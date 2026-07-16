/**
 * Instruments API Routes
 * Handles instrument management (CRUD operations) and instrument rental workflow
 */

import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// ─── GET all instruments ───────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM equipment')
    res.json(rows)
  } catch (error) {
    console.error('Error fetching instruments:', error)
    res.status(500).json({ error: 'Failed to fetch instruments' })
  }
})

// ─── GET single instrument by ID ───────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM equipment WHERE equipment_id = ?', [req.params.id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Instrument not found' })
    }
    res.json(rows[0])
  } catch (error) {
    console.error('Error fetching instrument:', error)
    res.status(500).json({ error: 'Failed to fetch instrument' })
  }
})

// ─── POST create a new instrument ──────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { instrument_name, type, brand, description, quantity } = req.body
    if (!instrument_name) {
      return res.status(400).json({ error: 'Instrument name is required' })
    }
    const [result] = await pool.query(
      'INSERT INTO equipment (equipment_id, eqp_name, brand_name, quantity) VALUES (?, ?, ?, ?)',
      [req.body.equipment_id || req.body.instrument_id || '', instrument_name, brand || null, quantity || 0]
    )
    res.status(201).json({ message: 'Instrument created successfully', instrumentId: result.insertId })
  } catch (error) {
    console.error('Error creating instrument:', error)
    res.status(500).json({ error: 'Failed to create instrument' })
  }
})

// ─── PUT update an instrument ──────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { instrument_name, type, brand, description, quantity } = req.body
    const [result] = await pool.query(
      'UPDATE equipment SET eqp_name = ?, brand_name = ?, quantity = ? WHERE equipment_id = ?',
      [instrument_name, brand, quantity, req.params.id]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Instrument not found' })
    }
    res.json({ message: 'Instrument updated successfully' })
  } catch (error) {
    console.error('Error updating instrument:', error)
    res.status(500).json({ error: 'Failed to update instrument' })
  }
})

// ─── DELETE an instrument ──────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM equipment WHERE equipment_id = ?', [req.params.id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Instrument not found' })
    }
    res.json({ message: 'Instrument deleted successfully' })
  } catch (error) {
    console.error('Error deleting instrument:', error)
    res.status(500).json({ error: 'Failed to delete instrument' })
  }
})

// ================================================================
// INSTRUMENT RENTALS API
// ================================================================

// ─── GET all rental requests (for frontdesk approval page) ─────
router.get('/rentals/all', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ir.*, 
              CONCAT(COALESCE(e.first_name, ''), ' ', COALESCE(e.last_name, '')) as student_name,
              COALESCE(eqt.eqp_name, 'Unknown') as instrument_name
       FROM instrument_rentals ir
       LEFT JOIN enrollments e ON ir.student_id = e.id
       LEFT JOIN equipment eqt ON ir.instrument_id = eqt.equipment_id
       ORDER BY ir.created_at DESC`
    )
    res.json(rows)
  } catch (error) {
    console.error('Error fetching rentals:', error)
    res.status(500).json({ error: 'Failed to fetch rental requests' })
  }
})

// ─── GET pending rental requests ──────────────────────────────
router.get('/rentals/pending', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ir.*, 
              CONCAT(COALESCE(e.first_name, ''), ' ', COALESCE(e.last_name, '')) as student_name,
              COALESCE(eqt.eqp_name, 'Unknown') as instrument_name
       FROM instrument_rentals ir
       LEFT JOIN enrollments e ON ir.student_id = e.id
       LEFT JOIN equipment eqt ON ir.instrument_id = eqt.equipment_id
       WHERE ir.status = 'pending'
       ORDER BY ir.created_at DESC`
    )
    res.json(rows)
  } catch (error) {
    console.error('Error fetching pending rentals:', error)
    res.status(500).json({ error: 'Failed to fetch pending rental requests' })
  }
})

