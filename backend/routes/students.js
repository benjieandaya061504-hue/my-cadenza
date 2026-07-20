/**
 * Students API Routes
 * Handles student CRUD operations
 */

import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// ─── GET all students ──────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT s.*, u.username as user_username FROM students s LEFT JOIN users u ON s.user_id = u.id ORDER BY s.created_at DESC'
    )
    res.json(rows)
  } catch (error) {
    console.error('Error fetching students:', error)
    res.status(500).json({ error: 'Failed to fetch students' })
  }
})

// ─── GET single student by ID ──────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT s.*, u.username as user_username FROM students s LEFT JOIN users u ON s.user_id = u.id WHERE s.id = ?',
      [req.params.id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' })
    }
    res.json(rows[0])
  } catch (error) {
    console.error('Error fetching student:', error)
    res.status(500).json({ error: 'Failed to fetch student' })
  }
})

// ─── POST Create new student ───────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, email, contact_number, address, date_of_birth, gender, emergency_contact_name, emergency_contact_number, medical_notes } = req.body

    if (!first_name || !last_name || !email || !contact_number) {
      return res.status(400).json({ error: 'First name, last name, email, and contact number are required' })
    }

    const [result] = await pool.query(
      `INSERT INTO students (first_name, last_name, email, contact_number, address, date_of_birth, gender, emergency_contact_name, emergency_contact_number, medical_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, contact_number, address || null, date_of_birth || null, gender || 'other', emergency_contact_name || null, emergency_contact_number || null, medical_notes || null]
    )

    res.status(201).json({ message: 'Student created successfully', studentId: result.insertId })
  } catch (error) {
    console.error('Error creating student:', error)
    res.status(500).json({ error: 'Failed to create student' })
  }
})

// ─── PUT Update student ────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { first_name, last_name, email, contact_number, address, date_of_birth, gender, emergency_contact_name, emergency_contact_number, medical_notes, status } = req.body

    const [result] = await pool.query(
      `UPDATE students SET first_name = ?, last_name = ?, email = ?, contact_number = ?, address = ?, date_of_birth = ?, gender = ?, emergency_contact_name = ?, emergency_contact_number = ?, medical_notes = ?, status = ? WHERE id = ?`,
      [first_name, last_name, email, contact_number, address, date_of_birth, gender, emergency_contact_name, emergency_contact_number, medical_notes, status || 'active', req.params.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' })
    }
    res.json({ message: 'Student updated successfully' })
  } catch (error) {
    console.error('Error updating student:', error)
    res.status(500).json({ error: 'Failed to update student' })
  }
})

// ─── DELETE student ────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM students WHERE id = ?', [req.params.id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' })
    }
    res.json({ message: 'Student deleted successfully' })
  } catch (error) {
    console.error('Error deleting student:', error)
    res.status(500).json({ error: 'Failed to delete student' })
  }
})

export default router