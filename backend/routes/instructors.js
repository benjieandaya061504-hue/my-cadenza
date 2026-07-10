/**
 * Instructors API Routes
 * Handles instructor CRUD operations
 */

import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// ─── GET all instructors ───────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT i.* FROM instructors i ORDER BY i.created_at DESC'
    )
    res.json(rows)
  } catch (error) {
    console.error('Error fetching instructors:', error)
    res.status(500).json({ error: 'Failed to fetch instructors' })
  }
})

// ─── GET single instructor by ID ───────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT i.* FROM instructors i WHERE i.id = ?',
      [req.params.id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Instructor not found' })
    }
    res.json(rows[0])
  } catch (error) {
    console.error('Error fetching instructor:', error)
    res.status(500).json({ error: 'Failed to fetch instructor' })
  }
})

// ─── POST Create new instructor ────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, email, contact_number, address, specialization, bio, hourly_rate, commission_percentage } = req.body

    if (!first_name || !last_name || !email || !contact_number) {
      return res.status(400).json({ error: 'First name, last name, email, and contact number are required' })
    }

    const [result] = await pool.query(
      `INSERT INTO instructors (first_name, last_name, email, contact_number, address, specialization, bio, hourly_rate, commission_percentage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, contact_number, address || null, specialization || null, bio || null, hourly_rate || 0, commission_percentage || 0]
    )

    res.status(201).json({ message: 'Instructor created successfully', instructorId: result.insertId })
  } catch (error) {
    console.error('Error creating instructor:', error)
    res.status(500).json({ error: 'Failed to create instructor' })
  }
})

// ─── PUT Update instructor ─────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { first_name, last_name, email, contact_number, address, specialization, bio, hourly_rate, commission_percentage, status } = req.body

    const [result] = await pool.query(
      `UPDATE instructors SET first_name = ?, last_name = ?, email = ?, contact_number = ?, address = ?, specialization = ?, bio = ?, hourly_rate = ?, commission_percentage = ?, status = ? WHERE id = ?`,
      [first_name, last_name, email, contact_number, address, specialization, bio, hourly_rate, commission_percentage, status || 'active', req.params.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Instructor not found' })
    }
    res.json({ message: 'Instructor updated successfully' })
  } catch (error) {
    console.error('Error updating instructor:', error)
    res.status(500).json({ error: 'Failed to update instructor' })
  }
})

// ─── DELETE instructor ─────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM instructors WHERE id = ?', [req.params.id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Instructor not found' })
    }
    res.json({ message: 'Instructor deleted successfully' })
  } catch (error) {
    console.error('Error deleting instructor:', error)
    res.status(500).json({ error: 'Failed to delete instructor' })
  }
})

export default router