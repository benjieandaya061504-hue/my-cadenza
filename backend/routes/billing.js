/**
 * Billing API Routes
 * Handles billing and invoice management (CRUD operations)
 */

import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// ─── GET all billing records ───────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Billing ORDER BY created_at DESC')
    res.json(rows)
  } catch (error) {
    console.error('Error fetching billing records:', error)
    res.status(500).json({ error: 'Failed to fetch billing records' })
  }
})

// ─── GET single billing record by ID ───────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Billing WHERE billing_id = ?', [req.params.id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Billing record not found' })
    }
    res.json(rows[0])
  } catch (error) {
    console.error('Error fetching billing record:', error)
    res.status(500).json({ error: 'Failed to fetch billing record' })
  }
})

// ─── POST create a new billing record ──────────────────────────
router.post('/', async (req, res) => {
  try {
    const { student_id, amount, due_date, status, description } = req.body
    if (!student_id || !amount) {
      return res.status(400).json({ error: 'Student ID and amount are required' })
    }
    const [result] = await pool.query(
      'INSERT INTO Billing (student_id, amount, due_date, status, description) VALUES (?, ?, ?, ?, ?)',
      [student_id, amount, due_date || null, status || 'pending', description || null]
    )
    res.status(201).json({ message: 'Billing record created successfully', billingId: result.insertId })
  } catch (error) {
    console.error('Error creating billing record:', error)
    res.status(500).json({ error: 'Failed to create billing record' })
  }
})

// ─── PUT update a billing record ───────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { amount, due_date, status, description } = req.body
    const [result] = await pool.query(
      'UPDATE Billing SET amount = ?, due_date = ?, status = ?, description = ? WHERE billing_id = ?',
      [amount, due_date, status, description, req.params.id]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Billing record not found' })
    }
    res.json({ message: 'Billing record updated successfully' })
  } catch (error) {
    console.error('Error updating billing record:', error)
    res.status(500).json({ error: 'Failed to update billing record' })
  }
})

// ─── DELETE a billing record ───────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM Billing WHERE billing_id = ?', [req.params.id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Billing record not found' })
    }
    res.json({ message: 'Billing record deleted successfully' })
  } catch (error) {
    console.error('Error deleting billing record:', error)
    res.status(500).json({ error: 'Failed to delete billing record' })
  }
})

export default router