/**
 * Enrollment Requests API Routes
 * Handles student enrollment submissions for frontdesk approval workflow
 */
import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// ─── POST Submit enrollment request ──────────────────────────────
router.post('/', async (req, res) => {
  try {
    const {
      student_id,
      course,
      schedule,
      program,
      notes,
      contact_number,
      student_address,
      payment_reference,
      payment_method,
      total_amount
    } = req.body

    // Validate required fields
    if (!student_id) {
      return res.status(400).json({ error: 'student_id is required' })
    }

    // Verify the user exists in users table
    const [user] = await pool.query('SELECT id FROM users WHERE id = ?', [student_id])
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found. Please sign up first.' })
    }

    // Check if there's already a pending enrollment for this student
    const [existing] = await pool.query(
      'SELECT id FROM enrollments WHERE student_id = ? AND status = ?',
      [student_id, 'pending']
    )

    if (existing.length > 0) {
      // Update the existing enrollment with all fields
      await pool.query(
        `UPDATE enrollments SET
           course_requested = ?,
           schedule_requested = ?,
           program_requested = ?,
           notes = ?,
           contact_number = ?,
           student_address = ?,
           payment_reference = ?,
           payment_method = ?,
           total_amount = ?
         WHERE id = ?`,
        [
          course || null,
          schedule || null,
          program || null,
          notes || null,
          contact_number || null,
          student_address || null,
          payment_reference || null,
          payment_method || null,
          total_amount || null,
          existing[0].id
        ]
      )

      console.log('✅ Enrollment request updated:', { enrollmentId: existing[0].id, student_id })

      return res.json({
        message: 'Enrollment request updated successfully',
        enrollmentId: existing[0].id,
        status: 'pending'
      })
    }

    // Create new enrollment record with all fields
    const [result] = await pool.query(
      `INSERT INTO enrollments
         (student_id, enrollment_date, status, course_requested, schedule_requested, program_requested,
          notes, contact_number, student_address, payment_reference, payment_method, total_amount)
       VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        student_id,
        'pending',
        course || null,
        schedule || null,
        program || null,
        notes || null,
        contact_number || null,
        student_address || null,
        payment_reference || null,
        payment_method || null,
        total_amount || null
      ]
    )

    console.log('✅ Enrollment request submitted:', { enrollmentId: result.insertId, student_id, status: 'pending' })

    res.status(201).json({
      message: 'Enrollment request submitted successfully',
      enrollmentId: result.insertId,
      status: 'pending'
    })

  } catch (error) {
    console.error('❌ Enrollment request error:', error)
    res.status(500).json({ error: 'An unexpected error occurred while submitting enrollment request. Please try again later.' })
  }
})

// ─── GET enrollment requests by student ID ──────────────────────
router.get('/student/:studentId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, 
              CONCAT(e.first_name, ' ', COALESCE(e.middle_name, ''), ' ', e.last_name, COALESCE(CONCAT(' ', e.suffix), '')) as student_name
       FROM enrollments e
       WHERE e.student_id = ?
       ORDER BY e.enrollment_date DESC`,
      [req.params.studentId]
    )
    res.json(rows)
  } catch (error) {
    console.error('Error fetching enrollment requests:', error)
    res.status(500).json({ error: 'Failed to fetch enrollment requests' })
  }
})

export default router