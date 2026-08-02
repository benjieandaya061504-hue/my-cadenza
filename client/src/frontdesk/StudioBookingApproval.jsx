import { useState } from 'react'
import C from '../admin/theme.js'

export default function StudioBookingApproval({ isMobile, isTablet }) {
  const [filter, setFilter] = useState('all')
  const [bookings, setBookings] = useState([
    { id: 1, client: 'Band Session - The Rockers', purpose: 'Band Practice', date: 'March 15, 2026', time: '3:00 PM - 5:00 PM', studio: 'Studio F (Recording)', duration: '2 hours', status: 'pending', requested: '1 hour ago' },
    { id: 2, client: 'Maria Santos', purpose: 'Solo Practice', date: 'March 16, 2026', time: '10:00 AM - 11:00 AM', studio: 'Studio A', duration: '1 hour', status: 'pending', requested: '3 hours ago' },
    { id: 3, client: 'John Reyes', purpose: 'Recording Session', date: 'March 17, 2026', time: '2:00 PM - 4:00 PM', studio: 'Studio F (Recording)', duration: '2 hours', status: 'approved', requested: 'Yesterday' },
    { id: 4, client: 'Pia Gomez', purpose: 'Vocal Practice', date: 'March 18, 2026', time: '11:00 AM - 12:00 PM', studio: 'Studio B', duration: '1 hour', status: 'pending', requested: 'Yesterday' },
  ])
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  const handleApprove = (id) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: 'approved' } : b))
  }

  const handleReject = (id) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: 'rejected' } : b))
  }

  const handleReschedule = (id) => {
    const booking = bookings.find(b => b.id === id)
    setSelectedBooking(booking)
    setNewDate(booking.date)
    setNewTime(booking.time)
    setShowRescheduleModal(true)
  }

  const handleSaveReschedule = () => {
    setBookings(bookings.map(b => b.id === selectedBooking.id ? { ...b, date: newDate, time: newTime } : b))
    setShowRescheduleModal(false)
    setSelectedBooking(null)
    setNewDate('')
    setNewTime('')
  }

  const handleCloseRescheduleModal = () => {
    setShowRescheduleModal(false)
    setSelectedBooking(null)
    setNewDate('')
    setNewTime('')
  }

  const statusColors = {
    pending: { bg: 'rgba(245,158,11,0.1)', c: C.gold, label: 'Pending' },
    approved: { bg: 'rgba(16,185,129,0.1)', c: C.green, label: 'Approved' },
    rejected: { bg: 'rgba(248,113,113,0.1)', c: C.coral, label: 'Rejected' },
  }

  const cols = isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)'

  return (
    <div style={{ fontFamily: C.font }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: C.display, fontSize: '1.3rem', fontWeight: 700, color: C.navy, margin: '0 0 4px' }}>Studio Booking Approval</h2>
        <p style={{ fontSize: '0.8rem', color: C.text3, margin: 0 }}>Manage studio booking requests from clients</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 16px', borderRadius: 20, border: `1px solid ${filter === f ? C.royal : C.border2}`,
            background: filter === f ? 'rgba(37,99,235,0.08)' : '#fff',
            color: filter === f ? C.royal : C.text2,
            cursor: 'pointer', fontSize: '0.78rem', fontFamily: C.font, fontWeight: 500, textTransform: 'capitalize',
            transition: 'all 0.15s ease',
          }}>
            {f} ({f === 'all' ? bookings.length : bookings.filter(b => b.status === f).length})
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 14 }}>
        {filteredBookings.map(booking => {
          const sc = statusColors[booking.status]
          return (
            <div key={booking.id} style={{
              background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`,
              padding: '1.2rem', boxShadow: '0 4px 12px rgba(30,41,59,0.04)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(30,41,59,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(30,41,59,0.04)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: C.navy, fontFamily: C.font }}>{booking.client}</div>
                  <div style={{ fontSize: '0.75rem', color: C.text2, fontFamily: C.font }}>{booking.purpose}</div>
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: sc.c, background: sc.bg, padding: '4px 10px', borderRadius: 20, fontFamily: C.font, letterSpacing: '.05em' }}>{sc.label}</span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, marginBottom: 8 }}>Booking Details</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                  <div><span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Date:</span><span style={{ fontSize: '0.75rem', color: C.text, fontFamily: C.font, marginLeft: 4 }}>{booking.date}</span></div>
                  <div><span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Time:</span><span style={{ fontSize: '0.75rem', color: C.text, fontFamily: C.font, marginLeft: 4 }}>{booking.time}</span></div>
                  <div><span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Studio:</span><span style={{ fontSize: '0.75rem', color: C.text, fontFamily: C.font, marginLeft: 4 }}>{booking.studio}</span></div>
                  <div><span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Duration:</span><span style={{ fontSize: '0.75rem', color: C.text, fontFamily: C.font, marginLeft: 4 }}>{booking.duration}</span></div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Requested: {booking.requested}</div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {booking.status === 'pending' && (
                  <>
                    <button onClick={() => handleApprove(booking.id)} style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${C.green}, #059669)`, color: '#fff', cursor: 'pointer', fontSize: '0.75rem', fontFamily: C.font, fontWeight: 600 }}>Approve</button>
                    <button onClick={() => handleReschedule(booking.id)} style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: `1px solid ${C.border2}`, background: '#fff', color: C.text2, cursor: 'pointer', fontSize: '0.75rem', fontFamily: C.font, fontWeight: 500 }}>Reschedule</button>
                    <button onClick={() => handleReject(booking.id)} style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: `1px solid rgba(248,113,113,0.3)`, background: 'rgba(248,113,113,0.08)', color: C.coral, cursor: 'pointer', fontSize: '0.75rem', fontFamily: C.font, fontWeight: 500 }}>Reject</button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showRescheduleModal && selectedBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, maxWidth: 400, width: '100%', boxShadow: '0 24px 64px rgba(15,23,42,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: C.display, fontSize: '1.1rem', fontWeight: 700, color: C.navy, margin: 0 }}>Reschedule Booking</h2>
              <button onClick={handleCloseRescheduleModal} style={{ background: 'none', border: 'none', color: C.text3, fontSize: '1.5rem', cursor: 'pointer', padding: '0 4px' }}>×</button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: 8 }}>New Date</label>
              <input type="text" value={newDate} onChange={e => setNewDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: C.mist, border: `1px solid ${C.border2}`, color: C.text, fontFamily: C.font, fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: 8 }}>New Time</label>
              <input type="text" value={newTime} onChange={e => setNewTime(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: C.mist, border: `1px solid ${C.border2}`, color: C.text, fontFamily: C.font, fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSaveReschedule} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${C.royal}, ${C.purple})`, color: '#fff', cursor: 'pointer', fontSize: '0.82rem', fontFamily: C.font, fontWeight: 600 }}>Save Changes</button>
              <button onClick={handleCloseRescheduleModal} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${C.border2}`, background: '#fff', color: C.text2, cursor: 'pointer', fontSize: '0.82rem', fontFamily: C.font, fontWeight: 500 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}