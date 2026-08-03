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

    const updatedLesson = await prisma.lesson.update({
      where: { id: parseInt(id) },
      data: {
        ...(lesson_name !== undefined && { lesson_name }),
        ...(status !== undefined && { status }),
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

module.exports = router