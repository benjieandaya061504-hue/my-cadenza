import { useMemo, useState } from 'react'

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

const AVAILABILITY = ['Active', 'Inactive']

const ROOM_TYPES = ['Piano / Vocals', 'Guitar / Bass', 'Drums', 'Strings', 'General', 'Recording']

const RENTAL_DURATIONS = ['30 minutes', '1 hour', '2 hours', '4 hours', 'Full day']

const SERVICE_CATEGORIES = ['Practice', 'Recording', 'Lesson', 'Rehearsal', 'Workshop']

const BOOKING_STATUSES = ['Pending', 'Confirmed', 'Cancelled', 'Completed']

const initialRooms = () => [
  { id: 'sr1', roomName: 'Studio A', roomType: 'Piano / Vocals', capacity: 2, availabilityStatus: 'Active', rentalRate: 450 },
  { id: 'sr2', roomName: 'Studio B', roomType: 'Guitar / Bass', capacity: 4, availabilityStatus: 'Active', rentalRate: 380 },
  { id: 'sr3', roomName: 'Studio C', roomType: 'Drums', capacity: 3, availabilityStatus: 'Inactive', rentalRate: 520 },
]

const initialPricingConfigs = () => [
  { id: 'pc1', roomId: 'sr1', rentalDuration: '1 hour', serviceCategory: 'Practice', rate: 450 },
  { id: 'pc2', roomId: 'sr3', rentalDuration: '2 hours', serviceCategory: 'Recording', rate: 1100 },
  { id: 'pc3', roomId: 'sr2', rentalDuration: '4 hours', serviceCategory: 'Rehearsal', rate: 1500 },
]

let nextRoomId = 4
let nextPricingId = 4

let nextBookingId = 5

