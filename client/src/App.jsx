import { useState, useEffect } from 'react'
import LandingPage from './landing/landing.jsx'
import AdminDashboard from './admin/admin.jsx'
import FrontDeskDashboard from './frontdesk/frontdesk.jsx'

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Check if on /admin route
  if (currentPath === '/admin') {
    // Check if user is logged in
    const userData = localStorage.getItem('cadenza_user')
    if (userData) {
      return <AdminDashboard />
    }
    // Not logged in, redirect to home
    window.location.href = '/'
    return null
  }

  // Check if on /frontdesk route
  if (currentPath === '/frontdesk') {
    // Check if user is logged in
    const userData = localStorage.getItem('cadenza_user')
    if (userData) {
      return <FrontDeskDashboard />
    }
    // Not logged in, redirect to home
    window.location.href = '/'
    return null
  }

  // Default: show landing page
  return <LandingPage />
}

export default App
