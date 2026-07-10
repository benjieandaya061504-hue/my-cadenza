/**
 * Auth API Routes
 * Handles student signup, login, and session management
 */
import { Router } from 'express'
import bcrypt from 'bcrypt'
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

    // Check if email already exists
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already exists' })
    }

    // Generate username from email prefix
    let username = email.split('@')[0]

    // Ensure username uniqueness by appending a number if needed
    const [existingUsername] = await pool.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    )

    if (existingUsername.length > 0) {
      const timestamp = Date.now().toString().slice(-4)
      username = `${username}_${timestamp}`
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert into Users table with role 'student' and status 'pending'
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, contact_number, address, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, contact_number || null, address || null, 'student', 'pending']
    )

    // Create a pending enrollment record (NO students table insert until approved)
    // Store all student info directly in the enrollment record
    const [enrollmentResult] = await pool.query(
      `INSERT INTO enrollments (student_id, enrollment_date, status, first_name, middle_name, last_name, suffix, email, contact_number, student_address)
       VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)`,
      [result.insertId, 'pending', first_name, middle_name || null, last_name, suffix || null, email, contact_number || null, address || null]
    )

    console.log('✅ Student signup successful:', { userId: result.insertId, email, username, enrollmentId: enrollmentResult.insertId })

    // Return user data so they can be immediately recognized
    res.status(201).json({
      message: 'Signup successful',
      user: {
        id: result.insertId,
        email,
        firstName: first_name,
        lastName: last_name,
        role: 'student',
        status: 'pending'
      },
      userId: result.insertId,
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

    // Find user by email
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    if (rows.length === 0) {
      return res.status(401).json({ error: 'No account found with this email address' })
    }

    const user = rows[0]

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' })
    }

    // Get student name if they are a student
    let firstName = user.username
    let lastName = ''

    if (user.role === 'student') {
      // First try to get from students table (approved students)
      const [studentRows] = await pool.query(
        'SELECT first_name, last_name FROM students WHERE user_id = ?',
        [user.id]
      )
      if (studentRows.length > 0) {
        firstName = studentRows[0].first_name
        lastName = studentRows[0].last_name
      } else {
        // Fallback: get from enrollments table (pending students)
        const [enrollmentRows] = await pool.query(
          'SELECT first_name, last_name FROM enrollments WHERE student_id = ? AND status = ? ORDER BY enrollment_date DESC LIMIT 1',
          [user.id, 'pending']
        )
        if (enrollmentRows.length > 0) {
          firstName = enrollmentRows[0].first_name
          lastName = enrollmentRows[0].last_name
        }
      }
    }

    console.log('✅ Public login successful:', { userId: user.id, email, role: user.role })

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName,
        lastName,
        role: user.role,
        status: user.status
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
      'SELECT id, email, username, role, status FROM users WHERE id = ?',
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const user = rows[0]

    // Get student name if applicable
    let firstName = user.username
    let lastName = ''

    if (user.role === 'student') {
      // First try to get from students table (approved students)
      const [studentRows] = await pool.query(
        'SELECT first_name, last_name FROM students WHERE user_id = ?',
        [user.id]
      )
      if (studentRows.length > 0) {
        firstName = studentRows[0].first_name
        lastName = studentRows[0].last_name
      } else {
        // Fallback: get from enrollments table (pending students)
        const [enrollmentRows] = await pool.query(
          'SELECT first_name, last_name FROM enrollments WHERE student_id = ? AND status = ? ORDER BY enrollment_date DESC LIMIT 1',
          [user.id, 'pending']
        )
        if (enrollmentRows.length > 0) {
          firstName = enrollmentRows[0].first_name
          lastName = enrollmentRows[0].last_name
        }
      }
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName,
        lastName,
        role: user.role,
        status: user.status
      }
    })
  } catch (error) {
    console.error('❌ Session restore error:', error)
    res.status(500).json({ error: 'Failed to restore session' })
  }
})

export default router