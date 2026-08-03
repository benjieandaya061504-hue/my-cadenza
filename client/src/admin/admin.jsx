import { useState, useEffect } from 'react'
import EnrolledStudents from './EnrolledStudents.jsx'
import UserManagement from './UserManagement.jsx'
import InstructorManagement from './InstructorManagement.jsx'
import LessonManagement from './LessonManagement.jsx'
import ScheduleManagement from './ScheduleManagement.jsx'
import StudioRoomManagement from './StudioRoomManagement.jsx'
import InstrumentManagement from './InstrumentManagement.jsx'
import AnnouncementManagement from './AnnouncementManagement.jsx'
import Settings from './Settings.jsx'
import Reports from './Reports.jsx'
import C from './theme.js'

const ADMIN_NAV = [
  { section: 'Overview', items: [
    { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
  ]},
  { section: 'Management', items: [
    { id: 'enrolled',      icon: '🎓', label: 'Enrolled Students' },
    { id: 'users',         icon: '◈', label: 'Users' },
    { id: 'instructors',   icon: '👨‍🏫', label: 'Instructors' },
    { id: 'lessons',       icon: '♫', label: 'Lessons' },
    { id: 'scheduling',    icon: '▦', label: 'Schedules' },
    { id: 'studio',        icon: '♬', label: 'Studio Rooms' },
    { id: 'instruments',   icon: '♪', label: 'Instruments' },
    { id: 'announcements', icon: '◐', label: 'Announcements' },
    { id: 'reports',       icon: '▲', label: 'Reports' },
  ]},
  { section: 'System', items: [
    { id: 'settings',     icon: '⚙', label: 'Settings' },
  ]},
]

const PAGE_LABELS = {
  dashboard: 'Dashboard',
  enrolled: 'Enrolled Students',
  users: 'Users',
  instructors: 'Instructors',
  lessons: 'Lessons',
  scheduling: 'Schedules',
  studio: 'Studio Rooms',
  instruments: 'Instruments',
  announcements: 'Announcements',
  reports: 'Reports',
  settings: 'Settings',
}

const AdminDashboard = () => {
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth)
  const [activePage, setActivePage] = useState(() => {
    try { return localStorage.getItem('adminActivePage') || 'dashboard' } catch { return 'dashboard' }
  })
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const isMobile = viewportWidth < 900
  const isTablet = viewportWidth < 1200

  useEffect(() => {
    try { localStorage.setItem('adminActivePage', activePage) } catch { /* ignore */ }
  }, [activePage])

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('cadenza_user')
    window.location.href = '/'
  }

  const pageLabel = PAGE_LABELS[activePage] || activePage

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardContent onNavigate={setActivePage} isMobile={isMobile} isTablet={isTablet} />
      case 'enrolled': return <EnrolledStudents isMobile={isMobile} isTablet={isTablet} />
      case 'users': return <UserManagement isMobile={isMobile} isTablet={isTablet} />
      case 'instructors': return <InstructorManagement isMobile={isMobile} isTablet={isTablet} />
      case 'lessons': return <LessonManagement isMobile={isMobile} isTablet={isTablet} />
      case 'scheduling': return <ScheduleManagement isMobile={isMobile} isTablet={isTablet} />
      case 'studio': return <StudioRoomManagement isMobile={isMobile} isTablet={isTablet} />
      case 'instruments': return <InstrumentManagement isMobile={isMobile} isTablet={isTablet} />
      case 'announcements': return <AnnouncementManagement isMobile={isMobile} isTablet={isTablet} />
      case 'reports': return <Reports isMobile={isMobile} isTablet={isTablet} />
      case 'settings': return <Settings isMobile={isMobile} isTablet={isTablet} />
      default: return (
        <div style={{ textAlign: 'center', paddingTop: 80, color: C.text3, fontFamily: C.font }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>◎</div>
          <div style={{ fontFamily: C.display, fontSize: 26, fontWeight: 700, color: C.navy, marginBottom: 8 }}>{pageLabel}</div>
          <div style={{ fontSize: 13 }}>This module is not yet built.</div>
        </div>
      )
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Sora:wght@400;500;600;700;800&display=swap');

        .admin-dashboard { min-height: 100vh; background: #F8FAFC; font-family: 'Inter', sans-serif; color: #334155; }
        .admin-header {
          background: rgba(255,255,255,0.85); backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(30,41,59,0.06); padding: 0 6%; position: sticky; top: 0; z-index: 100;
        }
        .admin-header-inner { display: flex; align-items: center; justify-content: space-between; height: 68px; max-width: 1400px; margin: 0 auto; }
        .admin-logo { display: flex; align-items: center; gap: 12px; }
        .admin-logo-mark {
          width: 40px; height: 40px; border-radius: 50%;
          background: linear-gradient(135deg, #2563EB, #7C3AED);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 18px rgba(37,99,235,0.35);
        }
        .admin-logo-mark svg { width: 20px; height: 20px; fill: none; stroke: #fff; stroke-width: 1.6; }
        .admin-logo-text { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1rem; letter-spacing: 0.5px; color: #1E293B; line-height: 1; }
        .admin-logo-text span { display: block; font-family: 'Inter', sans-serif; font-weight: 500; font-size: 0.6rem; letter-spacing: 2.5px; color: #7C3AED; margin-top: 3px; }
        .admin-header-right { display: flex; align-items: center; gap: 1rem; }
        .admin-badge {
          display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 20px;
          background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.2);
          font-size: 0.78rem; font-weight: 600; color: #7C3AED;
        }
        .admin-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #10B981; animation: dotBlink 1.4s ease-in-out infinite; }
        @keyframes dotBlink { 0%,100% { opacity: 1; } 50% { opacity: 0.2; } }
        .admin-logout-btn {
          padding: 0.5rem 1.2rem; border-radius: 999px; font-size: 0.68rem; font-weight: 700;
          letter-spacing: 1.1px; text-transform: uppercase; border: 1.5px solid rgba(30,41,59,0.14);
          color: #1E293B; background: transparent; cursor: pointer; transition: all 0.25s ease; font-family: 'Inter', sans-serif;
        }
        .admin-logout-btn:hover { border-color: #2563EB; color: #2563EB; background: rgba(37,99,235,0.06); }
        .admin-main { max-width: 1400px; margin: 0 auto; padding: 28px 6%; }
        .admin-title { font-family: 'Sora', sans-serif; font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 800; color: #1E293B; letter-spacing: -0.02em; margin-bottom: 4px; }
        .admin-subtitle { color: #94A3B8; font-size: 0.85rem; margin-bottom: 28px; }
        .admin-date { color: #7C3AED; font-weight: 500; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
        .stat-card {
          background: #fff; border: 1px solid rgba(30,41,59,0.07); border-radius: 18px; padding: 1.3rem 1.2rem;
          box-shadow: 0 4px 12px rgba(30,41,59,0.04); transition: transform 0.2s ease, box-shadow 0.2s ease;
          animation: fadeUp 0.4s ease both;
        }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(30,41,59,0.08); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .stat-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .stat-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
        .stat-value { font-family: 'Sora', sans-serif; font-size: 1.5rem; font-weight: 800; color: #1E293B; line-height: 1; margin-bottom: 4px; }
        .stat-label { font-size: 0.75rem; color: #64748B; font-weight: 500; margin-bottom: 8px; }
        .stat-change { font-size: 0.7rem; font-weight: 600; display: flex; align-items: center; gap: 4px; }
        .stat-change.up { color: #10B981; }
        .stat-change.down { color: #F87171; }
        .lower-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .panel {
          background: #fff; border: 1px solid rgba(30,41,59,0.07); border-radius: 18px; padding: 1.3rem;
          box-shadow: 0 4px 12px rgba(30,41,59,0.04); animation: fadeUp 0.5s ease both;
        }
        .panel-title { font-family: 'Sora', sans-serif; font-size: 0.9rem; font-weight: 700; color: #1E293B; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; }
        .panel-title-bar { flex: 1; height: 1px; background: rgba(30,41,59,0.07); margin: 0 12px; }
        .panel-title-label { color: #94A3B8; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; font-family: 'Inter', sans-serif; }
        .schedule-table { width: 100%; border-collapse: collapse; }
        .schedule-table th { text-align: left; padding: 10px 8px; font-size: 0.68rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid rgba(30,41,59,0.07); }
        .schedule-table td { padding: 11px 8px; font-size: 0.8rem; color: #334155; border-bottom: 1px solid rgba(30,41,59,0.05); }
        .schedule-table tr:hover td { background: rgba(37,99,235,0.03); }
        .status-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: 0.68rem; font-weight: 600; }
        .status-dot { width: 5px; height: 5px; border-radius: 50%; display: inline-block; }
        .room-badge { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 8px; background: #F4F7FE; border: 1px solid rgba(30,41,59,0.07); font-size: 0.7rem; font-weight: 700; color: #64748B; }
        .notif-item { display: flex; gap: 12px; padding: 10px 4px; border-bottom: 1px solid rgba(30,41,59,0.06); cursor: pointer; transition: background 0.15s ease; }
        .notif-item:last-child { border-bottom: none; }
        .notif-item:hover { background: rgba(37,99,235,0.03); border-radius: 8px; }
        .notif-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
        .notif-body { flex: 1; min-width: 0; }
        .notif-title { font-size: 0.78rem; font-weight: 600; color: #1E293B; }
        .notif-text { font-size: 0.75rem; color: #64748B; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .notif-time { font-size: 0.65rem; color: #94A3B8; flex-shrink: 0; align-self: center; }
        .rooms-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
        .room-card { padding: 12px; border-radius: 12px; transition: transform 0.15s ease; cursor: default; }
        .room-card:hover { transform: scale(1.03); }
        .room-card-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .room-name { font-size: 0.78rem; font-weight: 700; color: #1E293B; }
        .room-status-label { font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
        .room-type { font-size: 0.65rem; color: #94A3B8; margin-top: 2px; }
        .room-student { font-size: 0.65rem; color: #64748B; margin-top: 5px; padding-top: 5px; border-top: 1px solid rgba(30,41,59,0.06); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .instrument-item { margin-bottom: 10px; }
        .instrument-item:last-child { margin-bottom: 0; }
        .instrument-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .instrument-label { font-size: 0.78rem; color: #64748B; }
        .instrument-count { font-size: 0.72rem; color: #94A3B8; font-family: 'Sora', sans-serif; font-weight: 600; }
        .instrument-bar { height: 5px; background: #F4F7FE; border-radius: 20px; overflow: hidden; }
        .instrument-fill { height: 100%; border-radius: 20px; transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1); }

        .sidebar-overlay {
          position: fixed; inset: 0; z-index: 200; background: rgba(15,23,42,0.4);
          opacity: 0; visibility: hidden; transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        .sidebar-overlay.open { opacity: 1; visibility: visible; }
        .sidebar-panel {
          position: fixed; top: 0; left: 0; bottom: 0; width: 240px; z-index: 201;
          background: #fff; border-right: 1px solid rgba(30,41,59,0.07);
          transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow-y: auto; box-shadow: 4px 0 20px rgba(30,41,59,0.1);
        }
        .sidebar-panel.open { transform: translateX(0); }
        .nav-item { transition: all 0.15s ease; cursor: pointer; }
        .nav-item:hover { background: rgba(37,99,235,0.06) !important; }

        @media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } .lower-grid { grid-template-columns: 1fr; } .rooms-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 900px) { .admin-main { padding: 20px 5%; } .admin-badge span { display: none; } .stats-grid { grid-template-columns: 1fr 1fr; } .rooms-grid { grid-template-columns: 1fr; } }
        @media (max-width: 560px) { .stats-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="admin-dashboard">
        {/* Mobile sidebar overlay */}
        {isMobile && (
          <>
            <div className={`sidebar-overlay${isSidebarOpen ? ' open' : ''}`} onClick={() => setIsSidebarOpen(false)} />
            <div className={`sidebar-panel${isSidebarOpen ? ' open' : ''}`}>
              <SidebarContent activePage={activePage} onNavigate={(id) => { setActivePage(id); setIsSidebarOpen(false) }} onLogout={handleLogout} />
            </div>
          </>
        )}

        {/* Header */}
        <header className="admin-header">
          <div className="admin-header-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {isMobile && (
                <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#1E293B', padding: 4 }}>
                  ☰
                </button>
              )}
              <div className="admin-logo">
                <div className="admin-logo-mark">
                  <svg viewBox="0 0 24 24"><path d="M9 18V5l10-2v13" strokeLinecap="round" strokeLinejoin="round" /><circle cx="6" cy="18" r="3" /><circle cx="16" cy="16" r="3" /></svg>
                </div>
                <div className="admin-logo-text">CADENZA<span>MUSIC CENTER</span></div>
              </div>
            </div>
            <div className="admin-header-right">
              <div className="admin-badge">
                <span className="admin-badge-dot" />
                <span>Administrator</span>
              </div>
              <button className="admin-logout-btn" onClick={handleLogout}>Sign Out</button>
            </div>
          </div>
        </header>

        <div style={{ display: 'flex', maxWidth: 1400, margin: '0 auto' }}>
          {/* Desktop sidebar */}
          {!isMobile && (
            <div style={{ width: 220, minWidth: 220, background: '#fff', borderRight: `1px solid ${C.border}`, minHeight: 'calc(100vh - 68px)' }}>
              <SidebarContent activePage={activePage} onNavigate={setActivePage} onLogout={handleLogout} />
            </div>
          )}

          {/* Main content */}
          <main className="admin-main" style={{ flex: 1, padding: '28px 6%' }}>
            {renderPage()}
          </main>
        </div>
      </div>
    </>
  )
}

function SidebarContent({ activePage, onNavigate, onLogout }) {
  return (
    <div style={{ padding: '16px 0' }}>
      {/* Role Badge */}
      <div style={{ padding: '0 14px 12px', borderBottom: `1px solid ${C.border}`, marginBottom: 8 }}>
        <div style={{
          padding: '8px 12px', borderRadius: 10, background: 'rgba(37,99,235,0.08)', border: `1px solid rgba(37,99,235,0.2)`,
          display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', fontWeight: 600, color: C.royal, fontFamily: C.font,
        }}>
          <span style={{ fontSize: '0.9rem' }}>🛡️</span>
          <span>Administrator</span>
          <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: C.green }} className="admin-badge-dot" />
        </div>
      </div>

      {ADMIN_NAV.map(({ section, items }) => (
        <div key={section}>
          <div style={{ padding: '8px 16px 4px', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.text3, fontFamily: C.font }}>
            {section}
          </div>
          {items.map(item => {
            const isActive = activePage === item.id
            return (
              <div key={item.id} className="nav-item" onClick={() => onNavigate(item.id)}
                style={{
                  margin: '1px 8px', padding: '9px 10px', borderRadius: 10,
                  display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', fontFamily: C.font,
                  color: isActive ? C.royal : C.text2,
                  background: isActive ? 'rgba(37,99,235,0.08)' : 'transparent',
                  fontWeight: isActive ? 600 : 400, position: 'relative',
                }}>
                {isActive && (
                  <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: '60%', borderRadius: '0 3px 3px 0', background: `linear-gradient(180deg, ${C.royal}, ${C.purple})` }} />
                )}
                <span style={{ fontSize: '0.95rem', width: 20, textAlign: 'center' }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            )
          })}
        </div>
      ))}

      <div style={{ padding: '12px 8px', borderTop: `1px solid ${C.border}`, marginTop: 8 }}>
        <button onClick={onLogout}
          style={{
            width: '100%', padding: '9px 10px', borderRadius: 10, cursor: 'pointer',
            fontSize: '0.82rem', fontFamily: C.font, fontWeight: 500, color: C.coral,
            background: 'transparent', border: `1px solid ${C.border2}`, textAlign: 'left',
          }}>
          🚪 Sign Out
        </button>
      </div>
    </div>
  )
}

function DashboardContent({ onNavigate, isMobile, isTablet }) {
  const stats = [
    { color: 'royal', icon: '🎓', label: 'Enrolled Students', value: '248', change: '12 new this month', changeType: 'up', delay: 0.1 },
    { color: 'teal', icon: '📅', label: "Today's Lessons", value: '34', change: 'Active right now', changeType: 'up', delay: 0.15 },
    { color: 'gold', icon: '💰', label: 'Payments Received', value: '₱184k', change: '₱22k this week', changeType: 'up', delay: 0.2 },
    { color: 'coral', icon: '⚠️', label: 'Outstanding Balance', value: '₱38k', change: '3 overdue accounts', changeType: 'down', delay: 0.25 },
    { color: 'green', icon: '🎸', label: 'Studio Bookings', value: '7', change: 'Today', changeType: '', delay: 0.3 },
    { color: 'pink', icon: '🎺', label: 'Active Rentals', value: '19', change: '2 overdue', changeType: 'down', delay: 0.35 },
    { color: 'teal', icon: '👨‍🏫', label: 'Instructors', value: '14', change: 'All scheduled', changeType: '', delay: 0.4 },
    { color: 'royal', icon: '📦', label: 'Instruments', value: '91', change: '74 available', changeType: 'up', delay: 0.45 },
  ]

  const scheduleData = [
    { time: '08:00', student: 'Ana Reyes', instrument: 'Piano', instructor: 'Mr. Cruz', room: 'A', status: 'ongoing' },
    { time: '09:00', student: 'Marco Santos', instrument: 'Guitar', instructor: 'Ms. Tan', room: 'B', status: 'ongoing' },
    { time: '10:00', student: 'Luis Tan', instrument: 'Drums', instructor: 'Mr. Reyes', room: 'C', status: 'upcoming' },
    { time: '11:00', student: 'Pia Santos', instrument: 'Violin', instructor: 'Ms. Gomez', room: 'D', status: 'upcoming' },
    { time: '13:00', student: 'Carla Cruz', instrument: 'Voice', instructor: 'Mr. Cruz', room: 'A', status: 'upcoming' },
    { time: '14:00', student: 'Ben Torres', instrument: 'Bass', instructor: 'Ms. Tan', room: 'B', status: 'upcoming' },
  ]

  const notifications = [
    { icon: '🎓', color: C.royal, title: 'New enrollment', body: 'Ana Reyes applied for Guitar Intermediate', time: '2m ago' },
    { icon: '⚠️', color: C.coral, title: 'Overdue rental', body: 'Yamaha F310 — 3 days overdue (Marco Cruz)', time: '1h ago' },
    { icon: '🎸', color: C.gold, title: 'Studio booking', body: 'Room B reserved March 14 by Pia Santos', time: '3h ago' },
    { icon: '💳', color: C.teal, title: 'Payment received', body: '₱2,500 from Luis Tan — Guitar Beginner pkg', time: 'Yesterday' },
  ]

  const rooms = [
    { name: 'Studio A', type: 'Piano / Vocals', status: 'occupied', student: 'Ana Reyes' },
    { name: 'Studio B', type: 'Guitar / Bass', status: 'available' },
    { name: 'Studio C', type: 'Drums', status: 'booked', student: 'Luis Tan – 1PM' },
    { name: 'Studio D', type: 'Strings', status: 'available' },
    { name: 'Studio E', type: 'General', status: 'available' },
    { name: 'Studio F', type: 'Recording', status: 'occupied', student: 'Band session' },
  ]

  const instruments = [
    { label: 'Guitar', total: 26, used: 18, color: C.royal },
    { label: 'Piano', total: 18, used: 10, color: C.teal },
    { label: 'Drums', total: 12, used: 9, color: C.coral },
    { label: 'Violin', total: 8, used: 4, color: C.gold },
    { label: 'Ukulele', total: 12, used: 5, color: C.green },
  ]

  const statusColors = {
    ongoing: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', c: C.green, label: 'Ongoing' },
    upcoming: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)', c: C.royal, label: 'Upcoming' },
    occupied: { bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)', c: C.coral, label: 'Occupied' },
    booked: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', c: C.gold, label: 'Booked' },
    available: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', c: C.green, label: 'Available' },
  }

  const statColors = {
    royal: { bg: 'rgba(37,99,235,0.08)', border: 'rgba(37,99,235,0.15)' },
    teal: { bg: 'rgba(20,184,166,0.08)', border: 'rgba(20,184,166,0.15)' },
    gold: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)' },
    coral: { bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.15)' },
    green: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)' },
    pink: { bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.15)' },
  }

  return (
    <div>
      <div style={{ animation: 'fadeUp 0.4s ease both', marginBottom: 24 }}>
        <h1 className="admin-title">Dashboard</h1>
        <p className="admin-subtitle">
          Welcome back! — <span className="admin-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </p>
      </div>

      <div className="stats-grid">
        {stats.map((s, i) => {
          const sc = statColors[s.color]
          return (
            <div key={i} className="stat-card" style={{ animationDelay: `${s.delay}s` }}>
              <div className="stat-card-top">
                <div className="stat-icon" style={{ background: sc.bg, border: `1px solid ${sc.border}` }}>{s.icon}</div>
                {s.changeType === 'up' && <span className="stat-change up">↑ {s.change}</span>}
                {s.changeType === 'down' && <span className="stat-change down">↓ {s.change}</span>}
                {s.changeType === '' && <span className="stat-change" style={{ color: C.text3 }}>{s.change}</span>}
              </div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          )
        })}
      </div>

      <div className="lower-grid">
        <div className="panel" style={{ animationDelay: '0.3s' }}>
          <div className="panel-title">
            Today's Schedule
            <span className="panel-title-bar" />
            <span className="panel-title-label">{scheduleData.length} Lessons</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="schedule-table">
              <thead>
                <tr>
                  {['Time', 'Student', 'Instrument', 'Instructor', 'Room', 'Status'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scheduleData.map((r, i) => {
                  const s = statusColors[r.status] || statusColors.upcoming
                  return (
                    <tr key={i}>
                      <td style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: '0.78rem', color: '#1E293B' }}>{r.time}</td>
                      <td>{r.student}</td>
                      <td style={{ color: '#64748B' }}>{r.instrument}</td>
                      <td style={{ color: '#64748B' }}>{r.instructor}</td>
                      <td><span className="room-badge">{r.room}</span></td>
                      <td>
                        <span className="status-badge" style={{ background: s.bg, color: s.c }}>
                          <span className="status-dot" style={{ background: s.c }} />
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel" style={{ animationDelay: '0.4s' }}>
          <div className="panel-title">
            Recent Activity
            <span className="panel-title-bar" />
            <span className="panel-title-label">Today</span>
          </div>
          {notifications.map((n, i) => (
            <div key={i} className="notif-item">
              <div className="notif-icon" style={{ background: `${n.color}15`, border: `1px solid ${n.color}25` }}>{n.icon}</div>
              <div className="notif-body">
                <div className="notif-title">{n.title}</div>
                <div className="notif-text">{n.body}</div>
              </div>
              <div className="notif-time">{n.time}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="lower-grid">
        <div className="panel" style={{ animationDelay: '0.5s' }}>
          <div className="panel-title">Studio Rooms</div>
          <div className="rooms-grid">
            {rooms.map((r, i) => {
              const s = statusColors[r.status] || statusColors.available
              return (
                <div key={i} className="room-card" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                  <div className="room-card-top">
                    <div className="room-name">{r.name}</div>
                    <span className="room-status-label" style={{ color: s.c }}>{s.label}</span>
                  </div>
                  <div className="room-type">{r.type}</div>
                  {r.student && <div className="room-student">{r.student}</div>}
                </div>
              )
            })}
          </div>
        </div>

        <div className="panel" style={{ animationDelay: '0.6s' }}>
          <div className="panel-title">Instrument Usage</div>
          {instruments.map((item, i) => (
            <div key={i} className="instrument-item">
              <div className="instrument-header">
                <span className="instrument-label">{item.label}</span>
                <span className="instrument-count">{item.used}/{item.total}</span>
              </div>
              <div className="instrument-bar">
                <div className="instrument-fill" style={{ width: `${(item.used / item.total) * 100}%`, background: `linear-gradient(90deg, ${item.color}, ${item.color}88)` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard