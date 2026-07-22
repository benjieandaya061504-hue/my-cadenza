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

// ─── GET all lesson packages (with assigned instructors) ────────
router.get('/packages/all', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM lesson_packages ORDER BY created_at DESC')

    // For each package, fetch assigned instructors
    const packagesWithInstructors = await Promise.all(rows.map(async (pkg) => {
      const [instructors] = await pool.query(
        `SELECT i.id, i.first_name, i.last_name, i.specialization, i.email
         FROM instructors i
         JOIN package_instructors pi ON pi.instructor_id = i.id
         WHERE pi.package_id = ?
         ORDER BY i.first_name ASC`,
        [pkg.id]
      )
      return {
        ...pkg,
        instructors: instructors || [],
      }
    }))

    res.json(packagesWithInstructors)
  } catch (error) {
    console.error('Error fetching lesson packages:', error)
    res.status(500).json({ error: 'Failed to fetch lesson packages' })
  }
})

// ─── POST create a lesson package ───────────────────────────────
router.post('/packages', async (req, res) => {
  try {
    const { name, duration_minutes, session_limit, sessions_per_week, category_kind, category, description, rate, package_group, instructor_ids } = req.body

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
    if (!sessions_per_week || sessions_per_week < 1 || sessions_per_week > 7) {
      return res.status(400).json({ error: 'Sessions per week must be between 1 and 7' })
    }
    if (!category_kind || !['instrument', 'course'].includes(category_kind)) {
      return res.status(400).json({ error: 'Category basis must be "instrument" or "course"' })
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ error: 'Category (instrument or course type) is required' })
    }

    const [result] = await pool.query(
      `INSERT INTO lesson_packages (name, duration_minutes, session_limit, sessions_per_week, category_kind, category, description, rate, package_group)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name.trim(), Number(duration_minutes), Number(session_limit), Number(sessions_per_week), category_kind, category.trim(), description || null, rate || 0, package_group || null]
    )

    const packageId = result.insertId

    // Insert instructor assignments if provided
    if (instructor_ids && Array.isArray(instructor_ids) && instructor_ids.length > 0) {
      const values = instructor_ids.map(id => [packageId, id])
      await pool.query(
        'INSERT INTO package_instructors (package_id, instructor_id) VALUES ?',
        [values]
      )
    }

    // Fetch the newly created record with instructors
    const [newPackage] = await pool.query('SELECT * FROM lesson_packages WHERE id = ?', [packageId])
    const [instructors] = await pool.query(
      `SELECT i.id, i.first_name, i.last_name, i.specialization, i.email
       FROM instructors i
       JOIN package_instructors pi ON pi.instructor_id = i.id
       WHERE pi.package_id = ?`,
      [packageId]
    )

    res.status(201).json({
      message: 'Lesson package created successfully',
      package: { ...newPackage[0], instructors: instructors || [] }
    })
  } catch (error) {
    console.error('Error creating lesson package:', error)
    res.status(500).json({ error: 'Failed to create lesson package' })
  }
})

// ─── PUT update a lesson package ──────────────────────────────
router.put('/packages/:id', async (req, res) => {
  try {
    const { name, duration_minutes, session_limit, sessions_per_week, category_kind, category, description, rate, package_group, instructor_ids } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Package name is required' })
    }

    const [result] = await pool.query(
      `UPDATE lesson_packages
       SET name = ?, duration_minutes = ?, session_limit = ?, sessions_per_week = ?, category_kind = ?, category = ?, description = ?, rate = ?, package_group = ?
       WHERE id = ?`,
      [
        name.trim(),
        Number(duration_minutes),
        Number(session_limit),
        Number(sessions_per_week) || 1,
        category_kind,
        category.trim(),
        description || null,
        rate || 0,
        package_group || null,
        req.params.id,
      ]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lesson package not found' })
    }

    // Replace instructor assignments: delete existing, insert new
    await pool.query('DELETE FROM package_instructors WHERE package_id = ?', [req.params.id])

    if (instructor_ids && Array.isArray(instructor_ids) && instructor_ids.length > 0) {
      const values = instructor_ids.map(id => [Number(req.params.id), id])
      await pool.query(
        'INSERT INTO package_instructors (package_id, instructor_id) VALUES ?',
        [values]
      )
    }

    // Fetch the updated record with instructors
    const [updated] = await pool.query('SELECT * FROM lesson_packages WHERE id = ?', [req.params.id])
    const [instructors] = await pool.query(
      `SELECT i.id, i.first_name, i.last_name, i.specialization, i.email
       FROM instructors i
       JOIN package_instructors pi ON pi.instructor_id = i.id
       WHERE pi.package_id = ?`,
      [req.params.id]
    )

    res.json({
      message: 'Lesson package updated successfully',
      package: { ...updated[0], instructors: instructors || [] }
    })
  } catch (error) {
    console.error('Error updating lesson package:', error)
    res.status(500).json({ error: 'Failed to update lesson package' })
  }
})

// ─── DELETE a lesson package ─────────────────────────────────
router.delete('/packages/:id', async (req, res) => {
  try {
    const packageId = Number(req.params.id)
    if (!packageId) {
      return res.status(400).json({ error: 'Invalid package ID' })
    }

    // Check for existing enrollments referencing this package
    const [enrollments] = await pool.query(
      'SELECT COUNT(*) AS count FROM enrollments WHERE package_id = ?',
      [packageId]
    )

    if (enrollments[0].count > 0) {
      return res.status(409).json({
        error: `Cannot remove — ${enrollments[0].count} student(s) are enrolled in this package. Remove or reassign them first.`
      })
    }

    // package_instructors entries will be deleted automatically via ON DELETE CASCADE
    const [result] = await pool.query('DELETE FROM lesson_packages WHERE id = ?', [packageId])

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lesson package not found' })
    }

    res.json({ message: 'Lesson package deleted successfully' })
  } catch (error) {
    console.error('Error deleting lesson package:', error)
    res.status(500).json({ error: 'Failed to delete lesson package' })
  }
})

// ─── GET instructors assigned to a specific package ─────────────
router.get('/packages/:id/instructors', async (req, res) => {
  try {
    const [instructors] = await pool.query(
      `SELECT i.id, i.first_name, i.last_name, i.specialization, i.email
       FROM instructors i
       JOIN package_instructors pi ON pi.instructor_id = i.id
       WHERE pi.package_id = ?
       ORDER BY i.first_name ASC`,
      [req.params.id]
    )
    res.json(instructors)
  } catch (error) {
    console.error('Error fetching package instructors:', error)
    res.status(500).json({ error: 'Failed to fetch package instructors' })
  }
})

export default router