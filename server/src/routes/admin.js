const express = require('express')
const bcrypt = require('bcryptjs')
const { verifyToken, checkRole } = require('../middleware/authMiddleware')
const { PrismaClient } = require('@prisma/client')

const router = express.Router()
const prisma = new PrismaClient()

// ==================== ADMIN ROUTES ====================

// GET /api/admin/users - Get all users (Admin only)
router.get('/users', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      include: {
        role: true,
        staff: true,
      },
    })

    res.json({
      success: true,
      data: users,
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching users.',
    })
  }
})

// POST /api/admin/users - Create a new user (Admin only)
router.post('/users', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { email, password, role_id, status, staffData } = req.body

    // Validate required fields
    if (!email || !password || !role_id) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and role are required.',
      })
    }

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered.',
      })
    }

    // Verify role exists
    const role = await prisma.role.findUnique({
      where: { id: parseInt(role_id) },
    })

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role.',
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    let staffId = null

    // If role is instructor (role_id: 3) or if staffData is provided, create staff record
    if (parseInt(role_id) === 3 || staffData) {
      const newStaff = await prisma.staff.create({
        data: {
          f_name: staffData?.f_name || null,
          m_name: staffData?.m_name || null,
          l_name: staffData?.l_name || null,
          gender: staffData?.gender || null,
          contact_no: staffData?.contact_no || null,
          email: email,
          address: staffData?.address || null,
          hire_date: staffData?.hire_date ? new Date(staffData.hire_date) : new Date(),
          status: 'active',
        },
      })
      staffId = newStaff.id

      // If role is instructor, also create instructor record
      if (parseInt(role_id) === 3) {
        const newInstructor = await prisma.instructors.create({
          data: {
            staff_id: newStaff.id,
          },
        })

        // Create instructor_specialties if specialty_ids provided
        if (req.body.specialty_ids && Array.isArray(req.body.specialty_ids) && req.body.specialty_ids.length > 0) {
          await prisma.instructor_specialties.createMany({
            data: req.body.specialty_ids.map(specialty_id => ({
              instructor_id: newInstructor.id,
              specialty_id: parseInt(specialty_id),
            })),
          })
        }
      }
    }

    // Create user
    const newUser = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        role_id: parseInt(role_id),
        staff_id: staffId,
        status: status || 'active',
      },
      include: { role: true, staff: true },
    })

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: newUser,
    })
  } catch (error) {
    console.error('Error creating user:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating user.',
    })
  }
})

// PUT /api/admin/users/:id - Update a user (Admin only)
router.put('/users/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params
    const { email, password, role_id, status } = req.body

    const updateData = {}

    if (email !== undefined) {
      // Check if email is taken by another user
      const existing = await prisma.users.findFirst({
        where: { email, NOT: { id: parseInt(id) } },
      })
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email already in use.' })
      }
      updateData.email = email
    }

    if (password !== undefined && password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    if (role_id !== undefined) {
      updateData.role_id = parseInt(role_id)
    }

    if (status !== undefined) {
      if (!['active', 'inactive', 'suspended'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value.' })
      }
      updateData.status = status
    }

    const updatedUser = await prisma.users.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { role: true, staff: true },
    })

    res.json({
      success: true,
      message: 'User updated successfully.',
      data: updatedUser,
    })
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating user.',
    })
  }
})

// ==================== LESSON ROUTES ====================

// GET /api/admin/lessons - Get all lessons (Admin only)
router.get('/lessons', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const lessons = await prisma.lesson.findMany({
      include: {
        specialties: true,
      },
      orderBy: { id: 'desc' },
    })

    res.json({
      success: true,
      data: lessons,
    })
  } catch (error) {
    console.error('Error fetching lessons:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching lessons.',
    })
  }
})

