import { useState } from 'react'
import C from '../admin/theme.js'

export default function FrontDeskSchedule({ isMobile, isTablet }) {
  const [view, setView] = useState('daily')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [schedule, setSchedule] = useState([
    { id: 1, time: '09:00', student: 'Ana Reyes', instructor: 'Mr. Cruz', room: 'Studio A', instrument: 'Guitar', status: 'ongoing' },
    { id: 2, time: '10:00', student: 'Marco Santos', instructor: 'Ms. Lim', room: 'Studio B', instrument: 'Piano', status: 'upcoming' },
    { id: 3, time: '11:00', student: 'Pia Gomez', instructor: 'Mr. Cruz', room: 'Studio A', instrument: 'Guitar', status: 'upcoming' },
    { id: 4, time: '13:00', student: 'Luis Tan', instructor: 'Ms. Reyes', room: 'Studio C', instrument: 'Drums', status: 'pending' },
    { id: 5, time: '14:00', student: 'Sofia Del', instructor: 'Mr. Bautista', room: 'Studio B', instrument: 'Voice', status: 'upcoming' },
    { id: 6, time: '15:00', student: 'Carlos Tan', instructor: 'Ms. Lim', room: 'Studio B', instrument: 'Piano', status: 'pending' },
    { id: 7, time: '16:00', student: 'Maria Cruz', instructor: 'Mr. Cruz', room: 'Studio A', instrument: 'Guitar', status: 'pending' },
  ])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [newLesson, setNewLesson] = useState({ time: '', student: '', instructor: '', room: '', instrument: '', status: 'pending' })

  const statusColors = {
    ongoing: { bg: 'rgba(16,185,129,0.1)', c: C.green, label: 'Live' },
    upcoming: { bg: 'rgba(37,99,235,0.1)', c: C.royal, label: 'Up Next' },
    pending: { bg: 'rgba(245,158,11,0.1)', c: C.gold, label: 'Pending' },
  }

  const handleEdit = (id) => {
    const lesson = schedule.find(s => s.id === id)
    setSelectedLesson(lesson)
    setNewLesson(lesson)
    setShowEditModal(true)
  }

  const handleDelete = (id) => {
    setSchedule(schedule.filter(s => s.id !== id))
  }

  const handleAddLesson = () => {
    setNewLesson({ time: '', student: '', instructor: '', room: '', instrument: '', status: 'pending' })
    setShowAddModal(true)
  }

  const handleSaveLesson = () => {
    if (showEditModal) {
      setSchedule(schedule.map(s => s.id === selectedLesson.id ? { ...newLesson, id: selectedLesson.id } : s))
    } else {
      setSchedule([...schedule, { ...newLesson, id: Math.max(...schedule.map(s => s.id)) + 1 }])
    }
    setShowAddModal(false)
    setShowEditModal(false)
    setSelectedLesson(null)
    setNewLesson({ time: '', student: '', instructor: '', room: '', instrument: '', status: 'pending' })
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setShowEditModal(false)
    setSelectedLesson(null)
    setNewLesson({ time: '', student: '', instructor: '', room: '', instrument: '', status: 'pending' })
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    background: C.mist, border: `1px solid ${C.border2}`,
    color: C.text, fontFamily: C.font, fontSize: '0.82rem',
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ fontFamily: C.font }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: C.display, fontSize: '1.3rem', fontWeight: 700, color: C.navy, margin: '0 0 4px' }}>Lesson Schedule</h2>
        <p style={{ fontSize: '0.8rem', color: C.text3, margin: 0 }}>Create and manage lesson schedules with instructors and studio rooms</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {['daily', 'weekly', 'monthly'].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: '8px 16px', borderRadius: 20, border: `1px solid ${view === v ? C.royal : C.border2}`,
            background: view === v ? 'rgba(37,99,235,0.08)' : '#fff',
            color: view === v ? C.royal : C.text2,
            cursor: 'pointer', fontSize: '0.78rem', fontFamily: C.font, fontWeight: 500, textTransform: 'capitalize',
            transition: 'all 0.15s ease',
          }}>{v} View</button>
        ))}
        <button onClick={handleAddLesson} style={{
          marginLeft: 'auto', padding: '8px 16px', borderRadius: 10, border: 'none',
          background: `linear-gradient(135deg, ${C.royal}, ${C.purple})`, color: '#fff',
          cursor: 'pointer', fontSize: '0.78rem', fontFamily: C.font, fontWeight: 600,
        }}>+ Add Lesson</button>
      </div>

      <div style={{
        background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`,
        padding: '1.3rem', boxShadow: '0 4px 12px rgba(30,41,59,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: C.display, fontSize: '0.9rem', fontWeight: 700, color: C.navy }}>
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div style={{ flex: 1, height: 1, background: C.border, margin: '0 14px' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.border2}`, background: '#fff', color: C.text2, cursor: 'pointer', fontSize: '0.7rem', fontFamily: C.font }}>← Previous</button>
            <button style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.border2}`, background: '#fff', color: C.text2, cursor: 'pointer', fontSize: '0.7rem', fontFamily: C.font }}>Next →</button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Time', 'Student', 'Instructor', 'Room', 'Instrument', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '10px 12px', fontSize: '0.65rem', fontWeight: 600,
                    color: C.text3, fontFamily: C.font, textTransform: 'uppercase',
                    letterSpacing: '.1em', borderBottom: `1px solid ${C.border}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedule.map((s, i) => {
                const sc = statusColors[s.status]
                return (
                  <tr key={s.id} style={{ borderBottom: i < schedule.length - 1 ? `1px solid ${C.border}` : 'none', transition: 'background 0.15s ease' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '13px 12px', fontFamily: C.display, fontSize: '0.78rem', color: s.status === 'ongoing' ? C.green : C.navy, fontWeight: 700 }}>{s.time}</td>
                    <td style={{ padding: '13px 12px', fontSize: '0.82rem', fontFamily: C.font, color: C.text, fontWeight: 500 }}>{s.student}</td>
                    <td style={{ padding: '13px 12px', fontSize: '0.75rem', fontFamily: C.font, color: C.text2 }}>{s.instructor}</td>
                    <td style={{ padding: '13px 12px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px 10px', borderRadius: 8, background: C.mist, border: `1px solid ${C.border}`, fontSize: '0.7rem', fontFamily: C.font, color: C.text2 }}>{s.room}</span>
                    </td>
                    <td style={{ padding: '13px 12px', fontSize: '0.75rem', fontFamily: C.font, color: C.text2 }}>{s.instrument}</td>
                    <td style={{ padding: '13px 12px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600, background: sc.bg, color: sc.c, fontFamily: C.font }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc.c }} />
                        {sc.label}
                      </span>
                    </td>
                    <td style={{ padding: '13px 12px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleEdit(s.id)} style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${C.border2}`, background: '#fff', color: C.text2, cursor: 'pointer', fontSize: '0.7rem', fontFamily: C.font }}>Edit</button>
                        <button onClick={() => handleDelete(s.id)} style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid rgba(248,113,113,0.3)`, background: 'rgba(248,113,113,0.08)', color: C.coral, cursor: 'pointer', fontSize: '0.7rem', fontFamily: C.font }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {(showAddModal || showEditModal) && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, maxWidth: 450, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(15,23,42,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: C.display, fontSize: '1.1rem', fontWeight: 700, color: C.navy, margin: 0 }}>{showEditModal ? 'Edit Lesson' : 'Add Lesson'}</h3>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: C.text3, fontSize: '1.5rem', cursor: 'pointer', padding: '0 4px' }}>×</button>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: 6 }}>Time</label>
                <input type="text" value={newLesson.time} onChange={e => setNewLesson({ ...newLesson, time: e.target.value })} placeholder="HH:MM" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: 6 }}>Student</label>
                <input type="text" value={newLesson.student} onChange={e => setNewLesson({ ...newLesson, student: e.target.value })} placeholder="Student name" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: 6 }}>Instructor</label>
                <input type="text" value={newLesson.instructor} onChange={e => setNewLesson({ ...newLesson, instructor: e.target.value })} placeholder="Instructor name" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: 6 }}>Room</label>
                <input type="text" value={newLesson.room} onChange={e => setNewLesson({ ...newLesson, room: e.target.value })} placeholder="Studio room" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: 6 }}>Instrument</label>
                <input type="text" value={newLesson.instrument} onChange={e => setNewLesson({ ...newLesson, instrument: e.target.value })} placeholder="Instrument" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: 6 }}>Status</label>
                <select value={newLesson.status} onChange={e => setNewLesson({ ...newLesson, status: e.target.value })} style={inputStyle}>
                  <option value="pending">Pending</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={handleSaveLesson} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${C.royal}, ${C.purple})`, color: '#fff', cursor: 'pointer', fontSize: '0.82rem', fontFamily: C.font, fontWeight: 600 }}>Save</button>
              <button onClick={handleCloseModal} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${C.border2}`, background: '#fff', color: C.text2, cursor: 'pointer', fontSize: '0.82rem', fontFamily: C.font, fontWeight: 500 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}