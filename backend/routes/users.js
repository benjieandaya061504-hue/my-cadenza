/**
 * Users API Routes
 * Handles user registration, authentication, and management
 * Uses Staff + Staff_Auth tables for staff/admin authentication
 */

import { Router } from 'express'
import bcrypt from 'bcryptjs'
import pool from '../db.js'

const router = Router()

// ─── GET all staff users ───────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.staff_id AS id, s.email, s.f_name AS first_name, s.m_name AS middle_name,
              s.l_name AS last_name, s.contact_no AS contact_number,
              s.address, s.status, s.role
       FROM Staff s
       ORDER BY s.staff_id DESC`
    )
    // Use Staff.role directly (already lowercase: admin, frontdesk, instructor)
    const mapped = rows.map(u => ({
      ...u,
      role: u.role || 'staff',
      username: u.email?.split('@')[0] || u.email,
      contact_number: u.contact_number,
      created_at: null,
      // Map 'active'/'inactive' status to what frontend expects ('approved'/'rejected')
      status: u.status === 'active' ? 'approved' : u.status === 'inactive' ? 'rejected' : u.status,
    }))
    res.json(mapped)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// ─── GET single user by ID ─────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.staff_id AS id, s.email, s.f_name AS first_name, s.m_name AS middle_name,
              s.l_name AS last_name, s.contact_no AS contact_number,
              s.address, s.status, s.role, s.created_at
       FROM Staff s
       WHERE s.staff_id = ?`,
      [req.params.id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    const u = rows[0]
    res.json({
      ...u,
      role: u.role || 'staff',
      username: u.email?.split('@')[0] || u.email,
      created_at: u.created_at?.toISOString?.() || u.created_at,
    })
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

    // Check if already exists in Staff table
    const [existing] = await pool.query(
      'SELECT staff_id FROM Staff WHERE email = ?',
      [email]
    )
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' })
    }

    // Use provided role, default to 'frontdesk'
    const staffRole = ['admin', 'frontdesk', 'instructor'].includes(role) ? role : 'frontdesk'

    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert into Staff table
    const [staffResult] = await pool.query(
      `INSERT INTO Staff (f_name, m_name, l_name, address, age, gender, contact_no, email, profile, status, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        username || email.split('@')[0],
        null,
        username || email.split('@')[0],
        address || 'TBD',
        25,
        'Other',
        contactNumber,
        email,
        null,
        'active',
        staffRole
      ]
    )

    // Insert into Staff_Auth table with bcrypt password
    await pool.query(
      'INSERT INTO Staff_Auth (staff_id, email, password) VALUES (?, ?, ?)',
      [staffResult.insertId, email, hashedPassword]
    )

    console.log('✅ User registered:', { staffId: staffResult.insertId, email })

    res.status(201).json({
      message: 'Registration successful',
      userId: staffResult.insertId
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error during registration' })
  }
})

// ─── POST Add user (admin only) ────────────────────────────────
router.post('/add-user', async (req, res) => {
  try {
    const { username, email, contactNumber, address, password, role, firstName, middleName, lastName, age, gender } = req.body

    console.log('=== ADD-USER DEBUG ===')
    console.log('Full request body:', req.body)

    // Input validation
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'Username, email, password, and role are required' })
    }

    // Name validation for admin/frontdesk roles
    if ((role === 'admin' || role === 'frontdesk') && (!firstName || !lastName)) {
      return res.status(400).json({ error: 'First name and last name are required for admin and frontdesk roles' })
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Contact number validation
    if (contactNumber) {
      const contactRegex = /^[+]?[0-9]+$/
      if (!contactRegex.test(contactNumber)) {
        return res.status(400).json({ error: 'Contact number can only contain digits and an optional + prefix' })
      }
    }

    // Password requirements
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' })
    }

    // Role validation
    const validRoles = ['admin', 'frontdesk']
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Role must be one of: admin, frontdesk' })
    }

    // Uniqueness check
    const [existing] = await pool.query(
      'SELECT staff_id, email FROM Staff WHERE email = ?',
      [email]
    )

    if (existing.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' })
    }

    console.log('No duplicate found, proceeding with insert...')

    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert into Staff table with role directly
    const [staffResult] = await pool.query(
      `INSERT INTO Staff (f_name, m_name, l_name, address, age, gender, contact_no, email, profile, status, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        firstName,
        middleName || null,
        lastName,
        address || 'TBD',
        age || 25,
        gender || 'Other',
        contactNumber || '00000000000',
        email,
        null,
        'active',
        role
      ]
    )

    console.log('Staff record created:', staffResult.insertId)

    // Insert into Staff_Auth table with bcrypt password
    await pool.query(
      'INSERT INTO Staff_Auth (staff_id, email, password) VALUES (?, ?, ?)',
      [staffResult.insertId, email, hashedPassword]
    )

    console.log('Staff_Auth record created for staff_id:', staffResult.insertId)

    console.log('=== END ADD-USER DEBUG ===')

    res.status(201).json({
      message: 'User created successfully',
      userId: staffResult.insertId,
      user: {
        id: staffResult.insertId,
        username,
        email,
        role,
        status: 'active'
      }
    })
  } catch (error) {
    console.error('Add user error:', error)
    res.status(500).json({ error: 'Internal server error during user creation' })
  }
})

