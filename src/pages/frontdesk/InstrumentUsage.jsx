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

function InstrumentCard({ instrument, onEdit, onMaintenance, onDispose }) {
  const statusColors = {
    available: { bg: 'rgba(52,211,153,0.12)', c: C.green, label: 'Available' },
    in_use: { bg: 'rgba(124,106,247,0.12)', c: C.accentL, label: 'In Use' },
    maintenance: { bg: 'rgba(251,191,36,0.12)', c: C.gold, label: 'Maintenance' },
    retired: { bg: 'rgba(248,113,113,0.12)', c: C.coral, label: 'Retired' },
  }
  const sc = statusColors[instrument.status]

  return (
    <div className="card row" style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: C.text, fontFamily: C.font }}>{instrument.name}</div>
          <div style={{ fontSize: '12px', color: C.text2, fontFamily: C.mono }}>{instrument.id}</div>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 700, color: sc.c, background: sc.bg, padding: '4px 10px', borderRadius: '20px', fontFamily: C.font, letterSpacing: '.05em' }}>{sc.label}</span>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, marginBottom: '8px' }}>Instrument Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Type:</span>
            <span style={{ fontSize: '12px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{instrument.type}</span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Brand:</span>
            <span style={{ fontSize: '12px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{instrument.brand}</span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Condition:</span>
            <span style={{ fontSize: '12px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{instrument.condition}</span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Location:</span>
            <span style={{ fontSize: '12px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{instrument.location}</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Last Maintenance: {instrument.lastMaintenance}</div>
        <div style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Current User: {instrument.currentUser || 'None'}</div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => onEdit(instrument.id)} className="btn" style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 500 }}>
          Edit
        </button>
        <button onClick={() => onMaintenance(instrument.id)} className="btn" style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 500 }}>
          Maintenance
        </button>
        {instrument.status !== 'retired' && (
          <button onClick={() => onDispose(instrument.id)} className="btn" style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: `1px solid rgba(248,113,113,0.3)`, background: 'rgba(248,113,113,0.1)', color: C.coral, cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 500 }}>
            Dispose
          </button>
        )}
      </div>
    </div>
  )
}

