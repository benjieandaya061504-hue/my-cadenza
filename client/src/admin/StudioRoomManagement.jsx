import { useState } from 'react'
import C from './theme.js'

const initialRooms = [
  { id: 1, name: 'Studio A', type: 'Piano / Vocals', capacity: 2, rate: 450, status: 'Active' },
  { id: 2, name: 'Studio B', type: 'Guitar / Bass', capacity: 4, rate: 380, status: 'Active' },
  { id: 3, name: 'Studio C', type: 'Drums', capacity: 3, rate: 520, status: 'Inactive' },
  { id: 4, name: 'Studio D', type: 'Strings', capacity: 2, rate: 400, status: 'Active' },
  { id: 5, name: 'Studio E', type: 'General', capacity: 6, rate: 350, status: 'Active' },
  { id: 6, name: 'Studio F', type: 'Recording', capacity: 5, rate: 600, status: 'Active' },
]

export default function StudioRoomManagement({ isMobile, isTablet }) {
  const [search, setSearch] = useState('')
  const filtered = initialRooms.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ fontFamily: C.font }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: C.display, fontSize: '1.3rem', fontWeight: 700, color: C.navy, margin: 0 }}>Studio Room Management</h2>
          <p style={{ fontSize: '0.8rem', color: C.text3, marginTop: 2 }}>{filtered.length} rooms</p>
        </div>
        <input placeholder="Search rooms..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${C.border2}`, fontSize: '0.8rem', fontFamily: C.font, outline: 'none', width: 220 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr 1fr', gap: 14 }}>
        {filtered.map(r => (
          <div key={r.id} style={{ background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`, padding: '1.2rem', boxShadow: '0 4px 12px rgba(30,41,59,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: C.navy }}>{r.name}</div>
                <div style={{ fontSize: '0.78rem', color: C.text2, marginTop: 2 }}>{r.type}</div>
              </div>
              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600,
                background: r.status === 'Active' ? 'rgba(16,185,129,0.1)' : 'rgba(148,163,184,0.1)',
                color: r.status === 'Active' ? C.green : C.text3 }}>{r.status}</span>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
              <div><div style={{ fontSize: '1.2rem', fontWeight: 800, color: C.navy, fontFamily: C.display }}>{r.capacity}</div><div style={{ fontSize: '0.68rem', color: C.text3 }}>Capacity</div></div>
              <div><div style={{ fontSize: '1.2rem', fontWeight: 800, color: C.gold, fontFamily: C.display }}>₱{r.rate}</div><div style={{ fontSize: '0.68rem', color: C.text3 }}>Rate/hr</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}