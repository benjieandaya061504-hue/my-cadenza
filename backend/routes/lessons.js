/**
 * Lessons API Routes
 * Handles lesson management (CRUD operations)
 */

import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// ─── GET all lessons ───────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Lesson ORDER BY created_at DESC')
    res.json(rows)
  } catch (error) {
    console.error('Error fetching lessons:', error)
    res.status(500).json({ error: 'Failed to fetch lessons' })
  }
})

// ─── GET single lesson by ID ───────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Lesson WHERE lesson_id = ?', [req.params.id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' })
    }
    res.json(rows[0])
  } catch (error) {
    console.error('Error fetching lesson:', error)
    res.status(500).json({ error: 'Failed to fetch lesson' })
  }
})

// ─── POST create a new lesson ──────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { lesson_name, description, course_id, instructor_id, schedule, duration } = req.body
    if (!lesson_name || !course_id) {
      return res.status(400).json({ error: 'Lesson name and course ID are required' })
    }
    const [result] = await pool.query(
      'INSERT INTO Lesson (lesson_name, description, course_id, instructor_id, schedule, duration) VALUES (?, ?, ?, ?, ?, ?)',
      [lesson_name, description || null, course_id, instructor_id || null, schedule || null, duration || null]
    )
    res.status(201).json({ message: 'Lesson created successfully', lessonId: result.insertId })
  } catch (error) {
    console.error('Error creating lesson:', error)
    res.status(500).json({ error: 'Failed to create lesson' })
  }
})

// ─── PUT update a lesson ───────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { lesson_name, description, course_id, instructor_id, schedule, duration } = req.body
    const [result] = await pool.query(
      'UPDATE Lesson SET lesson_name = ?, description = ?, course_id = ?, instructor_id = ?, schedule = ?, duration = ? WHERE lesson_id = ?',
      [lesson_name, description, course_id, instructor_id, schedule, duration, req.params.id]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lesson not found' })
    }
    res.json({ message: 'Lesson updated successfully' })
  } catch (error) {
    console.error('Error updating lesson:', error)
    res.status(500).json({ error: 'Failed to update lesson' })
  }
})

// ─── DELETE a lesson ───────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM Lesson WHERE lesson_id = ?', [req.params.id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lesson not found' })
    }
    res.json({ message: 'Lesson deleted successfully' })
  } catch (error) {
    console.error('Error deleting lesson:', error)
    res.status(500).json({ error: 'Failed to delete lesson' })
  }
})

export default router