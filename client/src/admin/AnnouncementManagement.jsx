import { useState } from 'react'
import C from './theme.js'

const initialAnnouncements = [
  { id: 1, title: 'Holiday schedule – No lessons on May 20', audience: 'Students', urgency: 'Reminder', status: 'Sent', date: '2026-05-09' },
  { id: 2, title: 'Front desk opening moved to 9:30 AM', audience: 'Frontdesk', urgency: 'Urgent', status: 'Sent', date: '2026-05-08' },
  { id: 3, title: 'Recital preparation guidelines', audience: 'Everyone', urgency: 'Info', status: 'Draft', date: '2026-05-07' },
  { id: 4, title: 'Payment deadline extended', audience: 'Students', urgency: 'Reminder', status: 'Scheduled', date: '2026-05-10' },
]

export default function AnnouncementManagement({ isMobile, isTablet }) {
  const [filter, setFilter] = useState('All')
  const filtered = filter === 'All' ? initialAnnouncements : initialAnnouncements.filter(a => a.status === filter)

  return (
    <div style={{ fontFamily: C.font }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: C.display, fontSize: '1.3rem', fontWeight: 700, color: C.navy, margin: 0 }}>Announcements</h2>
          <p style={{ fontSize: '0.8rem', color: C.text3, marginTop: 2 }}>{filtered.length} announcements</p>
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 10, border: `1.5px solid ${C.border2}`, fontSize: '0.8rem', fontFamily: C.font, outline: 'none', background: '#fff' }}>
          {['All', 'Draft', 'Scheduled', 'Sent'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: C.mist }}>
              {['Title', 'Audience', 'Urgency', 'Status', 'Date'].map(h => (
                <th key={h} style={{ padding: '12px 14px', fontSize: '0.7rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(a => {
                const urgColor = a.urgency === 'Urgent' ? C.coral : a.urgency === 'Reminder' ? C.gold : C.royal
                return (
                  <tr key={a.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '12px 14px', fontSize: '0.85rem', fontWeight: 600, color: C.navy }}>{a.title}</td>
                    <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>{a.audience}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600, background: urgColor + '15', color: urgColor }}>{a.urgency}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
                        background: a.status === 'Sent' ? 'rgba(16,185,129,0.1)' : a.status === 'Scheduled' ? 'rgba(37,99,235,0.1)' : 'rgba(148,163,184,0.1)',
                        color: a.status === 'Sent' ? C.green : a.status === 'Scheduled' ? C.royal : C.text3 }}>{a.status}</span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: C.text3 }}>{a.date}</td>
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