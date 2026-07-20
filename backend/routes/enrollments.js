/**
 * Enrollments API Routes
 * Handles enrollment CRUD operations
 */

import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// ─── GET all enrollments ───────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, 
              CONCAT(s.first_name, ' ', s.last_name) as student_name,
              c.name as course_name,
              p.name as package_name,
              CONCAT(i.first_name, ' ', i.last_name) as instructor_name
       FROM enrollments e
       LEFT JOIN students s ON e.student_id = s.id
       LEFT JOIN courses c ON e.course_id = c.id
       LEFT JOIN packages p ON e.package_id = p.id
       LEFT JOIN instructors i ON e.instructor_id = i.id
       ORDER BY e.created_at DESC`
    )
    res.json(rows)
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    res.status(500).json({ error: 'Failed to fetch enrollments' })
  }
})

// ─── GET pending enrollment requests (frontdesk dashboard) ───
router.get('/pending', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*,
              u.id as user_id,
              u.email,
              u.contact_number as user_contact,
              u.status as user_status
       FROM enrollments e
       LEFT JOIN users u ON e.student_id = u.id
       WHERE e.status = 'pending'
       ORDER BY e.enrollment_date DESC`
    )
    res.json(rows)
  } catch (error) {
    console.error('Error fetching pending enrollments:', error)
    res.status(500).json({ error: 'Failed to fetch pending enrollment requests' })
  }
})

// ─── GET approved enrollments (admin view) ────────────────────
router.get('/approved', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*,
              u.id as user_id,
              u.email,
              u.contact_number as user_contact,
              u.status as user_status
       FROM enrollments e
       LEFT JOIN users u ON e.student_id = u.id
       WHERE e.status = 'approved'
       ORDER BY e.enrollment_date DESC`
    )
    res.json(rows)
  } catch (error) {
    console.error('Error fetching approved enrollments:', error)
    res.status(500).json({ error: 'Failed to fetch approved enrollments' })
  }
})

// ─── GET single enrollment by ID ───────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*,
              CONCAT(s.first_name, ' ', s.last_name) as student_name,
              c.name as course_name,
              p.name as package_name,
              CONCAT(i.first_name, ' ', i.last_name) as instructor_name
       FROM enrollments e
       LEFT JOIN students s ON e.student_id = s.id
       LEFT JOIN courses c ON e.course_id = c.id
       LEFT JOIN packages p ON e.package_id = p.id
       LEFT JOIN instructors i ON e.instructor_id = i.id
       WHERE e.id = ?`,
      [req.params.id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Enrollment not found' })
    }
    res.json(rows[0])
  } catch (error) {
    console.error('Error fetching enrollment:', error)
    res.status(500).json({ error: 'Failed to fetch enrollment' })
  }
})

