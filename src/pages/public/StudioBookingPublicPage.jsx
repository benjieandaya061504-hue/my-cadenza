import { useMemo, useState } from 'react'
import PublicSectionNav from './PublicSectionNav'
import { usePublicSite } from './PublicSiteContext'

const ROOM_RATES = { A: 300, B: 300, C: 500 }

function formatTime12(h, m) {
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export default function StudioBookingPublicPage() {
  const { openSignupGate, openSuccessModal, showToast } = usePublicSite()
  const [date, setDate] = useState('2026-03-14')
  const [room, setRoom] = useState('A')
  const [startTime, setStartTime] = useState('09:00')
  const [duration, setDuration] = useState('1')
  const [purpose, setPurpose] = useState('Personal Practice')
  const [payment, setPayment] = useState('Cash (Pay at counter)')
  const [showGcash, setShowGcash] = useState(false)
  const [bkForm, setBkForm] = useState({
    name: '',
    contact: '',
    email: '',
    gcashNum: '',
    gcashRef: '',
  })

  const summary = useMemo(() => {
    const [hh, mm] = startTime.split(':').map(Number)
    const dur = parseInt(duration, 10) || 1
    const rate = ROOM_RATES[room] || 300
    const endH = hh + dur
    const total = rate * dur
    const roomLabel =
      room === 'A' ? 'Studio A' : room === 'B' ? 'Studio B' : 'Studio C — Large'
    const d = new Date(date)
    const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    return {
      roomLabel,
      dateStr,
      startStr: formatTime12(hh, mm),
      endStr: formatTime12(endH > 23 ? 23 : endH, mm),
      dur,
      rate,
      total,
    }
  }, [date, room, startTime, duration])

  const onPaymentChange = (v) => {
    setPayment(v)
    setShowGcash(v === 'GCash')
  }

  const submitBooking = () => {
    if (!bkForm.name.trim() || !bkForm.contact.trim()) {
      showToast('Please enter your name and contact number.')
      return
    }
    openSignupGate({
      icon: '🎵',
      title: 'Studio Booking',
      subtitle: 'Sign up to submit your studio booking request.',
      onContinue: () => {
        openSuccessModal({
          title: 'Booking Request Submitted!',
          message: 'Your request has been received. Our team will review availability and contact you.',
        })
      },
    })
  }

  return (
    <div id="pub-booking" className="pub-section">
      <PublicSectionNav label="Studio Booking" />
      <div className="pub-page-header">
        <h2>Studio Room Booking</h2>
        <p>Check real-time availability and reserve your preferred studio room and time slot. — REQ172–REQ175</p>
      </div>
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <div className="section-heading">
            Select Date, Room & Time <span className="sh-line" />
          </div>
          <div className="form-row cols2">
            <div>
              <label htmlFor="bk-date">Preferred Date</label>
              <input id="bk-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label htmlFor="bk-room">Studio Room</label>
              <select id="bk-room" value={room} onChange={(e) => setRoom(e.target.value)}>
                <option value="A">Studio A (₱300/hr)</option>
                <option value="B">Studio B (₱300/hr)</option>
                <option value="C">Studio C — Large (₱500/hr)</option>
              </select>
            </div>
          </div>
          <div className="form-row cols2">
            <div>
              <label htmlFor="bk-start-time">Start Time</label>
              <input
                id="bk-start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                Studio hours: 8:00 AM – 8:00 PM
              </div>
            </div>
            <div>
              <label htmlFor="bk-duration">Duration (hours)</label>
              <select id="bk-duration" value={duration} onChange={(e) => setDuration(e.target.value)}>
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="3">3 hours</option>
                <option value="4">4 hours</option>
                <option value="5">5 hours</option>
              </select>
            </div>
          </div>

          <div
            id="bk-unavail-notice"
            style={{ display: 'none', background: 'rgba(192,57,43,.08)', border: '1px solid rgba(192,57,43,.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 14 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }} aria-hidden>
                🚫
              </span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--coral)', marginBottom: 4 }}>
                  Time Slot Unavailable
                </div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
                  The selected date and time is not available. Please choose a different date or time.
                </div>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div>
              <label htmlFor="bk-purpose">Purpose of Booking</label>
              <select id="bk-purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                <option>Personal Practice</option>
                <option>Group Rehearsal</option>
                <option>Recording Session</option>
                <option>Band Practice</option>
              </select>
            </div>
          </div>

          <div
            id="bk-summary"
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: 14,
            }}
            className="mb16"
          >
            <div className="flex-between mb12">
              <span className="text-muted text-sm">
                {summary.roomLabel} — {summary.dateStr}
              </span>
              <span className="badge badge-teal">Available</span>
            </div>
            <div className="flex-between mb12">
              <span className="text-muted text-sm">Start Time</span>
              <span className="text-sm">{summary.startStr}</span>
            </div>
            <div className="flex-between mb12">
              <span className="text-muted text-sm">End Time</span>
              <span className="text-sm">{summary.endStr}</span>
            </div>
            <div className="flex-between mb12">
              <span className="text-muted text-sm">Duration</span>
              <span className="text-sm">
                {summary.dur} hour{summary.dur > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex-between mb12">
              <span className="text-muted text-sm">Rate</span>
              <span className="mono text-sm">₱{summary.rate} / hour</span>
            </div>
            <div className="divider" />
            <div className="flex-between">
              <span style={{ fontWeight: 600 }}>Total</span>
              <span className="mono text-accent" style={{ fontSize: 16 }}>
                ₱{summary.total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="divider" />
          <div className="section-heading mt12">
            Your Contact Details <span className="sh-line" />
          </div>
          <div className="form-row cols2">
            <div>
              <label>Full Name</label>
              <input
                value={bkForm.name}
                onChange={(e) => setBkForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label>Contact Number</label>
              <input
                value={bkForm.contact}
                onChange={(e) => setBkForm((f) => ({ ...f, contact: e.target.value }))}
                placeholder="+63 9XX XXX XXXX"
              />
            </div>
          </div>
          <div className="form-row cols2">
            <div>
              <label>Email Address</label>
              <input
                type="email"
                value={bkForm.email}
                onChange={(e) => setBkForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label htmlFor="bk-payment">Payment Method</label>
              <select id="bk-payment" value={payment} onChange={(e) => onPaymentChange(e.target.value)}>
                <option>Cash (Pay at counter)</option>
                <option>GCash</option>
                <option>Cheque</option>
              </select>
            </div>
          </div>
          {showGcash ? (
            <div className="form-row cols2">
              <div>
                <label>GCash Number</label>
                <input
                  value={bkForm.gcashNum}
                  onChange={(e) => setBkForm((f) => ({ ...f, gcashNum: e.target.value }))}
                  placeholder="+63 9XX XXX XXXX"
                />
              </div>
              <div>
                <label>Reference #</label>
                <input
                  value={bkForm.gcashRef}
                  onChange={(e) => setBkForm((f) => ({ ...f, gcashRef: e.target.value }))}
                  placeholder="13-digit reference"
                />
              </div>
            </div>
          ) : null}
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            onClick={submitBooking}
          >
            Submit Booking Request →
          </button>
        </div>

        <div>
          <div className="card mb16">
            <div className="section-heading">
              March 2026 Availability <span className="sh-line" />
            </div>
            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="cal-header">
                  {d}
                </div>
              ))}
              {[23, 24, 25, 26, 27, 28].map((n) => (
                <div key={`pre-${n}`} className="cal-day other">
                  <div className="cal-num">{n}</div>
                </div>
              ))}
              {[
                { d: 1, a: 'teal', b: 'blue' },
                { d: 2, a: 'teal', b: 'teal' },
                { d: 3, a: 'blue', b: 'teal' },
                { d: 4, a: 'teal', b: 'teal' },
                { d: 5, a: 'blue', b: 'blue' },
                { d: 6, a: 'teal', b: 'teal' },
                { d: 7, a: 'blue', b: 'teal' },
                { d: 8, a: 'teal', b: 'blue' },
                { d: 9, a: 'teal', b: 'teal' },
                { d: 10, a: 'blue', b: 'teal' },
                { d: 11, a: 'blue', b: 'blue', today: true },
                { d: 12, a: 'teal', b: 'teal' },
                { d: 13, a: 'teal', b: 'blue' },
                { d: 14, a: 'teal', b: 'teal' },
                { d: 15, a: 'teal', b: 'teal' },
              ].map((cell) => (
                <div key={cell.d} className={`cal-day${cell.today ? ' today' : ''}`}>
                  <div className={`cal-num${cell.today ? ' today' : ''}`}>{cell.d}</div>
                  <div className={`cal-event ${cell.a}`}>A</div>
                  <div className={`cal-event ${cell.b}`}>B</div>
                </div>
              ))}
            </div>
            <div className="avail-legend">
              <span className="avail-dot free">Available</span>
              <span className="avail-dot booked">Booked</span>
            </div>
          </div>
          <div className="card">
            <div className="section-heading">
              Studio Information <span className="sh-line" />
            </div>
            <table>
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Capacity</th>
                  <th>Rate</th>
                  <th>Features</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Studio A</strong>
                  </td>
                  <td>1–2 pax</td>
                  <td className="mono">₱300/hr</td>
                  <td className="text-dim text-sm">Piano, mirrors, AC</td>
                </tr>
                <tr>
                  <td>
                    <strong>Studio B</strong>
                  </td>
                  <td>1–2 pax</td>
                  <td className="mono">₱300/hr</td>
                  <td className="text-dim text-sm">Guitar amp, AC</td>
                </tr>
                <tr>
                  <td>
                    <strong>Studio C</strong>
                  </td>
                  <td>up to 6</td>
                  <td className="mono">₱500/hr</td>
                  <td className="text-dim text-sm">Full band setup, recording</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
