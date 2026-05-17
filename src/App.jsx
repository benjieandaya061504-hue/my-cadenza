import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/admin/AdminLogin'
import Dashboard from './pages/admin/AdminDashboard'
import FrontDeskLogin from './pages/frontdesk/FrontDeskLogin'
import FrontDeskDashboard from './pages/frontdesk/FrontDeskDashboard'
import LandingPage from './pages/LandingPage'
import EnrollmentPage from './pages/public/EnrollmentPage'
import PublicSiteLayout from './pages/public/PublicSiteLayout'
import RegistrationPublicPage from './pages/public/RegistrationPublicPage'
import RentalPublicPage from './pages/public/RentalPublicPage'
import StudioBookingPublicPage from './pages/public/StudioBookingPublicPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<PublicSiteLayout />}>
        <Route path="/enrollment" element={<EnrollmentPage />} />
        <Route path="/registration" element={<RegistrationPublicPage />} />
        <Route path="/rental" element={<RentalPublicPage />} />
        <Route path="/studio-booking" element={<StudioBookingPublicPage />} />
      </Route>
      <Route path="/admin/login" element={<Login role="admin" />} />
      <Route path="/frontdesk/login" element={<FrontDeskLogin />} />
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/frontdesk/dashboard" element={<FrontDeskDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
