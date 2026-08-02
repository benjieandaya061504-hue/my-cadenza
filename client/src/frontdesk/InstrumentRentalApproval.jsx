import { useState } from 'react'
import C from '../admin/theme.js'

export default function InstrumentRentalApproval({ isMobile, isTablet }) {
  const [filter, setFilter] = useState('all')
  const [rentals, setRentals] = useState([
    { id: 1, renter_name: 'Maria Santos', email: 'maria@email.com', contact_number: '0917-123-4567', instrument_name: 'Yamaha F310 Acoustic Guitar', duration_months: 3, monthly_rate: 500, deposit_amount: 1000, total_amount: 2500, payment_method: 'GCash', status: 'pending', rental_start_date: '2026-03-15', created_at: '2026-03-10', address: '123 Rizal St., Manila' },
    { id: 2, renter_name: 'John Reyes', email: 'john@email.com', contact_number: '0928-234-5678', instrument_name: 'Yamaha U1 Upright Piano', duration_months: 6, monthly_rate: 2000, deposit_amount: 5000, total_amount: 17000, payment_method: 'Bank Transfer', status: 'pending', rental_start_date: '2026-04-01', created_at: '2026-03-09', address: '456 Mabini St., QC' },
    { id: 3, renter_name: 'Ana Cruz', email: 'ana@email.com', contact_number: '0935-345-6789', instrument_name: 'Yamaha SV-200 Silent Violin', duration_months: 2, monthly_rate: 800, deposit_amount: 1500, total_amount: 3100, payment_method: 'Cash', status: 'approved', rental_start_date: '2026-03-01', created_at: '2026-02-28', address: '789 Luna St., Makati' },
    { id: 4, renter_name: 'Carlos Tan', email: 'carlos@email.com', contact_number: '0912-456-7890', instrument_name: 'Pearl Roadshow Drum Kit', duration_months: 1, monthly_rate: 1500, deposit_amount: 3000, total_amount: 4500, payment_method: 'Maya', status: 'rejected', rental_start_date: '2026-03-20', created_at: '2026-03-07', address: '321 Bonifacio St., BGC' },
  ])
  const [selectedRental, setSelectedRental] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [actionMsg, setActionMsg] = useState('')

  const filteredRentals = filter === 'all' ? rentals : rentals.filter(r => r.status === filter)

  const handleApprove = (id) => {
    setRentals(rentals.map(r => r.id === id ? { ...r, status: 'approved' } : r))
    setActionMsg('Rental approved successfully')
    setTimeout(() => setActionMsg(''), 3000)
  }

  const handleReject = (id) => {
    setRentals(rentals.map(r => r.id === id ? { ...r, status: 'rejected' } : r))
    setActionMsg('Rental rejected successfully')
    setTimeout(() => setActionMsg(''), 3000)
  }

  const handleView = (rental) => {
    setSelectedRental(rental)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedRental(null)
  }

  const statusColors = {
    pending: { bg: 'rgba(245,158,11,0.1)', c: C.gold, label: 'Pending' },
    approved: { bg: 'rgba(16,185,129,0.1)', c: C.green, label: 'Approved' },
    rejected: { bg: 'rgba(248,113,113,0.1)', c: C.coral, label: 'Rejected' },
  }

  const formatCurrency = (val) => `₱${Number(val).toLocaleString()}`

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    try { return new Date(dateStr).toLocaleDateString() } catch { return dateStr }
  }

  const cols = isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)'

  return (
    <div style={{ fontFamily: C.font }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: C.display, fontSize: '1.3rem', fontWeight: 700, color: C.navy, margin: '0 0 4px' }}>Instrument Rental Approval</h2>
        <p style={{ fontSize: '0.8rem', color: C.text3, margin: 0 }}>Manage instrument rental requests and assign instruments</p>
      </div>

      {actionMsg && (
        <div style={{ padding: '10px 16px', marginBottom: 16, borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: C.green, fontSize: '0.82rem', fontFamily: C.font, fontWeight: 500 }}>{actionMsg}</div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 16px', borderRadius: 20, border: `1px solid ${filter === f ? C.royal : C.border2}`,
            background: filter === f ? 'rgba(37,99,235,0.08)' : '#fff',
            color: filter === f ? C.royal : C.text2,
            cursor: 'pointer', fontSize: '0.78rem', fontFamily: C.font, fontWeight: 500, textTransform: 'capitalize',
            transition: 'all 0.15s ease',
          }}>
            {f} ({f === 'all' ? rentals.length : rentals.filter(r => r.status === f).length})
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 14 }}>
        {filteredRentals.map(rental => {
          const sc = statusColors[rental.status]
          return (
            <div key={rental.id} style={{
              background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`,
              padding: '1.2rem', boxShadow: '0 4px 12px rgba(30,41,59,0.04)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(30,41,59,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(30,41,59,0.04)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `linear-gradient(135deg, ${C.royal}, ${C.purple})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: C.font,
                  }}>
                    {rental.renter_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: C.navy, fontFamily: C.font }}>{rental.renter_name}</div>
                    <div style={{ fontSize: '0.75rem', color: C.text2, fontFamily: C.font }}>{rental.email}</div>
                    <div style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font, marginTop: 2 }}>{rental.contact_number}</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: sc.c, background: sc.bg, padding: '4px 10px', borderRadius: 20, fontFamily: C.font, letterSpacing: '.05em' }}>{sc.label}</span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, marginBottom: 8 }}>Rental Details</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                  <div><span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Instrument:</span><span style={{ fontSize: '0.75rem', color: C.text, fontFamily: C.font, marginLeft: 4 }}>{rental.instrument_name}</span></div>
                  <div><span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Duration:</span><span style={{ fontSize: '0.75rem', color: C.text, fontFamily: C.font, marginLeft: 4 }}>{rental.duration_months} mo</span></div>
                  <div><span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Monthly Rate:</span><span style={{ fontSize: '0.75rem', color: C.text, fontFamily: C.font, marginLeft: 4 }}>{formatCurrency(rental.monthly_rate)}</span></div>
                  <div><span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Deposit:</span><span style={{ fontSize: '0.75rem', color: C.text, fontFamily: C.font, marginLeft: 4 }}>{formatCurrency(rental.deposit_amount)}</span></div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Start: {formatDate(rental.rental_start_date)}</div>
                <div style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Requested: {formatDate(rental.created_at)}</div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleView(rental)} style={{
                  flex: 1, padding: '8px 12px', borderRadius: 10,
                  border: `1px solid ${C.border2}`, background: '#fff',
                  color: C.text2, cursor: 'pointer', fontSize: '0.75rem',
                  fontFamily: C.font, fontWeight: 500, transition: 'all 0.15s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.royal; e.currentTarget.style.color = C.royal }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border2; e.currentTarget.style.color = C.text2 }}
                >View Details</button>
                {rental.status === 'pending' && (
                  <>
                    <button onClick={() => handleApprove(rental.id)} style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${C.green}, #059669)`, color: '#fff', cursor: 'pointer', fontSize: '0.75rem', fontFamily: C.font, fontWeight: 600 }}>Approve</button>
                    <button onClick={() => handleReject(rental.id)} style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: `1px solid rgba(248,113,113,0.3)`, background: 'rgba(248,113,113,0.08)', color: C.coral, cursor: 'pointer', fontSize: '0.75rem', fontFamily: C.font, fontWeight: 500 }}>Reject</button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showModal && selectedRental && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, maxWidth: 500, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(15,23,42,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: C.display, fontSize: '1.2rem', fontWeight: 700, color: C.navy, margin: 0 }}>Rental Details</h2>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: C.text3, fontSize: '1.5rem', cursor: 'pointer', padding: '0 4px' }}>×</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg, ${C.royal}, ${C.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff', fontFamily: C.font }}>
                {selectedRental.renter_name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: C.navy, fontFamily: C.font }}>{selectedRental.renter_name}</div>
                <div style={{ fontSize: '0.85rem', color: C.text2, fontFamily: C.font }}>{selectedRental.email}</div>
                <div style={{ fontSize: '0.75rem', color: C.text3, fontFamily: C.font, marginTop: 2 }}>{selectedRental.contact_number}</div>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, marginBottom: 8 }}>Rental Information</div>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ padding: 12, borderRadius: 10, background: C.mist, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Instrument:</span>
                  <span style={{ fontSize: '0.82rem', color: C.text, fontFamily: C.font, marginLeft: 8 }}>{selectedRental.instrument_name}</span>
                </div>
                <div style={{ padding: 12, borderRadius: 10, background: C.mist, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Start Date:</span>
                  <span style={{ fontSize: '0.82rem', color: C.text, fontFamily: C.font, marginLeft: 8 }}>{formatDate(selectedRental.rental_start_date)}</span>
                </div>
                <div style={{ padding: 12, borderRadius: 10, background: C.mist, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Duration:</span>
                  <span style={{ fontSize: '0.82rem', color: C.text, fontFamily: C.font, marginLeft: 8 }}>{selectedRental.duration_months} month(s)</span>
                </div>
                <div style={{ padding: 12, borderRadius: 10, background: C.mist, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Monthly Rate:</span>
                  <span style={{ fontSize: '0.82rem', color: C.text, fontFamily: C.font, marginLeft: 8 }}>{formatCurrency(selectedRental.monthly_rate)}</span>
                </div>
                <div style={{ padding: 12, borderRadius: 10, background: C.mist, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Deposit:</span>
                  <span style={{ fontSize: '0.82rem', color: C.text, fontFamily: C.font, marginLeft: 8 }}>{formatCurrency(selectedRental.deposit_amount)}</span>
                </div>
                <div style={{ padding: 12, borderRadius: 10, background: C.mist, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Total Amount:</span>
                  <span style={{ fontSize: '0.82rem', color: C.teal, fontFamily: C.font, fontWeight: 600, marginLeft: 8 }}>{formatCurrency(selectedRental.total_amount)}</span>
                </div>
                <div style={{ padding: 12, borderRadius: 10, background: C.mist, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Payment Method:</span>
                  <span style={{ fontSize: '0.82rem', color: C.text, fontFamily: C.font, marginLeft: 8, textTransform: 'capitalize' }}>{selectedRental.payment_method}</span>
                </div>
              </div>
            </div>
            <button onClick={handleCloseModal} style={{ width: '100%', padding: '10px', borderRadius: 10, border: `1px solid ${C.border2}`, background: '#fff', color: C.text2, cursor: 'pointer', fontSize: '0.82rem', fontFamily: C.font, fontWeight: 500 }}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}