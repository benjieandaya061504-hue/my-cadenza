const express = require('express')
const { PrismaClient } = require('@prisma/client')

const router = express.Router()
const prisma = new PrismaClient()

/**
 * Normalize a package_type frequency value to a numeric sessions-per-week.
 * Handles bare numbers as strings ("1" → 1), or named values ("weekly" → 1).
 */
function normalizeSessionsPerWeek(freq) {
  if (!freq) return 1
  const num = parseInt(freq, 10)
  if (!isNaN(num) && num > 0) return num
  const lower = freq.toLowerCase().trim()
  if (lower === 'weekly' || lower === 'once' || lower === '1x') return 1
  if (lower === 'twice' || lower === 'biweekly' || lower === '2x') return 2
  if (lower === 'thrice' || lower === '3x') return 3
  return 1
}

/**
 * Format a bare duration number string like "1" into "1 Month".
 */
function formatDuration(dur) {
  if (!dur) return ''
  const num = parseInt(dur, 10)
  if (!isNaN(num) && num > 0) {
    return `${num} Month${num > 1 ? 's' : ''}`
  }
  return dur
}

/**
 * GET /api/public/lesson-packages
 *
 * Public-facing endpoint — no auth required, read-only.
 * Returns active lessons with their available package types and instructors.
 *
 * Response shape (grouped by lesson):
 * [
 *   {
 *     id: lesson.id,
 *     lesson_name: "Guitar",
 *     specialty: "Guitar",
 *     specialty_id: 1,
 *     instructors: [ ... ],
 *     package_types: [
 *       {
 *         package_type_id: 1,
 *         package_type_name: "Starter",
 *         session: 4,
 *         fee: 1000,
 *         sessions_per_week: 1,
 *         duration_label: "1 Month",
 *       }
 *     ]
 *   }
 * ]
 */
router.get('/lesson-packages', async (req, res) => {
  try {
    // 1. Fetch all active lessons
    const lessons = await prisma.lesson.findMany({
      where: { status: 'Active' },
      include: { specialties: true },
    })

    // 2. Fetch all instructors with their staff info and specialties
    const instructors = await prisma.instructors.findMany({
      include: {
        staff: true,
        instructor_specialties: {
          include: { specialties: true },
        },
      },
    })

    // 3. Fetch all active packages and their package types (manual join)
    const packages = await prisma.packages.findMany({
      where: { status: 'Active' },
    })

    const packageTypes = await prisma.package_type.findMany()

    // 4. Build the response
    const result = lessons.map((lesson) => {
      const specialtyName = lesson.specialties?.specialty_name || null

      // Match instructors whose specialty matches this lesson's specialty
      const matchingInstructors = lesson.specialty_id
        ? instructors
            .filter((inst) =>
              inst.instructor_specialties.some(
                (is) => is.specialty_id === lesson.specialty_id
              )
            )
            .map((inst) => ({
              id: inst.id,
              first_name: inst.staff?.f_name || null,
              last_name: inst.staff?.l_name || null,
              specialization:
                inst.instructor_specialties[0]?.specialties?.specialty_name || null,
            }))
        : []

      // Find packages for this lesson
      const lessonPackages = packages.filter((p) => p.lesson_id === lesson.id)

      // Build package types from the packages rows (each maps to a package_type)
      const lessonPackageTypes = lessonPackages.map((pkg) => {
        const pt = packageTypes.find((t) => t.id === pkg.package_type_id)
        return {
          package_type_id: pkg.package_type_id,
          package_type_name: pt?.package_type_name || 'Unknown',
          session: pt?.session || 4,
          fee: Number(pkg.fee),
          sessions_per_week: normalizeSessionsPerWeek(pt?.frequency),
          duration_label: formatDuration(pt?.duration),
        }
      })

      return {
        id: lesson.id,
        lesson_name: lesson.lesson_name,
        specialty: specialtyName,
        specialty_id: lesson.specialty_id,
        instructors: matchingInstructors,
        package_types: lessonPackageTypes,
      }
    })

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Error fetching lesson packages:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching lesson packages.',
    })
  }
})

