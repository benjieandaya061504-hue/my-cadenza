import { useState } from 'react'

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
  mono: '"Space Mono", monospace',
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(124,106,247,0.3); border-radius: 4px; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  .card { animation: fadeUp 0.4s ease both; transition: all 0.2s ease; }
  .card:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,0.35); }
  .btn { transition: all 0.15s ease; }
  .btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
  .row { transition: background 0.15s ease; }
  .row:hover { background: rgba(255,255,255,0.03); }
  .urgent-dot { animation: pulse 1.5s ease-in-out infinite; }
`

function NotificationItem({ notification, onMarkRead, onDismiss }) {
  const typeColors = {
    enrollment: { icon: '🎓', color: C.accent, label: 'Enrollment' },
    payment: { icon: '💳', color: C.gold, label: 'Payment' },
    booking: { icon: '📅', color: C.teal, label: 'Booking' },
    rental: { icon: '🎸', color: C.pink, label: 'Rental' },
    schedule: { icon: '🔄', color: C.coral, label: 'Schedule' },
    announcement: { icon: '📢', color: C.green, label: 'Announcement' },
  }
  const tc = typeColors[notification.type]

  return (
    <div className="card row" style={{ background: notification.read ? C.bg3 : `rgba(124,106,247,0.08)`, border: `1px solid ${notification.read ? C.border : 'rgba(124,106,247,0.3)'}`, borderRadius: '16px', padding: '16px' }}>
      <div style={{ display: 'flex', gap: '14px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${tc.color}18`, border: `1px solid ${tc.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
          {tc.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: C.text, fontFamily: C.font }}>{notification.title}</span>
            <span style={{ fontSize: '9px', fontWeight: 700, color: tc.color, background: `${tc.color}18`, padding: '2px 8px', borderRadius: '12px', fontFamily: C.font, letterSpacing: '.05em' }}>{tc.label}</span>
            {notification.urgent && <span style={{ fontSize: '9px', fontWeight: 700, color: C.coral, background: 'rgba(248,113,113,0.12)', padding: '2px 8px', borderRadius: '12px', fontFamily: C.font, letterSpacing: '.05em' }}>URGENT</span>}
          </div>
          <div style={{ fontSize: '12px', color: C.text2, fontFamily: C.font, marginBottom: '6px' }}>{notification.message}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '10px', color: C.text3, fontFamily: C.font }}>{notification.time}</span>
            {!notification.read && <span className="urgent-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.accent }} />}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {!notification.read && (
            <button onClick={() => onMarkRead(notification.id)} className="btn" style={{ padding: '4px 10px', borderRadius: '8px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '11px', fontFamily: C.font, fontWeight: 500 }}>
              Mark Read
            </button>
          )}
          <button onClick={() => onDismiss(notification.id)} className="btn" style={{ padding: '4px 10px', borderRadius: '8px', border: `1px solid rgba(248,113,113,0.3)`, background: 'rgba(248,113,113,0.1)', color: C.coral, cursor: 'pointer', fontSize: '11px', fontFamily: C.font, fontWeight: 500 }}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Notifications({ isMobile, isTablet }) {
  const [filter, setFilter] = useState('all')
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'enrollment', title: 'New Student Enrollment', message: 'Maria Santos has enrolled in Guitar Beginner course', time: '10 min ago', read: false, urgent: false },
    { id: 2, type: 'payment', title: 'Overdue Payment Alert', message: 'Carlos Tan has an overdue payment of ₱800 (7 days overdue)', time: '25 min ago', read: false, urgent: true },
    { id: 3, type: 'booking', title: 'Studio Booking Confirmation', message: 'Room F has been booked for Band session on March 15', time: '1 hour ago', read: false, urgent: false },
    { id: 4, type: 'rental', title: 'Instrument Rental Update', message: 'Ana Cruz has returned Yamaha SV-200 Silent Violin', time: '2 hours ago', read: true, urgent: false },
    { id: 5, type: 'schedule', title: 'Schedule Change Request', message: 'Mr. Cruz requested to reschedule lesson to 2PM', time: '3 hours ago', read: false, urgent: true },
    { id: 6, type: 'announcement', title: 'Studio Maintenance Notice', message: 'Studio C will be under maintenance on March 20', time: '5 hours ago', read: true, urgent: false },
    { id: 7, type: 'payment', title: 'Payment Received', message: 'John Reyes paid ₱6,000 via GCash', time: 'Yesterday', read: true, urgent: false },
    { id: 8, type: 'enrollment', title: 'New Student Enrollment', message: 'Pia Gomez has enrolled in Voice Lessons', time: 'Yesterday', read: true, urgent: false },
  ])

  const filteredNotifications = filter === 'all' ? notifications : filter === 'unread' ? notifications.filter(n => !n.read) : filter === 'urgent' ? notifications.filter(n => n.urgent) : notifications.filter(n => n.type === filter)

  const handleMarkRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const handleDismiss = (id) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  return (
    <>
      <style>{css}</style>
      <div style={{ fontFamily: C.font }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: C.display, fontSize: isMobile ? '24px' : '30px', fontWeight: 800, color: C.text, letterSpacing: '-0.02em', marginBottom: '8px' }}>Notifications</h1>
          <p style={{ color: C.text3, fontSize: '13px' }}>Real-time notifications for enrollments, payments, bookings, and updates</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['all', 'unread', 'urgent', 'enrollment', 'payment', 'booking', 'rental', 'schedule', 'announcement'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="btn"
              style={{
                padding: '8px 16px', borderRadius: '20px', border: `1px solid ${filter === f ? C.accent : C.border}`,
                background: filter === f ? 'rgba(124,106,247,0.15)' : C.bg3,
                color: filter === f ? C.accentL : C.text2,
                cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 500, textTransform: 'capitalize',
              }}
            >
              {f} ({f === 'all' ? notifications.length : f === 'unread' ? notifications.filter(n => !n.read).length : f === 'urgent' ? notifications.filter(n => n.urgent).length : notifications.filter(n => n.type === f).length})
            </button>
          ))}
          <button onClick={handleMarkAllRead} className="btn" style={{ marginLeft: 'auto', padding: '8px 16px', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 500 }}>
            Mark All as Read
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredNotifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkRead}
              onDismiss={handleDismiss}
            />
          ))}
        </div>
      </div>
    </>
  )
}

