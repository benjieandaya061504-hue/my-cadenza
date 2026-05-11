import { useMemo } from 'react'
import { fetchInstrumentUsageReport } from '../../services/centralDb'

const C = {
  bg3: '#1a1c24',
  bg4: '#1f2130',
  border: 'rgba(255,255,255,0.07)',
  text: '#f0eff4',
  text2: '#9b99a8',
  text3: '#5a5870',
  teal: '#2dd4bf',
  coral: '#f87171',
  gold: '#fbbf24',
  green: '#34d399',
  font: "'Outfit', sans-serif",
  display: "'Syne', sans-serif",
  mono: "'Space Mono', monospace",
}

function InstrumentUsageReport({ isMobile = false, isTablet = false }) {
  const rows = useMemo(() => fetchInstrumentUsageReport(), [])

  const totals = useMemo(() => {
    const totalInstruments = rows.length
    const maintenanceActivities = rows.reduce((s, r) => s + (Number(r.maintenanceActivities) || 0), 0)
    const inRepair = rows.filter(r => r.repairStatus && r.repairStatus !== 'None').length
    const disposed = rows.filter(r => r.disposalStatus && r.disposalStatus !== 'Active').length
    return { totalInstruments, maintenanceActivities, inRepair, disposed }
  }, [rows])

  const availabilityColor = a => {
    if (a === 'Available') return C.green
    if (a === 'Limited') return C.gold
    return C.coral
  }

  return (
    <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: isMobile ? '14px' : '18px 20px' }}>
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontFamily: C.display, fontSize: '15px', fontWeight: 700, color: C.text }}>Instrument usage report</div>
        <div style={{ fontSize: '12px', color: C.text3, marginTop: '2px' }}>
          Availability, usage (lessons / studio bookings / rentals), condition, maintenance activities, repair status, disposal status.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
        {[
          { label: 'Instruments', value: totals.totalInstruments, c: C.text },
          { label: 'Maintenance activities', value: totals.maintenanceActivities, c: C.teal },
          { label: 'Repair status (non-none)', value: totals.inRepair, c: C.gold },
          { label: 'Disposal (non-active)', value: totals.disposed, c: C.coral },
        ].map(s => (
          <div key={s.label} style={{ background: C.bg4, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '12px 14px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em' }}>{s.label}</div>
            <div style={{ fontFamily: C.display, fontSize: '22px', fontWeight: 700, color: s.c, marginTop: '2px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${C.border}` }}>
        <table style={{ width: '100%', minWidth: isTablet ? '860px' : '1040px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.bg4 }}>
              {[
                'Instrument',
                'Availability',
                'Lessons',
                'Studio bookings',
                'Rentals',
                'Condition',
                'Maintenance',
                'Repair status',
                'Disposal status',
              ].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '10px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: `1px solid ${C.border}` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.instrumentId} style={{ borderBottom: idx < rows.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <td style={{ padding: '11px 12px', fontSize: '13px', fontWeight: 700, color: C.text }}>{r.instrumentName}</td>
                <td style={{ padding: '11px 12px', fontSize: '12px', color: availabilityColor(r.availability), fontWeight: 800 }}>{r.availability}</td>
                <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text2 }}>{r.usedInLessons}</td>
                <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text2 }}>{r.usedInStudioBookings}</td>
                <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text2 }}>{r.usedInRentals}</td>
                <td style={{ padding: '11px 12px', fontSize: '12px', color: C.text2 }}>{r.condition}</td>
                <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.teal, fontWeight: 700 }}>{r.maintenanceActivities}</td>
                <td style={{ padding: '11px 12px', fontSize: '12px', color: r.repairStatus !== 'None' ? C.gold : C.text3, fontWeight: 700 }}>{r.repairStatus}</td>
                <td style={{ padding: '11px 12px', fontSize: '12px', color: r.disposalStatus !== 'Active' ? C.coral : C.text2, fontWeight: 700 }}>{r.disposalStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default InstrumentUsageReport

