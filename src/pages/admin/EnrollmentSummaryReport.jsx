import { useMemo, useState } from 'react'
import { fetchEnrollmentSummary } from '../../services/centralDb'

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

function EnrollmentSummaryReport({ isMobile = false, isTablet = false }) {
  const [period, setPeriod] = useState('monthly') // daily|monthly|quarterly|annual

  const data = useMemo(() => fetchEnrollmentSummary({ period }), [period])

  const totals = useMemo(() => {
    let newEnrollees = 0
    let reenrollees = 0
    const packageCounts = {}
    data.rows.forEach(r => {
      if (r.isReenrollment) reenrollees += 1
      else newEnrollees += 1
      packageCounts[r.packageName] = (packageCounts[r.packageName] || 0) + 1
    })
    const popular = Object.entries(packageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
    return { total: data.rows.length, newEnrollees, reenrollees, popular }
  }, [data.rows])

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

  return (
    <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: isMobile ? '14px' : '18px 20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: isMobile ? 'stretch' : 'center', marginBottom: '14px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: C.display, fontSize: '15px', fontWeight: 700, color: C.text }}>Enrollment summary report</div>
          <div style={{ fontSize: '12px', color: C.text3, marginTop: '2px' }}>
            Daily / monthly / quarterly / annual enrollment totals with trends and enrolled packages.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>Period</span>
          <select value={period} onChange={e => setPeriod(e.target.value)} style={{ ...selectBase, minWidth: '140px' }} aria-label="Enrollment period">
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annual">Annual</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
        {[
          { label: 'Total enrollees', value: totals.total },
          { label: 'New enrollees', value: totals.newEnrollees },
          { label: 'Re-enrollees', value: totals.reenrollees },
          { label: 'Popular package', value: totals.popular },
        ].map(s => (
          <div key={s.label} style={{ background: C.bg4, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '12px 14px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em' }}>{s.label}</div>
            <div style={{ fontFamily: C.display, fontSize: '22px', fontWeight: 700, color: C.text, marginTop: '2px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '12px', fontWeight: 700, color: C.text, marginBottom: '10px' }}>Enrollment trends (summary)</div>
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${C.border}`, marginBottom: '16px' }}>
        <table style={{ width: '100%', minWidth: isTablet ? '700px' : '820px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.bg4 }}>
              {['Period', 'Total', 'New', 'Re-enrollees', 'Top packages'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '10px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: `1px solid ${C.border}` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.series.map((s, idx) => {
              const top = Object.entries(s.packageCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 2)
                .map(([k, v]) => `${k} (${v})`)
                .join(', ') || '—'
              return (
                <tr key={s.periodKey} style={{ borderBottom: idx < data.series.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text2, fontWeight: 700 }}>{s.periodKey}</td>
                  <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text }}>{s.total}</td>
                  <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text2 }}>{s.newEnrollees}</td>
                  <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text2 }}>{s.reenrollees}</td>
                  <td style={{ padding: '11px 12px', fontSize: '12px', color: C.text2 }}>{top}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: '12px', fontWeight: 700, color: C.text, marginBottom: '10px' }}>Detailed enrollments</div>
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${C.border}` }}>
        <table style={{ width: '100%', minWidth: isTablet ? '760px' : '900px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.bg4 }}>
              {['Date', 'Student', 'Package', 'Type'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '10px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: `1px solid ${C.border}` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows
              .slice()
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((r, idx) => (
                <tr key={r.id} style={{ borderBottom: idx < data.rows.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text2 }}>{r.createdAt}</td>
                  <td style={{ padding: '11px 12px', fontSize: '13px', fontWeight: 600, color: C.text }}>{r.studentName}</td>
                  <td style={{ padding: '11px 12px', fontSize: '12px', color: C.text2 }}>{r.packageName}</td>
                  <td style={{ padding: '11px 12px', fontSize: '12px', color: r.isReenrollment ? C.accentL : C.text2, fontWeight: 600 }}>
                    {r.isReenrollment ? 'Re-enrollee' : 'New'}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default EnrollmentSummaryReport

