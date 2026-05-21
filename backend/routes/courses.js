/**
 * Courses & Packages API Routes
 * Handles course and package management
 */

import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// ─── GET all courses ───────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT c.*, CONCAT(i.first_name, " ", i.last_name) as instructor_name FROM courses c LEFT JOIN instructors i ON c.instructor_id = i.id ORDER BY c.created_at DESC'
    )
    res.json(rows)
  } catch (error) {
    console.error('Error fetching courses:', error)
    res.status(500).json({ error: 'Failed to fetch courses' })
  }
})

// ─── GET single course by ID ───────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT c.*, CONCAT(i.first_name, " ", i.last_name) as instructor_name FROM courses c LEFT JOIN instructors i ON c.instructor_id = i.id WHERE c.id = ?',
      [req.params.id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' })
    }
    res.json(rows[0])
  } catch (error) {
    console.error('Error fetching course:', error)
    res.status(500).json({ error: 'Failed to fetch course' })
  }
})

// ─── POST Create course ────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, description, category, duration_weeks, sessions_per_week, session_duration_minutes, price, instructor_id, max_students } = req.body

    if (!name || !price) {
      return res.status(400).json({ error: 'Course name and price are required' })
    }

    const [result] = await pool.query(
      `INSERT INTO courses (name, description, category, duration_weeks, sessions_per_week, session_duration_minutes, price, instructor_id, max_students)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description || null, category || null, duration_weeks || 0, sessions_per_week || 1, session_duration_minutes || 60, price, instructor_id || null, max_students || 10]
    )

    res.status(201).json({ message: 'Course created successfully', courseId: result.insertId })
  } catch (error) {
    console.error('Error creating course:', error)
    res.status(500).json({ error: 'Failed to create course' })
  }
})

// ─── PUT Update course ─────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { name, description, category, duration_weeks, sessions_per_week, session_duration_minutes, price, instructor_id, max_students, status } = req.body

    const [result] = await pool.query(
      `UPDATE courses SET name = ?, description = ?, category = ?, duration_weeks = ?, sessions_per_week = ?, session_duration_minutes = ?, price = ?, instructor_id = ?, max_students = ?, status = ? WHERE id = ?`,
      [name, description, category, duration_weeks, sessions_per_week, session_duration_minutes, price, instructor_id, max_students, status || 'active', req.params.id]
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

// ─── DELETE course ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM courses WHERE id = ?', [req.params.id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found' })
    }
    res.json({ message: 'Course deleted successfully' })
  } catch (error) {
    console.error('Error deleting course:', error)
    res.status(500).json({ error: 'Failed to delete course' })
  }
})

// ─── GET all packages ──────────────────────────────────────────
router.get('/packages/all', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT p.*, c.name as course_name FROM packages p LEFT JOIN courses c ON p.course_id = c.id ORDER BY p.created_at DESC'
    )
    res.json(rows)
  } catch (error) {
    console.error('Error fetching packages:', error)
    res.status(500).json({ error: 'Failed to fetch packages' })
  }
})

// ─── POST Create package ───────────────────────────────────────
router.post('/packages', async (req, res) => {
  try {
    const { name, description, course_id, total_sessions, price, discount_percentage, validity_days } = req.body

    if (!name || !price) {
      return res.status(400).json({ error: 'Package name and price are required' })
    }

    const [result] = await pool.query(
      `INSERT INTO packages (name, description, course_id, total_sessions, price, discount_percentage, validity_days)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description || null, course_id || null, total_sessions || 0, price, discount_percentage || 0, validity_days || 30]
    )

    res.status(201).json({ message: 'Package created successfully', packageId: result.insertId })
  } catch (error) {
    console.error('Error creating package:', error)
    res.status(500).json({ error: 'Failed to create package' })
  }
})

export default router