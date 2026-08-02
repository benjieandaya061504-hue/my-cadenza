# Frontend Authentication Implementation Guide

## Overview
Your frontend is now integrated with the backend JWT authentication system. The login flow is updated to match your backend API.

## What Changed

### Login Flow
- **Before**: Login sent `email`, `password`, and `role` to backend
- **Now**: Login sends only `email` and `password` - role is determined by the backend based on user database record
- **Token Storage**: JWT token is stored in `localStorage` as `cadenza_token`
- **User Data**: User info (id, email, role, roleId, staffId) stored in `localStorage` as `cadenza_user`

### Frontend Files Updated
1. **landing.jsx** - Updated login form to use email field and store token
2. **authUtils.js** (new) - Helper functions for auth operations
3. **ProtectedRoute.jsx** (new) - Route protection components

## Using Auth Utilities

### 1. Import Auth Functions
```jsx
import {
  getToken,
  getUser,
  isAuthenticated,
  authenticatedFetch,
  logout,
  hasRole,
  redirectToDashboard,
} from '../utils/authUtils'
```

### 2. Check if User is Logged In
```jsx
import { isAuthenticated, getUser } from '../utils/authUtils'

function Dashboard() {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />
  }

  const user = getUser()
  return <div>Welcome, {user.email}!</div>
}
```

### 3. Make Authenticated API Requests
```jsx
import { authenticatedFetch } from '../utils/authUtils'

// Get admin users (protected endpoint)
const response = await authenticatedFetch('http://localhost:5000/api/admin/users', {
  method: 'GET',
})
const data = await response.json()
```

### 4. Check User Role
```jsx
import { hasRole, hasAnyRole } from '../utils/authUtils'

// Check specific role
if (hasRole('admin')) {
  // Show admin features
}

// Check multiple roles
if (hasAnyRole(['admin', 'instructor'])) {
  // Show staff features
}
```

### 5. Logout User
```jsx
import { logout } from '../utils/authUtils'

function LogoutButton() {
  return <button onClick={logout}>Logout</button>
}
```

### 6. Redirect to Correct Dashboard
```jsx
import { redirectToDashboard } from '../utils/authUtils'

// After successful login, redirect to user's dashboard
redirectToDashboard()
```

## Using Protected Routes

### Setup Router with Protected Routes
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute'
import LandingPage from './landing/landing'
import AdminDashboard from './admin/admin'
import InstructorDashboard from './instructor/instructor'
import StudentDashboard from './student/student'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor"
          element={
            <ProtectedRoute allowedRoles={['instructor']}>
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
```

## Login Flow Diagram

```
User Enters Email/Password
           ↓
  Validate Fields
           ↓
  Send POST /api/auth/login
           ↓
  Backend Authenticates User
           ↓
  Generate JWT Token
           ↓
  Return Token + User Data
           ↓
  Store in localStorage:
  - cadenza_token (JWT)
  - cadenza_user (user object)
           ↓
  Redirect to Dashboard
  (based on user.role)
```

## Token Usage in Requests

### Manual Header Example
```jsx
const token = localStorage.getItem('cadenza_token')

const response = await fetch('http://localhost:5000/api/admin/users', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
})
```

### Using authenticatedFetch Helper (Recommended)
```jsx
const response = await authenticatedFetch('http://localhost:5000/api/admin/users', {
  method: 'GET',
})
```

## Protected Endpoints

### Get Current User Info
```jsx
const response = await authenticatedFetch('http://localhost:5000/api/auth/me')
const user = await response.json()
```

### Get All Users (Admin Only)
```jsx
const response = await authenticatedFetch('http://localhost:5000/api/admin/users')
const users = await response.json()
```

### Update User Status (Admin Only)
```jsx
const response = await authenticatedFetch(
  'http://localhost:5000/api/admin/users/1',
  {
    method: 'PUT',
    body: JSON.stringify({ status: 'inactive' }),
  }
)
const updatedUser = await response.json()
```

### Get Instructors (Admin, Instructor)
```jsx
const response = await authenticatedFetch('http://localhost:5000/api/admin/instructors')
const instructors = await response.json()
```

## Example: Admin Component with Protected API

```jsx
import { useEffect, useState } from 'react'
import { authenticatedFetch, getUser } from '../utils/authUtils'

export function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await authenticatedFetch('http://localhost:5000/api/admin/users')
        if (!response.ok) throw new Error('Failed to fetch users')
        const data = await response.json()
        setUsers(data.data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.email} - {user.role.role_name}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## Error Handling

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| No token provided. Please log in. | User not authenticated | Redirect to login |
| Invalid or expired token. | Token is invalid/expired | Clear auth data and redirect to login |
| You do not have permission to access this resource. | User role not allowed | Redirect to accessible area |
| Could not connect to server | Backend server not running | Start server with `npm run dev` |

### Auto-Login Redirect on Token Expiry

```jsx
const authenticatedFetch = async (url, options = {}) => {
  let response = await fetch(url, { ...options })

  // If 403 (token expired/invalid), redirect to login
  if (response.status === 403) {
    localStorage.clear()
    window.location.href = '/'
    return
  }

  return response
}
```

## Remember Me Feature

The login form includes a "Remember me" checkbox that stores the email for convenience:

```jsx
if (rememberEmail) {
  localStorage.setItem('cadenza_remember_email', userEmail)
}

// On landing page load:
const rememberedEmail = localStorage.getItem('cadenza_remember_email')
if (rememberedEmail) {
  setEmail(rememberedEmail)
}
```

## Next Steps

1. ✅ Login page updated and matching backend
2. ✅ Auth utilities created
3. ✅ Protected route components ready
4. ⬜ Create role-specific dashboard pages (Admin, Instructor, Student)
5. ⬜ Integrate protected endpoints into dashboards
6. ⬜ Add logout functionality to header
7. ⬜ Implement token refresh (optional, for longer sessions)
8. ⬜ Add password reset endpoint (backend needed)

## Testing the Setup

### Test Login Flow
1. Start backend: `npm run dev` (in server folder)
2. Start frontend: `npm run dev` (in client folder)
3. Navigate to `http://localhost:5173`
4. Click "Admin Login"
5. Enter valid credentials
6. Verify token is in localStorage: `localStorage.getItem('cadenza_token')`

### Test Protected Endpoint
In browser console:
```javascript
import { authenticatedFetch } from './utils/authUtils'

const response = await authenticatedFetch('http://localhost:5000/api/auth/me')
const user = await response.json()
console.log(user)
```

## Security Notes

1. **Never expose JWT tokens** - Keep them in secure storage (localStorage, cookies)
2. **HTTPS in production** - Always use HTTPS for auth endpoints
3. **Token expiration** - Current setup uses 7-day tokens (set in backend)
4. **Refresh tokens** - Consider implementing refresh token rotation for sensitive apps
5. **CORS** - Backend is configured to accept requests from localhost:5173/5174
