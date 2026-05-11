import { useMemo } from 'react'
import { fetchInstructorAssignmentReport } from '../../services/centralDb'

const C = {
  bg3: '#1a1c24',
  bg4: '#1f2130',
  border: 'rgba(255,255,255,0.07)',
  text: '#f0eff4',
  text2: '#9b99a8',
  text3: '#5a5870',
  accentL: '#a99cf9',
  font: "'Outfit', sans-serif",
  display: "'Syne', sans-serif",
  mono: "'Space Mono', monospace",
}

function InstructorAssignmentReport({ isMobile = false, isTablet = false }) {
  const data = useMemo(() => fetchInstructorAssignmentReport(), [])

  const totals = useMemo(() => {
    const instructors = data.workloads.length
    const assignedStudents = data.workloads.reduce((s, r) => s + (Number(r.assignedStudents) || 0), 0)
    const scheduledSessions = data.workloads.reduce((s, r) => s + (Number(r.scheduledSessions) || 0), 0)
    const studioAllocations = data.workloads.reduce((s, r) => s + (Number(r.studioAllocations) || 0), 0)
    return { instructors, assignedStudents, scheduledSessions, studioAllocations }
  }, [data])

  return (
    <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: isMobile ? '14px' : '18px 20px' }}>
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontFamily: C.display, fontSize: '15px', fontWeight: 700, color: C.text }}>Instructor assignment report</div>
        <div style={{ fontSize: '12px', color: C.text3, marginTop: '2px' }}>
          Instructor workloads, assigned students, scheduled sessions, and studio allocations.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
        {[
          { label: 'Instructors', value: totals.instructors },
          { label: 'Assigned students', value: totals.assignedStudents },
          { label: 'Scheduled sessions', value: totals.scheduledSessions },
          { label: 'Studio allocations', value: totals.studioAllocations },
        ].map(s => (
          <div key={s.label} style={{ background: C.bg4, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '12px 14px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em' }}>{s.label}</div>
            <div style={{ fontFamily: C.display, fontSize: '22px', fontWeight: 700, color: C.text, marginTop: '2px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '12px', fontWeight: 700, color: C.text, marginBottom: '10px' }}>Instructor workloads (detailed)</div>
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${C.border}`, marginBottom: '16px' }}>
        <table style={{ width: '100%', minWidth: isTablet ? '720px' : '860px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.bg4 }}>
              {['Instructor', 'Assigned students', 'Scheduled sessions', 'Studio allocations'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '10px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: `1px solid ${C.border}` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.workloads.map((w, idx) => (
              <tr key={w.instructorId} style={{ borderBottom: idx < data.workloads.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <td style={{ padding: '11px 12px', fontSize: '13px', fontWeight: 700, color: C.text }}>{w.instructorName}</td>
                <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text2 }}>{w.assignedStudents}</td>
                <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text2 }}>{w.scheduledSessions}</td>
                <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.accentL, fontWeight: 700 }}>{w.studioAllocations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: '12px', fontWeight: 700, color: C.text, marginBottom: '10px' }}>Scheduled sessions (detailed)</div>
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${C.border}` }}>
        <table style={{ width: '100%', minWidth: isTablet ? '760px' : '900px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.bg4 }}>
              {['Date', 'Time', 'Instructor', 'Student', 'Studio allocation'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '10px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: `1px solid ${C.border}` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.scheduledSessions.map((s, idx) => (
              <tr key={s.id} style={{ borderBottom: idx < data.scheduledSessions.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text2 }}>{s.date}</td>
                <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text2 }}>{s.time}</td>
                <td style={{ padding: '11px 12px', fontSize: '13px', fontWeight: 600, color: C.text }}>{s.instructorName}</td>
                <td style={{ padding: '11px 12px', fontSize: '12px', color: C.text2 }}>{s.studentName}</td>
                <td style={{ padding: '11px 12px', fontSize: '12px', color: C.text2 }}>{s.studioRoom}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default InstructorAssignmentReport

