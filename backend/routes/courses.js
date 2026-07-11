/**
 * Courses API Routes
 * Handles course management (CRUD operations)
 */

import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// ─── GET all courses ───────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Course ORDER BY created_at DESC')
    res.json(rows)
  } catch (error) {
    console.error('Error fetching courses:', error)
    res.status(500).json({ error: 'Failed to fetch courses' })
  }
})

// ─── GET single course by ID ───────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Course WHERE course_id = ?', [req.params.id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' })
    }
    res.json(rows[0])
  } catch (error) {
    console.error('Error fetching course:', error)
    res.status(500).json({ error: 'Failed to fetch course' })
  }
})

// ─── POST create a new course ──────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { course_name, description, duration, fee } = req.body
    if (!course_name) {
      return res.status(400).json({ error: 'Course name is required' })
    }
    const [result] = await pool.query(
      'INSERT INTO Course (course_name, description, duration, fee) VALUES (?, ?, ?, ?)',
      [course_name, description || null, duration || null, fee || 0]
    )
    res.status(201).json({ message: 'Course created successfully', courseId: result.insertId })
  } catch (error) {
    console.error('Error creating course:', error)
    res.status(500).json({ error: 'Failed to create course' })
  }
})

// ─── PUT update a course ───────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { course_name, description, duration, fee } = req.body
    const [result] = await pool.query(
      'UPDATE Course SET course_name = ?, description = ?, duration = ?, fee = ? WHERE course_id = ?',
      [course_name, description, duration, fee, req.params.id]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found' })
    }
    res.json({ message: 'Course updated successfully' })
  } catch (error) {
    console.error('Error updating course:', error)
    res.status(500).json({ error: 'Failed to update course' })
  }
})

// ─── DELETE a course ───────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM Course WHERE course_id = ?', [req.params.id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found' })
    }
    res.json({ message: 'Course deleted successfully' })
  } catch (error) {
    console.error('Error deleting course:', error)
    res.status(500).json({ error: 'Failed to delete course' })
  }
})

export default router