/**
 * GET /api/public/instructor-availability/:instructorId
 *
 * Public-facing endpoint — no auth required, read-only.
 * Returns the instructor's actual available recurring time slots,
 * with already-booked slots (those that have any class with active
 * enrollments for that instructor on that day-of-week + time) excluded.
 *
 * Because lessons are 1-on-1, any active enrollment on a class
 * permanently occupies that recurring slot for the instructor.
 */
router.get('/instructor-availability/:instructorId', async (req, res) => {
  try {
    const instructorId = parseInt(req.params.instructorId, 10)

    if (isNaN(instructorId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid instructor ID.',
      })
    }

    // 1. Fetch the instructor's general recurring availability
    const scheduleEntries = await prisma.instructor_schedule.findMany({
      where: {
        instructor_id: instructorId,
        status: 'Available',
      },
      include: {
        time_slot: true,
      },
    })

    if (scheduleEntries.length === 0) {
      return res.json({
        success: true,
        data: [],
      })
    }

    // 2. Find all class IDs that have active enrollments
    const activeEnrollments = await prisma.enrollments.findMany({
      where: {
        status: 'Active',
      },
      select: {
        class_id: true,
      },
    })

    const allBookedClassIds = [...new Set(activeEnrollments.map((e) => e.class_id))]

    // 3. Filter those classes to only ones belonging to this instructor
    const bookedClasses = allBookedClassIds.length > 0
      ? await prisma.classes.findMany({
          where: {
            id: { in: allBookedClassIds },
            instructor_id: instructorId,
          },
          select: {
            class_date: true,
            start_time: true,
          },
        })
      : []

    // 3. Build a Set of occupied slots keyed by "day_of_week|start_time"
    const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    const occupiedKeys = new Set()

    for (const cls of bookedClasses) {
      const dayOfWeek = DAY_NAMES[cls.class_date.getDay()]
      // Normalize start_time to "HH:MM:SS" format
      const timeStr = cls.start_time.toISOString().slice(11, 19)
      occupiedKeys.add(`${dayOfWeek}|${timeStr}`)
    }

    // 4. Filter schedule entries — exclude those that match an occupied slot
    //    Also normalize time_slot.start_time to "HH:MM:SS" for comparison
    const availableSlots = scheduleEntries
      .filter((entry) => {
        const entryTime = entry.time_slot.start_time.toISOString().slice(11, 19)
        const key = `${entry.day_of_week}|${entryTime}`
        return !occupiedKeys.has(key)
      })
      .map((entry) => {
        const startTime = entry.time_slot.start_time.toISOString().slice(11, 16)
        const endTime = entry.time_slot.end_time.toISOString().slice(11, 16)
        return {
          time_slot_id: entry.time_slot_id,
          day_of_week: entry.day_of_week,
          start_time: entry.time_slot.start_time,
          end_time: entry.time_slot.end_time,
          label: `${startTime} – ${endTime}`,
        }
      })

    // 5. Sort by day_of_week order then by start_time
    const DAY_ORDER = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
    availableSlots.sort((a, b) => {
      const dayDiff = (DAY_ORDER[a.day_of_week] ?? 0) - (DAY_ORDER[b.day_of_week] ?? 0)
      if (dayDiff !== 0) return dayDiff
      return a.start_time - b.start_time
    })

    res.json({
      success: true,
      data: availableSlots,
    })
  } catch (error) {
    console.error('Error fetching instructor availability:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching instructor availability.',
    })
  }
})

/**
 * POST /api/public/enrollments
 *
 * Public-facing endpoint — no auth required.
 * Creates a full enrollment record in a single transaction:
 * clients → students → enrollments → enrollment_schedule → payments
 *
 * Accepts all data collected by the enrollment modal (Steps 1-5).
 * Returns the created enrollment ID.
 */
