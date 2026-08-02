import { useState } from 'react'
import C from './theme.js'

const initialData = [
  { id: 1, name: 'Ana Reyes', instrument: 'Guitar', level: 'Intermediate', instructor: 'Ms. Tan', status: 'Active', enrolled: '2026-01-15' },
  { id: 2, name: 'Marco Santos', instrument: 'Piano', level: 'Beginner', instructor: 'Mr. Cruz', status: 'Active', enrolled: '2026-02-01' },
  { id: 3, name: 'Luis Tan', instrument: 'Drums', level: 'Advanced', instructor: 'Mr. Reyes', status: 'Active', enrolled: '2025-11-10' },
  { id: 4, name: 'Pia Santos', instrument: 'Violin', level: 'Intermediate', instructor: 'Ms. Gomez', status: 'Active', enrolled: '2026-03-05' },
  { id: 5, name: 'Carla Cruz', instrument: 'Voice', level: 'Beginner', instructor: 'Mr. Cruz', status: 'Inactive', enrolled: '2026-01-20' },
  { id: 6, name: 'Ben Torres', instrument: 'Bass', level: 'Intermediate', instructor: 'Ms. Tan', status: 'Active', enrolled: '2026-04-01' },
  { id: 7, name: 'Sofia Ramirez', instrument: 'Piano', level: 'Advanced', instructor: 'Mr. Cruz', status: 'Active', enrolled: '2025-09-15' },
  { id: 8, name: 'Diego Garcia', instrument: 'Guitar', level: 'Beginner', instructor: 'Ms. Tan', status: 'Pending', enrolled: '2026-05-10' },
]

export default function EnrolledStudents({ isMobile, isTablet }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const filtered = initialData.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.instrument.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || s.status === filter
    return matchSearch && matchFilter
  })

  const statusStyle = status => {
    switch (status) {
      case 'Active': return { bg: 'rgba(16,185,129,0.1)', c: C.green }
      case 'Inactive': return { bg: 'rgba(148,163,184,0.1)', c: C.text3 }
      case 'Pending': return { bg: 'rgba(245,158,11,0.1)', c: C.gold }
      default: return { bg: 'rgba(148,163,184,0.1)', c: C.text3 }
    }
  }

  return (
    <div style={{ fontFamily: C.font }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: C.display, fontSize: '1.3rem', fontWeight: 700, color: C.navy, margin: 0 }}>Enrolled Students</h2>
          <p style={{ fontSize: '0.8rem', color: C.text3, marginTop: 2 }}>{filtered.length} students</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder="Search students..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${C.border2}`,
              fontSize: '0.8rem', fontFamily: C.font, outline: 'none', width: 200,
            }}
          />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{
              padding: '8px 12px', borderRadius: 10, border: `1.5px solid ${C.border2}`,
              fontSize: '0.8rem', fontFamily: C.font, outline: 'none', background: '#fff',
            }}
          >
            {['All', 'Active', 'Inactive', 'Pending'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.mist }}>
                {['Student', 'Instrument', 'Level', 'Instructor', 'Status', 'Enrolled'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', fontSize: '0.7rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const ss = statusStyle(s.status)
                return (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '12px 14px', fontSize: '0.85rem', fontWeight: 600, color: C.navy }}>{s.name}</td>
                    <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>{s.instrument}</td>
                    <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>{s.level}</td>
                    <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>{s.instructor}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600, background: ss.bg, color: ss.c }}>{s.status}</span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: C.text3 }}>{s.enrolled}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}