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

// ─── GET all lesson packages ────────────────────────────────────
router.get('/packages/all', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM lesson_packages ORDER BY created_at DESC')
    res.json(rows)
  } catch (error) {
    console.error('Error fetching lesson packages:', error)
    res.status(500).json({ error: 'Failed to fetch lesson packages' })
  }
})

// ─── POST create a lesson package ───────────────────────────────
router.post('/packages', async (req, res) => {
  try {
    const { name, duration_minutes, session_limit, category_kind, category, description, rate } = req.body

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Package name is required' })
    }
    if (!duration_minutes || duration_minutes < 1) {
      return res.status(400).json({ error: 'Duration must be at least 1 minute' })
    }
    if (!session_limit || session_limit < 1) {
      return res.status(400).json({ error: 'Session limit must be at least 1' })
    }
    if (!category_kind || !['instrument', 'course'].includes(category_kind)) {
      return res.status(400).json({ error: 'Category basis must be "instrument" or "course"' })
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ error: 'Category (instrument or course type) is required' })
    }

    const [result] = await pool.query(
      `INSERT INTO lesson_packages (name, duration_minutes, session_limit, category_kind, category, description, rate)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name.trim(), Number(duration_minutes), Number(session_limit), category_kind, category.trim(), description || null, rate || 0]
    )

    // Fetch the newly created record to return full data
    const [newPackage] = await pool.query('SELECT * FROM lesson_packages WHERE id = ?', [result.insertId])

    res.status(201).json({ message: 'Lesson package created successfully', package: newPackage[0] })
  } catch (error) {
    console.error('Error creating lesson package:', error)
    res.status(500).json({ error: 'Failed to create lesson package' })
  }
})

// ─── PUT update a lesson package ──────────────────────────────
router.put('/packages/:id', async (req, res) => {
  try {
    const { name, duration_minutes, session_limit, category_kind, category, description, rate } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Package name is required' })
    }

    const [result] = await pool.query(
      `UPDATE lesson_packages
       SET name = ?, duration_minutes = ?, session_limit = ?, category_kind = ?, category = ?, description = ?, rate = ?
       WHERE id = ?`,
      [
        name.trim(),
        Number(duration_minutes),
        Number(session_limit),
        category_kind,
        category.trim(),
        description || null,
        rate || 0,
        req.params.id,
      ]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lesson package not found' })
    }

    // Fetch the updated record
    const [updated] = await pool.query('SELECT * FROM lesson_packages WHERE id = ?', [req.params.id])

    res.json({ message: 'Lesson package updated successfully', package: updated[0] })
  } catch (error) {
    console.error('Error updating lesson package:', error)
    res.status(500).json({ error: 'Failed to update lesson package' })
  }
})

export default router
