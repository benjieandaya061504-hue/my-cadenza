import { useEffect, useState } from 'react'

const C = {
  bg:      '#ffffff',
  surface: '#ffffff',
  surface2:'#f7f6f3',
  border:  '#e8e5df',
  border2: '#d4d0c8',
  text:    '#1a1814',
  text2:   '#6b6560',
  text3:   '#a09b93',
  accent:  '#2c6e49',
  teal:    '#0d8a6f',
  coral:   '#c0392b',
  gold:    '#b8860b',
  green:   '#276749',
  font:    "'Jost', sans-serif",
  display: "'Cormorant Garamond', serif",
  mono:    "'DM Mono', monospace",
}

// ── Admin nav structure (from ROLES.admin.nav in HTML) ────────
const ADMIN_NAV = [
  { section: 'Overview', items: [
    { id: 'dashboard',     icon: '📊', label: 'Dashboard' },
    { id: 'notifications', icon: '🔔', label: 'Notifications', badge: '3', badgeColor: 'green' },
  ]},
  { section: 'People', items: [
    { id: 'users',         icon: '👥', label: 'User Management' },
    { id: 'students',      icon: '🎓', label: 'Students' },
    { id: 'instructors',   icon: '👨‍🏫', label: 'Instructors' },
  ]},
  { section: 'Academics', items: [
    { id: 'lessons',       icon: '📚', label: 'Lesson Packages' },
    { id: 'timeslots',     icon: '⏰', label: 'Time Slots' },
    { id: 'scheduling',    icon: '📅', label: 'Scheduling' },
  ]},
  { section: 'Facilities', items: [
    { id: 'studio',        icon: '🎸', label: 'Studio Management' },
    { id: 'instruments',   icon: '🎺', label: 'Instruments' },
  ]},
  { section: 'Finance', items: [
    { id: 'billing',       icon: '💳', label: 'Billing' },
  ]},
  { section: 'Analytics', items: [
    { id: 'reports',       icon: '📈', label: 'Reports' },
  ]},
  { section: 'Communication', items: [
    { id: 'announcements', icon: '📣', label: 'Announcements' },
  ]},
]

const PAGE_LABELS = {
  dashboard: 'Dashboard', notifications: 'Notifications',
  users: 'User Management', students: 'Students', instructors: 'Instructors',
  lessons: 'Lesson Packages', timeslots: 'Time Slots', scheduling: 'Scheduling',
  studio: 'Studio Management', instruments: 'Instruments',
  billing: 'Billing', reports: 'Reports', announcements: 'Announcements',
}

