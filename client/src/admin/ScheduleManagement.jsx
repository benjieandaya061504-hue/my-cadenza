import { useState, useEffect } from 'react'
import C from './theme.js'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/admin'

const initialSlots = [
  { id: 1, instructor: 'Mr. Cruz', day: 'Mon', start: '09:00', end: '11:00', room: 'Studio A', published: true },
  { id: 2, instructor: 'Ms. Lim', day: 'Mon', start: '10:00', end: '12:00', room: 'Studio B', published: true },
  { id: 3, instructor: 'Mr. Cruz', day: 'Tue', start: '14:00', end: '17:00', room: 'Studio A', published: false },
  { id: 4, instructor: 'Ms. Reyes', day: 'Wed', start: '08:00', end: '10:00', room: 'Studio D', published: true },
  { id: 5, instructor: 'Ms. Tan', day: 'Thu', start: '13:00', end: '16:00', room: 'Studio B', published: true },
  { id: 6, instructor: 'Mr. Reyes', day: 'Fri', start: '09:00', end: '12:00', room: 'Studio C', published: false },
]

const ROOM_LIST = ['Studio A', 'Studio B', 'Studio C', 'Studio D', 'Studio E', 'Studio F']

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function ScheduleManagement({ isMobile, isTablet }) {
  const [slots, setSlots] = useState(initialSlots)
  const [selectedInstructor, setSelectedInstructor] = useState('All Instructors')
  const [instructors, setInstructors] = useState([])
  const [loading, setLoading] = useState(true)

  const getToken = () => localStorage.getItem('cadenza_token')

  const fetchInstructors = async () => {
    try {
      const res = await fetch(`${API}/instructors`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (data.success) {
        setInstructors(data.data)
      }
    } catch (err) {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInstructors()
  }, [])

  const getInstructorName = (instructor) => {
    const staff = instructor.staff
    if (!staff) return 'Unknown'
    const parts = [staff.f_name, staff.m_name, staff.l_name].filter(Boolean)
    return parts.join(' ') || 'Unknown'
  }

  const [currentDate, setCurrentDate] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)
  const [newSlot, setNewSlot] = useState({
    start: '09:00',
    end: '10:00',
    room: 'Studio A',
    published: true,
  })

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startDayOfWeek = firstDayOfMonth.getDay()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const filteredSlots = selectedInstructor === 'All Instructors'
    ? []
    : slots.filter(s => s.instructor === selectedInstructor)

  const getSlotsForDate = (date) => {
    const dayAbbr = DAYS_SHORT[date.getDay()]
    return filteredSlots.filter(s => {
      const slotDay = s.day.slice(0, 3)
      if (slotDay === dayAbbr) return true
      if (slotDay === 'Wed' && dayAbbr === 'Wed') return true
      if (slotDay === 'Thu' && dayAbbr === 'Thu') return true
      return false
    })
  }

  const handleDayClick = (date) => {
    setSelectedDay(date)
    setNewSlot({
      start: '09:00',
      end: '10:00',
      room: 'Studio A',
      published: true,
    })
    setShowModal(true)
  }

  const handleAddSlot = () => {
    if (!selectedDay || !selectedInstructor || selectedInstructor === 'All Instructors') return

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayAbbr = dayNames[selectedDay.getDay()]

    const newId = Math.max(0, ...slots.map(s => s.id)) + 1
    const slot = {
      id: newId,
      instructor: selectedInstructor,
      day: dayAbbr,
      start: newSlot.start,
      end: newSlot.end,
      room: newSlot.room,
      published: newSlot.published,
    }

    setSlots([...slots, slot])
    setShowModal(false)
    setSelectedDay(null)
  }

  // Calendar grid builders
  const calendarCells = []
  const totalCells = Math.ceil((startDayOfWeek + daysInMonth) / 7) * 7

  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(new Date(year, month, d))
  }
  while (calendarCells.length < totalCells) {
    calendarCells.push(null)
  }

  const today = new Date()
  const isToday = (date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()

  return (
    <div style={{ fontFamily: C.font }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: C.display, fontSize: '1.3rem', fontWeight: 700, color: C.navy, margin: 0 }}>Schedule Management</h2>
          <p style={{ fontSize: '0.8rem', color: C.text3, marginTop: 2 }}>{filteredSlots.length} slot{filteredSlots.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            value={selectedInstructor}
            onChange={e => setSelectedInstructor(e.target.value)}
            style={{
              padding: '8px 12px', borderRadius: 10, border: `1.5px solid ${C.border2}`,
              fontSize: '0.8rem', fontFamily: C.font, outline: 'none', background: '#fff',
            }}
          >
            <option value="All Instructors">All Instructors</option>
            {instructors.map(instr => (
              <option key={instr.id} value={getInstructorName(instr)}>{getInstructorName(instr)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
        background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`, padding: '16px 20px',
      }}>
        <button
          onClick={prevMonth}
          style={{
            background: C.mist, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 14px',
            cursor: 'pointer', fontSize: '0.9rem', color: C.navy, fontFamily: C.font, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          ← Prev
        </button>
        <div style={{ fontFamily: C.display, fontSize: '1.2rem', fontWeight: 700, color: C.navy }}>
          {MONTHS[month]} {year}
        </div>
        <button
          onClick={nextMonth}
          style={{
            background: C.mist, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 14px',
            cursor: 'pointer', fontSize: '0.9rem', color: C.navy, fontFamily: C.font, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          Next →
        </button>
      </div>

      {/* Calendar Grid */}
      <div style={{
        background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`, overflow: 'hidden',
      }}>
        {/* Day headers */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
          background: C.mist, borderBottom: `1px solid ${C.border}`,
        }}>
          {DAYS_SHORT.map(d => (
            <div key={d} style={{
              padding: '12px 8px', fontSize: '0.7rem', fontWeight: 700, color: C.text3,
              textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center',
            }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar body */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        }}>
          {calendarCells.map((date, idx) => {
            if (!date) {
              return <div key={`empty-${idx}`} style={{ minHeight: 100, borderRight: idx % 7 !== 6 ? `1px solid ${C.border}` : 'none', borderBottom: idx < totalCells - 7 ? `1px solid ${C.border}` : 'none', background: C.mist }} />
            }

            const daySlots = getSlotsForDate(date)
            const isCurrentDay = isToday(date)

            return (
              <div
                key={idx}
                onClick={() => handleDayClick(date)}
                style={{
                  minHeight: 100, padding: 6, cursor: 'pointer',
                  borderRight: idx % 7 !== 6 ? `1px solid ${C.border}` : 'none',
                  borderBottom: idx < totalCells - 7 ? `1px solid ${C.border}` : 'none',
                  background: isCurrentDay ? 'rgba(37,99,235,0.04)' : '#fff',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => { if (!isCurrentDay) e.currentTarget.style.background = 'rgba(37,99,235,0.03)' }}
                onMouseLeave={e => { if (!isCurrentDay) e.currentTarget.style.background = '#fff' }}
              >
                <div style={{
                  fontSize: '0.8rem', fontWeight: isCurrentDay ? 800 : 600,
                  color: isCurrentDay ? C.royal : C.navy,
                  marginBottom: 4, fontFamily: C.display,
                }}>
                  {date.getDate()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {daySlots.slice(0, 3).map(s => (
                    <div key={s.id} style={{
                      padding: '2px 5px', borderRadius: 4, fontSize: '0.62rem', fontWeight: 600,
                      background: s.published ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                      color: s.published ? C.green : C.gold,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {s.start}-{s.end} {s.room}
                    </div>
                  ))}
                  {daySlots.length > 3 && (
                    <div style={{ fontSize: '0.6rem', color: C.text3, fontWeight: 600, paddingLeft: 2 }}>
                      +{daySlots.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Schedule Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, padding: '28px 32px',
            width: '90%', maxWidth: 420, boxShadow: '0 20px 60px rgba(15,23,42,0.2)',
            fontFamily: C.font,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: C.display, fontSize: '1.1rem', fontWeight: 700, color: C.navy, margin: 0 }}>
                Add Schedule
              </h3>
              <button
                onClick={() => { setShowModal(false); setSelectedDay(null) }}
                style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: C.text3, padding: '0 4px' }}
              >
                ✕
              </button>
            </div>

            {selectedInstructor === 'All Instructors' ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: C.coral, fontSize: '0.85rem', fontWeight: 600 }}>
                Please select a specific instructor first to add a schedule.
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: C.text3, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Instructor
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: C.navy, padding: '8px 12px', background: C.mist, borderRadius: 10 }}>
                    {selectedInstructor}
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: C.text3, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Day
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: C.navy, padding: '8px 12px', background: C.mist, borderRadius: 10 }}>
                    {selectedDay ? `${MONTHS[selectedDay.getMonth()]} ${selectedDay.getDate()}, ${selectedDay.getFullYear()} (${DAYS_SHORT[selectedDay.getDay()]})` : ''}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: C.text3, marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={newSlot.start}
                      onChange={e => setNewSlot({ ...newSlot, start: e.target.value })}
                      style={{
                        width: '100%', padding: '8px 10px', borderRadius: 10, border: `1.5px solid ${C.border2}`,
                        fontSize: '0.85rem', fontFamily: C.font, outline: 'none', background: '#fff', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: C.text3, marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      End Time
                    </label>
                    <input
                      type="time"
                      value={newSlot.end}
                      onChange={e => setNewSlot({ ...newSlot, end: e.target.value })}
                      style={{
                        width: '100%', padding: '8px 10px', borderRadius: 10, border: `1.5px solid ${C.border2}`,
                        fontSize: '0.85rem', fontFamily: C.font, outline: 'none', background: '#fff', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: C.text3, marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Room
                  </label>
                  <select
                    value={newSlot.room}
                    onChange={e => setNewSlot({ ...newSlot, room: e.target.value })}
                    style={{
                      width: '100%', padding: '8px 10px', borderRadius: 10, border: `1.5px solid ${C.border2}`,
                      fontSize: '0.85rem', fontFamily: C.font, outline: 'none', background: '#fff', boxSizing: 'border-box',
                    }}
                  >
                    {ROOM_LIST.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: C.text3, marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Status
                  </label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85rem', color: C.text2 }}>
                      <input
                        type="radio"
                        checked={newSlot.published === true}
                        onChange={() => setNewSlot({ ...newSlot, published: true })}
                      />
                      Published
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85rem', color: C.text2 }}>
                      <input
                        type="radio"
                        checked={newSlot.published === false}
                        onChange={() => setNewSlot({ ...newSlot, published: false })}
                      />
                      Draft
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => { setShowModal(false); setSelectedDay(null) }}
                    style={{
                      padding: '10px 20px', borderRadius: 10, border: `1.5px solid ${C.border2}`,
                      background: '#fff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                      color: C.text2, fontFamily: C.font,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSlot}
                    style={{
                      padding: '10px 20px', borderRadius: 10, border: 'none',
                      background: C.royal, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                      color: '#fff', fontFamily: C.font,
                    }}
                  >
                    Add Schedule
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}