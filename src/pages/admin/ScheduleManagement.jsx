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

const WEEKDAYS = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
]

const ROOMS = [
  { id: 'rA', label: 'Studio A' },
  { id: 'rB', label: 'Studio B' },
  { id: 'rC', label: 'Studio C' },
  { id: 'rD', label: 'Studio D' },
]

const INSTRUCTORS = ['Mr. Cruz', 'Ms. Lim', 'Mr. Bautista', 'Ms. Reyes', 'Ms. Santos']

const initialInstructorSlots = () => [
  { id: 'ia1', instructor: 'Mr. Cruz', day: 'mon', start: '09:00', end: '11:00', roomId: 'rA', published: true },
  { id: 'ia2', instructor: 'Ms. Lim', day: 'mon', start: '10:00', end: '12:00', roomId: 'rB', published: true },
  { id: 'ia3', instructor: 'Mr. Cruz', day: 'tue', start: '14:00', end: '17:00', roomId: 'rA', published: false },
  { id: 'ia4', instructor: 'Ms. Reyes', day: 'wed', start: '09:00', end: '13:00', roomId: 'rC', published: true },
]

let nextIa = 5
let nextRb = 3

const initialRoomBlocks = () => [
  { id: 'rb1', roomId: 'rC', day: 'fri', start: '08:00', end: '10:00', kind: 'blocked' },
  { id: 'rb2', roomId: 'rD', day: 'sat', start: '12:00', end: '18:00', kind: 'blocked' },
]

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
  @keyframes smFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .sm-row { transition: background 0.15s ease; }
  .sm-row:hover { background: rgba(255,255,255,0.03) !important; }
  .sm-pill { transition: all 0.18s ease; }
  .sm-pill:hover { background: rgba(124,106,247,0.18) !important; color: #a99cf9 !important; }
`

function toMin(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + (m || 0)
}

function rangesOverlap(s1, e1, s2, e2) {
  return toMin(s1) < toMin(e2) && toMin(s2) < toMin(e1)
}

function dayLabel(key) {
  return WEEKDAYS.find(d => d.key === key)?.label || key
}

function roomLabel(id) {
  return ROOMS.find(r => r.id === id)?.label || id
}

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

function InstructorSlotModal({ mode, initial, slots, roomBlocks, onClose, onSave }) {
  const [instructor, setInstructor] = useState(initial?.instructor ?? INSTRUCTORS[0])
  const [day, setDay] = useState(initial?.day ?? 'mon')
  const [start, setStart] = useState(initial?.start ?? '09:00')
  const [end, setEnd] = useState(initial?.end ?? '10:00')
  const [roomId, setRoomId] = useState(initial?.roomId ?? ROOMS[0].id)
  const [published, setPublished] = useState(initial?.published ?? true)
  const [focus, setFocus] = useState(null)
  const [err, setErr] = useState('')

  const validate = () => {
    if (toMin(end) <= toMin(start)) {
      setErr('End after start')
      return false
    }
    const id = initial?.id
    const others = slots.filter(s => s.id !== id)
    for (const s of others) {
      if (s.instructor === instructor && s.day === day && rangesOverlap(start, end, s.start, s.end)) {
        setErr('Instructor overlap')
        return false
      }
    }
    for (const s of others) {
      if (s.roomId === roomId && s.day === day && rangesOverlap(start, end, s.start, s.end)) {
        setErr('Room overlap (instructor grid)')
        return false
      }
    }
    for (const b of roomBlocks) {
      if (b.roomId === roomId && b.day === day && rangesOverlap(start, end, b.start, b.end)) {
        setErr('Room overlap (block)')
        return false
      }
    }
    setErr('')
    return true
  }

  const submit = e => {
    e.preventDefault()
    if (!validate()) return
    if (mode === 'add') {
      onSave({ id: `ia${nextIa++}`, instructor, day, start, end, roomId, published })
    } else {
      onSave({ ...initial, instructor, day, start, end, roomId, published })
    }
    onClose()
  }

  return (
    <div role="presentation" onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'smFadeUp 0.25s ease both' }}>
      <div role="dialog" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto', background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: '16px', padding: '22px', boxShadow: '0 24px 48px rgba(0,0,0,0.45)' }}>
        <div style={{ fontFamily: C.display, fontSize: '18px', fontWeight: 700, color: C.text, marginBottom: '16px' }}>{mode === 'add' ? 'Add slot' : 'Edit slot'}</div>
        {err && <div style={{ marginBottom: '12px', padding: '8px 10px', borderRadius: '8px', background: 'rgba(248,113,113,0.12)', border: `1px solid rgba(248,113,113,0.3)`, color: C.coral, fontSize: '12px', fontWeight: 600 }}>{err}</div>}
        <form onSubmit={submit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              {fl('Instructor')}
              <select value={instructor} onChange={e => setInstructor(e.target.value)} style={{ ...inputStyle(focus === 'i'), cursor: 'pointer' }} onFocus={() => setFocus('i')} onBlur={() => setFocus(null)}>
                {INSTRUCTORS.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              {fl('Day')}
              <select value={day} onChange={e => setDay(e.target.value)} style={{ ...inputStyle(focus === 'd'), cursor: 'pointer' }} onFocus={() => setFocus('d')} onBlur={() => setFocus(null)}>
                {WEEKDAYS.map(w => (
                  <option key={w.key} value={w.key}>{w.label}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                {fl('Start')}
                <input type="time" value={start} onChange={e => setStart(e.target.value)} style={inputStyle(focus === 's')} onFocus={() => setFocus('s')} onBlur={() => setFocus(null)} />
              </div>
              <div>
                {fl('End')}
                <input type="time" value={end} onChange={e => setEnd(e.target.value)} style={inputStyle(focus === 'e')} onFocus={() => setFocus('e')} onBlur={() => setFocus(null)} />
              </div>
            </div>
            <div>
              {fl('Room')}
              <select value={roomId} onChange={e => setRoomId(e.target.value)} style={{ ...inputStyle(focus === 'r'), cursor: 'pointer' }} onFocus={() => setFocus('r')} onBlur={() => setFocus(null)}>
                {ROOMS.map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: C.text2, fontFamily: C.font }}>
              <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: C.accent }} />
              <span>Enrollment feed</span>
            </label>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="sm-pill" style={{ padding: '9px 16px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 500 }}>Cancel</button>
            <button type="submit" style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: '#fff', cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 600 }}>Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RoomBlockModal({ mode, initial, slots, roomBlocks, onClose, onSave }) {
  const [roomId, setRoomId] = useState(initial?.roomId ?? ROOMS[0].id)
  const [day, setDay] = useState(initial?.day ?? 'mon')
  const [start, setStart] = useState(initial?.start ?? '09:00')
  const [end, setEnd] = useState(initial?.end ?? '10:00')
  const [focus, setFocus] = useState(null)
  const [err, setErr] = useState('')

  const validate = () => {
    if (toMin(end) <= toMin(start)) {
      setErr('End after start')
      return false
    }
    const id = initial?.id
    const blocks = roomBlocks.filter(b => b.id !== id)
    for (const b of blocks) {
      if (b.roomId === roomId && b.day === day && rangesOverlap(start, end, b.start, b.end)) {
        setErr('Block overlap')
        return false
      }
    }
    for (const s of slots) {
      if (s.roomId === roomId && s.day === day && rangesOverlap(start, end, s.start, s.end)) {
        setErr('Room in use (instructor)')
        return false
      }
    }
    setErr('')
    return true
  }

  const submit = e => {
    e.preventDefault()
    if (!validate()) return
    if (mode === 'add') {
      onSave({ id: `rb${nextRb++}`, roomId, day, start, end, kind: 'blocked' })
    } else {
      onSave({ ...initial, roomId, day, start, end })
    }
    onClose()
  }

  return (
    <div role="presentation" onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'smFadeUp 0.25s ease both' }}>
      <div role="dialog" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px', background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: '16px', padding: '22px', boxShadow: '0 24px 48px rgba(0,0,0,0.45)' }}>
        <div style={{ fontFamily: C.display, fontSize: '18px', fontWeight: 700, color: C.text, marginBottom: '16px' }}>{mode === 'add' ? 'Add room block' : 'Edit room block'}</div>
        {err && <div style={{ marginBottom: '12px', padding: '8px 10px', borderRadius: '8px', background: 'rgba(248,113,113,0.12)', border: `1px solid rgba(248,113,113,0.3)`, color: C.coral, fontSize: '12px', fontWeight: 600 }}>{err}</div>}
        <form onSubmit={submit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              {fl('Room')}
              <select value={roomId} onChange={e => setRoomId(e.target.value)} style={{ ...inputStyle(focus === 'r'), cursor: 'pointer' }} onFocus={() => setFocus('r')} onBlur={() => setFocus(null)}>
                {ROOMS.map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              {fl('Day')}
              <select value={day} onChange={e => setDay(e.target.value)} style={{ ...inputStyle(focus === 'd'), cursor: 'pointer' }} onFocus={() => setFocus('d')} onBlur={() => setFocus(null)}>
                {WEEKDAYS.map(w => (
                  <option key={w.key} value={w.key}>{w.label}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                {fl('Start')}
                <input type="time" value={start} onChange={e => setStart(e.target.value)} style={inputStyle(focus === 's')} onFocus={() => setFocus('s')} onBlur={() => setFocus(null)} />
              </div>
              <div>
                {fl('End')}
                <input type="time" value={end} onChange={e => setEnd(e.target.value)} style={inputStyle(focus === 'e')} onFocus={() => setFocus('e')} onBlur={() => setFocus(null)} />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="sm-pill" style={{ padding: '9px 16px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 500 }}>Cancel</button>
            <button type="submit" style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: '#fff', cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 600 }}>Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ScheduleManagement({ isMobile = false, isTablet = false }) {
  const [tab, setTab] = useState('instructors')
  const [slots, setSlots] = useState(initialInstructorSlots)
  const [roomBlocks, setRoomBlocks] = useState(initialRoomBlocks)
  const [iaSearch, setIaSearch] = useState('')
  const [iaDay, setIaDay] = useState('all')
  const [rmSearch, setRmSearch] = useState('')
  const [rmDay, setRmDay] = useState('all')
  const [iaModal, setIaModal] = useState(null)
  const [rbModal, setRbModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filteredSlots = useMemo(() => {
    const q = iaSearch.trim().toLowerCase()
    return slots.filter(s => {
      if (iaDay !== 'all' && s.day !== iaDay) return false
      if (!q) return true
      return s.instructor.toLowerCase().includes(q) || roomLabel(s.roomId).toLowerCase().includes(q)
    })
  }, [slots, iaSearch, iaDay])

  const mergedRoomRows = useMemo(() => {
    const rows = []
    slots.forEach(s => {
      rows.push({ key: s.id, kind: 'lesson', roomId: s.roomId, day: s.day, start: s.start, end: s.end, label: s.instructor, published: s.published })
    })
    roomBlocks.forEach(b => {
      rows.push({ key: b.id, kind: 'blocked', roomId: b.roomId, day: b.day, start: b.start, end: b.end, label: '—', published: false })
    })
    rows.sort((a, b) => {
      const da = a.day.localeCompare(b.day)
      if (da !== 0) return da
      return toMin(a.start) - toMin(b.start)
    })
    const q = rmSearch.trim().toLowerCase()
    return rows.filter(r => {
      if (rmDay !== 'all' && r.day !== rmDay) return false
      if (!q) return true
      return roomLabel(r.roomId).toLowerCase().includes(q) || (r.label && r.label.toLowerCase().includes(q))
    })
  }, [slots, roomBlocks, rmSearch, rmDay])

  const stats = useMemo(() => {
    const published = slots.filter(s => s.published).length
    return { instructors: INSTRUCTORS.length, slots: slots.length, rooms: ROOMS.length, blocks: roomBlocks.length, published }
  }, [slots, roomBlocks])

  const tabBtn = (id, label) => {
    const on = tab === id
    return (
      <button
        type="button"
        key={id}
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

  const selectBase = {
    background: C.bg4,
    border: `1px solid ${C.border}`,
    borderRadius: '10px',
    padding: '8px 10px',
    color: C.text,
    fontFamily: C.font,
    fontSize: '13px',
    cursor: 'pointer',
    outline: 'none',
  }

  const addSlot = row => setSlots(prev => [...prev, row])
  const updSlot = row => setSlots(prev => prev.map(s => (s.id === row.id ? row : s)))
  const delSlot = id => setSlots(prev => prev.filter(s => s.id !== id))

  const addBlock = row => setRoomBlocks(prev => [...prev, row])
  const updBlock = row => setRoomBlocks(prev => prev.map(b => (b.id === row.id ? row : b)))
  const delBlock = id => setRoomBlocks(prev => prev.filter(b => b.id !== id))

  const togglePublished = id => {
    setSlots(prev => prev.map(s => (s.id === id ? { ...s, published: !s.published } : s)))
  }

  return (
    <>
      <style>{css}</style>
      <div style={{ animation: 'smFadeUp 0.4s ease both', fontFamily: C.font }}>
        <div style={{ marginBottom: '18px' }}>
          <h1 style={{ fontFamily: C.display, fontSize: isMobile ? '22px' : '26px', fontWeight: 800, color: C.text, letterSpacing: '-0.02em' }}>
            Schedule management
          </h1>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {tabBtn('instructors', 'Instructor availability')}
          {tabBtn('rooms', 'Studio occupancy')}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)', gap: '10px', marginBottom: '16px' }}>
          {[
            { k: 'Instructors', v: stats.instructors },
            { k: 'Slots', v: stats.slots },
            { k: 'Rooms', v: stats.rooms },
            { k: 'Blocks', v: stats.blocks },
            { k: 'Enrollment feed', v: stats.published },
          ].map((s, i) => (
            <div key={s.k} style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '12px 14px', animation: `smFadeUp 0.3s ease ${i * 0.04}s both` }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em' }}>{s.k}</div>
              <div style={{ fontFamily: C.display, fontSize: '22px', fontWeight: 700, color: C.text, marginTop: '2px' }}>{s.v}</div>
            </div>
          ))}
        </div>

        {tab === 'instructors' && (
          <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: isMobile ? '14px' : '18px 20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '14px', alignItems: isMobile ? 'stretch' : 'center' }}>
              <div style={{ flex: isMobile ? '1 1 100%' : '1 1 180px', minWidth: 0, position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: C.text3, fontSize: '14px' }}>⌕</span>
                <input
                  type="search"
                  placeholder="Instructor or room…"
                  value={iaSearch}
                  onChange={e => setIaSearch(e.target.value)}
                  aria-label="Search availability"
                  style={{ width: '100%', background: C.bg4, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '9px 12px 9px 34px', color: C.text, fontFamily: C.font, fontSize: '13px', outline: 'none' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(124,106,247,0.45)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,106,247,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <select value={iaDay} onChange={e => setIaDay(e.target.value)} style={{ ...selectBase, minWidth: '100px' }} aria-label="Day filter">
                <option value="all">All days</option>
                {WEEKDAYS.map(w => (
                  <option key={w.key} value={w.key}>{w.label}</option>
                ))}
              </select>
              <button type="button" onClick={() => setIaModal({ type: 'add' })} style={{ marginLeft: isMobile ? 0 : 'auto', padding: '9px 18px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: '#fff', cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 600, width: isMobile ? '100%' : 'auto' }}>
                + Slot
              </button>
            </div>
            <div style={{ fontSize: '11px', color: C.text3, marginBottom: '10px' }}>{filteredSlots.length} / {slots.length}</div>
            <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${C.border}` }}>
              <table style={{ width: '100%', minWidth: isTablet ? '640px' : '700px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.bg4 }}>
                    {['Day', 'Time', 'Instructor', 'Room', 'Enrollment', ''].map(h => (
                      <th key={h || 'a'} style={{ textAlign: h === '' ? 'right' : 'left', padding: '10px 12px', fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSlots.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>—</td>
                    </tr>
                  ) : (
                    filteredSlots.map((s, i) => (
                      <tr key={s.id} className="sm-row" style={{ borderBottom: i < filteredSlots.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                        <td style={{ padding: '11px 12px', fontSize: '12px', color: C.text2, fontWeight: 600 }}>{dayLabel(s.day)}</td>
                        <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text }}>{s.start}–{s.end}</td>
                        <td style={{ padding: '11px 12px', fontSize: '13px', color: C.text }}>{s.instructor}</td>
                        <td style={{ padding: '11px 12px', fontSize: '12px', color: C.text2 }}>{roomLabel(s.roomId)}</td>
                        <td style={{ padding: '11px 12px' }}>
                          <button type="button" onClick={() => togglePublished(s.id)} style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, border: `1px solid ${s.published ? 'rgba(52,211,153,0.35)' : C.border}`, background: s.published ? 'rgba(52,211,153,0.12)' : C.bg4, color: s.published ? C.green : C.text3, cursor: 'pointer' }}>
                            {s.published ? 'On' : 'Off'}
                          </button>
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button type="button" className="sm-pill" onClick={() => setIaModal({ type: 'edit', row: s })} style={{ marginRight: '6px', padding: '6px 10px', borderRadius: '8px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                          <button type="button" onClick={() => setDeleteTarget({ type: 'ia', id: s.id })} style={{ padding: '6px 10px', borderRadius: '8px', border: `1px solid rgba(248,113,113,0.35)`, background: 'rgba(248,113,113,0.08)', color: C.coral, cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Remove</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'rooms' && (
          <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: isMobile ? '14px' : '18px 20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '14px', alignItems: isMobile ? 'stretch' : 'center' }}>
              <div style={{ flex: isMobile ? '1 1 100%' : '1 1 180px', minWidth: 0, position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: C.text3, fontSize: '14px' }}>⌕</span>
                <input
                  type="search"
                  placeholder="Room or label…"
                  value={rmSearch}
                  onChange={e => setRmSearch(e.target.value)}
                  aria-label="Search occupancy"
                  style={{ width: '100%', background: C.bg4, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '9px 12px 9px 34px', color: C.text, fontFamily: C.font, fontSize: '13px', outline: 'none' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(124,106,247,0.45)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,106,247,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <select value={rmDay} onChange={e => setRmDay(e.target.value)} style={{ ...selectBase, minWidth: '100px' }} aria-label="Day filter">
                <option value="all">All days</option>
                {WEEKDAYS.map(w => (
                  <option key={w.key} value={w.key}>{w.label}</option>
                ))}
              </select>
              <button type="button" onClick={() => setRbModal({ type: 'add' })} style={{ marginLeft: isMobile ? 0 : 'auto', padding: '9px 18px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: '#fff', cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 600, width: isMobile ? '100%' : 'auto' }}>
                + Block
              </button>
            </div>
            <div style={{ fontSize: '11px', color: C.text3, marginBottom: '10px' }}>{mergedRoomRows.length} rows</div>
            <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${C.border}` }}>
              <table style={{ width: '100%', minWidth: isTablet ? '640px' : '720px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.bg4 }}>
                    {['Day', 'Time', 'Room', 'Type', 'Detail', ''].map(h => (
                      <th key={h || 'x'} style={{ textAlign: h === '' ? 'right' : 'left', padding: '10px 12px', fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mergedRoomRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>—</td>
                    </tr>
                  ) : (
                    mergedRoomRows.map((r, i) => (
                      <tr key={r.key} className="sm-row" style={{ borderBottom: i < mergedRoomRows.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                        <td style={{ padding: '11px 12px', fontSize: '12px', color: C.text2, fontWeight: 600 }}>{dayLabel(r.day)}</td>
                        <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text }}>{r.start}–{r.end}</td>
                        <td style={{ padding: '11px 12px', fontSize: '12px', color: C.text }}>{roomLabel(r.roomId)}</td>
                        <td style={{ padding: '11px 12px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '20px', background: r.kind === 'blocked' ? 'rgba(248,113,113,0.12)' : 'rgba(45,212,191,0.12)', color: r.kind === 'blocked' ? C.coral : C.teal }}>
                            {r.kind === 'blocked' ? 'Block' : 'Lesson'}
                          </span>
                        </td>
                        <td style={{ padding: '11px 12px', fontSize: '12px', color: C.text2 }}>{r.kind === 'lesson' ? r.label : 'Blocked'}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {r.kind === 'blocked' ? (
                            <>
                              <button type="button" className="sm-pill" onClick={() => setRbModal({ type: 'edit', row: roomBlocks.find(b => b.id === r.key) })} style={{ marginRight: '6px', padding: '6px 10px', borderRadius: '8px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                              <button type="button" onClick={() => setDeleteTarget({ type: 'rb', id: r.key })} style={{ padding: '6px 10px', borderRadius: '8px', border: `1px solid rgba(248,113,113,0.35)`, background: 'rgba(248,113,113,0.08)', color: C.coral, cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Remove</button>
                            </>
                          ) : (
                            <>
                              <button type="button" className="sm-pill" onClick={() => setIaModal({ type: 'edit', row: slots.find(s => s.id === r.key) })} style={{ marginRight: '6px', padding: '6px 10px', borderRadius: '8px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                              <button type="button" onClick={() => setDeleteTarget({ type: 'ia', id: r.key })} style={{ padding: '6px 10px', borderRadius: '8px', border: `1px solid rgba(248,113,113,0.35)`, background: 'rgba(248,113,113,0.08)', color: C.coral, cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Remove</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {iaModal?.type === 'add' && (
        <InstructorSlotModal mode="add" slots={slots} roomBlocks={roomBlocks} onClose={() => setIaModal(null)} onSave={addSlot} />
      )}
      {iaModal?.type === 'edit' && iaModal.row && (
        <InstructorSlotModal mode="edit" initial={iaModal.row} slots={slots} roomBlocks={roomBlocks} onClose={() => setIaModal(null)} onSave={updSlot} />
      )}
      {rbModal?.type === 'add' && (
        <RoomBlockModal mode="add" slots={slots} roomBlocks={roomBlocks} onClose={() => setRbModal(null)} onSave={addBlock} />
      )}
      {rbModal?.type === 'edit' && rbModal.row && (
        <RoomBlockModal mode="edit" initial={rbModal.row} slots={slots} roomBlocks={roomBlocks} onClose={() => setRbModal(null)} onSave={updBlock} />
      )}

      {deleteTarget && (
        <div role="presentation" onClick={() => setDeleteTarget(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: '16px', padding: '20px', maxWidth: '360px' }} role="dialog">
            <div style={{ fontFamily: C.display, fontSize: '17px', fontWeight: 700, color: C.text, marginBottom: '12px' }}>Remove?</div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="button" className="sm-pill" onClick={() => setDeleteTarget(null)} style={{ padding: '8px 14px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontFamily: C.font, fontSize: '13px' }}>Cancel</button>
              <button
                type="button"
                onClick={() => {
                  if (deleteTarget.type === 'ia') delSlot(deleteTarget.id)
                  else delBlock(deleteTarget.id)
                  setDeleteTarget(null)
                }}
                style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', background: C.coral, color: '#fff', cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 600 }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ScheduleManagement