// ── Sidebar ───────────────────────────────────────────────────
function Sidebar({ activePage, onNavigate, onLogout, isMobile, isOpen, onClose }) {
  const sidebarPanel = (
    <div style={{ width: '240px', minWidth: '240px', background: '#fafaf8', borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden', height: '100vh' }}>
      {/* Brand */}
      <div style={{ padding: '18px 20px 12px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg,#2c6e49,#1a4731)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🎵</div>
        <div>
          <div style={{ fontFamily: C.display, fontSize: '20px', fontWeight: 500, color: C.text, letterSpacing: '0.02em', lineHeight: 1.2 }}>Cadenza Music Center</div>
          <div style={{ fontSize: '10px', color: C.text3, letterSpacing: '.06em', textTransform: 'uppercase' }}>Management</div>
        </div>
      </div>

      {/* Role Badge */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 500, background: 'rgba(26,24,20,.06)', color: C.text, border: '1px solid rgba(26,24,20,.12)', fontFamily: C.font }}>
          <span>🛡️</span>
          <span>Administrator</span>
          <span style={{ marginLeft: 'auto', fontSize: '10px', opacity: 0.6 }}>⇅</span>
        </div>
      </div>

      {/* Nav Menu */}
      <div style={{ flex: 1 }}>
        {ADMIN_NAV.map(({ section, items }) => (
          <div key={section}>
            <div style={{ padding: '6px 0 2px 8px', fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: C.text3, marginTop: '8px', fontFamily: C.font, textAlign: 'left' }}>
              {section}
            </div>
            {items.map(item => {
              const isActive = activePage === item.id
              return (
                <NavItem key={item.id} item={item} isActive={isActive} onClick={() => { onNavigate(item.id); onClose?.() }} />
              )
            })}
          </div>
        ))}
      </div>

      {/* Logout Button */}
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.border}` }}>
        <button
          onClick={() => { onLogout?.(); onClose?.() }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(192,57,43,.18)'; e.currentTarget.style.borderColor = 'rgba(192,57,43,.45)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(192,57,43,.08)'; e.currentTarget.style.borderColor = 'rgba(192,57,43,.25)' }}
          style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(192,57,43,.25)', background: 'rgba(192,57,43,.08)', color: C.coral, cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all .15s' }}
        >
          🚪 Log Out
        </button>
      </div>
    </div>
  )

  if (!isMobile) return sidebarPanel

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,.35)', zIndex: 99 }}
        />
      )}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: isOpen ? 0 : '-240px',
          height: '100vh',
          zIndex: 100,
          transition: 'left .2s ease',
        }}
      >
        {sidebarPanel}
      </div>
    </>
  )
}

function NavItem({ item, isActive, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        margin: '1px 0', padding: '8px 12px 8px 8px', borderRadius: '0',
        display: 'flex', alignItems: 'center', gap: '9px',
        cursor: 'pointer', fontSize: '13px', fontFamily: C.font,
        color: isActive ? C.accent : hovered ? C.text : C.text2,
        background: isActive ? 'rgba(44,110,73,.08)' : hovered ? C.surface2 : 'transparent',
        transition: 'all .15s', position: 'relative',
      }}
    >
      {isActive && <div style={{ position: 'absolute', left: 0, top: '20%', height: '60%', width: '2px', background: C.accent, borderRadius: '0 3px 3px 0' }} />}
      <span style={{ width: '18px', textAlign: 'center', flexShrink: 0, fontSize: '14px' }}>{item.icon}</span>
      {item.label}
      {item.badge && (
        <span style={{ marginLeft: 'auto', background: item.badgeColor === 'green' ? C.green : C.coral, color: '#fff', fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '20px' }}>
          {item.badge}
        </span>
      )}
    </div>
  )
}

// ── Topbar ────────────────────────────────────────────────────
function Topbar({ pageLabel, onNavigate, onLogout, isMobile, onToggleSidebar }) {
  return (
    <div style={{ minHeight: '58px', background: C.surface, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: isMobile ? '10px 12px' : '0 24px', gap: '12px', flexShrink: 0, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {isMobile && (
          <button
            onClick={onToggleSidebar}
            title="Open menu"
            style={{ width: '34px', height: '34px', borderRadius: '8px', background: C.surface2, border: `1px solid ${C.border}`, cursor: 'pointer', fontSize: '16px' }}
          >
            ☰
          </button>
        )}
        <div style={{ fontFamily: C.display, fontSize: '18px', fontWeight: 400, letterSpacing: '0.02em', color: C.text }}>{pageLabel}</div>
        {!isMobile && <div style={{ fontSize: '12px', color: C.text3, fontFamily: C.font }}>Cadenza Music Center / {pageLabel}</div>}
      </div>
      <div style={{ marginLeft: isMobile ? 0 : 'auto', width: isMobile ? '100%' : 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input
          type="text"
          placeholder="Quick search..."
          onFocus={e => e.target.style.borderColor = C.accent}
          onBlur={e => e.target.style.borderColor = C.border}
          style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '6px 12px', color: C.text, fontFamily: C.font, fontSize: '13px', width: isMobile ? '100%' : '200px', outline: 'none', transition: 'border .15s', flex: isMobile ? 1 : 'none' }}
        />
        {/* Notifications bell with red dot */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => onNavigate('notifications')}
            style={{ width: '34px', height: '34px', borderRadius: '8px', background: C.surface2, border: `1px solid ${C.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text2, fontSize: '15px' }}
          >🔔</button>
          <div style={{ position: 'absolute', top: '6px', right: '6px', width: '7px', height: '7px', background: C.coral, borderRadius: '50%', border: `1.5px solid ${C.surface}`, pointerEvents: 'none' }} />
        </div>
        {/* Avatar */}
        <div title="Profile" style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#2c6e49,#1a4731)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: C.font }}>SA</div>
        {/* Logout */}
        <button
          onClick={onLogout}
          title="Log Out"
          style={{ width: '34px', height: '34px', borderRadius: '8px', background: C.surface2, border: `1px solid ${C.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.coral, fontSize: '16px' }}
        >🚪</button>
      </div>
    </div>
  )
}

// ── Reusable sub-components ───────────────────────────────────
const statColors = {
  blue:   { bg: 'rgba(44,110,73,.07)'   },
  teal:   { bg: 'rgba(13,138,111,.08)'  },
  gold:   { bg: 'rgba(184,134,11,.08)'  },
  coral:  { bg: 'rgba(192,57,43,.08)'   },
  green:  { bg: 'rgba(39,103,73,.08)'   },
  purple: { bg: 'rgba(91,74,138,.08)'   },
}

function StatCard({ color, icon, label, value, change, changeType }) {
  const sc = statColors[color] || statColors.blue
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,.04)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '10px' }}>{icon}</div>
      <div style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 500, fontFamily: C.font }}>{label}</div>
      <div style={{ fontFamily: C.display, fontSize: '26px', fontWeight: 400, color: C.text, lineHeight: 1, margin: '4px 0 6px', letterSpacing: '0.01em' }}>{value}</div>
      <div style={{ fontSize: '11px', color: changeType === 'up' ? C.green : changeType === 'down' ? C.coral : C.text3, fontFamily: C.font }}>{change}</div>
    </div>
  )
}

const badgeColors = {
  green:  { bg: 'rgba(39,103,73,.1)',   color: '#276749' },
  blue:   { bg: 'rgba(44,110,73,.1)',   color: '#2c6e49' },
  teal:   { bg: 'rgba(13,138,111,.1)',  color: '#0d8a6f' },
  gold:   { bg: 'rgba(184,134,11,.1)',  color: '#b8860b' },
  coral:  { bg: 'rgba(192,57,43,.1)',   color: '#c0392b' },
  gray:   { bg: 'rgba(160,155,147,.1)', color: '#a09b93' },
}

function Badge({ type, children }) {
  const bc = badgeColors[type] || badgeColors.gray
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 500, background: bc.bg, color: bc.color, fontFamily: C.font }}>
      {children}
    </span>
  )
}

const dotColors = { blue: C.accent, teal: C.teal, coral: C.coral, gold: C.gold, green: C.green }

function NotifItem({ dotColor, text, time }) {
  return (
    <div style={{ display: 'flex', gap: '12px', padding: '14px 0', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, marginTop: '5px', background: dotColors[dotColor] || C.accent }} />
      <div>
        <div style={{ fontSize: '13px', color: C.text2, lineHeight: 1.5, fontFamily: C.font }} dangerouslySetInnerHTML={{ __html: text }} />
        <div style={{ fontSize: '11px', color: C.text3, marginTop: '3px', fontFamily: C.font }}>{time}</div>
      </div>
    </div>
  )
}

// ── Dashboard Page Content ────────────────────────────────────
function DashboardContent({ onNavigate, isMobile, isTablet }) {
  const statsRow1 = [
    { color: 'blue',  icon: '🎓', label: 'Enrolled Students',   value: '248',   change: '↑ 12 this month',    changeType: 'up'   },
    { color: 'teal',  icon: '📅', label: 'Scheduled Lessons',   value: '34',    change: "↑ Today's sessions",  changeType: 'up'   },
    { color: 'gold',  icon: '💰', label: 'Payments Received',   value: '₱184k', change: '↑ ₱22k this week',   changeType: 'up'   },
    { color: 'coral', icon: '⚠️', label: 'Outstanding Balance', value: '₱38k',  change: '↓ 3 overdue',        changeType: 'down' },
  ]
  const statsRow2 = [
    { color: 'green',  icon: '🎸', label: 'Studio Bookings', value: '7',  change: 'Today',         changeType: ''     },
    { color: 'purple', icon: '🎺', label: 'Active Rentals',  value: '19', change: '2 overdue',     changeType: 'down' },
    { color: 'blue',   icon: '👨‍🏫', label: 'Instructors',    value: '14', change: 'All scheduled', changeType: ''     },
    { color: 'teal',   icon: '📦', label: 'Instruments',     value: '86', change: '↑ 74 available',changeType: 'up'   },
  ]
  const schedule = [
    { time: '09:00', student: 'Ana Reyes',    instructor: 'Mr. Cruz',     room: 'Studio A', status: 'green', label: 'Ongoing'  },
    { time: '10:00', student: 'Marco Santos', instructor: 'Ms. Lim',      room: 'Studio B', status: 'blue',  label: 'Upcoming' },
    { time: '11:00', student: 'Pia Gomez',    instructor: 'Mr. Cruz',     room: 'Studio A', status: 'blue',  label: 'Upcoming' },
    { time: '13:00', student: 'Luis Tan',     instructor: 'Ms. Reyes',    room: 'Studio C', status: 'gold',  label: 'Pending'  },
    { time: '14:00', student: 'Sofia Del',    instructor: 'Mr. Bautista', room: 'Studio B', status: 'blue',  label: 'Upcoming' },
  ]
  const notifications = [
    { dotColor: 'blue',  text: '<strong>New enrollment</strong> — Ana Reyes applied for Guitar Intermediate', time: '2 min ago' },
    { dotColor: 'coral', text: '<strong>Overdue rental</strong> — Yamaha F310 (Marco Cruz) — 3 days overdue',  time: '1 hr ago'  },
    { dotColor: 'gold',  text: '<strong>Studio booking</strong> — Room B reserved for March 14 by Pia Santos', time: '3 hrs ago' },
    { dotColor: 'teal',  text: '<strong>Payment received</strong> — ₱2,500 from Luis Tan (Guitar Beginner)',   time: 'Yesterday' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: C.display, fontSize: isMobile ? '26px' : '32px', fontWeight: 400, letterSpacing: '0.01em', color: C.text, margin: 0 }}>Good morning! 👋</h1>
        <p style={{ color: C.text3, fontSize: '13px', fontWeight: 300, letterSpacing: '0.02em', marginTop: '4px', fontFamily: C.font }}>
          Here's what's happening at Cadenza Music Center today — March 11, 2026
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: '14px', marginBottom: '16px' }}>
        {statsRow1.map((s, i) => <StatCard key={i} {...s} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: '14px', marginBottom: '16px' }}>
        {statsRow2.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr', gap: '16px' }}>
        {/* Today's Schedule */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '22px', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', fontFamily: C.font }}>Today's Schedule</span>
            <div style={{ flex: 1, height: '1px', background: C.border }} />
            <button onClick={() => onNavigate('scheduling')} style={{ padding: '4px 10px', borderRadius: '6px', border: `1px solid ${C.border}`, background: C.surface, color: C.text2, cursor: 'pointer', fontSize: '11px', fontFamily: C.font }}>View All</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '560px', borderCollapse: 'collapse' }}>
              <thead>
              <tr>{['Time','Student','Instructor','Room','Status'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontSize: '10px', fontWeight: 600, color: C.text3, borderBottom: `1px solid ${C.border}`, fontFamily: C.font, textTransform: 'uppercase', letterSpacing: '.1em' }}>{h}</th>
              ))}</tr>
              </thead>
              <tbody>
              {schedule.map((row, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '12px 10px', fontFamily: C.mono, fontSize: '13px', color: i === 0 ? C.accent : C.text }}>{row.time}</td>
                  <td style={{ padding: '12px 10px', fontSize: '13px', fontFamily: C.font, color: C.text }}>{row.student}</td>
                  <td style={{ padding: '12px 10px', fontSize: '13px', fontFamily: C.font, color: C.text2 }}>{row.instructor}</td>
                  <td style={{ padding: '12px 10px', fontSize: '13px', fontFamily: C.font, color: C.text2 }}>{row.room}</td>
                  <td style={{ padding: '12px 10px' }}><Badge type={row.status}>{row.label}</Badge></td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Notifications */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '22px', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', fontFamily: C.font }}>Recent Notifications</span>
            <div style={{ flex: 1, height: '1px', background: C.border }} />
          </div>
          {notifications.map((n, i) => <NotifItem key={i} {...n} />)}
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard Layout ─────────────────────────────────────
function Dashboard({ onLogout }) {
  const [activePage, setActivePage] = useState('dashboard')
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pageLabel = PAGE_LABELS[activePage] || activePage
  const isMobile = viewportWidth < 900
  const isTablet = viewportWidth < 1200

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setViewportWidth(width)
      if (width >= 900) setIsSidebarOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet" />

      <div style={{ display: 'flex', height: '100vh', background: C.bg, overflow: 'hidden' }}>

        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
          onLogout={onLogout}
          isMobile={isMobile}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Topbar
            pageLabel={pageLabel}
            onNavigate={setActivePage}
            onLogout={onLogout}
            isMobile={isMobile}
            onToggleSidebar={() => setIsSidebarOpen(v => !v)}
          />

          <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '28px 32px' }}>
            {activePage === 'dashboard'
              ? <DashboardContent onNavigate={setActivePage} isMobile={isMobile} isTablet={isTablet} />
              : (
                <div style={{ textAlign: 'center', paddingTop: '80px', color: C.text3, fontFamily: C.font }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
                  <div style={{ fontFamily: C.display, fontSize: '28px', fontWeight: 400, color: C.text, marginBottom: '8px' }}>{pageLabel}</div>
                  <div style={{ fontSize: '14px' }}>This page is not yet built. Navigate to another module.</div>
                </div>
              )
            }
          </div>
        </div>

      </div>
    </>
  )
}

export default Dashboard