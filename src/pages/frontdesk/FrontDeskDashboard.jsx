import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InstructorAvailability from './InstructorAvailability'
import StudentApproval from './StudentApproval'
import RescheduleApproval from './RescheduleApproval'
import StudioBookingApproval from './StudioBookingApproval'
import InstrumentRentalApproval from './InstrumentRentalApproval'
import FrontDeskSchedule from './FrontDeskSchedule'
import FrontDeskBilling from './FrontDeskBilling'
import FrontDeskPayment from './FrontDeskPayment'
import InstrumentUsage from './InstrumentUsage'
import Notifications from './Notifications'

const C = {
  bg: '#0e0f13',
  bg2: '#13141a',
  bg3: '#1a1c24',
  bg4: '#1f2130',
  border: 'rgba(255,255,255,0.07)',
  border2: 'rgba(255,255,255,0.12)',
  text: '#f0eff4',
  text2: '#9b99a8',
  text3: '#5a5870',
  accent: '#7c6af7',
  accentL: '#a99cf9',
  accentD: '#5548d9',
  teal: '#2dd4bf',
  coral: '#f87171',
  gold: '#fbbf24',
  green: '#34d399',
  pink: '#f472b6',
  font: "'Outfit', sans-serif",
  display: "'Syne', sans-serif",
  mono: "'Space Mono', monospace",
}

