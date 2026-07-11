/**
 * Studios API Routes
 * Handles studio/room management (CRUD operations)
 */

import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// ─── GET all studios ───────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Studio ORDER BY created_at DESC')
    res.json(rows)
  } catch (error) {
    console.error('Error fetching studios:', error)
    res.status(500).json({ error: 'Failed to fetch studios' })
  }
})

// ─── GET single studio by ID ───────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Studio WHERE studio_id = ?', [req.params.id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Studio not found' })
    }
    res.json(rows[0])
  } catch (error) {
    console.error('Error fetching studio:', error)
    res.status(500).json({ error: 'Failed to fetch studio' })
  }
})

// ─── POST create a new studio ──────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { studio_name, location, capacity, description } = req.body
    if (!studio_name) {
      return res.status(400).json({ error: 'Studio name is required' })
    }
    const [result] = await pool.query(
      'INSERT INTO Studio (studio_name, location, capacity, description) VALUES (?, ?, ?, ?)',
      [studio_name, location || null, capacity || null, description || null]
    )
    res.status(201).json({ message: 'Studio created successfully', studioId: result.insertId })
  } catch (error) {
    console.error('Error creating studio:', error)
    res.status(500).json({ error: 'Failed to create studio' })
  }
})

// ─── PUT update a studio ───────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { studio_name, location, capacity, description } = req.body
    const [result] = await pool.query(
      'UPDATE Studio SET studio_name = ?, location = ?, capacity = ?, description = ? WHERE studio_id = ?',
      [studio_name, location, capacity, description, req.params.id]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Studio not found' })
    }
    res.json({ message: 'Studio updated successfully' })
  } catch (error) {
    console.error('Error updating studio:', error)
    res.status(500).json({ error: 'Failed to update studio' })
  }
})

// ─── DELETE a studio ───────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM Studio WHERE studio_id = ?', [req.params.id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Studio not found' })
    }
    res.json({ message: 'Studio deleted successfully' })
  } catch (error) {
    console.error('Error deleting studio:', error)
    res.status(500).json({ error: 'Failed to delete studio' })
  }
})

export default router