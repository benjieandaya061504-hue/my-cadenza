import { useState } from 'react'
import C from './theme.js'

const initialSlots = [
  { id: 1, instructor: 'Mr. Cruz', day: 'Mon', start: '09:00', end: '11:00', room: 'Studio A', published: true },
  { id: 2, instructor: 'Ms. Lim', day: 'Mon', start: '10:00', end: '12:00', room: 'Studio B', published: true },
  { id: 3, instructor: 'Mr. Cruz', day: 'Tue', start: '14:00', end: '17:00', room: 'Studio A', published: false },
  { id: 4, instructor: 'Ms. Reyes', day: 'Wed', start: '08:00', end: '10:00', room: 'Studio D', published: true },
  { id: 5, instructor: 'Ms. Tan', day: 'Thu', start: '13:00', end: '16:00', room: 'Studio B', published: true },
  { id: 6, instructor: 'Mr. Reyes', day: 'Fri', start: '09:00', end: '12:00', room: 'Studio C', published: false },
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function ScheduleManagement({ isMobile, isTablet }) {
  const [dayFilter, setDayFilter] = useState('All')

  const filtered = dayFilter === 'All' ? initialSlots : initialSlots.filter(s => s.day === dayFilter)

  return (
    <div style={{ fontFamily: C.font }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: C.display, fontSize: '1.3rem', fontWeight: 700, color: C.navy, margin: 0 }}>Schedule Management</h2>
          <p style={{ fontSize: '0.8rem', color: C.text3, marginTop: 2 }}>{filtered.length} slots</p>
        </div>
        <select
          value={dayFilter}
          onChange={e => setDayFilter(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: 10, border: `1.5px solid ${C.border2}`,
            fontSize: '0.8rem', fontFamily: C.font, outline: 'none', background: '#fff',
          }}
        >
          <option value="All">All Days</option>
          {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.mist }}>
                {['Instructor', 'Day', 'Time', 'Room', 'Status'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', fontSize: '0.7rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '12px 14px', fontSize: '0.85rem', fontWeight: 600, color: C.navy }}>{s.instructor}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>{s.day}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>{s.start} - {s.end}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>{s.room}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '3px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
                      background: s.published ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                      color: s.published ? C.green : C.gold,
                    }}>{s.published ? 'Published' : 'Draft'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}