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
              s.address, s.status, r.role_name AS role
       FROM staff s
       JOIN role r ON s.role_id = r.role_id
       ORDER BY s.staff_id DESC`
    )
    // Map role_name to the format expected by frontend
    const mapped = rows.map(u => ({
      ...u,
      role: u.role?.toLowerCase().replace(' ', '') || 'staff',
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
              s.address, s.status, r.role_name AS role, s.created_at
       FROM staff s
       JOIN role r ON s.role_id = r.role_id
       WHERE s.staff_id = ?`,
      [req.params.id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    const u = rows[0]
    res.json({
      ...u,
      role: u.role?.toLowerCase().replace(' ', '') || 'staff',
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

    // Check if already exists in staff table
    const [existing] = await pool.query(
      'SELECT staff_id FROM staff WHERE email = ?',
      [email]
    )
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' })
    }

    // Map role string to role_id
    const roleMap = { admin: 1, frontdesk: 2, front_desk: 2, instructor: 3, staff: 1 }
    const roleId = roleMap[role] || 2

    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert into staff table
    const [staffResult] = await pool.query(
      `INSERT INTO staff (f_name, m_name, l_name, address, age, gender, contact_no, email, profile, status, role_id)
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
        roleId
      ]
    )

    // Insert into users table with bcrypt password
    const usernameFromEmail = email.split('@')[0]
    await pool.query(
      'INSERT INTO users (username, email, password, role, status, staff_id) VALUES (?, ?, ?, ?, ?, ?)',
      [usernameFromEmail, email, hashedPassword, 'frontdesk', 'approved', staffResult.insertId]
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
      'SELECT id, email FROM users WHERE email = ?',
      [email]
    )

    if (existing.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' })
    }

    console.log('No duplicate found, proceeding with insert...')

    // Map role to role_id
    const roleIdMap = { admin: 1, frontdesk: 2 }
    const roleId = roleIdMap[role]

    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert into staff table
    const [staffResult] = await pool.query(
      `INSERT INTO staff (f_name, m_name, l_name, address, age, gender, contact_no, email, profile, status, role_id)
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
        roleId
      ]
    )

    console.log('Staff record created:', staffResult.insertId)

    // Insert into users table with bcrypt password
    const roleMapping = { admin: 'admin', frontdesk: 'frontdesk' }
    await pool.query(
      'INSERT INTO users (username, email, password, role, status, staff_id, contact_number, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, roleMapping[role] || 'frontdesk', 'approved', staffResult.insertId, contactNumber || null, address || null]
    )

    console.log('User record created for staff_id:', staffResult.insertId)

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

// ─── POST Login (authenticate against users table with bcrypt) ──
// Uses the new schema: users table (username, email, password, role, status)
// staff_id links to Staff table for extended profile info
router.post('/login', async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Accept either username or email
    const identifier = username || email
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username/email and password are required' })
    }

    // Query the users table by email OR username
    const [rows] = await pool.query(
      `SELECT u.*, s.f_name, s.m_name, s.l_name, s.contact_no,
              s.address, s.profile, s.status AS staff_status, r.role_name
       FROM users u
       LEFT JOIN staff s ON u.staff_id = s.staff_id
       LEFT JOIN role r ON s.role_id = r.role_id
       WHERE u.email = ? OR u.username = ?`,
      [identifier, identifier]
    )

    if (rows.length === 0) {
      return res.status(401).json({ error: 'No account found with this email address' })
    }

    const user = rows[0]

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' })
    }

    // Determine role from users table, fall back to staff role_name
    const userRole = user.role || (user.role_name ? user.role_name.toLowerCase().replace(' ', '') : 'staff')

    console.log('✅ Login successful:', { userId: user.id, email: user.email, role: userRole })

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        user_id: user.id,
        staff_id: user.staff_id,
        username: user.username || user.email?.split('@')[0],
        email: user.email,
        first_name: user.f_name || user.username,
        middle_name: user.m_name,
        last_name: user.l_name || user.username,
        contact_number: user.contact_number || user.contact_no,
        address: user.address,
        role: userRole,
        staff_role: user.role_name,
        status: user.status === 'approved' ? 'approved' : 'active',
        staff_status: user.staff_status,
        profile: user.profile
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
      'UPDATE staff SET status = ? WHERE staff_id = ?',
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
      'UPDATE staff SET contact_no = ?, address = ? WHERE staff_id = ?',
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