router.post('/enrollments', async (req, res) => {
  try {
    const {
      fname, lname, email, phone, address, age, level,
      emergency_name, emergency_no, notes,
      lesson_id, package_type_id, instructor_id,
      selectedWeekdays, time_slot_id,
      paymethod, refnum, amount,
    } = req.body

    // ── Validation ──
    if (!fname || !lname || !email || !phone || !address) {
      return res.status(400).json({ success: false, message: 'Personal information is required.' })
    }
    if (!lesson_id || !package_type_id || !instructor_id) {
      return res.status(400).json({ success: false, message: 'Lesson, package, and instructor are required.' })
    }
    if (!Array.isArray(selectedWeekdays) || selectedWeekdays.length === 0 || !time_slot_id) {
      return res.status(400).json({ success: false, message: 'Schedule selection is required.' })
    }
    if (!paymethod || !refnum) {
      return res.status(400).json({ success: false, message: 'Payment method and reference are required.' })
    }

    // ── Look up the packages row matching lesson + package_type ──
    const pkg = await prisma.packages.findFirst({
      where: {
        lesson_id: parseInt(lesson_id),
        package_type_id: parseInt(package_type_id),
        status: 'Active',
      },
    })
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'No active package found for this lesson and package type.' })
    }

    // ── Verify time_slot exists ──
    const timeSlot = await prisma.time_slots.findUnique({
      where: { id: parseInt(time_slot_id) },
    })
    if (!timeSlot) {
      return res.status(400).json({ success: false, message: 'Invalid time slot.' })
    }

    // ── Verify instructor exists ──
    const instructor = await prisma.instructors.findUnique({
      where: { id: parseInt(instructor_id) },
    })
    if (!instructor) {
      return res.status(400).json({ success: false, message: 'Invalid instructor.' })
    }

    // ── Map weekday indices (0-6) to day names (Sun-Sat) ──
    const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayNames = selectedWeekdays.map((wd) => DAY_SHORT[parseInt(wd)])

    // ── Transaction: all-or-nothing (30s timeout) ──
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create client
      const client = await tx.clients.create({
        data: {
          f_name: fname,
          l_name: lname,
          email,
          phone,
          address,
          age: age ? parseInt(age) : null,
          level: level || null,
          notes: notes || null,
        },
      })

      // 2. Create student (guest — no users_id)
      const student = await tx.students.create({
        data: {
          client_id: client.id,
          email,
          guardian_name: emergency_name || null,
          guardian_no: emergency_no || null,
          enrollment_date: new Date(),
          status: 'Pending',
        },
      })

      // 3. Create enrollment (status = Pending, class_id = null until approved)
      const enrollment = await tx.enrollments.create({
        data: {
          student_id: student.id,
          class_id: null,
          package_id: pkg.id,
          amount: parseFloat(amount),
          enrollment_date: new Date(),
          status: 'Pending',
        },
      })

      // 4. Create enrollment_schedule rows (one per weekday, with instructor_id)
      if (dayNames.length > 0) {
        await tx.enrollment_schedule.createMany({
          data: dayNames.map((day) => ({
            enrollment_id: enrollment.id,
            day_of_week: day,
            time_slot_id: parseInt(time_slot_id),
            instructor_id: parseInt(instructor_id),
          })),
        })
      }

      // 5. Create payment (status = Pending — awaiting frontdesk verification)
      const payment = await tx.payments.create({
        data: {
          client_id: client.id,
          student_id: student.id,
          enrollment_id: enrollment.id,
          amount: parseFloat(amount),
          payment_method: paymethod,
          refnum,
          status: 'Pending',
        },
      })

      return { client, student, enrollment, payment }
    }, { timeout: 30000 })

    res.status(201).json({
      success: true,
      message: 'Enrollment submitted successfully.',
      data: {
        enrollmentId: result.enrollment.id,
        studentId: result.student.id,
        clientId: result.client.id,
        paymentId: result.payment.id,
        status: result.enrollment.status,
      },
    })
  } catch (error) {
    console.error('Error creating enrollment:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating enrollment.',
    })
  }
})

module.exports = router
