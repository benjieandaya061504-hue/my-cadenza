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
      `SELECT enrollment_id AS id, e.*,
              CONCAT(COALESCE(e.first_name, ''), ' ', COALESCE(e.last_name, '')) as student_name
       FROM enrollments e
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
      `SELECT enrollment_id AS id, e.*,
              e.student_id as user_id,
              e.email,
              e.contact_number as user_contact
       FROM enrollments e
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
      `SELECT enrollment_id AS id, e.*,
              e.student_id as user_id,
              e.email,
              e.contact_number as user_contact
       FROM enrollments e
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
      `SELECT enrollment_id AS id, e.*,
              CONCAT(COALESCE(e.first_name, ''), ' ', COALESCE(e.last_name, '')) as student_name
       FROM enrollments e
       WHERE e.enrollment_id = ?`,
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
      `SELECT enrollment_id AS id, e.*
       FROM enrollments e
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
    const { student_id, course_id, enrollment_date, notes } = req.body

    if (!student_id || !enrollment_date) {
      return res.status(400).json({ error: 'Student ID and enrollment date are required' })
    }

    const [result] = await pool.query(
      `INSERT INTO enrollments (student_id, course_id, enrollment_date, notes, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [student_id, course_id || null, enrollment_date, notes || null]
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
    // Check enrollment exists and is pending
    const [enrollment] = await pool.query(
      'SELECT * FROM enrollments WHERE enrollment_id = ?',
      [req.params.id]
    )

    if (enrollment.length === 0) {
      return res.status(404).json({ error: 'Enrollment not found' })
    }

    if (enrollment[0].status !== 'pending') {
      return res.status(400).json({ error: `Cannot approve enrollment with status '${enrollment[0].status}'. Only pending enrollments can be approved.` })
    }

    // Update enrollment status to approved
    const [result] = await pool.query(
      'UPDATE enrollments SET status = ? WHERE enrollment_id = ?',
      ['approved', req.params.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Enrollment not found' })
    }

    console.log('✅ Enrollment approved:', { enrollmentId: parseInt(req.params.id) })

    res.json({ message: 'Enrollment approved successfully.', enrollmentId: parseInt(req.params.id) })
  } catch (error) {
    console.error('Error approving enrollment:', error)
    res.status(500).json({ error: 'Failed to approve enrollment' })
  }
})

// ─── PUT Reject enrollment (frontdesk action) ─────────────────
router.put('/:id/reject', async (req, res) => {
  try {
    const [enrollment] = await pool.query(
      'SELECT * FROM enrollments WHERE enrollment_id = ?',
      [req.params.id]
    )

    if (enrollment.length === 0) {
      return res.status(404).json({ error: 'Enrollment not found' })
    }

    if (enrollment[0].status !== 'pending') {
      return res.status(400).json({ error: `Cannot reject enrollment with status '${enrollment[0].status}'. Only pending enrollments can be rejected.` })
    }

    const [result] = await pool.query(
      'UPDATE enrollments SET status = ? WHERE enrollment_id = ?',
      ['rejected', req.params.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Enrollment not found' })
    }

    console.log('✅ Enrollment rejected:', { enrollmentId: parseInt(req.params.id) })

    res.json({ message: 'Enrollment rejected successfully', enrollmentId: parseInt(req.params.id) })
  } catch (error) {
    console.error('Error rejecting enrollment:', error)
    res.status(500).json({ error: 'Failed to reject enrollment' })
  }
})

// ─── PUT Update enrollment ─────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { course_id, status, notes } = req.body

    const [result] = await pool.query(
      `UPDATE enrollments SET course_id = ?, status = ?, notes = ? WHERE enrollment_id = ?`,
      [course_id, status || 'pending', notes, req.params.id]
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
    const [result] = await pool.query('DELETE FROM enrollments WHERE enrollment_id = ?', [req.params.id])
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