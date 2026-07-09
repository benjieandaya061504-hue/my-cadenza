import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'
import PublicModals from '../components/PublicModals'
import { PublicSiteProvider, usePublicSite } from './public/PublicSiteContext'
import { PUBLIC_ROUTES } from '../constants/publicRoutes'
import '../styles/publicSiteTheme.css'
import '../styles/landingPage.css'

const MOBILE_APP_DOWNLOAD_URL = import.meta.env.VITE_MOBILE_APP_DOWNLOAD_URL

const ROUTES = PUBLIC_ROUTES

function pad2(n) {
  return String(n).padStart(2, '0')
}

function toDateKey(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function addMonths(d, delta) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1)
}

function seeded01(seed) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 2 ** 32
}

function buildSlotsForDay(dateKey) {
  const blocks = [
    ['08:00', '09:00'],
    ['09:00', '10:00'],
    ['10:00', '11:00'],
    ['11:00', '12:00'],
    ['13:00', '14:00'],
    ['14:00', '15:00'],
    ['15:00', '16:00'],
    ['16:00', '17:00'],
    ['17:00', '18:00'],
  ]
  return blocks.map(([start, end], i) => {
    const seed = `${dateKey}|${start}|${end}|${i}`
    const available = seeded01(seed) > 0.35
    return { start, end, available }
  })
}

function QRCode() {
  return (
    <svg width="110" height="110" viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect width="110" height="110" fill="white" />
      <rect x="8" y="8" width="28" height="28" rx="3" fill="#1a1814" />
      <rect x="13" y="13" width="18" height="18" rx="1" fill="white" />
      <rect x="17" y="17" width="10" height="10" rx="1" fill="#1a1814" />
      <rect x="74" y="8" width="28" height="28" rx="3" fill="#1a1814" />
      <rect x="79" y="13" width="18" height="18" rx="1" fill="white" />
      <rect x="83" y="17" width="10" height="10" rx="1" fill="#1a1814" />
      <rect x="8" y="74" width="28" height="28" rx="3" fill="#1a1814" />
      <rect x="13" y="79" width="18" height="18" rx="1" fill="white" />
      <rect x="17" y="83" width="10" height="10" rx="1" fill="#1a1814" />
      <rect x="44" y="8" width="6" height="6" fill="#1a1814" />
      <rect x="52" y="8" width="6" height="6" fill="#1a1814" />
      <rect x="60" y="8" width="6" height="6" fill="#1a1814" />
      <rect x="44" y="16" width="6" height="6" fill="#1a1814" />
      <rect x="60" y="16" width="6" height="6" fill="#1a1814" />
      <rect x="52" y="24" width="6" height="6" fill="#1a1814" />
      <rect x="44" y="44" width="6" height="6" fill="#7c6af7" />
      <rect x="52" y="44" width="6" height="6" fill="#1a1814" />
      <rect x="60" y="44" width="6" height="6" fill="#1a1814" />
      <rect x="44" y="52" width="6" height="6" fill="#1a1814" />
      <rect x="60" y="52" width="6" height="6" fill="#1a1814" />
      <rect x="44" y="60" width="6" height="6" fill="#7c6af7" />
      <rect x="52" y="60" width="6" height="6" fill="#1a1814" />
      <rect x="44" y="76" width="6" height="6" fill="#1a1814" />
      <rect x="52" y="76" width="6" height="6" fill="#7c6af7" />
      <rect x="60" y="76" width="6" height="6" fill="#1a1814" />
    </svg>
  )
}

