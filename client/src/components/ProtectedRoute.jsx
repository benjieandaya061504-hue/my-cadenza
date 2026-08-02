import { Navigate } from 'react-router-dom'
import { isAuthenticated, getUser, hasAnyRole } from '../utils/authUtils'

/**
 * ProtectedRoute component
 * Wraps routes that require authentication
 * Redirects to login if not authenticated
 */
export const ProtectedRoute = ({ children, allowedRoles = null }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />
  }

  // If specific roles are required, check if user has permission
  if (allowedRoles && !hasAnyRole(allowedRoles)) {
    return <Navigate to="/" replace />
  }

  return children
}

/**
 * PublicRoute component
 * Redirects authenticated users away from public pages
 */
export const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    const user = getUser()
    const roleMap = {
      admin: '/admin',
      instructor: '/instructor',
      student: '/student',
      client: '/client',
      frontdesk: '/frontdesk',
    }
    const dashboardUrl = roleMap[user.role] || '/admin'
    return <Navigate to={dashboardUrl} replace />
  }

  return children
}

export default {
  ProtectedRoute,
  PublicRoute,
}
