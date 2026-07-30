# Authentication Setup Guide

## Overview
Complete JWT-based authentication system for Cadenza Music Center with role-based access control.

## Installation

1. **Install dependencies** (jsonwebtoken was added to package.json):
   ```bash
   npm install
   ```

2. **Setup Environment Variables**:
   - Copy `.env.example` to `.env`
   - Update the `JWT_SECRET` to a strong random string
   - Set your `DATABASE_URL`

   ```bash
   # .env
   DATABASE_URL=mysql://user:password@localhost:3306/cadenza_db
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   PORT=5000
   NODE_ENV=development
   ```

## API Endpoints

### Authentication Routes (`/api/auth`)

#### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123",
  "role_id": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully. Please log in.",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "admin"
  }
}
```

#### 2. Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Welcome back, user@example.com!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "admin",
    "roleId": 1,
    "staffId": null
  }
}
```

#### 3. Get Current User Profile
```http
GET /api/auth/me
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "admin",
    "roleId": 1,
    "status": "active",
    "staffId": null,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 4. Logout User
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

### Admin Routes (`/api/admin`) - Protected Routes

#### 1. Get All Users (Admin Only)
```http
GET /api/admin/users
Authorization: Bearer {admin-token}
```

#### 2. Update User Status (Admin Only)
```http
PUT /api/admin/users/:id
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "status": "active"
}
```

Valid status values: `active`, `inactive`, `suspended`

#### 3. Get All Instructors (Admin, Instructor)
```http
GET /api/admin/instructors
Authorization: Bearer {token}
```

#### 4. Get All Students (Admin Only)
```http
GET /api/admin/students
Authorization: Bearer {admin-token}
```

#### 5. Get My Profile (All Authenticated Users)
```http
GET /api/admin/my-profile
Authorization: Bearer {token}
```

## Database Schema Integration

The authentication system uses these tables from your schema:

- **users** - Stores user credentials and role assignment
- **role** - Defines user roles (admin, instructor, student, client)
- **staff** - Links instructors and staff to users
- **students** - Links students to users
- **clients** - Links clients to users

## Security Features

1. **Password Hashing**: Passwords are hashed using bcryptjs (10 salt rounds)
2. **JWT Tokens**: Tokens expire after 7 days
3. **Role-Based Access Control**: Routes protected by user roles
4. **Token Validation**: Every protected endpoint verifies JWT token
5. **Status Checking**: Only active users can login

## Using Auth in Your Frontend

### 1. Store Token After Login
```javascript
// After login request
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})

const data = await response.json()
if (data.success) {
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))
}
```

### 2. Include Token in Protected Requests
```javascript
const token = localStorage.getItem('token')

const response = await fetch('http://localhost:5000/api/admin/users', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

### 3. Logout
```javascript
localStorage.removeItem('token')
localStorage.removeItem('user')
// Redirect to login page
```

## Middleware Usage

### Protect a Route with Token Verification
```javascript
const { verifyToken } = require('./middleware/authMiddleware')

router.get('/protected', verifyToken, async (req, res) => {
  // req.user contains: { id, email, role, roleId }
  res.json({ message: 'This is protected', user: req.user })
})
```

### Protect a Route with Role Check
```javascript
const { verifyToken, checkRole } = require('./middleware/authMiddleware')

router.get('/admin-only', verifyToken, checkRole(['admin']), async (req, res) => {
  res.json({ message: 'Admin resource' })
})

// Multiple roles
router.get('/staff-area', verifyToken, checkRole(['admin', 'instructor']), async (req, res) => {
  res.json({ message: 'Staff resource' })
})
```

## Error Handling

| Status | Message | Cause |
|--------|---------|-------|
| 400 | Email and password are required | Missing credentials |
| 401 | Invalid email or password | Wrong credentials |
| 403 | Your account has been deactivated | User status is not active |
| 403 | Invalid or expired token | Bad/expired JWT token |
| 409 | Email already registered | Registration with existing email |
| 500 | Internal server error | Server-side error |

## Testing the Setup

1. **Start the server**:
   ```bash
   npm run dev
   ```

2. **Register a new user**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123","confirmPassword":"test123","role_id":1}'
   ```

3. **Login**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

4. **Access protected route** (use token from login response):
   ```bash
   curl -X GET http://localhost:5000/api/auth/me \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

## Next Steps

1. Create a login page in your React client
2. Add role-specific dashboards (admin, instructor, student)
3. Integrate token refresh mechanism (optional, for longer sessions)
4. Add 2FA for enhanced security (optional)
5. Seed your database with initial roles and users
