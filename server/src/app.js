const express = require('express')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const adminRoutes = require('./routes/admin')

const app = express()

// CORS - allow Vite dev server and Vercel production
const allowedOrigins = [
  'https://my-cadenza.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
]

app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }

  next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)

app.get('/', (req, res) => {
  res.send('Cadenza Music Center API')
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred.',
  })
})

module.exports = app