const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')

const router = express.Router()
const prisma = new PrismaClient()

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// ==================== MIDDLEWARE ====================

// Verify JWT Token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided. Please log in.',
    })
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token.',
      })
    }
    req.user = decoded
    next()
  })
}

// Check Role Permission
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated.',
      })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource.',
      })
    }

    next()
  }
}

// ==================== ROUTES ====================

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, confirmPassword, role_id } = req.body

    // Validate input
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      })
    }

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered.',
      })
    }

    // Verify role exists
    const role = await prisma.role.findUnique({
      where: { id: role_id || 1 },
    })

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role.',
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const newUser = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        role_id: role_id || 1,
        status: 'active',
      },
      include: { role: true },
    })

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please log in.',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role.role_name,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration.',
    })
  }
})

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      })
    }

    // Find user by email
    const user = await prisma.users.findUnique({
      where: { email },
      include: { role: true, staff: true },
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      })
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Contact the administrator.',
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role.role_name,
        roleId: user.role_id,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Successful login
    res.json({
      success: true,
      message: `Welcome back, ${user.email}!`,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role.role_name,
        roleId: user.role_id,
        staffId: user.staff_id,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'An internal server error occurred.',
    })
  }
})

// POST /api/auth/logout - Logout user
router.post('/logout', verifyToken, async (req, res) => {
  try {
    // Token is invalidated on client side by deleting it
    res.json({
      success: true,
      message: 'Logged out successfully.',
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      success: false,
      message: 'An error occurred during logout.',
    })
  }
})

// GET /api/auth/me - Get current user info
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
      include: { role: true, staff: true },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      })
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role.role_name,
        roleId: user.role_id,
        status: user.status,
        staffId: user.staff_id,
        createdAt: user.created_at,
      },
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      success: false,
      message: 'An error occurred fetching user info.',
    })
  }
})

// ==================== EXPORTS ====================
module.exports = router
module.exports.verifyToken = verifyToken
module.exports.checkRole = checkRole