// POST /api/admin/lessons - Create a new lesson (Admin only)
router.post('/lessons', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { lesson_name, status } = req.body
    const specialty_id = req.body.specialty_id

    // Validate required fields
    if (!lesson_name) {
      return res.status(400).json({
        success: false,
        message: 'Lesson name is required.',
      })
    }

    const newLesson = await prisma.lesson.create({
      data: {
        lesson_name,
        status: status || 'Active',
        ...(specialty_id !== undefined && { specialty_id: specialty_id === '' ? null : Number(specialty_id) }),
      },
    })

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully.',
      data: newLesson,
    })
  } catch (error) {
    console.error('Error creating lesson:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating lesson.',
    })
  }
})

// PUT /api/admin/lessons/:id - Update a lesson (Admin only)
router.put('/lessons/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params
    const { lesson_name, status } = req.body
    const specialty_id = req.body.specialty_id

    const updatedLesson = await prisma.lesson.update({
      where: { id: parseInt(id) },
      data: {
        ...(lesson_name !== undefined && { lesson_name }),
        ...(status !== undefined && { status }),
        ...(specialty_id !== undefined && { specialty_id: specialty_id === '' ? null : Number(specialty_id) }),
      },
    })

    res.json({
      success: true,
      message: 'Lesson updated successfully.',
      data: updatedLesson,
    })
  } catch (error) {
    console.error('Error updating lesson:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating lesson.',
    })
  }
})

// DELETE /api/admin/lessons/:id - Delete a lesson (Admin only)
router.delete('/lessons/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params

    const lesson = await prisma.lesson.findUnique({
      where: { id: parseInt(id) },
    })

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found.',
      })
    }

    // Check if lesson is used by any packages
    const packageCount = await prisma.packages.count({
      where: { lesson_id: parseInt(id) },
    })

    if (packageCount > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete lesson. It is used by ${packageCount} package(s).`,
      })
    }

    // Check if lesson has any learning materials attached
    const materialCount = await prisma.learning_materials.count({
      where: { lesson_id: parseInt(id) },
    })

    if (materialCount > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete lesson. It has ${materialCount} learning material(s) attached.`,
      })
    }

    await prisma.lesson.delete({
      where: { id: parseInt(id) },
    })

    res.json({
      success: true,
      message: 'Lesson deleted successfully.',
    })
  } catch (error) {
    console.error('Error deleting lesson:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting lesson.',
    })
  }
})

// ==================== INSTRUMENT ROUTES ====================

// GET /api/admin/instruments - Get all instruments (Admin only)
router.get('/instruments', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const instruments = await prisma.instruments.findMany({
      orderBy: { id: 'desc' },
    })

    res.json({
      success: true,
      data: instruments,
    })
  } catch (error) {
    console.error('Error fetching instruments:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching instruments.',
    })
  }
})

// POST /api/admin/instruments - Create a new instrument (Admin only)
router.post('/instruments', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { instrument_name, brand, model, serial_number, quantity, rental_rate, rate_type, purchase_date, status } = req.body

    // Validate required fields
    if (!instrument_name) {
      return res.status(400).json({
        success: false,
        message: 'Instrument name is required.',
      })
    }

    const newInstrument = await prisma.instruments.create({
      data: {
        instrument_name,
        brand: brand || null,
        model: model || null,
        serial_number: serial_number || null,
        quantity: quantity ? parseInt(quantity) : null,
        rental_rate: rental_rate ? parseFloat(rental_rate) : null,
        rate_type: rate_type || null,
        purchase_date: purchase_date ? new Date(purchase_date) : null,
        status: status || 'Good',
      },
    })

    res.status(201).json({
      success: true,
      message: 'Instrument created successfully.',
      data: newInstrument,
    })
  } catch (error) {
    console.error('Error creating instrument:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating instrument.',
    })
  }
})