export default function InstrumentUsage({ isMobile, isTablet }) {
  const [filter, setFilter] = useState('all')
  const [instruments, setInstruments] = useState([
    { id: 'GTR-001', name: 'Yamaha F310 Acoustic Guitar', type: 'Guitar', brand: 'Yamaha', condition: 'Excellent', location: 'Storage A', status: 'available', lastMaintenance: 'Feb 15, 2026', currentUser: 'None' },
    { id: 'GTR-002', name: 'Fender Stratocaster Electric Guitar', type: 'Guitar', brand: 'Fender', condition: 'Good', location: 'Studio A', status: 'in_use', lastMaintenance: 'Jan 20, 2026', currentUser: 'Maria Santos' },
    { id: 'PNO-001', name: 'Yamaha U1 Upright Piano', type: 'Piano', brand: 'Yamaha', condition: 'Excellent', location: 'Studio B', status: 'in_use', lastMaintenance: 'Mar 1, 2026', currentUser: 'John Reyes' },
    { id: 'DRM-001', name: 'Pearl Roadshow Drum Kit', type: 'Drums', brand: 'Pearl', condition: 'Good', location: 'Studio C', status: 'maintenance', lastMaintenance: 'Feb 28, 2026', currentUser: 'None' },
    { id: 'VLN-001', name: 'Yamaha SV-200 Silent Violin', type: 'Violin', brand: 'Yamaha', condition: 'Excellent', location: 'Storage B', status: 'available', lastMaintenance: 'Feb 10, 2026', currentUser: 'None' },
    { id: 'GTR-003', name: 'Ibanez RG Electric Guitar', type: 'Guitar', brand: 'Ibanez', condition: 'Fair', location: 'Storage A', status: 'retired', lastMaintenance: 'Dec 15, 2025', currentUser: 'None' },
  ])
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedInstrument, setSelectedInstrument] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', type: '', brand: '', condition: '', location: '' })

  const filteredInstruments = filter === 'all' ? instruments : instruments.filter(i => i.status === filter)

  const handleEdit = (id) => {
    const instrument = instruments.find(i => i.id === id)
    setSelectedInstrument(instrument)
    setEditForm({ name: instrument.name, type: instrument.type, brand: instrument.brand, condition: instrument.condition, location: instrument.location })
    setShowEditModal(true)
  }

  const handleMaintenance = (id) => {
    setInstruments(instruments.map(i => i.id === id ? { ...i, status: 'maintenance', lastMaintenance: 'Just now' } : i))
    alert('Maintenance scheduled successfully')
  }

  const handleDispose = (id) => {
    if (confirm('Are you sure you want to dispose this instrument?')) {
      setInstruments(instruments.map(i => i.id === id ? { ...i, status: 'retired', currentUser: 'None' } : i))
    }
  }

  const handleSaveEdit = () => {
    setInstruments(instruments.map(i => i.id === selectedInstrument.id ? { ...i, ...editForm } : i))
    setShowEditModal(false)
    setSelectedInstrument(null)
    setEditForm({ name: '', type: '', brand: '', condition: '', location: '' })
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setSelectedInstrument(null)
    setEditForm({ name: '', type: '', brand: '', condition: '', location: '' })
  }

  const cols = isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)'

  return (
    <>
      <style>{css}</style>
      <div style={{ fontFamily: C.font }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: C.display, fontSize: isMobile ? '24px' : '30px', fontWeight: 800, color: C.text, letterSpacing: '-0.02em', marginBottom: '8px' }}>Instrument Usage</h1>
          <p style={{ color: C.text3, fontSize: '13px' }}>Track all instruments, availability, usage, maintenance, and disposal</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['all', 'available', 'in_use', 'maintenance', 'retired'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="btn"
              style={{
                padding: '8px 16px', borderRadius: '20px', border: `1px solid ${filter === f ? C.accent : C.border}`,
                background: filter === f ? 'rgba(124,106,247,0.15)' : C.bg3,
                color: filter === f ? C.accentL : C.text2,
                cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 500, textTransform: 'capitalize',
              }}
            >
              {f.replace('_', ' ')} ({f === 'all' ? instruments.length : instruments.filter(i => i.status === f).length})
            </button>
          ))}
          <button className="btn" style={{ marginLeft: 'auto', padding: '8px 16px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: '#fff', cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 600 }}>
            + Add Instrument
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: cols, gap: '14px' }}>
          {filteredInstruments.map(instrument => (
            <InstrumentCard
              key={instrument.id}
              instrument={instrument}
              onEdit={handleEdit}
              onMaintenance={handleMaintenance}
              onDispose={handleDispose}
            />
          ))}
        </div>

        {showEditModal && selectedInstrument && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: C.display, fontSize: '18px', fontWeight: 700, color: C.text }}>Edit Instrument</h2>
                <button onClick={handleCloseEditModal} style={{ background: 'none', border: 'none', color: C.text2, fontSize: '24px', cursor: 'pointer', padding: '4px' }}>×</button>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: '6px' }}>Name</label>
                  <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.font, fontSize: '13px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: '6px' }}>Type</label>
                  <input type="text" value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.font, fontSize: '13px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: '6px' }}>Brand</label>
                  <input type="text" value={editForm.brand} onChange={e => setEditForm({ ...editForm, brand: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.font, fontSize: '13px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: '6px' }}>Condition</label>
                  <select value={editForm.condition} onChange={e => setEditForm({ ...editForm, condition: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.font, fontSize: '13px', outline: 'none' }}>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: '6px' }}>Location</label>
                  <input type="text" value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.font, fontSize: '13px', outline: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                <button onClick={handleSaveEdit} className="btn" style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: '#fff', cursor: 'pointer', fontSize: '13px', fontFamily: C.font, fontWeight: 600 }}>Save</button>
                <button onClick={handleCloseEditModal} className="btn" style={{ flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '13px', fontFamily: C.font, fontWeight: 500 }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

