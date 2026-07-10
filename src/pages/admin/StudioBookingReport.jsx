import { useMemo } from 'react'
import { fetchStudioBookingReport } from '../../services/centralDb'

const C = {
  bg3: '#1a1c24',
  bg4: '#1f2130',
  border: 'rgba(255,255,255,0.07)',
  text: '#f0eff4',
  text2: '#9b99a8',
  text3: '#5a5870',
  gold: '#fbbf24',
  teal: '#2dd4bf',
  accentL: '#a99cf9',
  font: "'Outfit', sans-serif",
  display: "'Syne', sans-serif",
  mono: "'Space Mono', monospace",
}

function StudioBookingReport({ isMobile = false, isTablet = false }) {
  const rows = useMemo(() => fetchStudioBookingReport(), [])

  const summary = useMemo(() => {
    const totalBookings = rows.length
    const totalDurationMinutes = rows.reduce((s, r) => s + (Number(r.durationMinutes) || 0), 0)

    const byRoom = new Map()
    const byDate = new Map()
    rows.forEach(r => {
      byRoom.set(r.room, (byRoom.get(r.room) || 0) + 1)
      byDate.set(r.date, (byDate.get(r.date) || 0) + 1)
    })

    const mostUsedRoom = Array.from(byRoom.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
    const peakBookingTime = Array.from(byDate.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

    return { totalBookings, totalDurationMinutes, mostUsedRoom, peakBookingTime }
  }, [rows])

  const minutesToLabel = m => {
    const mm = Number(m) || 0
    if (mm % 60 === 0) return `${mm / 60} hr`
    return `${mm} min`
  }

  return (
    <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: isMobile ? '14px' : '18px 20px' }}>
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontFamily: C.display, fontSize: '15px', fontWeight: 700, color: C.text }}>Studio booking report</div>
        <div style={{ fontSize: '12px', color: C.text3, marginTop: '2px' }}>
          Booking frequency, rental duration, client information, room availability trends, and peak usage indicators.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
        {[
          { label: 'Bookings', value: summary.totalBookings, c: C.text },
          { label: 'Total duration', value: minutesToLabel(summary.totalDurationMinutes), c: C.teal },
          { label: 'Most-used room', value: summary.mostUsedRoom, c: C.accentL },
          { label: 'Peak booking time', value: summary.peakBookingTime, c: C.gold },
        ].map(s => (
          <div key={s.label} style={{ background: C.bg4, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '12px 14px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em' }}>{s.label}</div>
            <div style={{ fontFamily: C.display, fontSize: '22px', fontWeight: 700, color: s.c, marginTop: '2px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '12px', fontWeight: 700, color: C.text, marginBottom: '10px' }}>Studio bookings (detailed)</div>
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${C.border}` }}>
        <table style={{ width: '100%', minWidth: isTablet ? '720px' : '900px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.bg4 }}>
              {['Date', 'Room', 'Client', 'Rental duration', 'Booking frequency (room)'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '10px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: `1px solid ${C.border}` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => {
              const freqRoom = rows.filter(x => x.room === r.room).length
              return (
                <tr key={r.id} style={{ borderBottom: idx < rows.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text2 }}>{r.date}</td>
                  <td style={{ padding: '11px 12px', fontSize: '13px', fontWeight: 700, color: C.text }}>{r.room}</td>
                  <td style={{ padding: '11px 12px', fontSize: '12px', color: C.text2 }}>{r.clientName}</td>
                  <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.teal, fontWeight: 700 }}>{minutesToLabel(r.durationMinutes)}</td>
                  <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.gold, fontWeight: 700 }}>{freqRoom}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StudioBookingReport

