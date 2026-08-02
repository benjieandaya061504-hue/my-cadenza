import { useState } from 'react'
import C from '../admin/theme.js'

export default function FrontDeskBilling({ isMobile, isTablet }) {
  const [filter, setFilter] = useState('all')
  const [billings, setBillings] = useState([
    { id: 1, client: 'Maria Santos', invoiceId: 'INV-2026-001', type: 'Tuition', period: 'March 2026', amount: '₱4,000', dueDate: 'March 31, 2026', status: 'paid', issued: 'Mar 1, 2026' },
    { id: 2, client: 'John Reyes', invoiceId: 'INV-2026-002', type: 'Tuition', period: 'March 2026', amount: '₱6,000', dueDate: 'March 31, 2026', status: 'pending', issued: 'Mar 1, 2026' },
    { id: 3, client: 'Pia Gomez', invoiceId: 'INV-2026-003', type: 'Instrument Rental', period: 'March 2026', amount: '₱1,500', dueDate: 'March 31, 2026', status: 'overdue', issued: 'Mar 1, 2026' },
    { id: 4, client: 'Carlos Tan', invoiceId: 'INV-2026-004', type: 'Studio Booking', period: 'March 15, 2026', amount: '₱800', dueDate: 'March 15, 2026', status: 'paid', issued: 'Mar 10, 2026' },
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
    setBillings([...billings, { ...newInvoice, id: newId, invoiceId: invoiceNum, status: 'pending', issued: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }])
    setShowCreateModal(false)
    setNewInvoice({ client: '', type: 'Tuition', period: '', amount: '', dueDate: '' })
  }

  const handleCloseModals = () => {
    setShowCreateModal(false)
    setShowDetailsModal(false)
    setSelectedBilling(null)
    setNewInvoice({ client: '', type: 'Tuition', period: '', amount: '', dueDate: '' })
  }

  const statusColors = {
    paid: { bg: 'rgba(16,185,129,0.1)', c: C.green, label: 'Paid' },
    pending: { bg: 'rgba(245,158,11,0.1)', c: C.gold, label: 'Pending' },
    overdue: { bg: 'rgba(248,113,113,0.1)', c: C.coral, label: 'Overdue' },
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
        <h2 style={{ fontFamily: C.display, fontSize: '1.3rem', fontWeight: 700, color: C.navy, margin: '0 0 4px' }}>Billing Management</h2>
        <p style={{ fontSize: '0.8rem', color: C.text3, margin: 0 }}>Create and manage billing records for enrollments, lessons, bookings, and rentals</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'paid', 'pending', 'overdue'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 16px', borderRadius: 20, border: `1px solid ${filter === f ? C.royal : C.border2}`,
            background: filter === f ? 'rgba(37,99,235,0.08)' : '#fff',
            color: filter === f ? C.royal : C.text2,
            cursor: 'pointer', fontSize: '0.78rem', fontFamily: C.font, fontWeight: 500, textTransform: 'capitalize',
            transition: 'all 0.15s ease',
          }}>
            {f} ({f === 'all' ? billings.length : billings.filter(b => b.status === f).length})
          </button>
        ))}
        <button onClick={handleCreateInvoice} style={{
          marginLeft: 'auto', padding: '8px 16px', borderRadius: 10, border: 'none',
          background: `linear-gradient(135deg, ${C.royal}, ${C.purple})`, color: '#fff',
          cursor: 'pointer', fontSize: '0.78rem', fontFamily: C.font, fontWeight: 600,
        }}>+ Create Invoice</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 14 }}>
        {filteredBillings.map(billing => {
          const sc = statusColors[billing.status]
          return (
            <div key={billing.id} style={{
              background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`,
              padding: '1.2rem', boxShadow: '0 4px 12px rgba(30,41,59,0.04)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(30,41,59,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(30,41,59,0.04)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: C.navy, fontFamily: C.font }}>{billing.client}</div>
                  <div style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font, marginTop: 2 }}>{billing.invoiceId}</div>
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: sc.c, background: sc.bg, padding: '4px 10px', borderRadius: 20, fontFamily: C.font, letterSpacing: '.05em' }}>{sc.label}</span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, marginBottom: 8 }}>Billing Details</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                  <div><span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Type:</span><span style={{ fontSize: '0.75rem', color: C.text, fontFamily: C.font, marginLeft: 4 }}>{billing.type}</span></div>
                  <div><span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Period:</span><span style={{ fontSize: '0.75rem', color: C.text, fontFamily: C.font, marginLeft: 4 }}>{billing.period}</span></div>
                  <div><span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Amount:</span><span style={{ fontSize: '0.75rem', color: C.text, fontFamily: C.font, marginLeft: 4, fontWeight: 600 }}>{billing.amount}</span></div>
                  <div><span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Due Date:</span><span style={{ fontSize: '0.75rem', color: C.text, fontFamily: C.font, marginLeft: 4 }}>{billing.dueDate}</span></div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Issued: {billing.issued}</div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleViewDetails(billing.id)} style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: `1px solid ${C.border2}`, background: '#fff', color: C.text2, cursor: 'pointer', fontSize: '0.75rem', fontFamily: C.font, fontWeight: 500, transition: 'all 0.15s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.royal; e.currentTarget.style.color = C.royal }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border2; e.currentTarget.style.color = C.text2 }}
                >View Details</button>
                <button onClick={() => handlePrint(billing.id)} style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: `1px solid ${C.border2}`, background: '#fff', color: C.text2, cursor: 'pointer', fontSize: '0.75rem', fontFamily: C.font, fontWeight: 500, transition: 'all 0.15s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.royal; e.currentTarget.style.color = C.royal }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border2; e.currentTarget.style.color = C.text2 }}
                >Print</button>
              </div>
            </div>
          )
        })}
      </div>

      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, maxWidth: 400, width: '100%', boxShadow: '0 24px 64px rgba(15,23,42,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: C.display, fontSize: '1.1rem', fontWeight: 700, color: C.navy, margin: 0 }}>Create Invoice</h3>
              <button onClick={handleCloseModals} style={{ background: 'none', border: 'none', color: C.text3, fontSize: '1.5rem', cursor: 'pointer', padding: '0 4px' }}>×</button>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: 6 }}>Client</label>
                <input type="text" value={newInvoice.client} onChange={e => setNewInvoice({ ...newInvoice, client: e.target.value })} placeholder="Client name" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: 6 }}>Type</label>
                <select value={newInvoice.type} onChange={e => setNewInvoice({ ...newInvoice, type: e.target.value })} style={inputStyle}>
                  <option value="Tuition">Tuition</option>
                  <option value="Instrument Rental">Instrument Rental</option>
                  <option value="Studio Booking">Studio Booking</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: 6 }}>Period</label>
                <input type="text" value={newInvoice.period} onChange={e => setNewInvoice({ ...newInvoice, period: e.target.value })} placeholder="e.g., March 2026" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: 6 }}>Amount</label>
                <input type="text" value={newInvoice.amount} onChange={e => setNewInvoice({ ...newInvoice, amount: e.target.value })} placeholder="₱0.00" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: 6 }}>Due Date</label>
                <input type="text" value={newInvoice.dueDate} onChange={e => setNewInvoice({ ...newInvoice, dueDate: e.target.value })} placeholder="YYYY-MM-DD" style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={handleSaveInvoice} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${C.royal}, ${C.purple})`, color: '#fff', cursor: 'pointer', fontSize: '0.82rem', fontFamily: C.font, fontWeight: 600 }}>Create</button>
              <button onClick={handleCloseModals} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${C.border2}`, background: '#fff', color: C.text2, cursor: 'pointer', fontSize: '0.82rem', fontFamily: C.font, fontWeight: 500 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showDetailsModal && selectedBilling && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, maxWidth: 450, width: '100%', boxShadow: '0 24px 64px rgba(15,23,42,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: C.display, fontSize: '1.1rem', fontWeight: 700, color: C.navy, margin: 0 }}>Invoice Details</h3>
              <button onClick={handleCloseModals} style={{ background: 'none', border: 'none', color: C.text3, fontSize: '1.5rem', cursor: 'pointer', padding: '0 4px' }}>×</button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: C.navy, fontFamily: C.font, marginBottom: 4 }}>{selectedBilling.client}</div>
              <div style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>{selectedBilling.invoiceId}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 16 }}>
              <div style={{ padding: 12, borderRadius: 10, background: C.mist, border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Type:</span>
                <span style={{ fontSize: '0.82rem', color: C.text, fontFamily: C.font, marginLeft: 8 }}>{selectedBilling.type}</span>
              </div>
              <div style={{ padding: 12, borderRadius: 10, background: C.mist, border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Period:</span>
                <span style={{ fontSize: '0.82rem', color: C.text, fontFamily: C.font, marginLeft: 8 }}>{selectedBilling.period}</span>
              </div>
              <div style={{ padding: 12, borderRadius: 10, background: C.mist, border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Amount:</span>
                <span style={{ fontSize: '0.82rem', color: C.green, fontFamily: C.font, marginLeft: 8, fontWeight: 700 }}>{selectedBilling.amount}</span>
              </div>
              <div style={{ padding: 12, borderRadius: 10, background: C.mist, border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Due Date:</span>
                <span style={{ fontSize: '0.82rem', color: C.text, fontFamily: C.font, marginLeft: 8 }}>{selectedBilling.dueDate}</span>
              </div>
            </div>
            <button onClick={handleCloseModals} style={{ width: '100%', padding: '10px', borderRadius: 10, border: `1px solid ${C.border2}`, background: '#fff', color: C.text2, cursor: 'pointer', fontSize: '0.82rem', fontFamily: C.font, fontWeight: 500 }}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}