/**
 * Instruments & Instrument Rentals API Routes
 */

import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// ─── GET all instruments ───────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM instruments ORDER BY name ASC')
    res.json(rows)
  } catch (error) {
    console.error('Error fetching instruments:', error)
    res.status(500).json({ error: 'Failed to fetch instruments' })
  }
})

// ─── POST Create instrument ────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, category, brand, model, serial_number, purchase_date, purchase_price, rental_rate_per_day, rental_rate_per_week, rental_rate_per_month, deposit_amount, condition_notes } = req.body

    if (!name || !category) {
      return res.status(400).json({ error: 'Instrument name and category are required' })
    }

    const [result] = await pool.query(
      `INSERT INTO instruments (name, category, brand, model, serial_number, purchase_date, purchase_price, rental_rate_per_day, rental_rate_per_week, rental_rate_per_month, deposit_amount, condition_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, category, brand || null, model || null, serial_number || null, purchase_date || null, purchase_price || 0, rental_rate_per_day || 0, rental_rate_per_week || 0, rental_rate_per_month || 0, deposit_amount || 0, condition_notes || null]
    )

    res.status(201).json({ message: 'Instrument created successfully', instrumentId: result.insertId })
  } catch (error) {
    console.error('Error creating instrument:', error)
    res.status(500).json({ error: 'Failed to create instrument' })
  }
})

// ─── PUT Update instrument ─────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { name, category, brand, model, serial_number, purchase_date, purchase_price, rental_rate_per_day, rental_rate_per_week, rental_rate_per_month, deposit_amount, status, condition_notes } = req.body

    const [result] = await pool.query(
      `UPDATE instruments SET name = ?, category = ?, brand = ?, model = ?, serial_number = ?, purchase_date = ?, purchase_price = ?, rental_rate_per_day = ?, rental_rate_per_week = ?, rental_rate_per_month = ?, deposit_amount = ?, status = ?, condition_notes = ? WHERE id = ?`,
      [name, category, brand, model, serial_number, purchase_date, purchase_price, rental_rate_per_day, rental_rate_per_week, rental_rate_per_month, deposit_amount, status || 'available', condition_notes, req.params.id]
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

// ─── DELETE instrument ─────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM instruments WHERE id = ?', [req.params.id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Instrument not found' })
    }
    res.json({ message: 'Instrument deleted successfully' })
  } catch (error) {
    console.error('Error deleting instrument:', error)
    res.status(500).json({ error: 'Failed to delete instrument' })
  }
})

// ─── GET all instrument rentals ────────────────────────────────
router.get('/rentals/all', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ir.*, i.name as instrument_name, i.category as instrument_category,
              CONCAT(s.first_name, ' ', s.last_name) as student_name
       FROM instrument_rentals ir
       LEFT JOIN instruments i ON ir.instrument_id = i.id
       LEFT JOIN students s ON ir.student_id = s.id
       ORDER BY ir.created_at DESC`
    )
    res.json(rows)
  } catch (error) {
    console.error('Error fetching instrument rentals:', error)
    res.status(500).json({ error: 'Failed to fetch instrument rentals' })
  }
})

// ─── POST Create instrument rental ─────────────────────────────
router.post('/rentals', async (req, res) => {
  try {
    const { instrument_id, student_id, renter_name, rental_start_date, rental_end_date, rental_type, rate_at_time_of_rental, deposit_amount, deposit_paid, total_fee, notes } = req.body

    if (!instrument_id || !renter_name || !rental_start_date || !rate_at_time_of_rental) {
      return res.status(400).json({ error: 'Instrument ID, renter name, start date, and rate are required' })
    }

    const [result] = await pool.query(
      `INSERT INTO instrument_rentals (instrument_id, student_id, renter_name, rental_start_date, rental_end_date, rental_type, rate_at_time_of_rental, deposit_amount, deposit_paid, total_fee, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [instrument_id, student_id || null, renter_name, rental_start_date, rental_end_date || null, rental_type || 'monthly', rate_at_time_of_rental, deposit_amount || 0, deposit_paid || false, total_fee || 0, notes || null]
    )

    // Update instrument status to rented
    await pool.query('UPDATE instruments SET status = ? WHERE id = ?', ['rented', instrument_id])

    // Create a charge for the rental
    await pool.query(
      `INSERT INTO charges (ref_type, ref_id, customer_name, service_type, description, amount)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['instrument_rental', result.insertId, renter_name, 'Instrument rental', `Rental of instrument starting ${rental_start_date}`, total_fee || rate_at_time_of_rental]
    )

    res.status(201).json({ message: 'Instrument rental created successfully', rentalId: result.insertId })
  } catch (error) {
    console.error('Error creating instrument rental:', error)
    res.status(500).json({ error: 'Failed to create instrument rental' })
  }
})

// ─── PUT Return instrument ─────────────────────────────────────
router.put('/rentals/:id/return', async (req, res) => {
  try {
    const { condition_on_return } = req.body

    const [rental] = await pool.query('SELECT instrument_id FROM instrument_rentals WHERE id = ?', [req.params.id])
    if (rental.length === 0) {
      return res.status(404).json({ error: 'Rental not found' })
    }

    await pool.query(
      'UPDATE instrument_rentals SET status = ?, returned_at = NOW(), condition_on_return = ? WHERE id = ?',
      ['returned', condition_on_return || null, req.params.id]
    )

    // Set instrument back to available
    await pool.query('UPDATE instruments SET status = ? WHERE id = ?', ['available', rental[0].instrument_id])

    res.json({ message: 'Instrument returned successfully' })
  } catch (error) {
    console.error('Error returning instrument:', error)
    res.status(500).json({ error: 'Failed to return instrument' })
  }
})

export default router