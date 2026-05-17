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

function RentalCard({ rental, onApprove, onReject }) {
  const statusColors = {
    pending: { bg: 'rgba(251,191,36,0.12)', c: C.gold, label: 'Pending' },
    approved: { bg: 'rgba(52,211,153,0.12)', c: C.green, label: 'Approved' },
    rejected: { bg: 'rgba(248,113,113,0.12)', c: C.coral, label: 'Rejected' },
  }
  const sc = statusColors[rental.status]

  return (
    <div className="card row" style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: C.text, fontFamily: C.font }}>{rental.client}</div>
          <div style={{ fontSize: '12px', color: C.text2, fontFamily: C.font }}>{rental.instrument}</div>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 700, color: sc.c, background: sc.bg, padding: '4px 10px', borderRadius: '20px', fontFamily: C.font, letterSpacing: '.05em' }}>{sc.label}</span>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, marginBottom: '8px' }}>Rental Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Instrument ID:</span>
            <span style={{ fontSize: '12px', color: C.text, fontFamily: C.mono, marginLeft: '4px' }}>{rental.instrumentId}</span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Duration:</span>
            <span style={{ fontSize: '12px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{rental.duration}</span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Deposit:</span>
            <span style={{ fontSize: '12px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{rental.deposit}</span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Monthly Fee:</span>
            <span style={{ fontSize: '12px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{rental.monthlyFee}</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Condition: {rental.condition}</div>
        <div style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Requested: {rental.requested}</div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        {rental.status === 'pending' && (
          <>
            <button onClick={() => onApprove(rental.id)} className="btn" style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${C.green}, '#059669')`, color: '#fff', cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 600 }}>
              Approve
            </button>
            <button onClick={() => onReject(rental.id)} className="btn" style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: `1px solid rgba(248,113,113,0.3)`, background: 'rgba(248,113,113,0.1)', color: C.coral, cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 500 }}>
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function InstrumentRentalApproval({ isMobile, isTablet }) {
  const [filter, setFilter] = useState('all')
  const [rentals, setRentals] = useState([
    { id: 1, client: 'Maria Santos', instrument: 'Yamaha F310 Acoustic Guitar', instrumentId: 'GTR-001', duration: '3 months', deposit: '₱2,000', monthlyFee: '₱500', condition: 'Excellent', status: 'pending', requested: '2 hours ago' },
    { id: 2, client: 'John Reyes', instrument: 'Casio CDP-S100 Digital Piano', instrumentId: 'PNO-003', duration: '6 months', deposit: '₱5,000', monthlyFee: '₱1,200', condition: 'Good', status: 'pending', requested: '5 hours ago' },
    { id: 3, client: 'Carlos Tan', instrument: 'Pearl Roadshow Drum Kit', instrumentId: 'DRM-002', duration: '3 months', deposit: '₱3,000', monthlyFee: '₱800', condition: 'Good', status: 'approved', requested: 'Yesterday' },
    { id: 4, client: 'Ana Cruz', instrument: 'Yamaha SV-200 Silent Violin', instrumentId: 'VLN-001', duration: '3 months', deposit: '₱4,000', monthlyFee: '₱1,000', condition: 'Excellent', status: 'pending', requested: 'Yesterday' },
  ])

  const filteredRentals = filter === 'all' ? rentals : rentals.filter(r => r.status === filter)

  const handleApprove = (id) => {
    setRentals(rentals.map(r => r.id === id ? { ...r, status: 'approved' } : r))
  }

  const handleReject = (id) => {
    setRentals(rentals.map(r => r.id === id ? { ...r, status: 'rejected' } : r))
  }

  const cols = isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)'

  return (
    <>
      <style>{css}</style>
      <div style={{ fontFamily: C.font }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: C.display, fontSize: isMobile ? '24px' : '30px', fontWeight: 800, color: C.text, letterSpacing: '-0.02em', marginBottom: '8px' }}>Instrument Rental Approval</h1>
          <p style={{ color: C.text3, fontSize: '13px' }}>Manage instrument rental requests and assign instruments</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['all', 'pending', 'approved', 'rejected'].map(f => (
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
              {f} ({f === 'all' ? rentals.length : rentals.filter(r => r.status === f).length})
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: cols, gap: '14px' }}>
          {filteredRentals.map(rental => (
            <RentalCard
              key={rental.id}
              rental={rental}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      </div>
    </>
  )
}

