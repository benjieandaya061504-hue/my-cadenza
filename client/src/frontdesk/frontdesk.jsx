import { useState, useEffect } from 'react'
import InstructorAvailability from './InstructorAvailability.jsx'
import StudentApproval from './StudentApproval.jsx'
import RescheduleApproval from './RescheduleApproval.jsx'
import StudioBookingApproval from './StudioBookingApproval.jsx'
import InstrumentRentalApproval from './InstrumentRentalApproval.jsx'
import FrontDeskSchedule from './FrontDeskSchedule.jsx'
import FrontDeskBilling from './FrontDeskBilling.jsx'
import FrontDeskPayment from './FrontDeskPayment.jsx'
import InstrumentUsage from './InstrumentUsage.jsx'
import Notifications from './Notifications.jsx'
import C from '../admin/theme.js'

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

const FD_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Sora:wght@400;500;600;700;800&display=swap');

  .fd-dashboard { min-height: 100vh; background: #F8FAFC; font-family: 'Inter', sans-serif; color: #334155; }
  .fd-header {
    background: rgba(255,255,255,0.85); backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(30,41,59,0.06); padding: 0 6%; position: sticky; top: 0; z-index: 100;
  }
  .fd-header-inner { display: flex; align-items: center; justify-content: space-between; height: 68px; max-width: 1400px; margin: 0 auto; }
  .fd-logo { display: flex; align-items: center; gap: 12px; }
  .fd-logo-mark {
    width: 40px; height: 40px; border-radius: 50%;
    background: linear-gradient(135deg, #2563EB, #7C3AED);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 6px 18px rgba(37,99,235,0.35);
  }
  .fd-logo-mark svg { width: 20px; height: 20px; fill: none; stroke: #fff; stroke-width: 1.6; }
  .fd-logo-text { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1rem; letter-spacing: 0.5px; color: #1E293B; line-height: 1; }
  .fd-logo-text span { display: block; font-family: 'Inter', sans-serif; font-weight: 500; font-size: 0.6rem; letter-spacing: 2.5px; color: #7C3AED; margin-top: 3px; }
  .fd-header-right { display: flex; align-items: center; gap: 1rem; }
  .fd-badge {
    display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 20px;
    background: rgba(37,99,235,0.08); border: 1px solid rgba(37,99,235,0.2);
    font-size: 0.78rem; font-weight: 600; color: #2563EB;
  }
  .fd-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #10B981; animation: fdDotBlink 1.4s ease-in-out infinite; }
  @keyframes fdDotBlink { 0%,100% { opacity: 1; } 50% { opacity: 0.2; } }
  .fd-logout-btn {
    padding: 0.5rem 1.2rem; border-radius: 999px; font-size: 0.68rem; font-weight: 700;
    letter-spacing: 1.1px; text-transform: uppercase; border: 1.5px solid rgba(30,41,59,0.14);
    color: #1E293B; background: transparent; cursor: pointer; transition: all 0.25s ease; font-family: 'Inter', sans-serif;
  }
  .fd-logout-btn:hover { border-color: #2563EB; color: #2563EB; background: rgba(37,99,235,0.06); }
  .fd-main { max-width: 1400px; margin: 0 auto; padding: 28px 6%; }
  .fd-title { font-family: 'Sora', sans-serif; font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 800; color: #1E293B; letter-spacing: -0.02em; margin-bottom: 4px; }
  .fd-subtitle { color: #94A3B8; font-size: 0.85rem; margin-bottom: 28px; }
  .fd-date { color: #7C3AED; font-weight: 500; }

  @keyframes fdFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fdSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fdScaleIn {
    from { opacity: 0; transform: scale(0.92); }
    to { opacity: 1; transform: scale(1); }
  }

  .fd-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
  .fd-stat-card {
    background: #fff; border: 1px solid rgba(30,41,59,0.07); border-radius: 18px; padding: 1.3rem 1.2rem;
    box-shadow: 0 4px 12px rgba(30,41,59,0.04); transition: transform 0.25s ease, box-shadow 0.25s ease;
    animation: fdFadeUp 0.45s ease both; position: relative; overflow: hidden;
  }
  .fd-stat-card::before {
    content: ''; position: absolute; top: -60%; right: -30%; width: 90px; height: 90px;
    border-radius: 50%; opacity: 0.35; pointer-events: none; transition: all 0.4s ease;
  }
  .fd-stat-card:hover { transform: translateY(-4px); box-shadow: 0 14px 34px rgba(30,41,59,0.1); }
  .fd-stat-card:hover::before { transform: scale(1.6); opacity: 0.2; }
  .fd-stat-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .fd-stat-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
  .fd-stat-value {
    font-family: 'Sora', sans-serif; font-size: 1.5rem; font-weight: 800; color: #1E293B; line-height: 1; margin-bottom: 4px;
  }
  .fd-stat-label { font-size: 0.75rem; color: #64748B; font-weight: 500; margin-bottom: 8px; }
  .fd-stat-change { font-size: 0.7rem; font-weight: 600; display: flex; align-items: center; gap: 4px; }
  .fd-stat-change.up { color: #10B981; }
  .fd-stat-change.down { color: #F87171; }

  .fd-lower-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .fd-panel {
    background: #fff; border: 1px solid rgba(30,41,59,0.07); border-radius: 18px; padding: 1.3rem;
    box-shadow: 0 4px 12px rgba(30,41,59,0.04); animation: fdSlideUp 0.5s ease both;
  }
  .fd-panel-title {
    font-family: 'Sora', sans-serif; font-size: 0.9rem; font-weight: 700; color: #1E293B;
    margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;
  }
  .fd-panel-title-bar { flex: 1; height: 1px; background: rgba(30,41,59,0.07); margin: 0 12px; }
  .fd-panel-title-label {
    color: #94A3B8; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; font-family: 'Inter', sans-serif;
  }

  .fd-schedule-table { width: 100%; border-collapse: collapse; }
  .fd-schedule-table th {
    text-align: left; padding: 10px 8px; font-size: 0.68rem; font-weight: 700; color: #94A3B8;
    text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid rgba(30,41,59,0.07);
    font-family: 'Inter', sans-serif;
  }
  .fd-schedule-table td { padding: 11px 8px; font-size: 0.8rem; color: #334155; border-bottom: 1px solid rgba(30,41,59,0.05); }
  .fd-schedule-table tr:hover td { background: rgba(37,99,235,0.03); }
  .fd-status-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: 0.68rem; font-weight: 600; }
  .fd-status-dot { width: 5px; height: 5px; border-radius: 50%; display: inline-block; }
  .fd-status-dot.live { animation: fdDotBlink 1.4s ease-in-out infinite; }
  .fd-room-badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border-radius: 8px; background: #F4F7FE;
    border: 1px solid rgba(30,41,59,0.07); font-size: 0.7rem; font-weight: 700; color: #64748B;
    font-family: 'Sora', sans-serif;
  }
  .fd-notif-item {
    display: flex; gap: 12px; padding: 10px 4px; border-bottom: 1px solid rgba(30,41,59,0.06);
    cursor: pointer; transition: background 0.15s ease; border-radius: 8px;
  }
  .fd-notif-item:last-child { border-bottom: none; }
  .fd-notif-item:hover { background: rgba(37,99,235,0.04); }
  .fd-notif-icon {
    width: 36px; height: 36px; border-radius: 10px; display: flex;
    align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0;
  }
  .fd-notif-body { flex: 1; min-width: 0; }
  .fd-notif-title { font-size: 0.78rem; font-weight: 600; color: #1E293B; }
  .fd-notif-text { font-size: 0.75rem; color: #64748B; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .fd-notif-time { font-size: 0.65rem; color: #94A3B8; flex-shrink: 0; align-self: center; }

  .fd-rooms-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
  .fd-room-card { padding: 12px; border-radius: 12px; transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: default; }
  .fd-room-card:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 6px 18px rgba(30,41,59,0.08); }
  .fd-room-card-top { display: flex; justify-content: space-between; align-items: flex-start; }
  .fd-room-name { font-size: 0.78rem; font-weight: 700; color: #1E293B; font-family: 'Sora', sans-serif; }
  .fd-room-status-label { font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
  .fd-room-type { font-size: 0.65rem; color: #94A3B8; margin-top: 2px; }
  .fd-room-student {
    font-size: 0.65rem; color: #64748B; margin-top: 5px; padding-top: 5px;
    border-top: 1px solid rgba(30,41,59,0.06); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .fd-instrument-item { margin-bottom: 10px; }
  .fd-instrument-item:last-child { margin-bottom: 0; }
  .fd-instrument-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
  .fd-instrument-label { font-size: 0.78rem; color: #64748B; }
  .fd-instrument-count { font-size: 0.72rem; color: #94A3B8; font-family: 'Sora', sans-serif; font-weight: 600; }
  .fd-instrument-bar { height: 5px; background: #F4F7FE; border-radius: 20px; overflow: hidden; }
  .fd-instrument-fill {
    height: 100%; border-radius: 20px;
    transition: width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    animation: fdScaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  .fd-nav-item { transition: all 0.15s ease; cursor: pointer; }
  .fd-nav-item:hover { background: rgba(37,99,235,0.06) !important; }

  .fd-sidebar-overlay {
    position: fixed; inset: 0; z-index: 200; background: rgba(15,23,42,0.4);
    opacity: 0; visibility: hidden; transition: opacity 0.3s ease, visibility 0.3s ease;
  }
  .fd-sidebar-overlay.open { opacity: 1; visibility: visible; }
  .fd-sidebar-panel {
    position: fixed; top: 0; left: 0; bottom: 0; width: 240px; z-index: 201;
    background: #fff; border-right: 1px solid rgba(30,41,59,0.07);
    transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow-y: auto; box-shadow: 4px 0 20px rgba(30,41,59,0.1);
  }
  .fd-sidebar-panel.open { transform: translateX(0); }

  @media (max-width: 1200px) {
    .fd-stats-grid { grid-template-columns: repeat(2, 1fr); }
    .fd-lower-grid { grid-template-columns: 1fr; }
    .fd-rooms-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 900px) {
    .fd-main { padding: 20px 5%; }
    .fd-badge span { display: none; }
    .fd-stats-grid { grid-template-columns: 1fr 1fr; }
    .fd-rooms-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 560px) {
    .fd-stats-grid { grid-template-columns: 1fr; }
  }
`

function Sidebar({ activePage, onNavigate, onLogout, isMobile, isOpen, onClose }) {
  const panel = (
    <div style={{
      width: '220px', minWidth: '220px',
      background: '#fff',
      borderRight: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column',
      height: '100vh', overflowY: 'auto', overflowX: 'hidden',
    }}>
      <div style={{ padding: '20px 18px 16px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '12px',
            background: `linear-gradient(135deg, ${C.royal}, ${C.purple})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', flexShrink: 0, color: '#fff',
          }}>♬</div>
          <div>
            <div style={{ fontFamily: C.display, fontSize: '15px', fontWeight: 700, color: C.navy, letterSpacing: '0.01em', lineHeight: 1.2 }}>Cadenza</div>
            <div style={{ fontSize: '10px', color: C.text3, letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: C.font }}>Music Center</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 14px' }}>
        <div style={{
          padding: '8px 12px', borderRadius: '10px',
          background: 'rgba(37,99,235,0.08)', border: `1px solid rgba(37,99,235,0.2)`,
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '12px', fontWeight: 500, color: C.royal, fontFamily: C.font,
        }}>
          <span style={{ fontSize: '14px' }}>🎯</span>
          <span>Front Desk</span>
          <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: C.green }} className="fd-badge-dot" />
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
                  className="fd-nav-item"
                  onClick={() => { onNavigate(item.id); onClose?.() }}
                  style={{
                    margin: '1px 8px', padding: '9px 10px', borderRadius: '10px',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    cursor: 'pointer', fontSize: '13px', fontFamily: C.font,
                    color: isActive ? C.royal : C.text2,
                    background: isActive ? 'rgba(37,99,235,0.08)' : 'transparent',
                    fontWeight: isActive ? 600 : 400,
                    position: 'relative',
                  }}
                >
                  {isActive && (
                    <div style={{
                      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                      width: '3px', height: '60%', borderRadius: '0 3px 3px 0',
                      background: `linear-gradient(180deg, ${C.royal}, ${C.purple})`,
                    }} />
                  )}
                  <span style={{ fontSize: '15px', width: '18px', textAlign: 'center' }}>{item.icon}</span>
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
          className="fd-nav-item"
          style={{
            width: '100%', padding: '9px 12px', borderRadius: '10px',
            border: `1px solid ${C.border2}`,
            background: 'transparent', color: C.coral,
            cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          <span>⏻</span> Log Out
        </button>
      </div>
    </div>
  )

  if (!isMobile) return panel
  return (
    <>
      {isOpen && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 99 }} />}
      <div style={{ position: 'fixed', top: 0, left: isOpen ? 0 : '-220px', height: '100vh', zIndex: 100, transition: 'left 0.25s ease' }}>
        {panel}
      </div>
    </>
  )
}

function DashboardContent({ onNavigate, isMobile, isTablet }) {
  const stats = [
    { color: 'royal', icon: '📨', label: 'New Inquiries', value: '4', change: '2 urgent', changeType: 'up', delay: 0.1 },
    { color: 'teal', icon: '🎓', label: 'Active Enrollments', value: '248', change: '12 new this week', changeType: 'up', delay: 0.15 },
    { color: 'gold', icon: '📅', label: "Today's Lessons", value: '34', change: '3 ongoing now', changeType: 'up', delay: 0.2 },
    { color: 'green', icon: '🎬', label: 'Studio Bookings', value: '7', change: 'Today', changeType: '', delay: 0.25 },
    { color: 'coral', icon: '💳', label: 'Unpaid Balances', value: '₱38k', change: '3 overdue accounts', changeType: 'down', delay: 0.3 },
    { color: 'pink', icon: '✅', label: 'Pending Tasks', value: '4', change: '2 high priority', changeType: 'down', delay: 0.35 },
  ]

  const statColorMap = {
    royal: { bg: 'rgba(37,99,235,0.08)', border: 'rgba(37,99,235,0.15)', glow: 'rgba(37,99,235,0.25)' },
    teal: { bg: 'rgba(20,184,166,0.08)', border: 'rgba(20,184,166,0.15)', glow: 'rgba(20,184,166,0.2)' },
    gold: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)', glow: 'rgba(245,158,11,0.2)' },
    coral: { bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.15)', glow: 'rgba(248,113,113,0.2)' },
    green: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)', glow: 'rgba(16,185,129,0.2)' },
    pink: { bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.15)', glow: 'rgba(236,72,153,0.2)' },
  }

  const inquiries = [
    { name: 'Maria Santos', interest: 'Guitar Beginner', phone: '0917-123-4567', time: '10 min ago', priority: 'high' },
    { name: 'John Reyes', interest: 'Piano Intermediate', phone: '0928-234-5678', time: '25 min ago', priority: 'medium' },
    { name: 'Ana Cruz', interest: 'Voice Lessons', phone: '0935-345-6789', time: '1 hour ago', priority: 'high' },
    { name: 'Carlos Tan', interest: 'Drums Beginner', phone: '0912-456-7890', time: '2 hours ago', priority: 'low' },
  ]

  const priorityColors = {
    high: { bg: 'rgba(248,113,113,0.1)', c: C.coral, label: 'Urgent' },
    medium: { bg: 'rgba(245,158,11,0.1)', c: C.gold, label: 'Follow-up' },
    low: { bg: 'rgba(16,185,129,0.1)', c: C.green, label: 'New' },
  }

  const scheduleData = [
    { time: '09:00', student: 'Ana Reyes', instructor: 'Mr. Cruz', room: 'A', status: 'ongoing', statusLabel: 'Live' },
    { time: '10:00', student: 'Marco Santos', instructor: 'Ms. Lim', room: 'B', status: 'upcoming', statusLabel: 'Up Next' },
    { time: '11:00', student: 'Pia Gomez', instructor: 'Mr. Cruz', room: 'A', status: 'upcoming', statusLabel: 'Up Next' },
    { time: '13:00', student: 'Luis Tan', instructor: 'Ms. Reyes', room: 'C', status: 'pending', statusLabel: 'Pending' },
    { time: '14:00', student: 'Sofia Del', instructor: 'Mr. Bautista', room: 'B', status: 'upcoming', statusLabel: 'Up Next' },
  ]

  const scheduleStatusColors = {
    ongoing: { bg: 'rgba(16,185,129,0.1)', c: C.green, dot: C.green },
    upcoming: { bg: 'rgba(37,99,235,0.1)', c: C.royal, dot: C.royal },
    pending: { bg: 'rgba(245,158,11,0.1)', c: C.gold, dot: C.gold },
  }

  const rooms = [
    { name: 'Studio A', type: 'Piano / Vocals', status: 'occupied', student: 'Ana Reyes' },
    { name: 'Studio B', type: 'Guitar / Bass', status: 'available' },
    { name: 'Studio C', type: 'Drums', status: 'booked', student: 'Luis Tan – 1PM' },
    { name: 'Studio D', type: 'Strings', status: 'available' },
    { name: 'Studio E', type: 'General', status: 'available' },
    { name: 'Studio F', type: 'Recording', status: 'occupied', student: 'Band session' },
  ]

  const roomStatusColors = {
    occupied: { bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', c: C.coral, label: 'Live' },
    booked: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', c: C.gold, label: 'Booked' },
    available: { bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.15)', c: C.green, label: 'Free' },
  }

  const instruments = [
    { name: 'Guitar', total: 26, available: 8, color: C.royal },
    { name: 'Piano', total: 18, available: 8, color: C.teal },
    { name: 'Drums', total: 12, available: 3, color: C.coral },
    { name: 'Violin', total: 8, available: 4, color: C.gold },
    { name: 'Ukulele', total: 12, available: 7, color: C.green },
  ]

  const tasks = [
    { task: 'Follow up with Maria Santos - Guitar inquiry', priority: 'high', time: 'Due today' },
    { task: 'Process payment for Luis Tan - March package', priority: 'medium', time: 'Due today' },
    { task: 'Confirm studio booking for Band session', priority: 'high', time: '2 hours ago' },
    { task: 'Update student records for new enrollments', priority: 'low', time: 'Tomorrow' },
  ]

  const updates = [
    { icon: '⚠️', color: C.coral, title: 'Schedule Change', body: 'Mr. Cruz rescheduled to 2PM - Room A', time: 'Just now' },
    { icon: '💳', color: C.gold, title: 'Unpaid Balance', body: 'Marco Santos - ₱2,500 overdue (7 days)', time: '1 hour ago' },
    { icon: '🎓', color: C.royal, title: 'New Enrollment', body: 'Ana Reyes enrolled in Guitar Beginner', time: '2 hours ago' },
    { icon: '📅', color: C.teal, title: 'Studio Booking', body: 'Room B reserved for Band session - 3PM', time: '3 hours ago' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '24px', animation: 'fdFadeUp 0.45s ease both' }}>
        <h1 className="fd-title">Front Desk Dashboard</h1>
        <p className="fd-subtitle">
          Daily operations overview — <span className="fd-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </p>
      </div>

      <div className="fd-stats-grid">
        {stats.map((s, i) => {
          const sc = statColorMap[s.color]
          return (
            <div key={i} className="fd-stat-card" style={{ animationDelay: `${s.delay}s` }}>
              <div style={{
                position: 'absolute', top: '-20px', right: '-20px',
                width: '80px', height: '80px', borderRadius: '50%',
                background: sc.glow, filter: 'blur(20px)', pointerEvents: 'none',
              }} />
              <div className="fd-stat-card-top">
                <div className="fd-stat-icon" style={{ background: sc.bg, border: `1px solid ${sc.border}` }}>{s.icon}</div>
                {s.changeType === 'up' && <span className="fd-stat-change up">↑ {s.change}</span>}
                {s.changeType === 'down' && <span className="fd-stat-change down">↓ {s.change}</span>}
                {s.changeType === '' && <span className="fd-stat-change" style={{ color: C.text3 }}>{s.change}</span>}
              </div>
              <div className="fd-stat-value">{s.value}</div>
              <div className="fd-stat-label">{s.label}</div>
            </div>
          )
        })}
      </div>

      <div className="fd-lower-grid">
        <div className="fd-panel" style={{ animationDelay: '0.3s' }}>
          <div className="fd-panel-title">
            New Student Inquiries
            <span className="fd-panel-title-bar" />
            <span className="fd-panel-title-label">4 new</span>
          </div>
          {inquiries.map((inq, i) => {
            const pc = priorityColors[inq.priority]
            return (
              <div key={i} className="fd-notif-item">
                <div className="fd-notif-icon" style={{ background: pc.bg, border: `1px solid ${pc.c}30` }}>🎓</div>
                <div className="fd-notif-body">
                  <div className="fd-notif-title">{inq.name}</div>
                  <div className="fd-notif-text">{inq.interest} — {inq.phone}</div>
                </div>
                <div className="fd-notif-time">{inq.time}</div>
              </div>
            )
          })}
        </div>

        <div className="fd-panel" style={{ animationDelay: '0.4s' }}>
          <div className="fd-panel-title">
            Today's Schedule
            <span className="fd-panel-title-bar" />
            <span className="fd-panel-title-label">{scheduleData.length} Lessons</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="fd-schedule-table">
              <thead>
                <tr>
                  {['Time', 'Student', 'Instructor', 'Room', 'Status'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scheduleData.map((r, i) => {
                  const s = scheduleStatusColors[r.status]
                  return (
                    <tr key={i}>
                      <td style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: '0.78rem', color: r.status === 'ongoing' ? C.green : C.navy }}>{r.time}</td>
                      <td style={{ fontWeight: 500 }}>{r.student}</td>
                      <td style={{ color: C.text2 }}>{r.instructor}</td>
                      <td><span className="fd-room-badge">{r.room}</span></td>
                      <td>
                        <span className="fd-status-badge" style={{ background: s.bg, color: s.c }}>
                          <span className={`fd-status-dot${r.status === 'ongoing' ? ' live' : ''}`} style={{ background: s.dot }} />
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
      </div>

      <div className="fd-lower-grid">
        <div className="fd-panel" style={{ animationDelay: '0.5s' }}>
          <div className="fd-panel-title">Studio Room Availability</div>
          <div className="fd-rooms-grid">
            {rooms.map((r, i) => {
              const s = roomStatusColors[r.status]
              return (
                <div key={i} className="fd-room-card" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                  <div className="fd-room-card-top">
                    <div className="fd-room-name">{r.name}</div>
                    <span className="fd-room-status-label" style={{ color: s.c }}>{s.label}</span>
                  </div>
                  <div className="fd-room-type">{r.type}</div>
                  {r.student && <div className="fd-room-student">{r.student}</div>}
                </div>
              )
            })}
          </div>
        </div>

        <div className="fd-panel" style={{ animationDelay: '0.6s' }}>
          <div className="fd-panel-title">Instrument Availability</div>
          {instruments.map((item, i) => (
            <div key={i} className="fd-instrument-item">
              <div className="fd-instrument-header">
                <span className="fd-instrument-label">{item.name}</span>
                <span className="fd-instrument-count">{item.available}/{item.total} available</span>
              </div>
              <div className="fd-instrument-bar">
                <div className="fd-instrument-fill" style={{
                  width: `${(item.available / item.total) * 100}%`,
                  background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`,
                  animationDelay: `${i * 0.1 + 0.4}s`,
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fd-lower-grid">
        <div className="fd-panel" style={{ animationDelay: '0.7s' }}>
          <div className="fd-panel-title">
            Pending Tasks
            <span className="fd-panel-title-bar" />
            <span className="fd-panel-title-label">4 tasks</span>
          </div>
          {tasks.map((t, i) => {
            const pc = priorityColors[t.priority]
            return (
              <div key={i} className="fd-notif-item">
                <div style={{
                  width: '20px', height: '20px', borderRadius: '6px',
                  border: `1.5px solid ${C.border2}`, background: '#fff', flexShrink: 0, marginTop: 2,
                  transition: 'all 0.15s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.royal; e.currentTarget.style.background = 'rgba(37,99,235,0.06)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border2; e.currentTarget.style.background = '#fff' }}
                />
                <div className="fd-notif-body">
                  <div className="fd-notif-text" style={{ color: C.text, whiteSpace: 'normal' }}>{t.task}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 4 }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: pc.c, background: pc.bg, padding: '2px 8px', borderRadius: '12px' }}>{pc.label}</span>
                    <span style={{ fontSize: '0.65rem', color: C.text3 }}>{t.time}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="fd-panel" style={{ animationDelay: '0.8s' }}>
          <div className="fd-panel-title">
            Important Updates
            <span className="fd-panel-title-bar" />
            <span className="fd-panel-title-label">Today</span>
          </div>
          {updates.map((u, i) => (
            <div key={i} className="fd-notif-item">
              <div className="fd-notif-icon" style={{ background: `${u.color}15`, border: `1px solid ${u.color}25` }}>{u.icon}</div>
              <div className="fd-notif-body">
                <div className="fd-notif-title">{u.title}</div>
                <div className="fd-notif-text">{u.body}</div>
              </div>
              <div className="fd-notif-time">{u.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function FrontDeskDashboard() {
  const [activePage, setActivePage] = useState(() => {
    try { return localStorage.getItem('frontdeskActivePage') || 'dashboard' } catch { return 'dashboard' }
  })
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const isMobile = viewportWidth < 900
  const isTablet = viewportWidth < 1200
  const pageLabel = PAGE_LABELS[activePage] || activePage

  useEffect(() => {
    try { localStorage.setItem('frontdeskActivePage', activePage) } catch { /* ignore */ }
  }, [activePage])

  useEffect(() => {
    const handleResize = () => { setViewportWidth(window.innerWidth); if (window.innerWidth >= 900) setIsSidebarOpen(false) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('cadenza_user')
    window.location.href = '/'
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardContent onNavigate={setActivePage} isMobile={isMobile} isTablet={isTablet} />
      case 'instructor-availability': return <InstructorAvailability isMobile={isMobile} isTablet={isTablet} />
      case 'student-approval': return <StudentApproval isMobile={isMobile} isTablet={isTablet} />
      case 'reschedule-approval': return <RescheduleApproval isMobile={isMobile} isTablet={isTablet} />
      case 'studio-booking-approval': return <StudioBookingApproval isMobile={isMobile} isTablet={isTablet} />
      case 'instrument-rental-approval': return <InstrumentRentalApproval isMobile={isMobile} isTablet={isTablet} />
      case 'schedule': return <FrontDeskSchedule isMobile={isMobile} isTablet={isTablet} />
      case 'billing': return <FrontDeskBilling isMobile={isMobile} isTablet={isTablet} />
      case 'payment': return <FrontDeskPayment isMobile={isMobile} isTablet={isTablet} />
      case 'instrument-usage': return <InstrumentUsage isMobile={isMobile} isTablet={isTablet} />
      case 'notifications': return <Notifications isMobile={isMobile} isTablet={isTablet} />
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
      <style>{FD_STYLES}</style>
      <div className="fd-dashboard">
        {/* Mobile sidebar */}
        {isMobile && (
          <>
            <div className={`fd-sidebar-overlay${isSidebarOpen ? ' open' : ''}`} onClick={() => setIsSidebarOpen(false)} />
            <div className={`fd-sidebar-panel${isSidebarOpen ? ' open' : ''}`}>
              <Sidebar activePage={activePage} onNavigate={(id) => { setActivePage(id); setIsSidebarOpen(false) }} onLogout={handleLogout} />
            </div>
          </>
        )}

        {/* Header */}
        <header className="fd-header">
          <div className="fd-header-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {isMobile && (
                <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: C.navy, padding: 4 }}>
                  ☰
                </button>
              )}
              <div className="fd-logo">
                <div className="fd-logo-mark">
                  <svg viewBox="0 0 24 24"><path d="M9 18V5l10-2v13" strokeLinecap="round" strokeLinejoin="round" /><circle cx="6" cy="18" r="3" /><circle cx="16" cy="16" r="3" /></svg>
                </div>
                <div className="fd-logo-text">CADENZA<span>MUSIC CENTER</span></div>
              </div>
            </div>
            <div className="fd-header-right">
              <div className="fd-badge">
                <span className="fd-badge-dot" />
                <span>Front Desk</span>
              </div>
              <button className="fd-logout-btn" onClick={handleLogout}>Sign Out</button>
            </div>
          </div>
        </header>

        <div style={{ display: 'flex', maxWidth: 1400, margin: '0 auto' }}>
          {/* Desktop sidebar */}
          {!isMobile && (
            <div style={{ width: 220, minWidth: 220, background: '#fff', borderRight: `1px solid ${C.border}`, minHeight: 'calc(100vh - 68px)' }}>
              <Sidebar activePage={activePage} onNavigate={setActivePage} onLogout={handleLogout} />
            </div>
          )}

          {/* Main content */}
          <main className="fd-main" style={{ flex: 1, padding: '28px 6%' }}>
            {renderPage()}
          </main>
        </div>
      </div>
    </>
  )
}