const FRONTDESK_NAV = [
  { section: 'Overview', items: [
    { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
  ]},
  { section: 'Approvals', items: [
    { id: 'instructor-availability', icon: '👨‍🏫', label: 'Instructor Availability' },
    { id: 'student-approval', icon: '🎓', label: 'Student Approval' },
    { id: 'reschedule-approval', icon: '🔄', label: 'Reschedule Approval' },
    { id: 'studio-booking-approval', icon: '🎬', label: 'Studio Booking' },
    { id: 'instrument-rental-approval', icon: '🎸', label: 'Instrument Rental' },
  ]},
  { section: 'Operations', items: [
    { id: 'schedule', icon: '📅', label: 'Schedule' },
    { id: 'billing', icon: '💳', label: 'Billing' },
    { id: 'payment', icon: '💰', label: 'Payments' },
    { id: 'instrument-usage', icon: '🎹', label: 'Instrument Usage' },
  ]},
  { section: 'System', items: [
    { id: 'notifications', icon: '🔔', label: 'Notifications' },
  ]},
]

const PAGE_LABELS = {
  dashboard: 'Dashboard',
  'instructor-availability': 'Instructor Availability',
  'student-approval': 'Student Approval',
  'reschedule-approval': 'Reschedule Approval',
  'studio-booking-approval': 'Studio Booking Approval',
  'instrument-rental-approval': 'Instrument Rental Approval',
  schedule: 'Schedule',
  billing: 'Billing',
  payment: 'Payments',
  'instrument-usage': 'Instrument Usage',
  notifications: 'Notifications',
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(124,106,247,0.3); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(124,106,247,0.6); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideRight {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 12px rgba(124,106,247,0.25); }
    50%       { box-shadow: 0 0 28px rgba(124,106,247,0.55); }
  }
  @keyframes barGrow {
    from { transform: scaleY(0); }
    to   { transform: scaleY(1); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-4px); }
  }
  @keyframes dotBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.2; }
  }

  .nav-item:hover .nav-icon { transform: scale(1.15); }
  .nav-item { transition: all 0.18s ease; }
  .nav-item:hover { background: rgba(124,106,247,0.08) !important; }

  .stat-card {
    animation: fadeUp 0.4s ease both;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.35) !important;
  }

  .pill-btn { transition: all 0.18s ease; }
  .pill-btn:hover { background: rgba(124,106,247,0.18) !important; color: #a99cf9 !important; }

  .schedule-row { transition: background 0.15s ease; }
  .schedule-row:hover { background: rgba(255,255,255,0.03) !important; }

  .sidebar-logo-icon { animation: float 3s ease-in-out infinite; }

  .bar-item { transform-origin: bottom; animation: barGrow 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; }

  .notif-item { transition: background 0.15s ease; }
  .notif-item:hover { background: rgba(255,255,255,0.03); border-radius: 8px; }

  .live-dot {
    animation: dotBlink 1.4s ease-in-out infinite;
  }

  .glow-ring { animation: glowPulse 2.5s ease-in-out infinite; }

  .topbar-btn { transition: all 0.15s ease; }
  .topbar-btn:hover { background: rgba(255,255,255,0.1) !important; border-color: rgba(255,255,255,0.2) !important; }
`

function Sidebar({ activePage, onNavigate, onLogout, isMobile, isOpen, onClose }) {
  const panel = (
    <div style={{
      width: '220px', minWidth: '220px',
      background: C.bg2,
      borderRight: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column',
      height: '100vh', overflowY: 'auto', overflowX: 'hidden',
    }}>
      <div style={{ padding: '20px 18px 16px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="sidebar-logo-icon glow-ring" style={{
            width: '38px', height: '38px', borderRadius: '12px',
            background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', flexShrink: 0,
          }}>♬</div>
          <div>
            <div style={{ fontFamily: C.display, fontSize: '15px', fontWeight: 700, color: C.text, letterSpacing: '0.01em', lineHeight: 1.2 }}>Cadenza</div>
            <div style={{ fontSize: '10px', color: C.text3, letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: C.font }}>Music Center</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 14px' }}>
        <div style={{
          padding: '8px 12px', borderRadius: '10px',
          background: 'rgba(124,106,247,0.1)', border: `1px solid rgba(124,106,247,0.25)`,
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '12px', fontWeight: 500, color: C.accentL, fontFamily: C.font,
        }}>
          <span style={{ fontSize: '14px' }}>🎯</span>
          <span>Front Desk</span>
          <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: C.green }} className="live-dot" />
        </div>
      </div>

      <div style={{ flex: 1 }}>
        {FRONTDESK_NAV.map(({ section, items }) => (
          <div key={section} style={{ marginBottom: '4px' }}>
            <div style={{
              padding: '10px 0 4px 16px', fontSize: '9px', fontWeight: 700,
              letterSpacing: '.14em', textTransform: 'uppercase',
              color: C.text3, fontFamily: C.font,
            }}>{section}</div>
            {items.map(item => {
              const isActive = activePage === item.id
              return (
                <div
                  key={item.id}
                  className="nav-item"
                  onClick={() => { onNavigate(item.id); onClose?.() }}
                  style={{
                    margin: '1px 8px', padding: '9px 10px', borderRadius: '10px',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    cursor: 'pointer', fontSize: '13px', fontFamily: C.font,
                    color: isActive ? C.accentL : C.text2,
                    background: isActive ? 'rgba(124,106,247,0.12)' : 'transparent',
                    fontWeight: isActive ? 600 : 400,
                    position: 'relative',
                  }}
                >
                  {isActive && (
                    <div style={{
                      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                      width: '3px', height: '60%', borderRadius: '0 3px 3px 0',
                      background: `linear-gradient(180deg, ${C.accent}, ${C.pink})`,
                    }} />
                  )}
                  <span className="nav-icon" style={{ fontSize: '15px', width: '18px', textAlign: 'center', transition: 'transform 0.15s ease' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 8px', borderTop: `1px solid ${C.border}` }}>
        <button
          onClick={() => { if (window.confirm('Are you sure you want to log out?')) { onLogout?.(); onClose?.() } }}
          style={{
            width: '100%', padding: '9px 12px', borderRadius: '10px',
            border: `1px solid rgba(248,113,113,0.2)`,
            background: 'rgba(248,113,113,0.07)', color: C.coral,
            cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: '8px',
            transition: 'all .18s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.15)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.4)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.07)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.2)' }}
        >
          <span>⏻</span> Log Out
        </button>
      </div>
    </div>
  )

  if (!isMobile) return panel
  return (
    <>
      {isOpen && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99 }} />}
      <div style={{ position: 'fixed', top: 0, left: isOpen ? 0 : '-220px', height: '100vh', zIndex: 100, transition: 'left .2s ease' }}>
        {panel}
      </div>
    </>
  )
}

function Topbar({ pageLabel, onNavigate, onLogout, isMobile, onToggleSidebar }) {
  return (
    <div style={{
      height: '60px', background: C.bg2, borderBottom: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', padding: '0 20px', gap: '12px', flexShrink: 0,
    }}>
      {isMobile && (
        <button className="topbar-btn" onClick={onToggleSidebar} style={{ width: '36px', height: '36px', borderRadius: '10px', background: C.bg3, border: `1px solid ${C.border}`, cursor: 'pointer', color: C.text2, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>☰</button>
      )}

      <div style={{ fontFamily: C.display, fontSize: '17px', fontWeight: 700, color: C.text, letterSpacing: '0.02em' }}>{pageLabel}</div>
      {!isMobile && <div style={{ fontSize: '12px', color: C.text3, fontFamily: C.font }}>/ {pageLabel}</div>}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: C.text3, fontSize: '13px' }}>⌕</span>
          <input
            type="text"
            placeholder="Search..."
            style={{
              background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '10px',
              padding: '7px 12px 7px 28px', color: C.text, fontFamily: C.font, fontSize: '13px',
              width: isMobile ? '130px' : '200px', outline: 'none',
              transition: 'border .15s, box-shadow .15s',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(124,106,247,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,106,247,0.1)' }}
            onBlur={e => { e.target.style.borderColor = `rgba(255,255,255,0.07)`; e.target.style.boxShadow = 'none' }}
          />
        </div>

        <button className="topbar-btn" style={{ width: '36px', height: '36px', borderRadius: '10px', background: C.bg3, border: `1px solid ${C.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', color: C.text2, fontSize: '16px' }}>
          ◎
          <div style={{ position: 'absolute', top: '7px', right: '7px', width: '7px', height: '7px', background: C.coral, borderRadius: '50%', border: `1.5px solid ${C.bg2}` }} className="live-dot" />
        </button>

        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: `linear-gradient(135deg, ${C.accent}, ${C.pink})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: C.font,
        }}>FD</div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, change, changeType, color, delay }) {
  const colors = {
    purple: { from: C.accent,  to: C.accentD, glow: 'rgba(124,106,247,0.2)' },
    teal:   { from: C.teal,    to: '#0891b2',  glow: 'rgba(45,212,191,0.2)'  },
    coral:  { from: C.coral,   to: '#dc2626',  glow: 'rgba(248,113,113,0.2)' },
    gold:   { from: C.gold,    to: '#d97706',  glow: 'rgba(251,191,36,0.2)'  },
    green:  { from: C.green,   to: '#059669',  glow: 'rgba(52,211,153,0.2)'  },
    pink:   { from: C.pink,    to: '#db2777',  glow: 'rgba(244,114,182,0.2)' },
  }
  const sc = colors[color] || colors.purple

  return (
    <div className="stat-card" style={{
      background: C.bg3, border: `1px solid ${C.border}`,
      borderRadius: '16px', padding: '18px 20px',
      animationDelay: `${delay || 0}s`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px',
        width: '80px', height: '80px', borderRadius: '50%',
        background: sc.glow, filter: 'blur(24px)', pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px',
          background: `linear-gradient(135deg, ${sc.from}22, ${sc.to}33)`,
          border: `1px solid ${sc.from}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
        }}>{icon}</div>
      </div>

      <div style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500 }}>{label}</div>
      <div style={{ fontFamily: C.display, fontSize: '28px', fontWeight: 700, color: C.text, lineHeight: 1.1, margin: '4px 0 6px', letterSpacing: '-0.01em' }}>{value}</div>
      <div style={{
        fontSize: '11px', fontFamily: C.font, fontWeight: 500,
        color: changeType === 'up' ? C.green : changeType === 'down' ? C.coral : C.text3,
        display: 'flex', alignItems: 'center', gap: '3px',
      }}>
        {changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : ''} {change}
      </div>
    </div>
  )
}

