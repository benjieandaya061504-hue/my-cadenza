/**
 * Users API Routes
 * Handles user registration, authentication, and management
 */

import { Router } from 'express'
import bcrypt from 'bcrypt'
import pool from '../db.js'

const router = Router()

// ─── GET all users ─────────────────────────────────────────────
  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT u.id, u.username, u.email, u.contact_number, u.address, u.role, u.status, u.created_at, u.updated_at,
                COALESCE(staff.f_name, stu.first_name) AS first_name,
                COALESCE(staff.m_name, stu.middle_name) AS middle_name,
                COALESCE(staff.l_name, stu.last_name) AS last_name,
                COALESCE(staff.suffix, stu.suffix) AS suffix
         FROM users u
         LEFT JOIN Staff staff ON u.email = staff.email
         LEFT JOIN students stu ON u.id = stu.user_id
         ORDER BY u.created_at DESC`
      )
      res.json(rows)
    } catch (error) {
      console.error('Error fetching users:', error)
      res.status(500).json({ error: 'Failed to fetch users' })
    }
  })

// ─── GET single user by ID ─────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, contact_number, address, role, status, created_at, updated_at FROM users WHERE id = ?',
      [req.params.id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(rows[0])
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// ─── POST Register new user ────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, email, contactNumber, address, password, role } = req.body

    if (!username || !email || !contactNumber || !password) {
  return res.status(400).json({ error: 'All required fields must be filled' })
}

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    )
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User with this email or username already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const [result] = await pool.query(
      'INSERT INTO users (username, email, contact_number, address, password, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, email, contactNumber, address || null, hashedPassword, role || 'student', 'pending']
    )

    res.status(201).json({
      message: 'Registration successful',
      userId: result.insertId
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error during registration' })
  }
})

// ─── POST Add user (admin only) ────────────────────────────────────
router.post('/add-user', async (req, res) => {
  try {
    const { username, email, contactNumber, address, password, role, firstName, middleName, lastName, suffix, age, gender } = req.body

    console.log('=== ADD-USER DEBUG ===')
    console.log('Full request body:', req.body)
    console.log('Parsed values:', { username, email, contactNumber, address, password: password ? '***' : null, role, firstName, middleName, lastName, suffix, age, gender })

    // Input validation
    if (!username || !email || !password || !role) {
      console.log('Validation failed: missing required fields')
      return res.status(400).json({ error: 'Username, email, password, and role are required' })
    }

    // Name validation for admin/frontdesk roles
    if ((role === 'admin' || role === 'frontdesk') && (!firstName || !lastName)) {
      console.log('Validation failed: missing name fields for staff role')
      return res.status(400).json({ error: 'First name and last name are required for admin and frontdesk roles' })
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('Email format validation failed:', email)
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Contact number validation (only digits and optional + prefix)
    if (contactNumber) {
      const contactRegex = /^[+]?[0-9]+$/
      if (!contactRegex.test(contactNumber)) {
        console.log('Contact number validation failed:', contactNumber)
        return res.status(400).json({ error: 'Contact number can only contain digits and an optional + prefix' })
      }
    }

    // Password requirements (minimum 8 characters)
    if (password.length < 8) {
      console.log('Password validation failed: length =', password.length)
      return res.status(400).json({ error: 'Password must be at least 8 characters long' })
    }

    // Role validation
    const validRoles = ['admin', 'frontdesk']
    if (!validRoles.includes(role)) {
      console.log('Role validation failed:', role)
      return res.status(400).json({ error: 'Role must be one of: admin, frontdesk' })
    }

    // Uniqueness check
    const [existing] = await pool.query(
      'SELECT id, username, email FROM users WHERE email = ? OR username = ?',
      [email, username]
    )

    if (existing.length > 0) {
      return res.status(400).json({ error: 'User with this email or username already exists' })
    }

    console.log('No duplicate found, proceeding with insert...')

    // Hash password using the same method as login route
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert user with 'pending' status (admin-created accounts start as pending)
    const [result] = await pool.query(
      'INSERT INTO users (username, email, contact_number, address, password, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, email, contactNumber || null, address || null, hashedPassword, role, 'pending']
    )

    console.log('User created successfully:', result.insertId)

    // If admin or frontdesk, also create Staff record with name fields
    if (role === 'admin' || role === 'frontdesk') {
      console.log('Creating/Updating Staff record for role:', role)
      // Map role to role_id
      const roleIdMap = { admin: 1, frontdesk: 2 }
      const roleId = roleIdMap[role]

      // Check if Staff record with this email already exists
      const [existingStaff] = await pool.query(
        'SELECT staff_id FROM Staff WHERE email = ?',
        [email]
      )

      if (existingStaff.length > 0) {
        console.log('Found existing Staff record, updating...')
        // Update existing Staff record with name fields
        await pool.query(
          'UPDATE Staff SET f_name = ?, m_name = ?, l_name = ?, suffix = ? WHERE staff_id = ?',
          [firstName, middleName || null, lastName, suffix || null, existingStaff[0].staff_id]
        )
        console.log('Updated existing Staff record with name fields:', existingStaff[0].staff_id)
      } else {
        console.log('No existing Staff record, inserting new one...')
        // Insert new Staff record with name fields
        await pool.query(
          'INSERT INTO Staff (f_name, m_name, l_name, suffix, address, age, gender, contact_no, email, profile, status, role_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            firstName,
            middleName || null,
            lastName,
            suffix || null,
            address || 'TBD',
            age || 25,
            gender || 'Other',
            contactNumber || '00000000000',
            email,
            null,
            'active',
            roleId
          ]
        )
        console.log('Created new Staff record with name fields')
      }
    } else {
      console.log('Skipping Staff creation - role is:', role)
    }

    console.log('=== END ADD-USER DEBUG ===')

    res.status(201).json({
      message: 'User created successfully',
      userId: result.insertId,
      user: {
        id: result.insertId,
        username,
        email,
        role,
        status: 'approved'
      }
    })
  } catch (error) {
    console.error('Add user error:', error)
    res.status(500).json({ error: 'Internal server error during user creation' })
  }
})

// ─── POST Login ────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Accept either username or email
    const identifier = username || email
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username/email and password are required' })
    }

    // Query Users by username or email
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [identifier, identifier]
    )

    if (rows.length === 0) {
      return res.status(401).json({ error: 'User not found' })
    }

    const user = rows[0]

    if (user.status !== 'approved') {
      return res.status(403).json({ error: 'Account is not approved yet. Please wait for admin approval.' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' })
    }

    // Check role-based authorization - auto-detect from database
    if (user.role === 'student') {
      return res.status(403).json({ error: 'This account is not authorized to log in here. Students authenticate through a separate portal.' })
    }

    // If user is staff, join with Staff table to get staff info
    let userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status
    }

    if (user.staff_id) {
      const [staffRows] = await pool.query(
        `SELECT s.*, r.role_name
         FROM Staff s
         JOIN Role r ON s.role_id = r.role_id
         WHERE s.staff_id = ?`,
        [user.staff_id]
      )

      if (staffRows.length > 0) {
        const staff = staffRows[0]
        userData.staff_id = staff.staff_id
        userData.first_name = staff.f_name
        userData.middle_name = staff.m_name
        userData.last_name = staff.l_name
        userData.staff_role = staff.role_name
        userData.contact_no = staff.contact_no
        userData.profile = staff.profile
        userData.staff_status = staff.status
      }
    } else {
      userData.contact_number = user.contact_number
      userData.address = user.address
    }

    res.json({
      message: 'Login successful',
      user: userData
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error during login' })
  }
})

// ─── PUT Update user status ────────────────────────────────────
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' })
    }

    const [result] = await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ message: `User status updated to ${status}` })
  } catch (error) {
    console.error('Error updating user status:', error)
    res.status(500).json({ error: 'Failed to update user status' })
  }
})

// ─── PUT Update user profile ───────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { username, email, contact_number, address } = req.body
    const [result] = await pool.query(
      'UPDATE users SET username = ?, email = ?, contact_number = ?, address = ? WHERE id = ?',
      [username, email, contact_number, address, req.params.id]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({ message: 'Profile updated successfully' })
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ error: 'Failed to update user' })
  }
})

export default router