// PUT /api/admin/instruments/:id - Update an instrument (Admin only)
router.put('/instruments/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params
    const { instrument_name, brand, model, serial_number, quantity, rental_rate, rate_type, purchase_date, status } = req.body

    const updatedInstrument = await prisma.instruments.update({
      where: { id: parseInt(id) },
      data: {
        ...(instrument_name !== undefined && { instrument_name }),
        ...(brand !== undefined && { brand }),
        ...(model !== undefined && { model }),
        ...(serial_number !== undefined && { serial_number }),
        ...(quantity !== undefined && { quantity: parseInt(quantity) }),
        ...(rental_rate !== undefined && { rental_rate: parseFloat(rental_rate) }),
        ...(rate_type !== undefined && { rate_type }),
        ...(purchase_date !== undefined && { purchase_date: purchase_date ? new Date(purchase_date) : null }),
        ...(status !== undefined && { status }),
      },
    })

    res.json({
      success: true,
      message: 'Instrument updated successfully.',
      data: updatedInstrument,
    })
  } catch (error) {
    console.error('Error updating instrument:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating instrument.',
    })
  }
})

// ==================== INSTRUCTOR ROUTES ====================

// GET /api/admin/instructors - Get all instructors (Admin, Instructor)
router.get(
  '/instructors',
  verifyToken,
  checkRole(['admin', 'instructor']),
  async (req, res) => {
    try {
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

      res.json({
        success: true,
        data: instructors,
      })
    } catch (error) {
      console.error('Error fetching instructors:', error)
      res.status(500).json({
        success: false,
        message: 'Error fetching instructors.',
      })
    }
  }
)

// PUT /api/admin/instructors/:id - Update instructor (Admin only)
router.put('/instructors/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params
    const { staffData, specialty_ids } = req.body

    const instructor = await prisma.instructors.findUnique({
      where: { id: parseInt(id) },
      include: { staff: true },
    })

    if (!instructor) {
      return res.status(404).json({ success: false, message: 'Instructor not found.' })
    }

    // Update staff record if staffData provided
    if (staffData) {
      await prisma.staff.update({
        where: { id: instructor.staff_id },
        data: {
          ...(staffData.f_name !== undefined && { f_name: staffData.f_name }),
          ...(staffData.m_name !== undefined && { m_name: staffData.m_name }),
          ...(staffData.l_name !== undefined && { l_name: staffData.l_name }),
          ...(staffData.gender !== undefined && { gender: staffData.gender }),
          ...(staffData.contact_no !== undefined && { contact_no: staffData.contact_no }),
          ...(staffData.address !== undefined && { address: staffData.address }),
        },
      })
    }

    // Update specialties if specialty_ids provided
    if (specialty_ids !== undefined && Array.isArray(specialty_ids)) {
      // Delete existing instructor_specialties
      await prisma.instructor_specialties.deleteMany({
        where: { instructor_id: parseInt(id) },
      })

      // Create new instructor_specialties
      if (specialty_ids.length > 0) {
        await prisma.instructor_specialties.createMany({
          data: specialty_ids.map(specialty_id => ({
            instructor_id: parseInt(id),
            specialty_id: parseInt(specialty_id),
          })),
        })
      }
    }

    const updated = await prisma.instructors.findUnique({
      where: { id: parseInt(id) },
      include: {
        staff: true,
        instructor_specialties: {
          include: {
            specialties: true,
          },
        },
      },
    })

    res.json({
      success: true,
      message: 'Instructor updated successfully.',
      data: updated,
    })
  } catch (error) {
    console.error('Error updating instructor:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating instructor.',
    })
  }
})

// ==================== STUDENT ROUTES ====================

// GET /api/admin/students - Get all students (Admin only)
router.get('/students', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const students = await prisma.students.findMany({
      include: {
        clients: true,
      },
    })

    res.json({
      success: true,
      data: students,
    })
  } catch (error) {
    console.error('Error fetching students:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching students.',
    })
  }
})

// GET /api/admin/my-profile - Get current user's profile (All authenticated users)
router.get('/my-profile', verifyToken, async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
      include: {
        role: true,
        staff: true,
      },
    })

    res.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching profile.',
    })
  }
})

// ==================== SPECIALTY ROUTES ====================