// ─── GET enrollments by student ID ─────────────────────────────
router.get('/student/:studentId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, c.name as course_name, p.name as package_name,
              CONCAT(i.first_name, ' ', i.last_name) as instructor_name
       FROM enrollments e
       LEFT JOIN courses c ON e.course_id = c.id
       LEFT JOIN packages p ON e.package_id = p.id
       LEFT JOIN instructors i ON e.instructor_id = i.id
       WHERE e.student_id = ?
       ORDER BY e.created_at DESC`,
      [req.params.studentId]
    )
    res.json(rows)
  } catch (error) {
    console.error('Error fetching student enrollments:', error)
    res.status(500).json({ error: 'Failed to fetch enrollments' })
  }
})

// ─── POST Create enrollment ────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { student_id, course_id, package_id, instructor_id, enrollment_date, start_date, end_date, total_fee, discount_applied, net_fee, total_sessions, is_reenrollment, notes } = req.body

    if (!student_id || !enrollment_date || !net_fee) {
      return res.status(400).json({ error: 'Student ID, enrollment date, and net fee are required' })
    }

    // Check if student exists
    const [student] = await pool.query('SELECT id FROM students WHERE id = ?', [student_id])
    if (student.length === 0) {
      return res.status(404).json({ error: 'Student not found' })
    }

    const [result] = await pool.query(
      `INSERT INTO enrollments (student_id, course_id, package_id, instructor_id, enrollment_date, start_date, end_date, total_fee, discount_applied, net_fee, total_sessions, is_reenrollment, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_id, course_id || null, package_id || null, instructor_id || null, enrollment_date, start_date || null, end_date || null, total_fee || net_fee, discount_applied || 0, net_fee, total_sessions || 0, is_reenrollment || false, notes || null]
    )

    // Automatically create a charge record for this enrollment
    const [studentInfo] = await pool.query('SELECT CONCAT(first_name, " ", last_name) as full_name FROM students WHERE id = ?', [student_id])
    const customerName = studentInfo[0]?.full_name || 'Unknown'

    await pool.query(
      `INSERT INTO charges (ref_type, ref_id, student_id, customer_name, service_type, description, amount)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['enrollment', result.insertId, student_id, customerName, 'Lessons', `Enrollment fee for course/package`, net_fee]
    )

    res.status(201).json({ message: 'Enrollment created successfully', enrollmentId: result.insertId })
  } catch (error) {
    console.error('Error creating enrollment:', error)
    res.status(500).json({ error: 'Failed to create enrollment' })
  }
})

// ─── PUT Approve enrollment (frontdesk action) ─────────────────
router.put('/:id/approve', async (req, res) => {
  try {
    const [enrollment] = await pool.query(
      'SELECT e.* FROM enrollments e WHERE e.id = ?',
      [req.params.id]
    )

    if (enrollment.length === 0) {
      return res.status(404).json({ error: 'Enrollment not found' })
    }

    if (enrollment[0].status !== 'pending') {
      return res.status(400).json({ error: `Cannot approve enrollment with status '${enrollment[0].status}'. Only pending enrollments can be approved.` })
    }

    const e = enrollment[0]
    const userId = e.student_id

    // Check if student already exists in students table (might be a re-enrollment)
    const [existingStudent] = await pool.query(
      'SELECT id FROM students WHERE user_id = ?',
      [userId]
    )

    if (existingStudent.length === 0) {
      // Insert into students table with all the information from the enrollment
      await pool.query(
        `INSERT INTO students (user_id, first_name, middle_name, last_name, suffix, email, contact_number, address)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, e.first_name, e.middle_name, e.last_name, e.suffix, e.email, e.contact_number, e.student_address]
      )
      console.log(`✅ Student record created for user ${userId}`)
    }

    // Update enrollment status to approved
    const [result] = await pool.query(
      'UPDATE enrollments SET status = ? WHERE id = ?',
      ['approved', req.params.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Enrollment not found' })
    }

    // Update the user's status to 'approved' to officially accept the student
    if (userId) {
      await pool.query(
        'UPDATE users SET status = ? WHERE id = ?',
        ['approved', userId]
      )
      console.log(`✅ User ${userId} status updated to 'approved'`)
    }

    console.log('✅ Enrollment approved:', { enrollmentId: parseInt(req.params.id), student_id: userId })

    res.json({ message: 'Enrollment approved successfully. Student has been accepted.', enrollmentId: parseInt(req.params.id) })
  } catch (error) {
    console.error('Error approving enrollment:', error)
    res.status(500).json({ error: 'Failed to approve enrollment' })
  }
})

// ─── PUT Reject enrollment (frontdesk action) ─────────────────
router.put('/:id/reject', async (req, res) => {
  try {
    const [enrollment] = await pool.query(
      'SELECT e.* FROM enrollments e WHERE e.id = ?',
      [req.params.id]
    )

    if (enrollment.length === 0) {
      return res.status(404).json({ error: 'Enrollment not found' })
    }

    if (enrollment[0].status !== 'pending') {
      return res.status(400).json({ error: `Cannot reject enrollment with status '${enrollment[0].status}'. Only pending enrollments can be rejected.` })
    }

    const [result] = await pool.query(
      'UPDATE enrollments SET status = ? WHERE id = ?',
      ['rejected', req.params.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Enrollment not found' })
    }

    // Also update the user's status to 'rejected' to match
    const userId = enrollment[0].student_id
    if (userId) {
      await pool.query(
        'UPDATE users SET status = ? WHERE id = ?',
        ['rejected', userId]
      )
      console.log(`✅ User ${userId} status updated to 'rejected'`)
    }

    console.log('✅ Enrollment rejected:', { enrollmentId: parseInt(req.params.id), student_id: enrollment[0].student_id })

    res.json({ message: 'Enrollment rejected successfully', enrollmentId: parseInt(req.params.id) })
  } catch (error) {
    console.error('Error rejecting enrollment:', error)
    res.status(500).json({ error: 'Failed to reject enrollment' })
  }
})

// ─── PUT Update enrollment ─────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { course_id, package_id, instructor_id, end_date, status, sessions_attended, total_sessions, notes } = req.body

    const [result] = await pool.query(
      `UPDATE enrollments SET course_id = ?, package_id = ?, instructor_id = ?, end_date = ?, status = ?, sessions_attended = ?, total_sessions = ?, notes = ? WHERE id = ?`,
      [course_id, package_id, instructor_id, end_date, status || 'active', sessions_attended || 0, total_sessions || 0, notes, req.params.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Enrollment not found' })
    }
    res.json({ message: 'Enrollment updated successfully' })
  } catch (error) {
    console.error('Error updating enrollment:', error)
    res.status(500).json({ error: 'Failed to update enrollment' })
  }
})

// ─── DELETE enrollment ─────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM enrollments WHERE id = ?', [req.params.id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Enrollment not found' })
    }
    res.json({ message: 'Enrollment deleted successfully' })
  } catch (error) {
    console.error('Error deleting enrollment:', error)
    res.status(500).json({ error: 'Failed to delete enrollment' })
  }
})

export default router