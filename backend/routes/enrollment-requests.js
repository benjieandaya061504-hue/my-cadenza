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
      first_name,
      last_name,
      email,
      course,
      schedule,
      instructor,
      program,
      notes,
      contact_number,
      student_address,
      payment_reference,
      payment_method,
      total_amount,
      package_id,
      package_name
    } = req.body

    // Validate required fields
    const missingFields = []
    if (!student_id) missingFields.push('student_id')
    if (!first_name) missingFields.push('first_name')
    if (!last_name) missingFields.push('last_name')
    if (!email) missingFields.push('email')
    if (!contact_number) missingFields.push('contact_number')
    if (!student_address) missingFields.push('student_address')
    if (!payment_reference) missingFields.push('payment_reference')

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required field(s): ${missingFields.join(', ')}`
      })
    }

    // Check if there's already a pending enrollment for this student
    const [existing] = await pool.query(
      'SELECT id FROM enrollments WHERE student_id = ? AND status = ?',
      [student_id, 'pending']
    )

    if (existing.length > 0) {
      // Update the existing enrollment with all fields, including refreshed enrollment_date
      // TODO: instructor_requested is a temporary name-only field. Replace with instructor_id
      // foreign key once a real instructor management system is built.
      await pool.query(
        `UPDATE enrollments SET
           course_requested = ?,
           schedule_requested = ?,
           instructor_requested = ?,
           program_requested = ?,
           notes = ?,
           contact_number = ?,
           student_address = ?,
           payment_reference = ?,
           payment_method = ?,
           total_amount = ?,
           first_name = ?,
           last_name = ?,
           email = ?,
           package_id = ?,
           package_name = ?,
           enrollment_date = NOW()
         WHERE id = ?`,
        [
          course || null,
          schedule || null,
          instructor || null,
          program || null,
          notes || null,
          contact_number || null,
          student_address || null,
          payment_reference || null,
          payment_method || null,
          total_amount || null,
          first_name || null,
          last_name || null,
          email || null,
          package_id || null,
          package_name || null,
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
    // TODO: instructor_requested is a temporary name-only field. Replace with instructor_id
    // foreign key once a real instructor management system is built.
    const [result] = await pool.query(
      `INSERT INTO enrollments
         (student_id, enrollment_date, status, course_requested, schedule_requested, instructor_requested,
          program_requested, notes, contact_number, student_address, payment_reference, payment_method,
          total_amount, first_name, last_name, email, package_id, package_name)
       VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        student_id,
        'pending',
        course || null,
        schedule || null,
        instructor || null,
        program || null,
        notes || null,
        contact_number || null,
        student_address || null,
        payment_reference || null,
        payment_method || null,
        total_amount || null,
        first_name || null,
        last_name || null,
        email || null,
        package_id || null,
        package_name || null
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