// GET /api/admin/specialties - Get all specialties (Admin only)
router.get('/specialties', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const specialties = await prisma.specialties.findMany({
      orderBy: { id: 'desc' },
    })

    res.json({
      success: true,
      data: specialties,
    })
  } catch (error) {
    console.error('Error fetching specialties:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching specialties.',
    })
  }
})

// POST /api/admin/specialties - Create a new specialty (Admin only)
router.post('/specialties', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { specialty_name, status } = req.body

    const newSpecialty = await prisma.specialties.create({
      data: {
        specialty_name: specialty_name || null,
        status: status || 'Active',
      },
    })

    res.status(201).json({
      success: true,
      message: 'Specialty created successfully.',
      data: newSpecialty,
    })
  } catch (error) {
    console.error('Error creating specialty:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating specialty.',
    })
  }
})

// PUT /api/admin/specialties/:id - Update a specialty (Admin only)
router.put('/specialties/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params
    const { specialty_name, status } = req.body

    const updateData = {}

    if (specialty_name !== undefined) {
      updateData.specialty_name = specialty_name
    }

    if (status !== undefined) {
      updateData.status = status
    }

    const updatedSpecialty = await prisma.specialties.update({
      where: { id: parseInt(id) },
      data: updateData,
    })

    res.json({
      success: true,
      message: 'Specialty updated successfully.',
      data: updatedSpecialty,
    })
  } catch (error) {
    console.error('Error updating specialty:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating specialty.',
    })
  }
})

