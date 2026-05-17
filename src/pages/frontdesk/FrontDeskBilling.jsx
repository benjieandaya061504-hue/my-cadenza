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

function BillingCard({ billing, onView, onPrint }) {
  const statusColors = {
    paid: { bg: 'rgba(52,211,153,0.12)', c: C.green, label: 'Paid' },
    pending: { bg: 'rgba(251,191,36,0.12)', c: C.gold, label: 'Pending' },
    overdue: { bg: 'rgba(248,113,113,0.12)', c: C.coral, label: 'Overdue' },
  }
  const sc = statusColors[billing.status]

  return (
    <div className="card row" style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: C.text, fontFamily: C.font }}>{billing.client}</div>
          <div style={{ fontSize: '12px', color: C.text2, fontFamily: C.mono }}>{billing.invoiceId}</div>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 700, color: sc.c, background: sc.bg, padding: '4px 10px', borderRadius: '20px', fontFamily: C.font, letterSpacing: '.05em' }}>{sc.label}</span>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, marginBottom: '8px' }}>Billing Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Type:</span>
            <span style={{ fontSize: '12px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{billing.type}</span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Period:</span>
            <span style={{ fontSize: '12px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{billing.period}</span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Amount:</span>
            <span style={{ fontSize: '12px', color: C.text, fontFamily: C.mono, marginLeft: '4px', fontWeight: 600 }}>{billing.amount}</span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Due Date:</span>
            <span style={{ fontSize: '12px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{billing.dueDate}</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Issued: {billing.issued}</div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => onView(billing.id)} className="btn" style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 500 }}>
          View Details
        </button>
        <button onClick={() => onPrint(billing.id)} className="btn" style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 500 }}>
          Print
        </button>
      </div>
    </div>
  )
}

export default function FrontDeskBilling({ isMobile, isTablet }) {
  const [filter, setFilter] = useState('all')
  const [billings, setBillings] = useState([
    { id: 1, client: 'Maria Santos', invoiceId: 'INV-2026-001', type: 'Tuition', period: 'March 2026', amount: '₱4,000', dueDate: 'March 31, 2026', status: 'paid' },
    { id: 2, client: 'John Reyes', invoiceId: 'INV-2026-002', type: 'Tuition', period: 'March 2026', amount: '₱6,000', dueDate: 'March 31, 2026', status: 'pending' },
    { id: 3, client: 'Pia Gomez', invoiceId: 'INV-2026-003', type: 'Instrument Rental', period: 'March 2026', amount: '₱1,500', dueDate: 'March 31, 2026', status: 'overdue' },
    { id: 4, client: 'Carlos Tan', invoiceId: 'INV-2026-004', type: 'Studio Booking', period: 'March 15, 2026', amount: '₱800', dueDate: 'March 15, 2026', status: 'paid' },
  ])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedBilling, setSelectedBilling] = useState(null)
  const [newInvoice, setNewInvoice] = useState({ client: '', type: 'Tuition', period: '', amount: '', dueDate: '' })

  const filteredBillings = filter === 'all' ? billings : billings.filter(b => b.status === filter)

  const handleViewDetails = (id) => {
    const billing = billings.find(b => b.id === id)
    setSelectedBilling(billing)
    setShowDetailsModal(true)
  }

  const handlePrint = (id) => {
    alert(`Printing invoice ${billings.find(b => b.id === id).invoiceId}`)
  }

  const handleCreateInvoice = () => {
    setNewInvoice({ client: '', type: 'Tuition', period: '', amount: '', dueDate: '' })
    setShowCreateModal(true)
  }

  const handleSaveInvoice = () => {
    const newId = Math.max(...billings.map(b => b.id)) + 1
    const invoiceNum = `INV-2026-${String(newId).padStart(3, '0')}`
    setBillings([...billings, { ...newInvoice, id: newId, invoiceId: invoiceNum, status: 'pending' }])
    setShowCreateModal(false)
    setNewInvoice({ client: '', type: 'Tuition', period: '', amount: '', dueDate: '' })
  }

  const handleCloseModals = () => {
    setShowCreateModal(false)
    setShowDetailsModal(false)
    setSelectedBilling(null)
    setNewInvoice({ client: '', type: 'Tuition', period: '', amount: '', dueDate: '' })
  }

  const cols = isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)'

  return (
    <>
      <style>{css}</style>
      <div style={{ fontFamily: C.font }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: C.display, fontSize: isMobile ? '24px' : '30px', fontWeight: 800, color: C.text, letterSpacing: '-0.02em', marginBottom: '8px' }}>Billing Management</h1>
          <p style={{ color: C.text3, fontSize: '13px' }}>Create and manage billing records for enrollments, lessons, bookings, and rentals</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['all', 'paid', 'pending', 'overdue'].map(f => (
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
              {f} ({f === 'all' ? billings.length : billings.filter(b => b.status === f).length})
            </button>
          ))}
          <button onClick={handleCreateInvoice} className="btn" style={{ marginLeft: 'auto', padding: '8px 16px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: '#fff', cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 600 }}>
            + Create Invoice
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: cols, gap: '14px' }}>
          {filteredBillings.map(billing => (
            <BillingCard
              key={billing.id}
              billing={billing}
              onView={handleViewDetails}
              onPrint={handlePrint}
            />
          ))}
        </div>

        {showCreateModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: C.display, fontSize: '18px', fontWeight: 700, color: C.text }}>Create Invoice</h2>
                <button onClick={handleCloseModals} style={{ background: 'none', border: 'none', color: C.text2, fontSize: '24px', cursor: 'pointer', padding: '4px' }}>×</button>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: '6px' }}>Client</label>
                  <input
                    type="text"
                    value={newInvoice.client}
                    onChange={e => setNewInvoice({ ...newInvoice, client: e.target.value })}
                    placeholder="Client name"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.font, fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: '6px' }}>Type</label>
                  <select
                    value={newInvoice.type}
                    onChange={e => setNewInvoice({ ...newInvoice, type: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.font, fontSize: '13px', outline: 'none' }}
                  >
                    <option value="Tuition">Tuition</option>
                    <option value="Instrument Rental">Instrument Rental</option>
                    <option value="Studio Booking">Studio Booking</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: '6px' }}>Period</label>
                  <input
                    type="text"
                    value={newInvoice.period}
                    onChange={e => setNewInvoice({ ...newInvoice, period: e.target.value })}
                    placeholder="e.g., March 2026"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.font, fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: '6px' }}>Amount</label>
                  <input
                    type="text"
                    value={newInvoice.amount}
                    onChange={e => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                    placeholder="₱0.00"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.mono, fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: '6px' }}>Due Date</label>
                  <input
                    type="text"
                    value={newInvoice.dueDate}
                    onChange={e => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                    placeholder="YYYY-MM-DD"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.font, fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                <button onClick={handleSaveInvoice} className="btn" style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: '#fff', cursor: 'pointer', fontSize: '13px', fontFamily: C.font, fontWeight: 600 }}>
                  Create
                </button>
                <button onClick={handleCloseModals} className="btn" style={{ flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '13px', fontFamily: C.font, fontWeight: 500 }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showDetailsModal && selectedBilling && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '24px', maxWidth: '450px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: C.display, fontSize: '18px', fontWeight: 700, color: C.text }}>Invoice Details</h2>
                <button onClick={handleCloseModals} style={{ background: 'none', border: 'none', color: C.text2, fontSize: '24px', cursor: 'pointer', padding: '4px' }}>×</button>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: C.text, fontFamily: C.font, marginBottom: '4px' }}>{selectedBilling.client}</div>
                <div style={{ fontSize: '12px', color: C.text2, fontFamily: C.mono }}>{selectedBilling.invoiceId}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px', marginBottom: '16px' }}>
                <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Type:</span>
                  <span style={{ fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '8px' }}>{selectedBilling.type}</span>
                </div>
                <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Period:</span>
                  <span style={{ fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '8px' }}>{selectedBilling.period}</span>
                </div>
                <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Amount:</span>
                  <span style={{ fontSize: '13px', color: C.green, fontFamily: C.mono, marginLeft: '8px', fontWeight: 700 }}>{selectedBilling.amount}</span>
                </div>
                <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Due Date:</span>
                  <span style={{ fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '8px' }}>{selectedBilling.dueDate}</span>
                </div>
              </div>
              <button onClick={handleCloseModals} className="btn" style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '13px', fontFamily: C.font, fontWeight: 500 }}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