const initialBookings = () => [
  { id: 'bk1', roomId: 'sr1', date: '2026-05-14', status: 'Confirmed', customerName: 'Ana Reyes' },
  { id: 'bk2', roomId: 'sr2', date: '2026-05-16', status: 'Pending', customerName: 'Marco Santos' },
  { id: 'bk3', roomId: 'sr3', date: '2026-05-18', status: 'Cancelled', customerName: 'Pia Gomez' },
  { id: 'bk4', roomId: 'sr1', date: '2026-05-20', status: 'Completed', customerName: 'Luis Tan' },
]

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
  @keyframes stFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .st-row { transition: background 0.15s ease; }
  .st-row:hover { background: rgba(255,255,255,0.03) !important; }
  .st-pill { transition: all 0.18s ease; }
  .st-pill:hover { background: rgba(124,106,247,0.18) !important; color: #a99cf9 !important; }
`

function inputStyle(focused) {
  return {
    width: '100%',
    background: C.bg4,
    border: `1px solid ${focused ? 'rgba(124,106,247,0.45)' : C.border}`,
    borderRadius: '10px',
    padding: '10px 12px',
    color: C.text,
    fontFamily: C.font,
    fontSize: '13px',
    outline: 'none',
    boxShadow: focused ? '0 0 0 3px rgba(124,106,247,0.12)' : 'none',
  }
}

function fl(text) {
  return (
    <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px', fontFamily: C.font }}>
      {text}
    </label>
  )
}

function RoomRecordModal({ mode, initial, onClose, onSave }) {
  const [roomName, setRoomName] = useState(initial?.roomName ?? '')
  const [roomType, setRoomType] = useState(initial?.roomType ?? ROOM_TYPES[0])
  const [capacity, setCapacity] = useState(initial?.capacity ?? 2)
  const [availabilityStatus, setAvailabilityStatus] = useState(initial?.availabilityStatus ?? 'Active')
  const [rentalRate, setRentalRate] = useState(initial?.rentalRate ?? 0)
  const [focus, setFocus] = useState(null)

  const submit = e => {
    e.preventDefault()
    if (!roomName.trim()) return
    if (mode === 'add') {
      onSave({
        id: `sr${nextRoomId++}`,
        roomName: roomName.trim(),
        roomType,
        capacity: Math.max(1, Number(capacity) || 1),
        availabilityStatus,
        rentalRate: Math.max(0, Number(rentalRate) || 0),
      })
    } else {
      onSave({
        ...initial,
        roomName: roomName.trim(),
        roomType,
        capacity: Math.max(1, Number(capacity) || 1),
        availabilityStatus,
        rentalRate: Math.max(0, Number(rentalRate) || 0),
      })
    }
    onClose()
  }

  return (
    <div role="presentation" onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'stFadeUp 0.25s ease both' }}>
      <div role="dialog" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto', background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: '16px', padding: '22px', boxShadow: '0 24px 48px rgba(0,0,0,0.45)' }}>
        <div style={{ fontFamily: C.display, fontSize: '18px', fontWeight: 700, color: C.text, marginBottom: '16px' }}>{mode === 'add' ? 'Create studio room record' : 'Update studio room record'}</div>
        <form onSubmit={submit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              {fl('Room name')}
              <input value={roomName} onChange={e => setRoomName(e.target.value)} required style={inputStyle(focus === 'n')} onFocus={() => setFocus('n')} onBlur={() => setFocus(null)} />
            </div>
            <div>
              {fl('Room type')}
              <select value={roomType} onChange={e => setRoomType(e.target.value)} style={{ ...inputStyle(focus === 't'), cursor: 'pointer' }} onFocus={() => setFocus('t')} onBlur={() => setFocus(null)}>
                {ROOM_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              {fl('Capacity')}
              <input type="number" min={1} value={capacity} onChange={e => setCapacity(e.target.value)} style={inputStyle(focus === 'c')} onFocus={() => setFocus('c')} onBlur={() => setFocus(null)} />
            </div>
            <div>
              {fl('Availability status')}
              <select value={availabilityStatus} onChange={e => setAvailabilityStatus(e.target.value)} style={{ ...inputStyle(focus === 'a'), cursor: 'pointer' }} onFocus={() => setFocus('a')} onBlur={() => setFocus(null)}>
                {AVAILABILITY.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              {fl('Rental rates')}
              <input type="number" min={0} step={1} value={rentalRate} onChange={e => setRentalRate(e.target.value)} style={inputStyle(focus === 'r')} onFocus={() => setFocus('r')} onBlur={() => setFocus(null)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="st-pill" style={{ padding: '9px 16px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 500 }}>Cancel</button>
            <button type="submit" style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: '#fff', cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 600 }}>Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PricingConfigModal({ mode, initial, rooms, onClose, onSave }) {
  const [roomId, setRoomId] = useState(initial?.roomId ?? rooms[0]?.id ?? '')
  const [rentalDuration, setRentalDuration] = useState(initial?.rentalDuration ?? RENTAL_DURATIONS[1])
  const [serviceCategory, setServiceCategory] = useState(initial?.serviceCategory ?? SERVICE_CATEGORIES[0])
  const [rate, setRate] = useState(initial?.rate ?? 0)
  const [focus, setFocus] = useState(null)

  const linkedRoom = rooms.find(r => r.id === roomId)

  const submit = e => {
    e.preventDefault()
    if (!roomId || !rooms.some(r => r.id === roomId)) return
    if (mode === 'add') {
      onSave({
        id: `pc${nextPricingId++}`,
        roomId,
        rentalDuration,
        serviceCategory,
        rate: Math.max(0, Number(rate) || 0),
      })
    } else {
      onSave({
        ...initial,
        roomId,
        rentalDuration,
        serviceCategory,
        rate: Math.max(0, Number(rate) || 0),
      })
    }
    onClose()
  }

  if (rooms.length === 0) {
    return (
      <div role="presentation" onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div role="dialog" onClick={e => e.stopPropagation()} style={{ background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: '16px', padding: '22px', maxWidth: '360px' }}>
          <div style={{ fontFamily: C.display, fontSize: '17px', fontWeight: 700, color: C.text, marginBottom: '12px' }}>Set room rate</div>
          <button type="button" onClick={onClose} className="st-pill" style={{ padding: '9px 16px', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontFamily: C.font, fontSize: '13px' }}>Close</button>
        </div>
      </div>
    )
  }

  return (
    <div role="presentation" onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'stFadeUp 0.25s ease both' }}>
      <div role="dialog" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '440px', background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: '16px', padding: '22px', boxShadow: '0 24px 48px rgba(0,0,0,0.45)' }}>
        <div style={{ fontFamily: C.display, fontSize: '18px', fontWeight: 700, color: C.text, marginBottom: '16px' }}>{mode === 'add' ? 'Set room rate' : 'Update room rate'}</div>
        <form onSubmit={submit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              {fl('Studio room record')}
              <select value={roomId} onChange={e => setRoomId(e.target.value)} style={{ ...inputStyle(focus === 'rid'), cursor: 'pointer' }} onFocus={() => setFocus('rid')} onBlur={() => setFocus(null)} required>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>{r.roomName} ({r.id})</option>
                ))}
              </select>
            </div>
            <div>
              {fl('Room type')}
              <div style={{ ...inputStyle(false), color: linkedRoom ? C.text2 : C.text3, cursor: 'default' }}>{linkedRoom ? linkedRoom.roomType : '—'}</div>
            </div>
            <div>
              {fl('Rental duration')}
              <select value={rentalDuration} onChange={e => setRentalDuration(e.target.value)} style={{ ...inputStyle(focus === 'rd'), cursor: 'pointer' }} onFocus={() => setFocus('rd')} onBlur={() => setFocus(null)}>
                {RENTAL_DURATIONS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              {fl('Service category')}
              <select value={serviceCategory} onChange={e => setServiceCategory(e.target.value)} style={{ ...inputStyle(focus === 'sc'), cursor: 'pointer' }} onFocus={() => setFocus('sc')} onBlur={() => setFocus(null)}>
                {SERVICE_CATEGORIES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              {fl('Rate')}
              <input type="number" min={0} step={1} value={rate} onChange={e => setRate(e.target.value)} style={inputStyle(focus === 'rate')} onFocus={() => setFocus('rate')} onBlur={() => setFocus(null)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="st-pill" style={{ padding: '9px 16px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 500 }}>Cancel</button>
            <button type="submit" style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: '#fff', cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 600 }}>Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function BookingModal({ mode, initial, rooms, onClose, onSave }) {
  const [roomId, setRoomId] = useState(initial?.roomId ?? rooms[0]?.id ?? '')
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10))
  const [status, setStatus] = useState(initial?.status ?? BOOKING_STATUSES[0])
  const [customerName, setCustomerName] = useState(initial?.customerName ?? '')
  const [focus, setFocus] = useState(null)

  const submit = e => {
    e.preventDefault()
    if (!roomId) return
    if (!date) return
    if (!customerName.trim()) return

    if (mode === 'add') {
      onSave({
        id: `bk${nextBookingId++}`,
        roomId,
        date,
        status,
        customerName: customerName.trim(),
      })
    } else {
      onSave({
        ...initial,
        roomId,
        date,
        status,
        customerName: customerName.trim(),
      })
    }
    onClose()
  }

  if (rooms.length === 0) {
    return (
      <div
        role="presentation"
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      >
        <div role="dialog" onClick={e => e.stopPropagation()} style={{ background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: '16px', padding: '22px', maxWidth: '360px' }}>
          <div style={{ fontFamily: C.display, fontSize: '17px', fontWeight: 700, color: C.text, marginBottom: '12px' }}>No rooms available</div>
          <p style={{ fontSize: '13px', color: C.text2, lineHeight: 1.5, marginBottom: '18px' }}>
            Create a studio room record before booking a room.
          </p>
          <button type="button" onClick={onClose} className="st-pill" style={{ padding: '9px 16px', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontFamily: C.font, fontSize: '13px' }}>
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'stFadeUp 0.25s ease both' }}
    >
      <div role="dialog" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '480px', background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: '16px', padding: '22px', boxShadow: '0 24px 48px rgba(0,0,0,0.45)' }}>
        <div style={{ fontFamily: C.display, fontSize: '18px', fontWeight: 700, color: C.text, marginBottom: '16px' }}>
          {mode === 'add' ? 'Create studio room booking' : 'Update studio room booking'}
        </div>
        <form onSubmit={submit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              {fl('Room')}
              <select
                value={roomId}
                onChange={e => setRoomId(e.target.value)}
                style={{ ...inputStyle(focus === 'r'), cursor: 'pointer' }}
                onFocus={() => setFocus('r')}
                onBlur={() => setFocus(null)}
                required
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>{r.roomName}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                {fl('Date')}
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={{ ...inputStyle(focus === 'd') }}
                  onFocus={() => setFocus('d')}
                  onBlur={() => setFocus(null)}
                  required
                />
              </div>
              <div>
                {fl('Status')}
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  style={{ ...inputStyle(focus === 's'), cursor: 'pointer' }}
                  onFocus={() => setFocus('s')}
                  onBlur={() => setFocus(null)}
                  required
                >
                  {BOOKING_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              {fl('Customer / Student')}
              <input
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                style={{ ...inputStyle(focus === 'c') }}
                onFocus={() => setFocus('c')}
                onBlur={() => setFocus(null)}
                placeholder="e.g. Ana Reyes"
                required
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="st-pill" style={{ padding: '9px 16px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 500 }}>
              Cancel
            </button>
            <button type="submit" style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: '#fff', cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 600 }}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function StudioRoomManagement({ isMobile = false, isTablet = false }) {
  const [rooms, setRooms] = useState(initialRooms)
  const [pricingConfigs, setPricingConfigs] = useState(initialPricingConfigs)
  const [roomModal, setRoomModal] = useState(null)
  const [pricingModal, setPricingModal] = useState(null)

  const [tab, setTab] = useState('bookings')

  const [bookings, setBookings] = useState(initialBookings)
  const [bkStatus, setBkStatus] = useState('all')
  const [bkDate, setBkDate] = useState('')
  const [bkRoomId, setBkRoomId] = useState('all')
  const [bookingModal, setBookingModal] = useState(null)
  const [deleteBookingId, setDeleteBookingId] = useState(null)

  const fmt = n => `₱${Number(n).toLocaleString()}`

  const addRoom = row => setRooms(prev => [...prev, row])
  const updateRoom = row => setRooms(prev => prev.map(r => (r.id === row.id ? row : r)))
  const deactivateRoom = id => {
    setRooms(prev => prev.map(r => (r.id === id ? { ...r, availabilityStatus: 'Inactive' } : r)))
  }

  const addPricing = row => setPricingConfigs(prev => [...prev, row])
  const updatePricing = row => setPricingConfigs(prev => prev.map(p => (p.id === row.id ? row : p)))

  const addBooking = row => setBookings(prev => [...prev, row])
  const removeBooking = id => setBookings(prev => prev.filter(b => b.id !== id))

  const roomById = useMemo(() => Object.fromEntries(rooms.map(r => [r.id, r])), [rooms])
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (bkStatus !== 'all' && b.status !== bkStatus) return false
      if (bkDate && b.date !== bkDate) return false
      if (bkRoomId !== 'all' && b.roomId !== bkRoomId) return false
      return true
    })
  }, [bookings, bkStatus, bkDate, bkRoomId])

  const tabBtn = (id, label) => {
    const on = tab === id
    return (
      <button
        type="button"
        onClick={() => setTab(id)}
        style={{
          padding: '8px 16px',
          borderRadius: '10px',
          border: on ? `1px solid rgba(124,106,247,0.4)` : `1px solid ${C.border}`,
          background: on ? 'rgba(124,106,247,0.14)' : 'transparent',
          color: on ? C.accentL : C.text2,
          cursor: 'pointer',
          fontFamily: C.font,
          fontSize: '13px',
          fontWeight: on ? 600 : 500,
        }}
      >
        {label}
      </button>
    )
  }

  const bookingStatusStyles = {
    Pending: { bg: 'rgba(251,191,36,0.12)', c: C.gold },
    Confirmed: { bg: 'rgba(52,211,153,0.12)', c: C.green },
    Cancelled: { bg: 'rgba(248,113,113,0.10)', c: C.coral },
    Completed: { bg: 'rgba(45,212,191,0.10)', c: C.teal },
  }

  return (
    <>
      <style>{css}</style>
      <div style={{ animation: 'stFadeUp 0.4s ease both', fontFamily: C.font }}>
        <div style={{ marginBottom: '18px' }}>
          <h1 style={{ fontFamily: C.display, fontSize: isMobile ? '22px' : '26px', fontWeight: 800, color: C.text, letterSpacing: '-0.02em' }}>
            Studio room management
          </h1>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
          {tabBtn('bookings', 'Studio room bookings')}
          {tabBtn('rooms', 'Rooms & pricing')}
        </div>

        {tab === 'bookings' && (
          <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: isMobile ? '14px' : '18px 20px', marginBottom: '22px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: isMobile ? 'stretch' : 'center', marginBottom: '14px' }}>
              <div style={{ flex: '1 1 220px', minWidth: 0, position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: C.text3, fontSize: '14px' }}>⌕</span>
                <select
                  value={bkStatus}
                  onChange={e => setBkStatus(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px 9px 34px', background: C.bg4, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text, fontFamily: C.font, fontSize: '13px', outline: 'none', cursor: 'pointer' }}
                  aria-label="Filter by booking status"
                >
                  <option value="all">All statuses</option>
                  {BOOKING_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div style={{ flex: '1 1 170px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px', fontFamily: C.font }}>
                  Date
                </label>
                <input
                  type="date"
                  value={bkDate}
                  onChange={e => setBkDate(e.target.value)}
                  style={{ width: '100%', background: C.bg4, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '10px 12px', color: C.text, fontFamily: C.font, fontSize: '13px', outline: 'none' }}
                  aria-label="Filter by date"
                />
              </div>

              <div style={{ flex: '1 1 220px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px', fontFamily: C.font }}>
                  Room
                </label>
                <select
                  value={bkRoomId}
                  onChange={e => setBkRoomId(e.target.value)}
                  style={{ width: '100%', background: C.bg4, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '10px 12px', color: C.text, fontFamily: C.font, fontSize: '13px', outline: 'none', cursor: 'pointer' }}
                  aria-label="Filter by room"
                >
                  <option value="all">All rooms</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>{r.roomName}</option>
                  ))}
                </select>
              </div>

              <div style={{ flex: '0 0 auto', marginLeft: isMobile ? 0 : 'auto', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => { setBkStatus('all'); setBkDate(''); setBkRoomId('all') }}
                  style={{ padding: '9px 16px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}
                >
                  Clear filters
                </button>
                <button
                  type="button"
                  disabled={rooms.length === 0}
                  onClick={() => setBookingModal({ type: 'add' })}
                  style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', background: rooms.length === 0 ? C.bg4 : `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: rooms.length === 0 ? C.text3 : '#fff', cursor: rooms.length === 0 ? 'not-allowed' : 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}
                >
                  + Create booking
                </button>
              </div>
            </div>

            <div style={{ fontSize: '11px', color: C.text3, marginBottom: '12px' }}>
              Showing <strong style={{ color: C.text2 }}>{filteredBookings.length}</strong> of {bookings.length} bookings
            </div>

            <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${C.border}` }}>
              <table style={{ width: '100%', minWidth: isTablet ? '720px' : '820px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.bg4 }}>
                    {['Booking ID', 'Room', 'Date', 'Status', 'Customer', ''].map(h => (
                      <th key={h || 'a'} style={{ textAlign: h === '' ? 'right' : 'left', padding: '10px 12px', fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '36px 16px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>
                        No bookings match your filters. Create a new booking or clear filters.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b, i) => {
                      const link = roomById[b.roomId]
                      const s = bookingStatusStyles[b.status] || { bg: C.bg4, c: C.text2 }
                      return (
                        <tr key={b.id} className="st-row" style={{ borderBottom: i < filteredBookings.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                          <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text2, fontWeight: 700 }}>{b.id}</td>
                          <td style={{ padding: '11px 12px', fontSize: '13px', fontWeight: 700, color: C.text }}>{link ? link.roomName : b.roomId}</td>
                          <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text2 }}>{b.date}</td>
                          <td style={{ padding: '11px 12px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: s.bg, color: s.c, border: `1px solid rgba(255,255,255,0.06)` }}>
                              {b.status}
                            </span>
                          </td>
                          <td style={{ padding: '11px 12px', fontSize: '13px', color: C.text2 }}>{b.customerName}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <button type="button" onClick={() => setDeleteBookingId(b.id)} style={{ padding: '6px 11px', borderRadius: '8px', border: `1px solid rgba(248,113,113,0.35)`, background: 'rgba(248,113,113,0.08)', color: C.coral, cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>
                              Remove
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'rooms' && (
          <>
            <div style={{ fontFamily: C.display, fontSize: '15px', fontWeight: 700, color: C.text, marginBottom: '12px' }}>Studio room records</div>
            <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: isMobile ? '14px' : '18px 20px', marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                <button type="button" onClick={() => setRoomModal({ type: 'add' })} style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: '#fff', cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 600 }}>
                  Create
                </button>
              </div>
              <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${C.border}` }}>
                <table style={{ width: '100%', minWidth: isTablet ? '640px' : '720px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: C.bg4 }}>
                      {['Room name', 'Room type', 'Capacity', 'Availability status', 'Rental rates', ''].map(h => (
                        <th key={h || 'a'} style={{ textAlign: h === '' ? 'right' : 'left', padding: '10px 12px', fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((r, i) => (
                      <tr key={r.id} className="st-row" style={{ borderBottom: i < rooms.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                        <td style={{ padding: '11px 12px', fontSize: '13px', fontWeight: 600, color: C.text }}>{r.roomName}</td>
                        <td style={{ padding: '11px 12px', fontSize: '12px', color: C.text2 }}>{r.roomType}</td>
                        <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '13px', color: C.text2 }}>{r.capacity}</td>
                        <td style={{ padding: '11px 12px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', background: r.availabilityStatus === 'Active' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.1)', color: r.availabilityStatus === 'Active' ? C.green : C.coral }}>
                            {r.availabilityStatus}
                          </span>
                        </td>
                        <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '13px', color: C.text }}>{fmt(r.rentalRate)}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button type="button" className="st-pill" onClick={() => setRoomModal({ type: 'edit', row: r })} style={{ marginRight: '6px', padding: '6px 11px', borderRadius: '8px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}>Update</button>
                          {r.availabilityStatus === 'Active' && (
                            <button type="button" onClick={() => deactivateRoom(r.id)} style={{ padding: '6px 11px', borderRadius: '8px', border: `1px solid rgba(248,113,113,0.35)`, background: 'rgba(248,113,113,0.08)', color: C.coral, cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Deactivate</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ fontFamily: C.display, fontSize: '15px', fontWeight: 700, color: C.text, marginBottom: '12px' }}>Pricing configurations</div>
            <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: isMobile ? '14px' : '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                <button type="button" disabled={rooms.length === 0} onClick={() => setPricingModal({ type: 'add' })} style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', background: rooms.length === 0 ? C.bg4 : `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: rooms.length === 0 ? C.text3 : '#fff', cursor: rooms.length === 0 ? 'not-allowed' : 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 600 }}>
                  Set rate
                </button>
              </div>
              <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${C.border}` }}>
                <table style={{ width: '100%', minWidth: isTablet ? '640px' : '760px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: C.bg4 }}>
                      {['Room name', 'Room type', 'Rental duration', 'Service category', 'Rate', ''].map(h => (
                        <th key={h || 'b'} style={{ textAlign: h === '' ? 'right' : 'left', padding: '10px 12px', fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pricingConfigs.map((p, i) => {
                      const link = rooms.find(r => r.id === p.roomId)
                      return (
                        <tr key={p.id} className="st-row" style={{ borderBottom: i < pricingConfigs.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                          <td style={{ padding: '11px 12px', fontSize: '13px', fontWeight: 600, color: C.text }}>{link ? link.roomName : '—'}</td>
                          <td style={{ padding: '11px 12px', fontSize: '12px', color: C.text2 }}>{link ? link.roomType : '—'}</td>
                          <td style={{ padding: '11px 12px', fontSize: '12px', color: C.text2 }}>{p.rentalDuration}</td>
                          <td style={{ padding: '11px 12px', fontSize: '12px', color: C.text2 }}>{p.serviceCategory}</td>
                          <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '13px', color: C.text }}>{fmt(p.rate)}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                            <button type="button" className="st-pill" onClick={() => setPricingModal({ type: 'edit', row: p })} style={{ padding: '6px 11px', borderRadius: '8px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}>Update</button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {roomModal?.type === 'add' && <RoomRecordModal mode="add" onClose={() => setRoomModal(null)} onSave={addRoom} />}
      {roomModal?.type === 'edit' && roomModal.row && <RoomRecordModal mode="edit" initial={roomModal.row} onClose={() => setRoomModal(null)} onSave={updateRoom} />}
      {pricingModal?.type === 'add' && <PricingConfigModal mode="add" rooms={rooms} onClose={() => setPricingModal(null)} onSave={addPricing} />}
      {pricingModal?.type === 'edit' && pricingModal.row && <PricingConfigModal mode="edit" initial={pricingModal.row} rooms={rooms} onClose={() => setPricingModal(null)} onSave={updatePricing} />}

      {bookingModal?.type === 'add' && <BookingModal mode="add" rooms={rooms} onClose={() => setBookingModal(null)} onSave={addBooking} />}

      {deleteBookingId && (
        <div
          role="presentation"
          onClick={() => setDeleteBookingId(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: '16px', padding: '20px', maxWidth: '380px' }} role="dialog">
            <div style={{ fontFamily: C.display, fontSize: '17px', fontWeight: 700, color: C.text, marginBottom: '12px' }}>Remove booking?</div>
            <p style={{ fontSize: '13px', color: C.text2, lineHeight: 1.5, marginBottom: '18px' }}>
              This will permanently delete the selected studio room booking.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" className="st-pill" onClick={() => setDeleteBookingId(null)} style={{ padding: '8px 14px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontFamily: C.font, fontSize: '13px' }}>
                Cancel
              </button>
              <button type="button" onClick={() => { removeBooking(deleteBookingId); setDeleteBookingId(null) }} style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', background: C.coral, color: '#fff', cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 700 }}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default StudioRoomManagement