// DELETE /api/admin/specialties/:id - Delete a specialty (Admin only)
router.delete('/specialties/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params

    // Check if specialty is assigned to any instructor
    const instructorCount = await prisma.instructor_specialties.count({
      where: { specialty_id: parseInt(id) },
    })

    if (instructorCount > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete specialty. It is assigned to ${instructorCount} instructor(s).`,
      })
    }

    await prisma.specialties.delete({
      where: { id: parseInt(id) },
    })

    res.json({
      success: true,
      message: 'Specialty deleted successfully.',
    })
  } catch (error) {
    console.error('Error deleting specialty:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting specialty.',
    })
  }
})

// GET /api/admin/roles - Get all roles (Admin only)
router.get('/roles', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const roles = await prisma.role.findMany()

    res.json({
      success: true,
      data: roles,
    })
  } catch (error) {
    console.error('Error fetching roles:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching roles.',
    })
  }
})

// ==================== TIME SLOT ROUTES ====================

// GET /api/admin/time-slots - Get all time slots (Admin only)
router.get('/time-slots', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const timeSlots = await prisma.time_slots.findMany({
      orderBy: { start_time: 'asc' },
    })

    res.json({
      success: true,
      data: timeSlots,
    })
  } catch (error) {
    console.error('Error fetching time slots:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching time slots.',
    })
  }
})

// ==================== INSTRUCTOR SCHEDULE ROUTES ====================

// GET /api/admin/instructor-schedules - Get all instructor schedules (Admin only)
router.get('/instructor-schedules', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const schedules = await prisma.instructor_schedule.findMany({
      include: {
        instructor: {
          include: {
            staff: true,
          },
        },
        time_slot: true,
      },
      orderBy: [
        { instructor_id: 'asc' },
        { day_of_week: 'asc' },
        { time_slot_id: 'asc' },
      ],
    })

    res.json({
      success: true,
      data: schedules,
    })
  } catch (error) {
    console.error('Error fetching instructor schedules:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching instructor schedules.',
    })
  }
})

// POST /api/admin/instructor-schedules - Create instructor schedule entry(ies) (Admin only)
// Accepts single: { instructor_id, day_of_week, time_slot_id, status }
// Accepts batch: { instructor_id, day_of_week: string | string[], time_slot_ids: number[], status }
// When day_of_week is an array, generates the full cross-product of (day × slot) combinations.
router.post('/instructor-schedules', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { instructor_id, day_of_week, time_slot_id, time_slot_ids, status } = req.body

    // Validate required fields
    if (!instructor_id || !day_of_week) {
      return res.status(400).json({
        success: false,
        message: 'Instructor and day of week are required.',
      })
    }

    const parsedInstructorId = parseInt(instructor_id)
    const parsedStatus = status || 'Available'

    // ---- BATCH MODE (time_slot_ids array) ----
    // Supports day_of_week as a single string OR an array of strings for cross-product
    if (time_slot_ids && Array.isArray(time_slot_ids) && time_slot_ids.length > 0) {
      const days = Array.isArray(day_of_week) ? day_of_week : [day_of_week]
      const created = []
      const skipped = []

      // Generate cross-product of (day × slot) combinations
      for (const d of days) {
        for (const rawId of time_slot_ids) {
          const parsedSlotId = parseInt(rawId)
          if (isNaN(parsedSlotId)) continue

          // Check for existing
          const existing = await prisma.instructor_schedule.findFirst({
            where: {
              instructor_id: parsedInstructorId,
              day_of_week: d,
              time_slot_id: parsedSlotId,
            },
          })

          if (existing) {
            skipped.push({ day_of_week: d, time_slot_id: parsedSlotId, reason: 'Already assigned' })
            continue
          }

          // Create new entry
          const newEntry = await prisma.instructor_schedule.create({
            data: {
              instructor_id: parsedInstructorId,
              day_of_week: d,
              time_slot_id: parsedSlotId,
              status: parsedStatus,
            },
            include: {
              instructor: {
                include: { staff: true },
              },
              time_slot: true,
            },
          })

          created.push(newEntry)
        }
      }

      return res.status(201).json({
        success: true,
        message: created.length > 0
          ? `Created ${created.length} schedule entry(ies).`
          : 'No new entries were created.',
        created,
        skipped,
      })
    }

    // ---- SINGLE MODE (time_slot_id scalar) ----
    if (!time_slot_id) {
      return res.status(400).json({
        success: false,
        message: 'Either time_slot_id or time_slot_ids is required.',
      })
    }

    // Check for duplicate
    const existing = await prisma.instructor_schedule.findFirst({
      where: {
        instructor_id: parsedInstructorId,
        day_of_week: day_of_week,
        time_slot_id: parseInt(time_slot_id),
      },
    })

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'This instructor is already assigned to this day and time slot.',
      })
    }

    const newSchedule = await prisma.instructor_schedule.create({
      data: {
        instructor_id: parsedInstructorId,
        day_of_week,
        time_slot_id: parseInt(time_slot_id),
        status: parsedStatus,
      },
      include: {
        instructor: {
          include: {
            staff: true,
          },
        },
        time_slot: true,
      },
    })

    res.status(201).json({
      success: true,
      message: 'Instructor schedule created successfully.',
      data: newSchedule,
    })
  } catch (error) {
    console.error('Error creating instructor schedule:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating instructor schedule.',
    })
  }
})

// PUT /api/admin/instructor-schedules/:id - Update an instructor schedule entry (Admin only)
router.put('/instructor-schedules/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params
    const { instructor_id, day_of_week, time_slot_id, status } = req.body

    // Check if entry exists
    const existing = await prisma.instructor_schedule.findUnique({
      where: { id: parseInt(id) },
    })

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Instructor schedule entry not found.',
      })
    }

    // Check for duplicate if instructor/day/time are being changed
    if (instructor_id || day_of_week || time_slot_id) {
      const newInstructorId = instructor_id ? parseInt(instructor_id) : existing.instructor_id
      const newDayOfWeek = day_of_week || existing.day_of_week
      const newTimeSlotId = time_slot_id ? parseInt(time_slot_id) : existing.time_slot_id

      const duplicate = await prisma.instructor_schedule.findFirst({
        where: {
          instructor_id: newInstructorId,
          day_of_week: newDayOfWeek,
          time_slot_id: newTimeSlotId,
          NOT: { id: parseInt(id) },
        },
      })

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: 'This instructor is already assigned to this day and time slot.',
        })
      }
    }

    const updateData = {}
    if (instructor_id !== undefined) updateData.instructor_id = parseInt(instructor_id)
    if (day_of_week !== undefined) updateData.day_of_week = day_of_week
    if (time_slot_id !== undefined) updateData.time_slot_id = parseInt(time_slot_id)
    if (status !== undefined) updateData.status = status

    const updated = await prisma.instructor_schedule.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        instructor: {
          include: {
            staff: true,
          },
        },
        time_slot: true,
      },
    })

    res.json({
      success: true,
      message: 'Instructor schedule updated successfully.',
      data: updated,
    })
  } catch (error) {
    console.error('Error updating instructor schedule:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating instructor schedule.',
    })
  }
})

// DELETE /api/admin/instructor-schedules/:id - Delete an instructor schedule entry (Admin only)
router.delete('/instructor-schedules/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params

    const existing = await prisma.instructor_schedule.findUnique({
      where: { id: parseInt(id) },
    })

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Instructor schedule entry not found.',
      })
    }

    await prisma.instructor_schedule.delete({
      where: { id: parseInt(id) },
    })

    res.json({
      success: true,
      message: 'Instructor schedule deleted successfully.',
    })
  } catch (error) {
    console.error('Error deleting instructor schedule:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting instructor schedule.',
    })
  }
})

// DELETE /api/admin/instructor-schedules/instructor/:instructorId - Delete all schedule entries for an instructor (Admin only)
router.delete('/instructor-schedules/instructor/:instructorId', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { instructorId } = req.params

    const result = await prisma.instructor_schedule.deleteMany({
      where: { instructor_id: parseInt(instructorId) },
    })

    res.json({
      success: true,
      deletedCount: result.count,
    })
  } catch (error) {
    console.error('Error clearing instructor schedules:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error clearing instructor schedules.',
    })
  }
})

// ==================== PACKAGE ROUTES ====================

// GET /api/admin/packages - Get all packages (Admin only)
router.get('/packages', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const packages = await prisma.packages.findMany({
      orderBy: { id: 'desc' },
    })

    // Fetch all lessons and merge manually (no @relation exists on packages → lesson)
    const lessons = await prisma.lesson.findMany()

    const packagesWithLessons = packages.map(pkg => {
      const lesson = lessons.find(l => l.id === pkg.lesson_id)
      return {
        ...pkg,
        lesson_name: lesson?.lesson_name || null,
        lesson_specialty_id: lesson?.specialty_id || null,
      }
    })

    res.json({
      success: true,
      data: packagesWithLessons,
    })
  } catch (error) {
    console.error('Error fetching packages:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching packages.',
    })
  }
})

// POST /api/admin/packages - Create a new package (Admin only)
router.post('/packages', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { package_name, lesson_id, total_session, duration, session, fee, level_name, status } = req.body

    // Validate required fields
    if (!package_name || !lesson_id || fee === undefined || fee === null) {
      return res.status(400).json({
        success: false,
        message: 'Package name, lesson, and fee are required.',
      })
    }

    // Verify lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: parseInt(lesson_id) },
    })

    if (!lesson) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lesson.',
      })
    }

    const newPackage = await prisma.packages.create({
      data: {
        package_name,
        lesson_id: parseInt(lesson_id),
        total_session: total_session ? parseInt(total_session) : null,
        duration: duration || null,
        session: session ? parseInt(session) : null,
        fee: parseFloat(fee),
        level_name: level_name || null,
        status: status || 'Active',
      },
    })

    // Manually attach lesson_name (no @relation exists on packages → lesson)
    const responseData = {
      ...newPackage,
      lesson_name: lesson.lesson_name || null,
      lesson_specialty_id: lesson.specialty_id || null,
    }

    res.status(201).json({
      success: true,
      message: 'Package created successfully.',
      data: responseData,
    })
  } catch (error) {
    console.error('Error creating package:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating package.',
    })
  }
})

// PUT /api/admin/packages/:id - Update a package (Admin only)
router.put('/packages/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params
    const { package_name, lesson_id, total_session, duration, session, fee, level_name, status } = req.body

    const existing = await prisma.packages.findUnique({
      where: { id: parseInt(id) },
    })

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Package not found.',
      })
    }

    const updateData = {}

    if (package_name !== undefined) updateData.package_name = package_name
    if (lesson_id !== undefined) updateData.lesson_id = parseInt(lesson_id)
    if (total_session !== undefined) updateData.total_session = parseInt(total_session)
    if (duration !== undefined) updateData.duration = duration
    if (session !== undefined) updateData.session = parseInt(session)
    if (fee !== undefined) updateData.fee = parseFloat(fee)
    if (level_name !== undefined) updateData.level_name = level_name
    if (status !== undefined) updateData.status = status

    const updated = await prisma.packages.update({
      where: { id: parseInt(id) },
      data: updateData,
    })

    // Manually attach lesson_name (no @relation exists on packages → lesson)
    let lessonName = null
    let lessonSpecialtyId = null
    const targetLessonId = lesson_id !== undefined ? parseInt(lesson_id) : existing.lesson_id
    if (targetLessonId) {
      const lesson = await prisma.lesson.findUnique({ where: { id: targetLessonId } })
      lessonName = lesson?.lesson_name || null
      lessonSpecialtyId = lesson?.specialty_id || null
    }

    const responseData = {
      ...updated,
      lesson_name: lessonName,
      lesson_specialty_id: lessonSpecialtyId,
    }

    res.json({
      success: true,
      message: 'Package updated successfully.',
      data: responseData,
    })
  } catch (error) {
    console.error('Error updating package:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating package.',
    })
  }
})

// DELETE /api/admin/packages/:id - Delete a package (Admin only)
router.delete('/packages/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params

    const existing = await prisma.packages.findUnique({
      where: { id: parseInt(id) },
    })

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Package not found.',
      })
    }

    // Check if package is used by any classes
    const classCount = await prisma.classes.count({
      where: { package_id: parseInt(id) },
    })

    if (classCount > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete package. It is used by ${classCount} class(es).`,
      })
    }

    // Check if package is used by any enrollments
    const enrollmentCount = await prisma.enrollments.count({
      where: { package_id: parseInt(id) },
    })

    if (enrollmentCount > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete package. It is used by ${enrollmentCount} enrollment(s).`,
      })
    }

    await prisma.packages.delete({
      where: { id: parseInt(id) },
    })

    res.json({
      success: true,
      message: 'Package deleted successfully.',
    })
  } catch (error) {
    console.error('Error deleting package:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting package.',
    })
  }
})

// GET /api/admin/lessons/:id/available-instructors - Get instructors matching a lesson's specialty (Admin only)
router.get('/lessons/:id/available-instructors', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params

    const lesson = await prisma.lesson.findUnique({
      where: { id: parseInt(id) },
    })

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found.',
      })
    }

    if (!lesson.specialty_id) {
      return res.json({
        success: true,
        data: [],
        message: 'This lesson has no specialty assigned.',
      })
    }

    // Find instructors who have this specialty
    const instructors = await prisma.instructors.findMany({
      where: {
        instructor_specialties: {
          some: {
            specialty_id: lesson.specialty_id,
          },
        },
      },
      include: {
        staff: true,
        instructor_specialties: {
          where: {
            specialty_id: lesson.specialty_id,
          },
          include: {
            specialties: true,
          },
        },
        instructor_schedules: {
          include: {
            time_slot: true,
          },
          orderBy: [
            { day_of_week: 'asc' },
            { time_slot_id: 'asc' },
          ],
        },
      },
    })

    res.json({
      success: true,
      data: instructors,
    })
  } catch (error) {
    console.error('Error fetching available instructors:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching available instructors.',
    })
  }
})

module.exports = router
