/**
 * Billing API Routes
 * Handles charges, invoices, and payments
 */

import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// ─── GET all charges ───────────────────────────────────────────
router.get('/charges', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM charges ORDER BY created_at DESC')
    res.json(rows)
  } catch (error) {
    console.error('Error fetching charges:', error)
    res.status(500).json({ error: 'Failed to fetch charges' })
  }
})

// ─── POST Create charge ────────────────────────────────────────
router.post('/charges', async (req, res) => {
  try {
    const { ref_type, ref_id, student_id, customer_name, service_type, description, amount } = req.body

    if (!ref_type || !ref_id || !customer_name || !service_type || !amount) {
      return res.status(400).json({ error: 'Reference type, reference ID, customer name, service type, and amount are required' })
    }

    const [result] = await pool.query(
      `INSERT INTO charges (ref_type, ref_id, student_id, customer_name, service_type, description, amount)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ref_type, ref_id, student_id || null, customer_name, service_type, description || null, amount]
    )

    res.status(201).json({ message: 'Charge created successfully', chargeId: result.insertId })
  } catch (error) {
    console.error('Error creating charge:', error)
    res.status(500).json({ error: 'Failed to create charge' })
  }
})

// ─── GET all invoices ──────────────────────────────────────────
router.get('/invoices', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT i.*, c.ref_type, c.ref_id, c.service_type FROM invoices i LEFT JOIN charges c ON i.charge_id = c.id ORDER BY i.issued_at DESC'
    )
    res.json(rows)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    res.status(500).json({ error: 'Failed to fetch invoices' })
  }
})

// ─── POST Create invoice from charge ───────────────────────────
router.post('/invoices', async (req, res) => {
  try {
    const { charge_id, student_id, customer_name, amount, due_date } = req.body

    if (!charge_id || !customer_name || !amount) {
      return res.status(400).json({ error: 'Charge ID, customer name, and amount are required' })
    }

    // Generate invoice number
    const year = new Date().getFullYear()
    const [count] = await pool.query("SELECT COUNT(*) as cnt FROM invoices WHERE YEAR(issued_at) = ?", [year])
    const seq = String(Number(count[0].cnt) + 1).padStart(3, '0')
    const invoiceNo = `SI-${year}-${seq}`

    const [result] = await pool.query(
      `INSERT INTO invoices (invoice_no, charge_id, student_id, customer_name, amount, balance, status, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [invoiceNo, charge_id, student_id || null, customer_name, amount, amount, 'unpaid', due_date || null]
    )

    // Update charge status to invoiced
    await pool.query('UPDATE charges SET status = ? WHERE id = ?', ['invoiced', charge_id])

    res.status(201).json({ message: 'Invoice created successfully', invoiceId: result.insertId, invoiceNo })
  } catch (error) {
    console.error('Error creating invoice:', error)
    res.status(500).json({ error: 'Failed to create invoice' })
  }
})

// ─── GET all payments ──────────────────────────────────────────
router.get('/payments', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, i.invoice_no FROM payments p
       LEFT JOIN invoices i ON p.invoice_id = i.id
       ORDER BY p.paid_at DESC`
    )
    res.json(rows)
  } catch (error) {
    console.error('Error fetching payments:', error)
    res.status(500).json({ error: 'Failed to fetch payments' })
  }
})

// ─── POST Record payment ───────────────────────────────────────
router.post('/payments', async (req, res) => {
  try {
    const { invoice_id, student_id, payer_name, amount, method, reference_number, payment_type, service_type, notes, received_by } = req.body

    if (!invoice_id || !payer_name || !amount || !method) {
      return res.status(400).json({ error: 'Invoice ID, payer name, amount, and payment method are required' })
    }

    const [result] = await pool.query(
      `INSERT INTO payments (invoice_id, student_id, payer_name, amount, method, reference_number, payment_type, service_type, notes, received_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [invoice_id, student_id || null, payer_name, amount, method, reference_number || null, payment_type || 'full', service_type || null, notes || null, received_by || null]
    )

    // Update invoice balance
    const [invoice] = await pool.query('SELECT amount, balance FROM invoices WHERE id = ?', [invoice_id])
    if (invoice.length > 0) {
      const newBalance = Number(invoice[0].balance) - Number(amount)
      let newStatus = 'unpaid'
      if (newBalance <= 0) {
        newStatus = 'paid'
      } else if (newBalance < Number(invoice[0].amount)) {
        newStatus = 'partially_paid'
      }
      await pool.query(
        'UPDATE invoices SET balance = ?, status = ?, paid_at = IF(? = "paid", NOW(), paid_at) WHERE id = ?',
        [Math.max(0, newBalance), newStatus, newStatus, invoice_id]
      )
    }

    res.status(201).json({ message: 'Payment recorded successfully', paymentId: result.insertId })
  } catch (error) {
    console.error('Error recording payment:', error)
    res.status(500).json({ error: 'Failed to record payment' })
  }
})

export default router