import { NavLink } from 'react-router-dom'
import { ADMIN_LOGIN_PATH, PUBLIC_ROUTES } from '../../constants/publicRoutes'

const linkClass = ({ isActive }) => `pub-top-link${isActive ? ' active' : ''}`

export default function PublicTopNav() {
  return (
    <header className="pub-top-nav" aria-label="Public site">
      <div className="pub-top-nav-inner">
        <NavLink to={PUBLIC_ROUTES.home} className="pub-top-brand" end>
          <span className="pub-top-brand-mark" aria-hidden>
            ♬
          </span>
          <span className="pub-top-brand-text">Cadenza Music Center</span>
        </NavLink>
        <nav className="pub-top-links" aria-label="Sections">
          <NavLink to={PUBLIC_ROUTES.home} className={linkClass} end>
            Home
          </NavLink>
          <NavLink to={PUBLIC_ROUTES.registration} className={linkClass}>
            Registration
          </NavLink>
          <NavLink to={PUBLIC_ROUTES.enrollment} className={linkClass}>
            Enroll
          </NavLink>
          <NavLink to={PUBLIC_ROUTES.rental} className={linkClass}>
            Instrument Rental
          </NavLink>
          <NavLink to={PUBLIC_ROUTES.studioBooking} className={linkClass}>
            Studio Booking
          </NavLink>
        </nav>
        <NavLink className="pub-top-login" to={ADMIN_LOGIN_PATH}>
          Staff / Student Login →
        </NavLink>
      </div>
    </header>
  )
}