function NewInquiries() {
  const inquiries = [
    { name: 'Maria Santos', interest: 'Guitar Beginner', phone: '0917-123-4567', time: '10 min ago', priority: 'high' },
    { name: 'John Reyes', interest: 'Piano Intermediate', phone: '0928-234-5678', time: '25 min ago', priority: 'medium' },
    { name: 'Ana Cruz', interest: 'Voice Lessons', phone: '0935-345-6789', time: '1 hour ago', priority: 'high' },
    { name: 'Carlos Tan', interest: 'Drums Beginner', phone: '0912-456-7890', time: '2 hours ago', priority: 'low' },
  ]

  const priorityColors = {
    high: { bg: 'rgba(248,113,113,0.12)', c: C.coral, label: 'Urgent' },
    medium: { bg: 'rgba(251,191,36,0.12)', c: C.gold, label: 'Follow-up' },
    low: { bg: 'rgba(52,211,153,0.12)', c: C.green, label: 'New' },
  }

  return (
    <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px', animation: 'fadeUp 0.5s ease 0.3s both' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontFamily: C.display, fontSize: '15px', fontWeight: 700, color: C.text }}>New Student Inquiries</div>
        <div style={{ flex: 1, height: '1px', background: C.border, margin: '0 14px' }} />
        <span style={{ fontSize: '11px', color: C.accentL, fontFamily: C.font, fontWeight: 600, background: 'rgba(124,106,247,0.1)', padding: '4px 10px', borderRadius: '20px' }}>4 new</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {inquiries.map((inq, i) => {
          const pc = priorityColors[inq.priority]
          return (
            <div key={i} className="notif-item" style={{ display: 'flex', gap: '12px', padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}`, cursor: 'pointer' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: C.text, fontFamily: C.font }}>{inq.name}</span>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: pc.c, background: pc.bg, padding: '2px 8px', borderRadius: '12px', fontFamily: C.font, letterSpacing: '.05em' }}>{pc.label}</span>
                </div>
                <div style={{ fontSize: '12px', color: C.text2, fontFamily: C.font }}>{inq.interest}</div>
                <div style={{ fontSize: '11px', color: C.text3, fontFamily: C.mono, marginTop: '2px' }}>{inq.phone}</div>
              </div>
              <div style={{ fontSize: '10px', color: C.text3, fontFamily: C.font, flexShrink: 0, alignSelf: 'center' }}>{inq.time}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TodaySchedule() {
  const schedule = [
    { time: '09:00', student: 'Ana Reyes', instructor: 'Mr. Cruz', room: 'A', status: 'ongoing', statusLabel: 'Live' },
    { time: '10:00', student: 'Marco Santos', instructor: 'Ms. Lim', room: 'B', status: 'upcoming', statusLabel: 'Up Next' },
    { time: '11:00', student: 'Pia Gomez', instructor: 'Mr. Cruz', room: 'A', status: 'upcoming', statusLabel: 'Up Next' },
    { time: '13:00', student: 'Luis Tan', instructor: 'Ms. Reyes', room: 'C', status: 'pending', statusLabel: 'Pending' },
    { time: '14:00', student: 'Sofia Del', instructor: 'Mr. Bautista', room: 'B', status: 'upcoming', statusLabel: 'Up Next' },
  ]
  const sc = { ongoing: { bg: 'rgba(52,211,153,0.12)', c: C.green, dot: C.green }, upcoming: { bg: 'rgba(124,106,247,0.12)', c: C.accentL, dot: C.accent }, pending: { bg: 'rgba(251,191,36,0.12)', c: C.gold, dot: C.gold } }

  return (
    <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px', animation: 'fadeUp 0.5s ease 0.4s both' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontFamily: C.display, fontSize: '15px', fontWeight: 700, color: C.text }}>Today's Schedule</div>
        <div style={{ flex: 1, height: '1px', background: C.border, margin: '0 14px' }} />
        <button className="pill-btn" style={{ padding: '5px 12px', borderRadius: '20px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text3, cursor: 'pointer', fontSize: '11px', fontFamily: C.font, fontWeight: 500 }}>View all →</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: '400px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Time', 'Student', 'Instructor', 'Room', 'Status'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontSize: '10px', fontWeight: 600, color: C.text3, fontFamily: C.font, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: `1px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.map((r, i) => {
              const s = sc[r.status]
              return (
                <tr key={i} className="schedule-row" style={{ borderBottom: i < schedule.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <td style={{ padding: '13px 10px', fontFamily: C.mono, fontSize: '12px', color: r.status === 'ongoing' ? C.green : C.text, fontWeight: 700 }}>{r.time}</td>
                  <td style={{ padding: '13px 10px', fontSize: '13px', fontFamily: C.font, color: C.text, fontWeight: 500 }}>{r.student}</td>
                  <td style={{ padding: '13px 10px', fontSize: '12px', fontFamily: C.font, color: C.text2 }}>{r.instructor}</td>
                  <td style={{ padding: '13px 10px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '8px', background: C.bg4, border: `1px solid ${C.border}`, fontSize: '11px', fontFamily: C.mono, fontWeight: 700, color: C.text2 }}>{r.room}</span>
                  </td>
                  <td style={{ padding: '13px 10px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: s.bg, color: s.c, fontFamily: C.font }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: s.dot, display: 'inline-block' }} className={r.status === 'ongoing' ? 'live-dot' : ''} />
                      {r.statusLabel}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StudioAvailability() {
  const rooms = [
    { name: 'Studio A', type: 'Piano / Vocals', status: 'occupied', student: 'Ana Reyes' },
    { name: 'Studio B', type: 'Guitar / Bass', status: 'available' },
    { name: 'Studio C', type: 'Drums', status: 'booked', student: 'Luis Tan – 1PM' },
    { name: 'Studio D', type: 'Strings', status: 'available' },
    { name: 'Studio E', type: 'General', status: 'available' },
    { name: 'Studio F', type: 'Recording', status: 'occupied', student: 'Band session' },
  ]
  const sc = {
    occupied: { bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)', c: C.coral, label: 'Live' },
    booked: { bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)', c: C.gold, label: 'Booked' },
    available: { bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)', c: C.green, label: 'Free' },
  }

  return (
    <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px', animation: 'fadeUp 0.5s ease 0.5s both' }}>
      <div style={{ fontFamily: C.display, fontSize: '15px', fontWeight: 700, color: C.text, marginBottom: '14px' }}>Studio Room Availability</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {rooms.map((r, i) => {
          const s = sc[r.status]
          return (
            <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '12px', padding: '12px', transition: 'transform 0.15s ease', cursor: 'default' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: C.text, fontFamily: C.font }}>{r.name}</div>
                <span style={{ fontSize: '9px', fontWeight: 700, color: s.c, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font }}>{s.label}</span>
              </div>
              <div style={{ fontSize: '10px', color: C.text3, fontFamily: C.font, marginTop: '2px' }}>{r.type}</div>
              {r.student && <div style={{ fontSize: '10px', color: C.text2, fontFamily: C.font, marginTop: '5px', borderTop: `1px solid ${s.border}`, paddingTop: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.student}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function InstrumentAvailability() {
  const instruments = [
    { name: 'Guitar', total: 26, available: 8, color: C.accent },
    { name: 'Piano', total: 18, available: 8, color: C.teal },
    { name: 'Drums', total: 12, available: 3, color: C.coral },
    { name: 'Violin', total: 8, available: 4, color: C.gold },
    { name: 'Ukulele', total: 12, available: 7, color: C.green },
  ]

  return (
    <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px', animation: 'fadeUp 0.5s ease 0.6s both' }}>
      <div style={{ fontFamily: C.display, fontSize: '15px', fontWeight: 700, color: C.text, marginBottom: '14px' }}>Instrument Availability</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {instruments.map((item, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '12px', color: C.text2, fontFamily: C.font }}>{item.name}</span>
              <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.mono }}>{item.available}/{item.total} available</span>
            </div>
            <div style={{ height: '5px', background: C.bg4, borderRadius: '20px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '20px',
                background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`,
                width: `${(item.available / item.total) * 100}%`,
                transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
                animation: `slideRight 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.1 + 0.4}s both`,
                transformOrigin: 'left',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PendingTasks() {
  const tasks = [
    { task: 'Follow up with Maria Santos - Guitar inquiry', priority: 'high', time: 'Due today' },
    { task: 'Process payment for Luis Tan - March package', priority: 'medium', time: 'Due today' },
    { task: 'Confirm studio booking for Band session', priority: 'high', time: '2 hours ago' },
    { task: 'Update student records for new enrollments', priority: 'low', time: 'Tomorrow' },
  ]

  const priorityColors = {
    high: { bg: 'rgba(248,113,113,0.12)', c: C.coral, label: 'High' },
    medium: { bg: 'rgba(251,191,36,0.12)', c: C.gold, label: 'Medium' },
    low: { bg: 'rgba(52,211,153,0.12)', c: C.green, label: 'Low' },
  }

  return (
    <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px', animation: 'fadeUp 0.5s ease 0.7s both' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontFamily: C.display, fontSize: '15px', fontWeight: 700, color: C.text }}>Pending Tasks</div>
        <div style={{ flex: 1, height: '1px', background: C.border, margin: '0 14px' }} />
        <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font, fontWeight: 600 }}>4 tasks</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {tasks.map((t, i) => {
          const pc = priorityColors[t.priority]
          return (
            <div key={i} className="notif-item" style={{ display: 'flex', gap: '12px', padding: '11px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}`, cursor: 'pointer' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: `1px solid ${C.border2}`, background: C.bg3, cursor: 'pointer', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: C.text, fontFamily: C.font, marginBottom: '4px' }}>{t.task}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: pc.c, background: pc.bg, padding: '2px 8px', borderRadius: '12px', fontFamily: C.font }}>{pc.label}</span>
                  <span style={{ fontSize: '10px', color: C.text3, fontFamily: C.font }}>{t.time}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ImportantUpdates() {
  const updates = [
    { icon: '⚠️', color: C.coral, title: 'Schedule Change', body: 'Mr. Cruz rescheduled to 2PM - Room A', time: 'Just now' },
    { icon: '💳', color: C.gold, title: 'Unpaid Balance', body: 'Marco Santos - ₱2,500 overdue (7 days)', time: '1 hour ago' },
    { icon: '🎓', color: C.accent, title: 'New Enrollment', body: 'Ana Reyes enrolled in Guitar Beginner', time: '2 hours ago' },
    { icon: '📅', color: C.teal, title: 'Studio Booking', body: 'Room B reserved for Band session - 3PM', time: '3 hours ago' },
  ]

  return (
    <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px', animation: 'fadeUp 0.5s ease 0.8s both' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontFamily: C.display, fontSize: '15px', fontWeight: 700, color: C.text }}>Important Updates</div>
        <div style={{ flex: 1, height: '1px', background: C.border, margin: '0 14px' }} />
        <span style={{ fontSize: '10px', color: C.text3, fontFamily: C.font, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}>Today</span>
      </div>

      {updates.map((u, i) => (
        <div key={i} className="notif-item" style={{ display: 'flex', gap: '12px', padding: '11px 6px', borderBottom: i < updates.length - 1 ? `1px solid ${C.border}` : 'none', cursor: 'pointer' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${u.color}18`, border: `1px solid ${u.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{u.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: C.text, fontFamily: C.font }}>{u.title}</div>
            <div style={{ fontSize: '12px', color: C.text2, fontFamily: C.font, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.body}</div>
          </div>
          <div style={{ fontSize: '10px', color: C.text3, fontFamily: C.font, flexShrink: 0, alignSelf: 'center' }}>{u.time}</div>
        </div>
      ))}
    </div>
  )
}

function DashboardContent({ onNavigate, isMobile, isTablet }) {
  const stats = [
    { color: 'purple', icon: '📨', label: 'New Inquiries', value: '4', change: '2 urgent', changeType: 'up', delay: 0.1 },
    { color: 'teal', icon: '🎓', label: 'Active Enrollments', value: '248', change: '12 new this week', changeType: 'up', delay: 0.15 },
    { color: 'gold', icon: '📅', label: "Today's Lessons", value: '34', change: '3 ongoing now', changeType: 'up', delay: 0.2 },
    { color: 'green', icon: '🎬', label: 'Studio Bookings', value: '7', change: 'Today', changeType: '', delay: 0.25 },
    { color: 'coral', icon: '💳', label: 'Unpaid Balances', value: '₱38k', change: '3 overdue accounts', changeType: 'down', delay: 0.3 },
    { color: 'pink', icon: '✅', label: 'Pending Tasks', value: '4', change: '2 high priority', changeType: 'down', delay: 0.35 },
  ]

  const cols = isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)'

  return (
    <div>
      <div style={{ marginBottom: '24px', animation: 'fadeUp 0.4s ease both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <h1 style={{ fontFamily: C.display, fontSize: isMobile ? '24px' : '30px', fontWeight: 800, color: C.text, letterSpacing: '-0.02em' }}>Front Desk Dashboard</h1>
        </div>
        <p style={{ color: C.text3, fontSize: '13px', fontFamily: C.font }}>
          Daily operations overview — <span style={{ color: C.accentL, fontWeight: 500 }}>March 11, 2026</span>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: '12px', marginBottom: '16px' }}>
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
        <NewInquiries />
        <TodaySchedule />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
        <StudioAvailability />
        <InstrumentAvailability />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr', gap: '14px' }}>
        <PendingTasks />
        <ImportantUpdates />
      </div>
    </div>
  )
}

export default function FrontDeskDashboard() {
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState(() => {
    try {
      return localStorage.getItem('frontdeskActivePage') || 'dashboard'
    } catch {
      return 'dashboard'
    }
  })
  // Persist active nav to localStorage
  useEffect(() => {
    try { localStorage.setItem('frontdeskActivePage', activePage) } catch { /* ignore */ }
  }, [activePage])
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const isMobile = viewportWidth < 900
  const isTablet = viewportWidth < 1200
  const pageLabel = PAGE_LABELS[activePage] || activePage

  const handleLogout = () => {
    navigate('/frontdesk/login')
  }

  useEffect(() => {
    const handleResize = () => { setViewportWidth(window.innerWidth); if (window.innerWidth >= 900) setIsSidebarOpen(false) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      <style>{css}</style>
      <div style={{ display: 'flex', height: '100vh', background: C.bg, overflow: 'hidden', fontFamily: C.font }}>
        <Sidebar activePage={activePage} onNavigate={setActivePage} onLogout={handleLogout} isMobile={isMobile} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Topbar pageLabel={pageLabel} onNavigate={setActivePage} onLogout={handleLogout} isMobile={isMobile} onToggleSidebar={() => setIsSidebarOpen(v => !v)} />
          <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '24px 28px', background: C.bg }}>
            {activePage === 'dashboard' ? (
              <DashboardContent onNavigate={setActivePage} isMobile={isMobile} isTablet={isTablet} />
            ) : activePage === 'instructor-availability' ? (
              <InstructorAvailability isMobile={isMobile} isTablet={isTablet} />
            ) : activePage === 'student-approval' ? (
              <StudentApproval isMobile={isMobile} isTablet={isTablet} />
            ) : activePage === 'reschedule-approval' ? (
              <RescheduleApproval isMobile={isMobile} isTablet={isTablet} />
            ) : activePage === 'studio-booking-approval' ? (
              <StudioBookingApproval isMobile={isMobile} isTablet={isTablet} />
            ) : activePage === 'instrument-rental-approval' ? (
              <InstrumentRentalApproval isMobile={isMobile} isTablet={isTablet} />
            ) : activePage === 'schedule' ? (
              <FrontDeskSchedule isMobile={isMobile} isTablet={isTablet} />
            ) : activePage === 'billing' ? (
              <FrontDeskBilling isMobile={isMobile} isTablet={isTablet} />
            ) : activePage === 'payment' ? (
              <FrontDeskPayment isMobile={isMobile} isTablet={isTablet} />
            ) : activePage === 'instrument-usage' ? (
              <InstrumentUsage isMobile={isMobile} isTablet={isTablet} />
            ) : activePage === 'notifications' ? (
              <Notifications isMobile={isMobile} isTablet={isTablet} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: C.text3, fontSize: '14px' }}>
                {pageLabel} module coming soon...
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

