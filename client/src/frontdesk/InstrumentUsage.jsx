import { useState } from 'react'
import C from '../admin/theme.js'

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

  const statusColors = {
    available: { bg: 'rgba(16,185,129,0.1)', c: C.green, label: 'Available' },
    in_use: { bg: 'rgba(37,99,235,0.1)', c: C.royal, label: 'In Use' },
    maintenance: { bg: 'rgba(245,158,11,0.1)', c: C.gold, label: 'Maintenance' },
    retired: { bg: 'rgba(248,113,113,0.1)', c: C.coral, label: 'Retired' },
  }

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

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    background: C.mist, border: `1px solid ${C.border2}`,
    color: C.text, fontFamily: C.font, fontSize: '0.82rem',
    outline: 'none', boxSizing: 'border-box',
  }

  const cols = isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)'

  return (
    <div style={{ fontFamily: C.font }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: C.display, fontSize: '1.3rem', fontWeight: 700, color: C.navy, margin: '0 0 4px' }}>Instrument Usage</h2>
        <p style={{ fontSize: '0.8rem', color: C.text3, margin: 0 }}>Track all instruments, availability, usage, maintenance, and disposal</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'available', 'in_use', 'maintenance', 'retired'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 16px', borderRadius: 20, border: `1px solid ${filter === f ? C.royal : C.border2}`,
            background: filter === f ? 'rgba(37,99,235,0.08)' : '#fff',
            color: filter === f ? C.royal : C.text2,
            cursor: 'pointer', fontSize: '0.78rem', fontFamily: C.font, fontWeight: 500, textTransform: 'capitalize',
            transition: 'all 0.15s ease',
          }}>
            {f.replace('_', ' ')} ({f === 'all' ? instruments.length : instruments.filter(i => i.status === f).length})
          </button>
        ))}
        <button style={{
          marginLeft: 'auto', padding: '8px 16px', borderRadius: 10, border: 'none',
          background: `linear-gradient(135deg, ${C.royal}, ${C.purple})`, color: '#fff',
          cursor: 'pointer', fontSize: '0.78rem', fontFamily: C.font, fontWeight: 600,
        }}>+ Add Instrument</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 14 }}>
        {filteredInstruments.map(instrument => {
          const sc = statusColors[instrument.status]
          return (
            <div key={instrument.id} style={{
              background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`,
              padding: '1.2rem', boxShadow: '0 4px 12px rgba(30,41,59,0.04)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(30,41,59,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(30,41,59,0.04)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: C.navy, fontFamily: C.font }}>{instrument.name}</div>
                  <div style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font, marginTop: 2 }}>{instrument.id}</div>
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: sc.c, background: sc.bg, padding: '4px 10px', borderRadius: 20, fontFamily: C.font, letterSpacing: '.05em' }}>{sc.label}</span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, marginBottom: 8 }}>Instrument Details</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                  <div><span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Type:</span><span style={{ fontSize: '0.75rem', color: C.text, fontFamily: C.font, marginLeft: 4 }}>{instrument.type}</span></div>
                  <div><span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Brand:</span><span style={{ fontSize: '0.75rem', color: C.text, fontFamily: C.font, marginLeft: 4 }}>{instrument.brand}</span></div>
                  <div><span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Condition:</span><span style={{ fontSize: '0.75rem', color: C.text, fontFamily: C.font, marginLeft: 4 }}>{instrument.condition}</span></div>
                  <div><span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Location:</span><span style={{ fontSize: '0.75rem', color: C.text, fontFamily: C.font, marginLeft: 4 }}>{instrument.location}</span></div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Last Maintenance: {instrument.lastMaintenance}</div>
                <div style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Current User: {instrument.currentUser || 'None'}</div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleEdit(instrument.id)} style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: `1px solid ${C.border2}`, background: '#fff', color: C.text2, cursor: 'pointer', fontSize: '0.75rem', fontFamily: C.font, fontWeight: 500, transition: 'all 0.15s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.royal; e.currentTarget.style.color = C.royal }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border2; e.currentTarget.style.color = C.text2 }}
                >Edit</button>
                <button onClick={() => handleMaintenance(instrument.id)} style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: `1px solid ${C.border2}`, background: '#fff', color: C.text2, cursor: 'pointer', fontSize: '0.75rem', fontFamily: C.font, fontWeight: 500, transition: 'all 0.15s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.royal; e.currentTarget.style.color = C.royal }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border2; e.currentTarget.style.color = C.text2 }}
                >Maintenance</button>
                {instrument.status !== 'retired' && (
                  <button onClick={() => handleDispose(instrument.id)} style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: `1px solid rgba(248,113,113,0.3)`, background: 'rgba(248,113,113,0.08)', color: C.coral, cursor: 'pointer', fontSize: '0.75rem', fontFamily: C.font, fontWeight: 500 }}>Dispose</button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showEditModal && selectedInstrument && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, maxWidth: 400, width: '100%', boxShadow: '0 24px 64px rgba(15,23,42,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: C.display, fontSize: '1.1rem', fontWeight: 700, color: C.navy, margin: 0 }}>Edit Instrument</h3>
              <button onClick={handleCloseEditModal} style={{ background: 'none', border: 'none', color: C.text3, fontSize: '1.5rem', cursor: 'pointer', padding: '0 4px' }}>×</button>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: 6 }}>Name</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: 6 }}>Type</label>
                <input type="text" value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: 6 }}>Brand</label>
                <input type="text" value={editForm.brand} onChange={e => setEditForm({ ...editForm, brand: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: 6 }}>Condition</label>
                <select value={editForm.condition} onChange={e => setEditForm({ ...editForm, condition: e.target.value })} style={inputStyle}>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: 6 }}>Location</label>
                <input type="text" value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={handleSaveEdit} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${C.royal}, ${C.purple})`, color: '#fff', cursor: 'pointer', fontSize: '0.82rem', fontFamily: C.font, fontWeight: 600 }}>Save</button>
              <button onClick={handleCloseEditModal} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${C.border2}`, background: '#fff', color: C.text2, cursor: 'pointer', fontSize: '0.82rem', fontFamily: C.font, fontWeight: 500 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}