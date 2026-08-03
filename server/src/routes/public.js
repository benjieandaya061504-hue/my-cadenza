const express = require('express')
const { PrismaClient } = require('@prisma/client')

const router = express.Router()
const prisma = new PrismaClient()

/**
 * GET /api/public/lesson-packages
 *
 * Public-facing endpoint — no auth required, read-only.
 * Returns only active lesson packages with the fields needed
 * for the enrollment flow and landing page.
 */
router.get('/lesson-packages', async (req, res) => {
  try {
    // Fetch all active packages
    const packages = await prisma.packages.findMany({
      where: { status: 'Active' },
      orderBy: { id: 'desc' },
    })

    // Fetch all lessons (for manual join)
    const lessons = await prisma.lesson.findMany({
      include: { specialties: true },
    })

    // Fetch all instructors with their specialties and staff info
    const instructors = await prisma.instructors.findMany({
      include: {
        staff: true,
        instructor_specialties: {
          include: {
            specialties: true,
          },
        },
      },
    })

    // Build the response
    const result = packages.map(pkg => {
      const lesson = lessons.find(l => l.id === pkg.lesson_id)
      const specialtyName = lesson?.specialties?.specialty_name || null

      // Find instructors whose specialty matches this lesson's specialty
      const matchingInstructors = lesson?.specialty_id
        ? instructors
            .filter(inst =>
              inst.instructor_specialties.some(
                is => is.specialty_id === lesson.specialty_id
              )
            )
            .map(inst => ({
              id: inst.id,
              first_name: inst.staff?.f_name || null,
              last_name: inst.staff?.l_name || null,
              specialization:
                inst.instructor_specialties[0]?.specialties?.specialty_name || null,
            }))
        : []

      return {
        id: pkg.id,
        package_name: pkg.package_name,
        description: pkg.description,
        lesson_name: lesson?.lesson_name || null,
        category: specialtyName,
        fee: Number(pkg.fee),
        total_session: pkg.total_session,
        sessions_per_week: pkg.session,
        duration: pkg.duration,
        level_name: pkg.level_name,
        instructors: matchingInstructors,
      }
    })

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Error fetching public lesson packages:', error)
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

    const allBookedClassIds = [...new Set(activeEnrollments.map(e => e.class_id))]

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
      .filter(entry => {
        const entryTime = entry.time_slot.start_time.toISOString().slice(11, 19)
        const key = `${entry.day_of_week}|${entryTime}`
        return !occupiedKeys.has(key)
      })
      .map(entry => {
        const startTime = entry.time_slot.start_time.toISOString().slice(11, 16)
        const endTime = entry.time_slot.end_time.toISOString().slice(11, 16)
        return {
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

module.exports = router