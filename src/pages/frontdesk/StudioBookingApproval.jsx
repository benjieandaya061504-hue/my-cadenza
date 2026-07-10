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
  .card { animation: fadeUp 0.4s ease both; transition: all 0.2s ease; }
  .card:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,0.35); }
  .btn { transition: all 0.15s ease; }
  .btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
  .row { transition: background 0.15s ease; }
  .row:hover { background: rgba(255,255,255,0.03); }
`

function BookingCard({ booking, onApprove, onReject, onReschedule }) {
  const statusColors = {
    pending: { bg: 'rgba(251,191,36,0.12)', c: C.gold, label: 'Pending' },
    approved: { bg: 'rgba(52,211,153,0.12)', c: C.green, label: 'Approved' },
    rejected: { bg: 'rgba(248,113,113,0.12)', c: C.coral, label: 'Rejected' },
  }
  const sc = statusColors[booking.status]

  return (
    <div className="card row" style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: C.text, fontFamily: C.font }}>{booking.client}</div>
          <div style={{ fontSize: '12px', color: C.text2, fontFamily: C.font }}>{booking.purpose}</div>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 700, color: sc.c, background: sc.bg, padding: '4px 10px', borderRadius: '20px', fontFamily: C.font, letterSpacing: '.05em' }}>{sc.label}</span>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, marginBottom: '8px' }}>Booking Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Date:</span>
            <span style={{ fontSize: '12px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{booking.date}</span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Time:</span>
            <span style={{ fontSize: '12px', color: C.text, fontFamily: C.mono, marginLeft: '4px' }}>{booking.time}</span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Studio:</span>
            <span style={{ fontSize: '12px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{booking.studio}</span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Duration:</span>
            <span style={{ fontSize: '12px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{booking.duration}</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Requested: {booking.requested}</div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        {booking.status === 'pending' && (
          <>
            <button onClick={() => onApprove(booking.id)} className="btn" style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${C.green}, '#059669')`, color: '#fff', cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 600 }}>
              Approve
            </button>
            <button onClick={() => onReschedule(booking.id)} className="btn" style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 500 }}>
              Reschedule
            </button>
            <button onClick={() => onReject(booking.id)} className="btn" style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: `1px solid rgba(248,113,113,0.3)`, background: 'rgba(248,113,113,0.1)', color: C.coral, cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 500 }}>
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  )
}

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

  const cols = isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)'

  return (
    <>
      <style>{css}</style>
      <div style={{ fontFamily: C.font }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: C.display, fontSize: isMobile ? '24px' : '30px', fontWeight: 800, color: C.text, letterSpacing: '-0.02em', marginBottom: '8px' }}>Studio Booking Approval</h1>
          <p style={{ color: C.text3, fontSize: '13px' }}>Manage studio booking requests from clients</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['all', 'pending', 'approved', 'rejected'].map(f => (
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
              {f} ({f === 'all' ? bookings.length : bookings.filter(b => b.status === f).length})
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: cols, gap: '14px' }}>
          {filteredBookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onApprove={handleApprove}
              onReject={handleReject}
              onReschedule={handleReschedule}
            />
          ))}
        </div>

        {showRescheduleModal && selectedBooking && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: C.display, fontSize: '18px', fontWeight: 700, color: C.text }}>Reschedule Booking</h2>
                <button onClick={handleCloseRescheduleModal} style={{ background: 'none', border: 'none', color: C.text2, fontSize: '24px', cursor: 'pointer', padding: '4px' }}>×</button>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: '8px' }}>New Date</label>
                <input
                  type="text"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.font, fontSize: '13px', outline: 'none' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: '8px' }}>New Time</label>
                <input
                  type="text"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.mono, fontSize: '13px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleSaveReschedule} className="btn" style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: '#fff', cursor: 'pointer', fontSize: '13px', fontFamily: C.font, fontWeight: 600 }}>
                  Save Changes
                </button>
                <button onClick={handleCloseRescheduleModal} className="btn" style={{ flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '13px', fontFamily: C.font, fontWeight: 500 }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