// ─── POST Login (authenticate against Staff_Auth with bcrypt) ──
router.post('/login', async (req, res) => {
  try {
    const { username, email, password, expectedRole } = req.body

    // Accept either username or email
    const identifier = username || email
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username/email and password are required' })
    }

    // Query Staff_Auth joined with Staff by email (use Staff.role directly)
    const [rows] = await pool.query(
      `SELECT sa.*, s.f_name, s.m_name, s.l_name, s.contact_no,
              s.address, s.profile, s.status AS staff_status, s.role
       FROM Staff_Auth sa
       JOIN Staff s ON sa.staff_id = s.staff_id
       WHERE sa.email = ?`,
      [identifier]
    )

    if (rows.length === 0) {
      return res.status(401).json({ error: 'No account found with this email address' })
    }

    const staff = rows[0]

    // Role enforcement: if expectedRole is provided, verify the account's role matches
    if (expectedRole) {
      if (staff.role !== expectedRole) {
        return res.status(403).json({ error: 'This account does not have access to this login page' })
      }
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, staff.password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' })
    }

    const userRole = staff.role || 'staff'

    console.log('✅ Login successful:', { staffId: staff.staff_id, email: staff.email, role: userRole })

    // Update last_login
    await pool.query(
      'UPDATE Staff_Auth SET last_login = NOW() WHERE auth_id = ?',
      [staff.auth_id]
    )

    res.json({
      message: 'Login successful',
      user: {
        id: staff.staff_id,
        staff_id: staff.staff_id,
        username: staff.email?.split('@')[0] || staff.email,
        email: staff.email,
        first_name: staff.f_name,
        middle_name: staff.m_name,
        last_name: staff.l_name,
        contact_number: staff.contact_no,
        address: staff.address,
        role: userRole,
        staff_role: userRole,
        status: 'approved',
        staff_status: staff.staff_status,
        profile: staff.profile,
        contact_no: staff.contact_no
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error during login' })
  }
})

// ─── PUT Update user status ────────────────────────────────────
// Accepts both frontend format ('approved'/'rejected') and DB format ('active'/'inactive')
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    // Map frontend status values to DB status values
    const statusMap = { 'approved': 'active', 'rejected': 'inactive', 'active': 'active', 'inactive': 'inactive' }
    const dbStatus = statusMap[status]
    if (!dbStatus) {
      return res.status(400).json({ error: 'Invalid status value. Use approved/rejected or active/inactive.' })
    }

    const [result] = await pool.query(
      'UPDATE Staff SET status = ? WHERE staff_id = ?',
      [dbStatus, req.params.id]
    )
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
    const { contact_number, address } = req.body
    const [result] = await pool.query(
      'UPDATE Staff SET contact_no = ?, address = ? WHERE staff_id = ?',
      [contact_number, address, req.params.id]
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