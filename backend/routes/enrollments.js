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