// ─── POST create new rental request (from landing page) ────────
router.post('/rentals', async (req, res) => {
  try {
    const {
      student_id,
      instrument_id,
      renter_name,
      contact_number,
      email,
      address,
      rental_start_date,
      duration_months,
      monthly_rate,
      deposit_amount,
      total_amount,
      payment_method,
      payment_reference,
      notes
    } = req.body

    if (!renter_name || !rental_start_date) {
      return res.status(400).json({ error: 'renter_name and rental_start_date are required' })
    }

    const safeStudentId = student_id || 0

    // NOTE: client_id is intentionally omitted (NULL) for student-submitted rentals.
    // Students are tracked via student_id (enrollments.id), not the separate `client` table
    // which stores admin-managed client records (IDs 1-5).
    // If admins later need to query rentals by student more formally, consider adding
    // a proper FK link — e.g. an enrollment_id or student_id FK — instead of reusing client_id.
    const [result] = await pool.query(
      `INSERT INTO instrument_rentals 
        (student_id, equipment_id, instrument_id, renter_name, contact_number, email, address,
         rental_start_date, duration_months, monthly_rate, deposit_amount, total_amount,
         payment_method, payment_reference, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        safeStudentId,
        instrument_id || null,
        instrument_id || null,
        renter_name,
        contact_number || null,
        email || null,
        address || null,
        rental_start_date,
        duration_months || 1,
        monthly_rate || 0,
        deposit_amount || 0,
        total_amount || 0,
        payment_method || null,
        payment_reference || null,
        notes || null
      ]
    )

    console.log('✅ Rental request created:', { rentalId: result.insertId, student_id })

    res.status(201).json({
      message: 'Rental request submitted successfully',
      rentalId: result.insertId,
      status: 'pending'
    })
  } catch (error) {
    console.error('Error creating rental:', error)
    res.status(500).json({ error: `Failed to create rental request: ${error.message}` })
  }
})

// ─── PUT Approve rental (frontdesk action) ────────────────────
router.put('/rentals/:id/approve', async (req, res) => {
  try {
    const [rental] = await pool.query(
      'SELECT * FROM instrument_rentals WHERE id = ?',
      [req.params.id]
    )

    if (rental.length === 0) {
      return res.status(404).json({ error: 'Rental request not found' })
    }

    if (rental[0].status !== 'pending') {
      return res.status(400).json({
        error: `Cannot approve rental with status '${rental[0].status}'. Only pending rentals can be approved.`
      })
    }

    const [result] = await pool.query(
      'UPDATE instrument_rentals SET status = ? WHERE id = ?',
      ['approved', req.params.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Rental request not found' })
    }

    console.log('✅ Rental approved:', { rentalId: parseInt(req.params.id) })

    res.json({ message: 'Rental approved successfully', rentalId: parseInt(req.params.id) })
  } catch (error) {
    console.error('Error approving rental:', error)
    res.status(500).json({ error: 'Failed to approve rental' })
  }
})

// ─── PUT Reject rental (frontdesk action) ─────────────────────
router.put('/rentals/:id/reject', async (req, res) => {
  try {
    const [rental] = await pool.query(
      'SELECT * FROM instrument_rentals WHERE id = ?',
      [req.params.id]
    )

    if (rental.length === 0) {
      return res.status(404).json({ error: 'Rental request not found' })
    }

    if (rental[0].status !== 'pending') {
      return res.status(400).json({
        error: `Cannot reject rental with status '${rental[0].status}'. Only pending rentals can be rejected.`
      })
    }

    const [result] = await pool.query(
      'UPDATE instrument_rentals SET status = ? WHERE id = ?',
      ['rejected', req.params.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Rental request not found' })
    }

    console.log('✅ Rental rejected:', { rentalId: parseInt(req.params.id) })

    res.json({ message: 'Rental rejected successfully', rentalId: parseInt(req.params.id) })
  } catch (error) {
    console.error('Error rejecting rental:', error)
    res.status(500).json({ error: 'Failed to reject rental' })
  }
})

// ─── PUT Mark rental as returned ──────────────────────────────
router.put('/rentals/:id/return', async (req, res) => {
  try {
    const [rental] = await pool.query(
      'SELECT * FROM instrument_rentals WHERE id = ?',
      [req.params.id]
    )

    if (rental.length === 0) {
      return res.status(404).json({ error: 'Rental request not found' })
    }

    if (rental[0].status !== 'approved' && rental[0].status !== 'active') {
      return res.status(400).json({
        error: `Cannot return rental with status '${rental[0].status}'. Only approved/active rentals can be returned.`
      })
    }

    const [result] = await pool.query(
      'UPDATE instrument_rentals SET status = ?, rental_end_date = CURDATE() WHERE id = ?',
      ['returned', req.params.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Rental request not found' })
    }

    res.json({ message: 'Rental marked as returned successfully', rentalId: parseInt(req.params.id) })
  } catch (error) {
    console.error('Error returning rental:', error)
    res.status(500).json({ error: 'Failed to return rental' })
  }
})

export default router