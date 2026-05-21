/**
 * Studios & Studio Bookings API Routes
 */

import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// ─── GET all studios ───────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM studios ORDER BY name ASC')
    res.json(rows)
  } catch (error) {
    console.error('Error fetching studios:', error)
    res.status(500).json({ error: 'Failed to fetch studios' })
  }
})

// ─── POST Create studio ────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, room_number, capacity, equipment_notes, hourly_rate } = req.body
    if (!name || !room_number) {
      return res.status(400).json({ error: 'Studio name and room number are required' })
    }
    const [result] = await pool.query(
      'INSERT INTO studios (name, room_number, capacity, equipment_notes, hourly_rate) VALUES (?, ?, ?, ?, ?)',
      [name, room_number, capacity || 1, equipment_notes || null, hourly_rate || 0]
    )
    res.status(201).json({ message: 'Studio created successfully', studioId: result.insertId })
  } catch (error) {
    console.error('Error creating studio:', error)
    res.status(500).json({ error: 'Failed to create studio' })
  }
})

// ─── GET all studio bookings ───────────────────────────────────
router.get('/bookings', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sb.*, st.name as studio_name, st.room_number,
              CONCAT(s.first_name, ' ', s.last_name) as student_name
       FROM studio_bookings sb
       LEFT JOIN studios st ON sb.studio_id = st.id
       LEFT JOIN students s ON sb.student_id = s.id
       ORDER BY sb.booking_date DESC, sb.start_time ASC`
    )
    res.json(rows)
  } catch (error) {
    console.error('Error fetching studio bookings:', error)
    res.status(500).json({ error: 'Failed to fetch studio bookings' })
  }
})

// ─── POST Create studio booking ────────────────────────────────
router.post('/bookings', async (req, res) => {
  try {
    const { studio_id, student_id, instructor_id, client_name, booking_date, start_time, end_time, duration_minutes, purpose, total_fee, notes } = req.body

    if (!studio_id || !client_name || !booking_date || !start_time || !end_time) {
      return res.status(400).json({ error: 'Studio ID, client name, date, start time, and end time are required' })
    }

    const calcDuration = duration_minutes || (() => {
      const start = new Date(`2000-01-01T${start_time}`)
      const end = new Date(`2000-01-01T${end_time}`)
      return (end - start) / 60000
    })()

    const [result] = await pool.query(
      `INSERT INTO studio_bookings (studio_id, student_id, instructor_id, client_name, booking_date, start_time, end_time, duration_minutes, purpose, total_fee, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [studio_id, student_id || null, instructor_id || null, client_name, booking_date, start_time, end_time, calcDuration, purpose || null, total_fee || 0, notes || null]
    )

    // Automatically create a charge for studio booking
    if (total_fee && total_fee > 0) {
      await pool.query(
        `INSERT INTO charges (ref_type, ref_id, customer_name, service_type, description, amount)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['studio_booking', result.insertId, client_name, 'Studio booking', `Studio booking on ${booking_date}`, total_fee]
      )
    }

    // Update studio status to occupied
    await pool.query('UPDATE studios SET status = ? WHERE id = ?', ['occupied', studio_id])

    res.status(201).json({ message: 'Studio booking created successfully', bookingId: result.insertId })
  } catch (error) {
    console.error('Error creating studio booking:', error)
    res.status(500).json({ error: 'Failed to create studio booking' })
  }
})

// ─── PUT Update booking status ─────────────────────────────────
router.put('/bookings/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    if (!['confirmed', 'cancelled', 'completed', 'no_show'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' })
    }

    const [result] = await pool.query('UPDATE studio_bookings SET status = ? WHERE id = ?', [status, req.params.id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    // If completed or cancelled, set studio back to available
    if (status === 'completed' || status === 'cancelled' || status === 'no_show') {
      const [booking] = await pool.query('SELECT studio_id FROM studio_bookings WHERE id = ?', [req.params.id])
      if (booking.length > 0) {
        await pool.query('UPDATE studios SET status = ? WHERE id = ?', ['available', booking[0].studio_id])
      }
    }

    res.json({ message: `Booking status updated to ${status}` })
  } catch (error) {
    console.error('Error updating booking status:', error)
    res.status(500).json({ error: 'Failed to update booking status' })
  }
})

export default router