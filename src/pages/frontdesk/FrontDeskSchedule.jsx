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
    ongoing: { bg: 'rgba(52,211,153,0.12)', c: C.green, label: 'Live' },
    upcoming: { bg: 'rgba(124,106,247,0.12)', c: C.accentL, label: 'Up Next' },
    pending: { bg: 'rgba(251,191,36,0.12)', c: C.gold, label: 'Pending' },
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

  return (
    <>
      <style>{css}</style>
      <div style={{ fontFamily: C.font }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: C.display, fontSize: isMobile ? '24px' : '30px', fontWeight: 800, color: C.text, letterSpacing: '-0.02em', marginBottom: '8px' }}>Lesson Schedule</h1>
          <p style={{ color: C.text3, fontSize: '13px' }}>Create and manage lesson schedules with instructors and studio rooms</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['daily', 'weekly', 'monthly'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="btn"
              style={{
                padding: '8px 16px', borderRadius: '20px', border: `1px solid ${view === v ? C.accent : C.border}`,
                background: view === v ? 'rgba(124,106,247,0.15)' : C.bg3,
                color: view === v ? C.accentL : C.text2,
                cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 500, textTransform: 'capitalize',
              }}
            >
              {v} View
            </button>
          ))}
          <button onClick={handleAddLesson} className="btn" style={{ marginLeft: 'auto', padding: '8px 16px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: '#fff', cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 600 }}>
            + Add Lesson
          </button>
        </div>

        <div className="card" style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontFamily: C.display, fontSize: '15px', fontWeight: 700, color: C.text }}>
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div style={{ flex: 1, height: '1px', background: C.border, margin: '0 14px' }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn" style={{ padding: '6px 12px', borderRadius: '8px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '11px', fontFamily: C.font }}>
                ← Previous
              </button>
              <button className="btn" style={{ padding: '6px 12px', borderRadius: '8px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '11px', fontFamily: C.font }}>
                Next →
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Time', 'Student', 'Instructor', 'Room', 'Instrument', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '10px', fontWeight: 600, color: C.text3, fontFamily: C.font, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedule.map((s, i) => {
                  const sc = statusColors[s.status]
                  return (
                    <tr key={s.id} className="row" style={{ borderBottom: i < schedule.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                      <td style={{ padding: '13px 12px', fontFamily: C.mono, fontSize: '12px', color: s.status === 'ongoing' ? C.green : C.text, fontWeight: 700 }}>{s.time}</td>
                      <td style={{ padding: '13px 12px', fontSize: '13px', fontFamily: C.font, color: C.text, fontWeight: 500 }}>{s.student}</td>
                      <td style={{ padding: '13px 12px', fontSize: '12px', fontFamily: C.font, color: C.text2 }}>{s.instructor}</td>
                      <td style={{ padding: '13px 12px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px 10px', borderRadius: '8px', background: C.bg4, border: `1px solid ${C.border}`, fontSize: '11px', fontFamily: C.font, color: C.text2 }}>{s.room}</span>
                      </td>
                      <td style={{ padding: '13px 12px', fontSize: '12px', fontFamily: C.font, color: C.text2 }}>{s.instrument}</td>
                      <td style={{ padding: '13px 12px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: sc.bg, color: sc.c, fontFamily: C.font }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: sc.c }} />
                          {sc.label}
                        </span>
                      </td>
                      <td style={{ padding: '13px 12px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleEdit(s.id)} className="btn" style={{ padding: '4px 8px', borderRadius: '6px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '11px', fontFamily: C.font }}>
                            Edit
                          </button>
                          <button onClick={() => handleDelete(s.id)} className="btn" style={{ padding: '4px 8px', borderRadius: '6px', border: `1px solid rgba(248,113,113,0.3)`, background: 'rgba(248,113,113,0.1)', color: C.coral, cursor: 'pointer', fontSize: '11px', fontFamily: C.font }}>
                            Delete
                          </button>
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
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '24px', maxWidth: '450px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: C.display, fontSize: '18px', fontWeight: 700, color: C.text }}>{showEditModal ? 'Edit Lesson' : 'Add Lesson'}</h2>
                <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: C.text2, fontSize: '24px', cursor: 'pointer', padding: '4px' }}>×</button>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: '6px' }}>Time</label>
                  <input
                    type="text"
                    value={newLesson.time}
                    onChange={e => setNewLesson({ ...newLesson, time: e.target.value })}
                    placeholder="HH:MM"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.mono, fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: '6px' }}>Student</label>
                  <input
                    type="text"
                    value={newLesson.student}
                    onChange={e => setNewLesson({ ...newLesson, student: e.target.value })}
                    placeholder="Student name"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.font, fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: '6px' }}>Instructor</label>
                  <input
                    type="text"
                    value={newLesson.instructor}
                    onChange={e => setNewLesson({ ...newLesson, instructor: e.target.value })}
                    placeholder="Instructor name"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.font, fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: '6px' }}>Room</label>
                  <input
                    type="text"
                    value={newLesson.room}
                    onChange={e => setNewLesson({ ...newLesson, room: e.target.value })}
                    placeholder="Studio room"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.font, fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: '6px' }}>Instrument</label>
                  <input
                    type="text"
                    value={newLesson.instrument}
                    onChange={e => setNewLesson({ ...newLesson, instrument: e.target.value })}
                    placeholder="Instrument"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.font, fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: '6px' }}>Status</label>
                  <select
                    value={newLesson.status}
                    onChange={e => setNewLesson({ ...newLesson, status: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.font, fontSize: '13px', outline: 'none' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                <button onClick={handleSaveLesson} className="btn" style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: '#fff', cursor: 'pointer', fontSize: '13px', fontFamily: C.font, fontWeight: 600 }}>
                  Save
                </button>
                <button onClick={handleCloseModal} className="btn" style={{ flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '13px', fontFamily: C.font, fontWeight: 500 }}>
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

