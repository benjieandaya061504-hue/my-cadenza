/**
 * Auth API Routes
 * Handles student signup, login, and session management
 * Uses enrollments + a simple auth key store (no separate users table)
 */
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import pool from '../db.js'

const router = Router()

// ─── POST Student Signup ─────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { first_name, middle_name, last_name, suffix, email, password, contact_number, address } = req.body

    // Validate required fields
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: 'first_name, last_name, email, and password are required' })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Password minimum length check
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' })
    }

    // Check if email already exists in enrollments
    const [existing] = await pool.query(
      'SELECT id FROM enrollments WHERE email = ?',
      [email]
    )

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already exists' })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create a pending enrollment record with student info and password hash
    // Insert with student_id = 0 first, then update it to match id
    const [enrollmentResult] = await pool.query(
      `INSERT INTO enrollments (student_id, enrollment_date, status, first_name, middle_name, last_name, suffix, email, contact_number, student_address, notes)
       VALUES (0, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['pending', first_name, middle_name || null, last_name, suffix || null, email, contact_number || null, address || null, hashedPassword]
    )

    // Update student_id to match id
    await pool.query(
      'UPDATE enrollments SET student_id = ? WHERE id = ?',
      [enrollmentResult.insertId, enrollmentResult.insertId]
    )

    console.log('✅ Student signup successful:', { enrollmentId: enrollmentResult.insertId, email })

    // Return user data so they can be immediately recognized
    res.status(201).json({
      message: 'Signup successful',
      user: {
        id: enrollmentResult.insertId,
        email,
        firstName: first_name,
        lastName: last_name,
        role: 'student',
        status: 'pending'
      },
      userId: enrollmentResult.insertId,
      email,
      role: 'student',
      status: 'pending',
      enrollmentId: enrollmentResult.insertId
    })

  } catch (error) {
    console.error('❌ Signup error:', error)
    res.status(500).json({ error: 'An unexpected error occurred during signup. Please try again later.' })
  }
})

// ─── POST Student/Public Login ──────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find enrollment by email
    const [rows] = await pool.query(
      'SELECT id, email, first_name, last_name, status, notes FROM enrollments WHERE email = ?',
      [email]
    )

    if (rows.length === 0) {
      return res.status(401).json({ error: 'No account found with this email address' })
    }

    const enrollment = rows[0]

    // Verify password against stored hash in notes field
    const storedHash = enrollment.notes || ''
    const isPasswordValid = await bcrypt.compare(password, storedHash)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' })
    }

    console.log('✅ Public login successful:', { enrollmentId: enrollment.id, email })

    res.json({
      message: 'Login successful',
      user: {
        id: enrollment.id,
        email: enrollment.email,
        firstName: enrollment.first_name,
        lastName: enrollment.last_name,
        role: 'student',
        status: enrollment.status
      }
    })
  } catch (error) {
    console.error('❌ Public login error:', error)
    res.status(500).json({ error: 'An unexpected error occurred during login. Please try again.' })
  }
})

// ─── GET User by ID (session restore) ───────────────────────────
router.get('/me', async (req, res) => {
  try {
    const { id } = req.query

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    const [rows] = await pool.query(
      'SELECT id, email, first_name, last_name, status FROM enrollments WHERE id = ?',
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const enrollment = rows[0]

    res.json({
      user: {
        id: enrollment.id,
        email: enrollment.email,
        firstName: enrollment.first_name,
        lastName: enrollment.last_name,
        role: 'student',
        status: enrollment.status
      }
    })
  } catch (error) {
    console.error('❌ Session restore error:', error)
    res.status(500).json({ error: 'Failed to restore session' })
  }
})

export default router
