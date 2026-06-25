/**
 * Cadenza Music School Management System - Backend Server
 * Express API with MySQL database connection via mysql2
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import { testConnection } from './db.js'

// Import route modules
import usersRouter from './routes/users.js'
import staffAuthRouter from './routes/staff-auth.js'
import studentsRouter from './routes/students.js'
import instructorsRouter from './routes/instructors.js'
import coursesRouter from './routes/courses.js'
import enrollmentsRouter from './routes/enrollments.js'
import lessonsRouter from './routes/lessons.js'
import billingRouter from './routes/billing.js'
import studiosRouter from './routes/studios.js'
import instrumentsRouter from './routes/instruments.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// ─── Middleware ─────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ─── API Routes ────────────────────────────────────────────────
app.use('/api/users', usersRouter)
app.use('/api/staff-auth', staffAuthRouter)
app.use('/api/students', studentsRouter)
app.use('/api/instructors', instructorsRouter)
app.use('/api/courses', coursesRouter)
app.use('/api/enrollments', enrollmentsRouter)
app.use('/api/lessons', lessonsRouter)
app.use('/api/billing', billingRouter)
app.use('/api/studios', studiosRouter)
app.use('/api/instruments', instrumentsRouter)

// ─── Health Check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Cadenza Music School API is running',
    timestamp: new Date().toISOString()
  })
})

// ─── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ─── Error Handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// ─── Start Server ──────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', async () => {
  console.log('')
  console.log('╔══════════════════════════════════════════════╗')
  console.log('║   Cadenza Music School Management System    ║')
  console.log('║         Backend API Server                  ║')
  console.log('╠══════════════════════════════════════════════╣')
  console.log(`║  Server:     http://localhost:${PORT}           ║`)
  console.log(`║  Health:     http://localhost:${PORT}/api/health ║`)
  console.log('╚══════════════════════════════════════════════╝')
  console.log('')

  // Test database connection on startup
  const connected = await testConnection()
  if (!connected) {
    console.warn('⚠️  Server started but database connection failed.')
    console.warn('   Make sure WAMP MySQL is running and the database exists.')
    console.warn('   Run the schema.sql file to create the database and tables.')
  }
})