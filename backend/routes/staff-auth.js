/**
 * Staff Authentication API Routes
 * Handles staff login using Staff and Staff_Auth tables
 * This is separate from the users table used for students
 */

import { Router } from 'express'
import bcrypt from 'bcrypt'
import pool from '../db.js'

const router = Router()

// ─── POST Staff Login ────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Query Staff table joined with Role and Staff_Auth tables
    const [rows] = await pool.query(
      `SELECT s.*, r.role_name, sa.password 
       FROM Staff s 
       JOIN Role r ON s.role_id = r.role_id 
       JOIN Staff_Auth sa ON s.staff_id = sa.staff_id 
       WHERE sa.email = ?`,
      [email]
    )

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const staff = rows[0]

    // Check if staff is active
    if (staff.status !== 'active') {
      return res.status(403).json({ error: 'Account is inactive. Please contact administrator.' })
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, staff.password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Update last_login in Staff_Auth
    await pool.query(
      'UPDATE Staff_Auth SET last_login = CURRENT_TIMESTAMP WHERE staff_id = ?',
      [staff.staff_id]
    )

    // Return user info without password
    res.json({
      message: 'Login successful',
      user: {
        id: staff.staff_id,
        email: staff.email,
        first_name: staff.f_name,
        middle_name: staff.m_name,
        last_name: staff.l_name,
        role: staff.role_name,
        status: staff.status,
        contact_no: staff.contact_no,
        profile: staff.profile
      }
    })
  } catch (error) {
    console.error('Staff login error:', error)
    res.status(500).json({ error: 'Internal server error during login' })
  }
})

// ─── GET Staff Profile ─────────────────────────────────────────────
router.get('/profile/:staffId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, r.role_name 
       FROM Staff s 
       JOIN Role r ON s.role_id = r.role_id 
       WHERE s.staff_id = ?`,
      [req.params.staffId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Staff not found' })
    }

    const staff = rows[0]
    delete staff.password // Remove password from response

    res.json(staff)
  } catch (error) {
    console.error('Error fetching staff profile:', error)
    res.status(500).json({ error: 'Failed to fetch staff profile' })
  }
})

// ─── PUT Update Staff Password ─────────────────────────────────────
router.put('/change-password/:staffId', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' })
    }

    // Get current password hash from Staff_Auth
    const [rows] = await pool.query(
      'SELECT password FROM Staff_Auth WHERE staff_id = ?',
      [req.params.staffId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Staff not found' })
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, rows[0].password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password in Staff_Auth
    await pool.query(
      'UPDATE Staff_Auth SET password = ? WHERE staff_id = ?',
      [hashedPassword, req.params.staffId]
    )

    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Error updating password:', error)
    res.status(500).json({ error: 'Failed to update password' })
  }
})

export default router
