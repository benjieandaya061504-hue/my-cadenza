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

    // role_id is required — no default fallback
    if (!role_id) {
      return res.status(400).json({
        success: false,
        message: 'role_id is required.',
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
      where: { id: role_id },
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
        role_id: role_id,
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

// POST /api/auth/client-register - Register a new client (public-facing, returns JWT)
router.post('/client-register', async (req, res) => {
  try {
    const { email, password, confirmPassword, fname, lname } = req.body

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

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      })
    }

    // Validate fname and lname (required for signup — needed for clients row)
    if (!fname || !fname.trim()) {
      return res.status(400).json({
        success: false,
        message: 'First name is required.',
      })
    }
    if (!lname || !lname.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Last name is required.',
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

    // Look up client role dynamically — never hardcode the id
    const clientRole = await prisma.role.findFirst({
      where: { role_name: 'client' },
    })

    if (!clientRole) {
      return res.status(500).json({
        success: false,
        message: 'Client role not configured. Contact the administrator.',
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    const clientName = `${fname.trim()} ${lname.trim()}`

    // Transaction: create users + clients atomically
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create users row
      const newUser = await tx.users.create({
        data: {
          email,
          password: hashedPassword,
          role_id: clientRole.id,
          status: 'active',
        },
      })

      // 2. Create clients row immediately (no longer deferred to enrollment)
      await tx.clients.create({
        data: {
          f_name: fname.trim(),
          l_name: lname.trim(),
          email,
          users_id: newUser.id,
          // phone, address, age, level, notes intentionally null — filled at enrollment
        },
      })

      return newUser
    }, { timeout: 10000 })

    // Sign JWT
    const token = jwt.sign(
      {
        id: result.id,
        email: result.email,
        role: 'client',
        roleId: clientRole.id,
        name: clientName,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: result.id,
        email: result.email,
        role: 'client',
        roleId: clientRole.id,
        staffId: null,
        name: clientName,
      },
    })
  } catch (error) {
    console.error('Client registration error:', error)

    // Handle DB-level unique constraint violation as backstop
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered.',
      })
    }

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
      include: { role: true, staff: true, clients: true },
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

    // Extract client name if a clients row exists
    const clientName = user.clients?.[0]
      ? `${user.clients[0].f_name || ''} ${user.clients[0].l_name || ''}`.trim() || null
      : null

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role.role_name,
        roleId: user.role_id,
        name: clientName,
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
        name: clientName,
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