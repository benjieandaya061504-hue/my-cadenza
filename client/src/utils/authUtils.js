/**
 * Auth utility functions for Cadenza Music Center
 * Handles token storage, retrieval, and authenticated requests
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
export const getApiBase = () => API_BASE

const TOKEN_KEY = 'cadenza_token'
const USER_KEY = 'cadenza_user'
const REMEMBER_EMAIL_KEY = 'cadenza_remember_email'

/**
 * Get stored JWT token
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Get stored user data
 */
export const getUser = () => {
  const userJson = localStorage.getItem(USER_KEY)
  return userJson ? JSON.parse(userJson) : null
}

/**
 * Get remembered email (for login form auto-fill)
 */
export const getRememberedEmail = () => {
  return localStorage.getItem(REMEMBER_EMAIL_KEY)
}

/**
 * Store authentication data after login
 */
export const setAuthData = (token, user, rememberEmail = false) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  
  if (rememberEmail) {
    localStorage.setItem(REMEMBER_EMAIL_KEY, user.email)
  }
}

/**
 * Clear authentication data (logout)
 */
export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken() && !!getUser()
}

/**
 * Make an authenticated API request
 * Automatically includes the JWT token in the Authorization header
 * 
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise} Fetch response promise
 */
export const authenticatedFetch = (url, options = {}) => {
  const token = getToken()
  
  if (!token) {
    throw new Error('No authentication token found. Please log in.')
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Add Authorization header with token
  headers.Authorization = `Bearer ${token}`

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })
}

/**
 * Logout user and clear stored data
 */
export const logout = () => {
  clearAuthData()
  window.location.href = '/'
}

/**
 * Check if user has a specific role
 */
export const hasRole = (role) => {
  const user = getUser()
  return user && user.role === role
}

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (roles) => {
  const user = getUser()
  return user && roles.includes(user.role)
}

/**
 * Redirect to appropriate dashboard based on role
 */
export const redirectToDashboard = () => {
  const user = getUser()
  
  if (!user) {
    window.location.href = '/'
    return
  }

  const roleMap = {
    admin: '/admin',
    instructor: '/instructor',
    student: '/student',
    client: '/client',
    frontdesk: '/frontdesk',
  }

  const dashboardUrl = roleMap[user.role] || '/'
  window.location.href = dashboardUrl
}

export default {
  getToken,
  getUser,
  getRememberedEmail,
  setAuthData,
  clearAuthData,
  isAuthenticated,
  authenticatedFetch,
  logout,
  hasRole,
  hasAnyRole,
  redirectToDashboard,
}
