/**
 * Instruments API Routes
 * Handles instrument management (CRUD operations)
 */

import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// ─── GET all instruments ───────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Instrument ORDER BY created_at DESC')
    res.json(rows)
  } catch (error) {
    console.error('Error fetching instruments:', error)
    res.status(500).json({ error: 'Failed to fetch instruments' })
  }
})

// ─── GET single instrument by ID ───────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Instrument WHERE instrument_id = ?', [req.params.id])
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
      'INSERT INTO Instrument (instrument_name, type, brand, description, quantity) VALUES (?, ?, ?, ?, ?)',
      [instrument_name, type || null, brand || null, description || null, quantity || 0]
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
      'UPDATE Instrument SET instrument_name = ?, type = ?, brand = ?, description = ?, quantity = ? WHERE instrument_id = ?',
      [instrument_name, type, brand, description, quantity, req.params.id]
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
    const [result] = await pool.query('DELETE FROM Instrument WHERE instrument_id = ?', [req.params.id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Instrument not found' })
    }
    res.json({ message: 'Instrument deleted successfully' })
  } catch (error) {
    console.error('Error deleting instrument:', error)
    res.status(500).json({ error: 'Failed to delete instrument' })
  }
})

export default router