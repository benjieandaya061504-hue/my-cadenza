import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ADMIN_LOGIN_PATH, FRONTDESK_LOGIN_PATH, PUBLIC_ROUTES } from '../constants/publicRoutes'
import { usePublicSite } from '../pages/public/PublicSiteContext'

function NavPhoneIcon() {
  return (
    <svg
      className="pub-nav-dl-icon"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="7" y="3" width="10" height="18" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M10 18h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

const linkClass = ({ isActive }) => `pub-nav-link${isActive ? ' active' : ''}`

/**
 * Shared public-site navigation (landing + module pages).
 * @param {{ onDownloadApp?: () => void }} props
 */
export default function PublicNav({ onDownloadApp }) {
  const location = useLocation()
  const [navOpen, setNavOpen] = useState(false)
  const { user, isLoggedIn, authLoading, logout } = usePublicSite() ?? {}

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setNavOpen(false))
    return () => window.cancelAnimationFrame(id)
  }, [location.pathname])

  const close = () => setNavOpen(false)

  return (
    <nav className="pub-nav" aria-label="Main">
      <div className="pub-nav-bar">
        <Link to={PUBLIC_ROUTES.home} className="pub-nav-brand" onClick={close}>
          <div className="brand-icon glow-ring" aria-hidden>
            ♬
          </div>
          <span>
            <span className="brand-text">Cadenza</span>
            <span className="brand-sub">Music Center</span>
          </span>
        </Link>

        <div id="pub-nav-links" className={`pub-nav-links${navOpen ? ' is-open' : ''}`}>
          <NavLink to={PUBLIC_ROUTES.home} end className={linkClass} onClick={close}>
            Home
          </NavLink>
          <NavLink to={PUBLIC_ROUTES.registration} className={linkClass} onClick={close}>
            Registration
          </NavLink>
          <NavLink to={PUBLIC_ROUTES.enrollment} className={linkClass} onClick={close}>
            Enroll
          </NavLink>
          <NavLink to={PUBLIC_ROUTES.rental} className={linkClass} onClick={close}>
            Instrument Rental
          </NavLink>
          <NavLink to={PUBLIC_ROUTES.studioBooking} className={linkClass} onClick={close}>
            Studio Booking
          </NavLink>
          {onDownloadApp ? (
            <button
              type="button"
              className="pub-nav-link download"
              onClick={() => {
                close()
                onDownloadApp()
              }}
            >
              <NavPhoneIcon />
              Download app
            </button>
          ) : null}
        </div>

        <div className="pub-nav-right">
          <div className="pub-login-group">
            {!authLoading && isLoggedIn && user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--accent)',
                    whiteSpace: 'nowrap',
                    maxWidth: 130,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={`${user.firstName} ${user.lastName}`}
                >
                  👤 {user.firstName} {user.lastName}
                </span>
                <button
                  type="button"
                  onClick={() => { if (window.confirm('Are you sure you want to log out?')) { close(); logout() } }}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 8,
                    border: '1px solid rgba(248,113,113,0.3)',
                    background: 'rgba(248,113,113,0.1)',
                    color: 'var(--coral)',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  Log Out
                </button>
              </div>
            ) : (
              <>
                <Link className="pub-login-btn admin" to={ADMIN_LOGIN_PATH} onClick={close}>
                  Admin Login
                </Link>
                <Link className="pub-login-btn frontdesk" to={FRONTDESK_LOGIN_PATH} onClick={close}>
                  Front Desk Login
                </Link>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          className={`pub-nav-burger${navOpen ? ' is-open' : ''}`}
          aria-label={navOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={navOpen}
          aria-controls="pub-nav-links"
          onClick={() => setNavOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  )
}
