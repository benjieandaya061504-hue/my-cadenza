/**
 * Lesson Schedules & Attendance API Routes
 * Handles lesson scheduling and attendance tracking
 */

import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// ─── GET all lesson schedules ──────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ls.*,
              CONCAT(s.first_name, ' ', s.last_name) as student_name,
              CONCAT(i.first_name, ' ', i.last_name) as instructor_name,
              st.name as studio_name
       FROM lesson_schedules ls
       LEFT JOIN students s ON ls.student_id = s.id
       LEFT JOIN instructors i ON ls.instructor_id = i.id
       LEFT JOIN studios st ON ls.studio_id = st.id
       ORDER BY ls.scheduled_date DESC, ls.start_time ASC`
    )
    res.json(rows)
  } catch (error) {
    console.error('Error fetching lesson schedules:', error)
    res.status(500).json({ error: 'Failed to fetch lesson schedules' })
  }
})

// ─── GET schedules by instructor ID ────────────────────────────
router.get('/instructor/:instructorId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ls.*,
              CONCAT(s.first_name, ' ', s.last_name) as student_name,
              st.name as studio_name
       FROM lesson_schedules ls
       LEFT JOIN students s ON ls.student_id = s.id
       LEFT JOIN studios st ON ls.studio_id = st.id
       WHERE ls.instructor_id = ?
       ORDER BY ls.scheduled_date ASC, ls.start_time ASC`,
      [req.params.instructorId]
    )
    res.json(rows)
  } catch (error) {
    console.error('Error fetching instructor schedules:', error)
    res.status(500).json({ error: 'Failed to fetch schedules' })
  }
})

// ─── GET schedules by student ID ───────────────────────────────
router.get('/student/:studentId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ls.*,
              CONCAT(i.first_name, ' ', i.last_name) as instructor_name,
              st.name as studio_name
       FROM lesson_schedules ls
       LEFT JOIN instructors i ON ls.instructor_id = i.id
       LEFT JOIN studios st ON ls.studio_id = st.id
       WHERE ls.student_id = ?
       ORDER BY ls.scheduled_date ASC, ls.start_time ASC`,
      [req.params.studentId]
    )
    res.json(rows)
  } catch (error) {
    console.error('Error fetching student schedules:', error)
    res.status(500).json({ error: 'Failed to fetch schedules' })
  }
})

// ─── POST Create lesson schedule ───────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { enrollment_id, instructor_id, student_id, studio_id, scheduled_date, start_time, end_time, topic, notes } = req.body

    if (!enrollment_id || !instructor_id || !student_id || !scheduled_date || !start_time || !end_time) {
      return res.status(400).json({ error: 'Enrollment ID, instructor ID, student ID, date, start time, and end time are required' })
    }

    const [result] = await pool.query(
      `INSERT INTO lesson_schedules (enrollment_id, instructor_id, student_id, studio_id, scheduled_date, start_time, end_time, topic, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [enrollment_id, instructor_id, student_id, studio_id || null, scheduled_date, start_time, end_time, topic || null, notes || null]
    )

    res.status(201).json({ message: 'Lesson scheduled successfully', scheduleId: result.insertId })
  } catch (error) {
    console.error('Error creating lesson schedule:', error)
    res.status(500).json({ error: 'Failed to create lesson schedule' })
  }
})

// ─── PUT Update lesson schedule status ─────────────────────────
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    if (!['scheduled', 'completed', 'cancelled', 'rescheduled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' })
    }

    const [result] = await pool.query('UPDATE lesson_schedules SET status = ? WHERE id = ?', [status, req.params.id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lesson schedule not found' })
    }
    res.json({ message: `Schedule status updated to ${status}` })
  } catch (error) {
    console.error('Error updating schedule status:', error)
    res.status(500).json({ error: 'Failed to update schedule status' })
  }
})

// ─── DELETE lesson schedule ────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM lesson_schedules WHERE id = ?', [req.params.id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lesson schedule not found' })
    }
    res.json({ message: 'Lesson schedule deleted successfully' })
  } catch (error) {
    console.error('Error deleting lesson schedule:', error)
    res.status(500).json({ error: 'Failed to delete lesson schedule' })
  }
})

// ─── GET all attendance records ────────────────────────────────
router.get('/attendance/all', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*,
              CONCAT(s.first_name, ' ', s.last_name) as student_name,
              CONCAT(i.first_name, ' ', i.last_name) as instructor_name
       FROM attendance a
       LEFT JOIN students s ON a.student_id = s.id
       LEFT JOIN instructors i ON a.instructor_id = i.id
       ORDER BY a.created_at DESC`
    )
    res.json(rows)
  } catch (error) {
    console.error('Error fetching attendance:', error)
    res.status(500).json({ error: 'Failed to fetch attendance records' })
  }
})

// ─── POST Mark attendance ──────────────────────────────────────
router.post('/attendance', async (req, res) => {
  try {
    const { lesson_schedule_id, student_id, instructor_id, status, minutes_late, notes, marked_by } = req.body

    if (!lesson_schedule_id || !student_id || !instructor_id || !status) {
      return res.status(400).json({ error: 'Lesson schedule ID, student ID, instructor ID, and status are required' })
    }

    const [result] = await pool.query(
      `INSERT INTO attendance (lesson_schedule_id, student_id, instructor_id, status, minutes_late, notes, marked_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [lesson_schedule_id, student_id, instructor_id, status, minutes_late || 0, notes || null, marked_by || null]
    )

    // If student attended, increment sessions_attended in enrollment
    if (status === 'present' || status === 'late') {
      await pool.query(
        `UPDATE enrollments e
         JOIN lesson_schedules ls ON e.id = ls.enrollment_id
         SET e.sessions_attended = e.sessions_attended + 1
         WHERE ls.id = ?`,
        [lesson_schedule_id]
      )
    }

    res.status(201).json({ message: 'Attendance marked successfully', attendanceId: result.insertId })
  } catch (error) {
    console.error('Error marking attendance:', error)
    res.status(500).json({ error: 'Failed to mark attendance' })
  }
})

export default router