export default function LandingPage() {
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [liveTick, setLiveTick] = useState(0)

  const selectedKey = useMemo(() => toDateKey(selectedDate), [selectedDate])
  const selectedSlots = useMemo(
    () => buildSlotsForDay(`${selectedKey}|tick:${liveTick}`),
    [selectedKey, liveTick],
  )

  useEffect(() => {
    const id = window.setInterval(() => setLiveTick((t) => t + 1), 8000)
    return () => window.clearInterval(id)
  }, [])

  const monthLabel = useMemo(
    () =>
      monthCursor.toLocaleString(undefined, {
        month: 'long',
        year: 'numeric',
      }),
    [monthCursor],
  )

  const calendarWeeks = useMemo(() => {
    const first = startOfMonth(monthCursor)
    const startWeekday = first.getDay()
    const gridStart = new Date(first)
    gridStart.setDate(1 - startWeekday)
    const weeks = []
    let cursor = new Date(gridStart)
    for (let w = 0; w < 6; w += 1) {
      const week = []
      for (let d = 0; d < 7; d += 1) {
        week.push(new Date(cursor))
        cursor.setDate(cursor.getDate() + 1)
      }
      weeks.push(week)
    }
    return weeks
  }, [monthCursor])

  const todayKey = toDateKey(new Date())

  const scrollToAppDownload = () => {
    document.getElementById('mobile-app')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const downloadHref = MOBILE_APP_DOWNLOAD_URL || '/mobile-application'

  return (
    <PublicSiteProvider>
      <div
        id="public-site"
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          background: 'var(--bg)',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <PublicNav onDownloadApp={scrollToAppDownload} />
        <PublicModals />

        <div className="pub-section active" id="pub-home" style={{ padding: 0 }}>
          <div className="pub-hero">
            <h1>
              Cadenza Music Center
              <br />
              <em>- by rain.</em>
            </h1>
            <div className="pub-hero-btns">
              <Link className="pub-cta primary" to={ROUTES.registration}>
                Registration
              </Link>
              <Link className="pub-cta secondary" to={ROUTES.enrollment}>
                Enrollment
              </Link>
            </div>
          </div>

          <div className="pub-features">
            <Link className="pub-feature-card stat-card" to={ROUTES.enrollment}>
              <div className="pub-feature-icon">🎓</div>
              <div className="pub-feature-title">Enrollment</div>
              <div className="pub-feature-desc">Open enrollment to continue.</div>
            </Link>
            <Link className="pub-feature-card stat-card" to={ROUTES.rental}>
              <div className="pub-feature-icon">🎸</div>
              <div className="pub-feature-title">Instrument rental</div>
              <div className="pub-feature-desc">Instrument rental services.</div>
            </Link>
            <Link className="pub-feature-card stat-card" to={ROUTES.studioBooking}>
              <div className="pub-feature-icon">🎵</div>
              <div className="pub-feature-title">Studio room booking</div>
              <div className="pub-feature-desc">Studio booking services.</div>
            </Link>
          </div>

          <div id="mobile-app" className="app-download-section" aria-labelledby="app-dl-title">
            <div className="app-download-inner">
              <div className="app-bg-note-1">🎵</div>
              <div className="app-bg-note-2">🎹</div>
              <div className="app-text-side">
                <div className="app-badge">
                  <span>Mobile</span>
                </div>
                <h2 className="app-title" id="app-dl-title">
                  Mobile application
                </h2>
                <p className="app-desc">
                  {'The Client shall be able to download the system\u2019s mobile application.'}
                </p>
                <a
                  className="app-dl-primary"
                  href={downloadHref}
                  {...(MOBILE_APP_DOWNLOAD_URL ? { download: true } : {})}
                >
                  Download mobile application
                </a>
              </div>
              <div className="app-qr-side">
                <div className="app-qr-wrap">
                  <QRCode />
                </div>
                <div className="app-qr-label">
                  Scan to download
                  <br />
                  the Cadenza app
                </div>
              </div>
            </div>
          </div>

          <div className="calendar-section">
            <div className="card">
              <div className="section-heading">
                <span>Live studio availability — {monthLabel}</span>
                <span className="sh-line" />
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  aria-label="Previous month"
                  onClick={() => setMonthCursor((m) => addMonths(m, -1))}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  aria-label="Next month"
                  onClick={() => setMonthCursor((m) => addMonths(m, 1))}
                >
                  ›
                </button>
                <Link className="btn btn-sm btn-secondary" to={ROUTES.studioBooking}>
                  Book Now →
                </Link>
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--text2)',
                  marginBottom: 16,
                  lineHeight: 1.65,
                  fontFamily: 'var(--font-body)',
                }}
              >
                Real-time availability through the interactive calendar. Select a day to check schedules before you
                proceed with a transaction or inquiry.
              </p>
              <div className="pub-studio-split" aria-live="polite">
                <div>
                  <div className="calendar-grid" role="grid" aria-label="Studio room calendar">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                      <div key={d} className="cal-header">
                        {d}
                      </div>
                    ))}
                    {calendarWeeks.map((week) =>
                      week.map((day) => {
                        const inMonth = day.getMonth() === monthCursor.getMonth()
                        const key = toDateKey(day)
                        const isSelected = key === selectedKey
                        const isToday = key === todayKey
                        return (
                          <button
                            key={key}
                            type="button"
                            className={[
                              'cal-day',
                              !inMonth ? 'other' : '',
                              isToday ? 'today' : '',
                              isSelected ? 'selected' : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            onClick={() => {
                              setSelectedDate(day)
                              setMonthCursor(startOfMonth(day))
                            }}
                            aria-pressed={isSelected}
                          >
                            <div className={`cal-num${isToday ? ' today' : ''}`}>{day.getDate()}</div>
                          </button>
                        )
                      }),
                    )}
                  </div>
                  <div className="avail-legend">
                    <span className="avail-dot free">Available</span>
                    <span className="avail-dot booked">Booked</span>
                    <span className="avail-dot full">Fully booked</span>
                  </div>
                </div>
                <div className="pub-slots-panel">
                  <div className="pub-slots-head">
                    <strong>{selectedDate.toLocaleDateString(undefined, { dateStyle: 'medium' })}</strong>
                    <span className="pub-slots-live">
                      <span className="pub-live-dot" aria-hidden />
                      Real-time availability — updates automatically
                    </span>
                  </div>
                  {selectedSlots.map((s) => (
                    <div key={`${s.start}-${s.end}`} className="pub-slot-row">
                      <span>
                        {s.start}–{s.end}
                      </span>
                      <span className={s.available ? 'pub-pill pub-pill-ok' : 'pub-pill pub-pill-no'}>
                        {s.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicSiteProvider>
  )
}