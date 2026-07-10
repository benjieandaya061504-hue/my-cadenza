import { useMemo, useState } from 'react'
import { fetchAttendanceAndCompletion } from '../../services/centralDb'

const C = {
  bg3: '#1a1c24',
  bg4: '#1f2130',
  border: 'rgba(255,255,255,0.07)',
  text: '#f0eff4',
  text2: '#9b99a8',
  text3: '#5a5870',
  gold: '#fbbf24',
  green: '#34d399',
  coral: '#f87171',
  teal: '#2dd4bf',
  font: "'Outfit', sans-serif",
  display: "'Syne', sans-serif",
  mono: "'Space Mono', monospace",
}

function AttendanceReport({ isMobile = false, isTablet = false }) {
  const [view, setView] = useState('student') // student|instructor
  const data = useMemo(() => fetchAttendanceAndCompletion(), [])

  const byStudent = useMemo(() => {
    const map = new Map()
    for (const s of data.sessions) {
      const k = s.studentId
      const prev = map.get(k) || { id: s.studentId, name: s.studentName, attended: 0, missed: 0, rescheduled: 0 }
      if (s.status === 'attended') prev.attended += 1
      else if (s.status === 'missed') prev.missed += 1
      else prev.rescheduled += 1
      map.set(k, prev)
    }
    const remainingByStudent = Object.fromEntries(
      data.progress.map(p => [p.studentId, Math.max(0, (p.totalSessions || 0) - (p.completedSessions || 0))]),
    )
    return Array.from(map.values()).map(r => ({ ...r, remaining: remainingByStudent[r.id] ?? 0 }))
  }, [data])

  const byInstructor = useMemo(() => {
    const map = new Map()
    for (const s of data.sessions) {
      const k = s.instructorId
      const prev = map.get(k) || { id: s.instructorId, name: s.instructorName, attended: 0, missed: 0, rescheduled: 0 }
      if (s.status === 'attended') prev.attended += 1
      else if (s.status === 'missed') prev.missed += 1
      else prev.rescheduled += 1
      map.set(k, prev)
    }
    const remainingByInstructor = new Map()
    for (const p of data.progress) {
      const rem = Math.max(0, (p.totalSessions || 0) - (p.completedSessions || 0))
      remainingByInstructor.set(p.instructorId, (remainingByInstructor.get(p.instructorId) || 0) + rem)
    }
    return Array.from(map.values()).map(r => ({ ...r, remaining: remainingByInstructor.get(r.id) || 0 }))
  }, [data])

  const rows = view === 'student' ? byStudent : byInstructor

  const tabBtn = (id, label) => {
    const on = view === id
    return (
      <button
        type="button"
        onClick={() => setView(id)}
        style={{
          padding: '8px 16px',
          borderRadius: '10px',
          border: on ? `1px solid rgba(124,106,247,0.4)` : `1px solid ${C.border}`,
          background: on ? 'rgba(124,106,247,0.14)' : 'transparent',
          color: on ? '#a99cf9' : C.text2,
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

  return (
    <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: isMobile ? '14px' : '18px 20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: isMobile ? 'stretch' : 'center', marginBottom: '14px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: C.display, fontSize: '15px', fontWeight: 700, color: C.text }}>Attendance & lesson completion report</div>
          <div style={{ fontSize: '12px', color: C.text3, marginTop: '2px' }}>
            Attended, missed, rescheduled, and remaining sessions (viewable per student or instructor).
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {tabBtn('student', 'Per student')}
          {tabBtn('instructor', 'Per instructor')}
        </div>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${C.border}` }}>
        <table style={{ width: '100%', minWidth: isTablet ? '720px' : '880px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.bg4 }}>
              {[
                view === 'student' ? 'Student' : 'Instructor',
                'Attended',
                'Missed',
                'Rescheduled',
                'Remaining sessions',
              ].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '10px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: `1px solid ${C.border}` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.id} style={{ borderBottom: idx < rows.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <td style={{ padding: '11px 12px', fontSize: '13px', fontWeight: 600, color: C.text }}>{r.name}</td>
                <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.green, fontWeight: 700 }}>{r.attended}</td>
                <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.coral, fontWeight: 700 }}>{r.missed}</td>
                <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.gold, fontWeight: 700 }}>{r.rescheduled}</td>
                <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: r.remaining > 0 ? C.teal : C.text3, fontWeight: 800 }}>{r.remaining}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AttendanceReport

