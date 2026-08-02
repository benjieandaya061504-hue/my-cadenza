import { useState } from 'react'
import C from '../admin/theme.js'

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

  const typeColors = {
    enrollment: { icon: '🎓', color: C.royal, label: 'Enrollment' },
    payment: { icon: '💳', color: C.gold, label: 'Payment' },
    booking: { icon: '📅', color: C.teal, label: 'Booking' },
    rental: { icon: '🎸', color: C.pink, label: 'Rental' },
    schedule: { icon: '🔄', color: C.coral, label: 'Schedule' },
    announcement: { icon: '📢', color: C.green, label: 'Announcement' },
  }

  const filteredNotifications = filter === 'all' ? notifications
    : filter === 'unread' ? notifications.filter(n => !n.read)
    : filter === 'urgent' ? notifications.filter(n => n.urgent)
    : notifications.filter(n => n.type === filter)

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
    <div style={{ fontFamily: C.font }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: C.display, fontSize: '1.3rem', fontWeight: 700, color: C.navy, margin: '0 0 4px' }}>Notifications</h2>
        <p style={{ fontSize: '0.8rem', color: C.text3, margin: 0 }}>Real-time notifications for enrollments, payments, bookings, and updates</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'unread', 'urgent', 'enrollment', 'payment', 'booking', 'rental', 'schedule', 'announcement'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 16px', borderRadius: 20, border: `1px solid ${filter === f ? C.royal : C.border2}`,
            background: filter === f ? 'rgba(37,99,235,0.08)' : '#fff',
            color: filter === f ? C.royal : C.text2,
            cursor: 'pointer', fontSize: '0.78rem', fontFamily: C.font, fontWeight: 500, textTransform: 'capitalize',
            transition: 'all 0.15s ease',
          }}>
            {f} ({f === 'all' ? notifications.length : f === 'unread' ? notifications.filter(n => !n.read).length : f === 'urgent' ? notifications.filter(n => n.urgent).length : notifications.filter(n => n.type === f).length})
          </button>
        ))}
        <button onClick={handleMarkAllRead} style={{
          marginLeft: 'auto', padding: '8px 16px', borderRadius: 10,
          border: `1px solid ${C.border2}`, background: '#fff',
          color: C.text2, cursor: 'pointer', fontSize: '0.78rem', fontFamily: C.font, fontWeight: 500,
        }}>Mark All as Read</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredNotifications.map(notification => {
          const tc = typeColors[notification.type]
          return (
            <div key={notification.id} style={{
              background: notification.read ? '#fff' : 'rgba(37,99,235,0.04)',
              border: `1px solid ${notification.read ? C.border : 'rgba(37,99,235,0.2)'}`,
              borderRadius: 16, padding: 16,
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(30,41,59,0.06)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${tc.color}15`, border: `1px solid ${tc.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                }}>{tc.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: C.navy, fontFamily: C.font }}>{notification.title}</span>
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, color: tc.color, background: `${tc.color}15`, padding: '2px 8px', borderRadius: 12, fontFamily: C.font, letterSpacing: '.05em' }}>{tc.label}</span>
                    {notification.urgent && <span style={{ fontSize: '0.6rem', fontWeight: 700, color: C.coral, background: 'rgba(248,113,113,0.1)', padding: '2px 8px', borderRadius: 12, fontFamily: C.font, letterSpacing: '.05em' }}>URGENT</span>}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: C.text2, fontFamily: C.font, marginBottom: 6 }}>{notification.message}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '0.65rem', color: C.text3, fontFamily: C.font }}>{notification.time}</span>
                    {!notification.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.royal, display: 'inline-block' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {!notification.read && (
                    <button onClick={() => handleMarkRead(notification.id)} style={{ padding: '4px 10px', borderRadius: 8, border: `1px solid ${C.border2}`, background: '#fff', color: C.text2, cursor: 'pointer', fontSize: '0.7rem', fontFamily: C.font, fontWeight: 500, transition: 'all 0.15s ease' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = C.royal; e.currentTarget.style.color = C.royal }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border2; e.currentTarget.style.color = C.text2 }}
                    >Mark Read</button>
                  )}
                  <button onClick={() => handleDismiss(notification.id)} style={{ padding: '4px 10px', borderRadius: 8, border: `1px solid rgba(248,113,113,0.3)`, background: 'rgba(248,113,113,0.06)', color: C.coral, cursor: 'pointer', fontSize: '0.7rem', fontFamily: C.font, fontWeight: 500 }}>Dismiss</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}