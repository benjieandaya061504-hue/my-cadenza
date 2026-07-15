import { useState, useEffect, useMemo } from 'react'
import { instrumentsAPI } from '../../services/api'

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

const normalizeStatus = (status) => {
  const value = String(status || '').trim().toLowerCase()
  if (value === 'approved' || value === 'active') return 'approved'
  if (value === 'rejected') return 'rejected'
  if (value === 'returned') return 'approved' // show returned as approved-ish in filters
  return 'pending'
}

function RentalCard({ rental, onApprove, onReject, onView }) {
  const statusColors = {
    pending: { bg: 'rgba(251,191,36,0.12)', c: C.gold, label: 'Pending' },
    approved: { bg: 'rgba(52,211,153,0.12)', c: C.green, label: 'Approved' },
    rejected: { bg: 'rgba(248,113,113,0.12)', c: C.coral, label: 'Rejected' },
    active: { bg: 'rgba(124,106,247,0.12)', c: C.accentL, label: 'Active' },
    returned: { bg: 'rgba(99,102,241,0.12)', c: C.teal, label: 'Returned' },
  }
  const sc = statusColors[rental.status] || statusColors.pending

  const formatCurrency = (val) => {
    const num = parseFloat(val)
    return isNaN(num) ? '₱0' : `₱${num.toLocaleString()}`
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    try {
      return new Date(dateStr).toLocaleDateString()
    } catch {
      return dateStr
    }
  }

  return (
    <div className="card row" style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `linear-gradient(135deg, ${C.accent}, ${C.pink})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: '#fff', fontFamily: C.font }}>
            {rental.renter_name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: C.text, fontFamily: C.font }}>{rental.renter_name}</div>
            <div style={{ fontSize: '12px', color: C.text2, fontFamily: C.mono }}>{rental.email || 'No email'}</div>
            <div style={{ fontSize: '11px', color: C.text3, fontFamily: C.mono, marginTop: '2px' }}>{rental.contact_number || rental.phone || 'N/A'}</div>
          </div>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 700, color: sc.c, background: sc.bg, padding: '4px 10px', borderRadius: '20px', fontFamily: C.font, letterSpacing: '.05em' }}>{sc.label}</span>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, marginBottom: '8px' }}>Rental Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Instrument:</span>
            <span style={{ fontSize: '12px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{rental.instrument_name || 'N/A'}</span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Duration:</span>
            <span style={{ fontSize: '12px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{rental.duration_months || 1} mo</span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Monthly Rate:</span>
            <span style={{ fontSize: '12px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{formatCurrency(rental.monthly_rate)}</span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Deposit:</span>
            <span style={{ fontSize: '12px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{formatCurrency(rental.deposit_amount)}</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Start: {formatDate(rental.rental_start_date)}</div>
        <div style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Requested: {formatDate(rental.created_at)}</div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => onView(rental)} className="btn" style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 500 }}>
          View Details
        </button>
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
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMsg, setActionMsg] = useState('')
  const [selectedRental, setSelectedRental] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const fetchRentals = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await instrumentsAPI.getRentals()
      const mapped = res.data.map(r => ({
        id: r.id,
        student_id: r.student_id,
        renter_name: r.renter_name || 'Unknown',
        email: r.email || 'N/A',
        contact_number: r.contact_number || 'N/A',
        address: r.address || 'N/A',
        instrument_name: r.instrument_name || 'N/A',
        instrument_id: r.instrument_id || 'N/A',
        rental_start_date: r.rental_start_date,
        duration_months: r.duration_months || 1,
        monthly_rate: r.monthly_rate || 0,
        deposit_amount: r.deposit_amount || 0,
        total_amount: r.total_amount || 0,
        payment_method: r.payment_method || 'N/A',
        status: normalizeStatus(r.status),
        created_at: r.created_at,
        notes: r.notes || '',
      }))
      setRentals(mapped)
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to load rental requests.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRentals()
  }, [])

  const filteredRentals = useMemo(() => {
    if (filter === 'all') return rentals
    return rentals.filter(r => r.status === filter)
  }, [filter, rentals])

  const handleApprove = async (id) => {
    try {
      await instrumentsAPI.approveRental(id)
      setActionMsg('Rental approved successfully')
      setTimeout(() => setActionMsg(''), 3000)
      fetchRentals()
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to approve rental.'
      setError(msg)
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleReject = async (id) => {
    try {
      await instrumentsAPI.rejectRental(id)
      setActionMsg('Rental rejected successfully')
      setTimeout(() => setActionMsg(''), 3000)
      fetchRentals()
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to reject rental.'
      setError(msg)
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleView = (rental) => {
    setSelectedRental(rental)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedRental(null)
  }

  const formatCurrency = (val) => {
    const num = parseFloat(val)
    return isNaN(num) ? '₱0' : `₱${num.toLocaleString()}`
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    try {
      return new Date(dateStr).toLocaleDateString()
    } catch {
      return dateStr
    }
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

        {actionMsg && (
          <div style={{ padding: '10px 16px', marginBottom: '16px', borderRadius: '10px', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', color: C.green, fontSize: '13px', fontFamily: C.font, fontWeight: 500 }}>
            {actionMsg}
          </div>
        )}
        {error && (
          <div style={{ padding: '10px 16px', marginBottom: '16px', borderRadius: '10px', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', color: C.coral, fontSize: '13px', fontFamily: C.font, fontWeight: 500 }}>
            {error}
          </div>
        )}
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: C.text2, fontSize: '14px', fontFamily: C.font }}>
            Loading rental requests...
          </div>
        ) : filteredRentals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: C.text3, fontSize: '14px', fontFamily: C.font }}>
            No rental requests found.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: cols, gap: '14px' }}>
            {filteredRentals.map(rental => (
              <RentalCard
                key={rental.id}
                rental={rental}
                onApprove={handleApprove}
                onReject={handleReject}
                onView={handleView}
              />
            ))}
          </div>
        )}

        {showModal && selectedRental && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: C.display, fontSize: '20px', fontWeight: 700, color: C.text }}>Rental Details</h2>
                <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: C.text2, fontSize: '24px', cursor: 'pointer', padding: '4px' }}>×</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: `linear-gradient(135deg, ${C.accent}, ${C.pink})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, color: '#fff', fontFamily: C.font }}>
                  {selectedRental.renter_name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: C.text, fontFamily: C.font }}>{selectedRental.renter_name}</div>
                  <div style={{ fontSize: '14px', color: C.text2, fontFamily: C.font }}>{selectedRental.email}</div>
                  <div style={{ fontSize: '12px', color: C.text3, fontFamily: C.mono, marginTop: '2px' }}>{selectedRental.contact_number}</div>
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, marginBottom: '8px' }}>Rental Information</div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Instrument:</span>
                    <span style={{ fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '8px' }}>{selectedRental.instrument_name}</span>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Start Date:</span>
                    <span style={{ fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '8px' }}>{formatDate(selectedRental.rental_start_date)}</span>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Duration:</span>
                    <span style={{ fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '8px' }}>{selectedRental.duration_months} month(s)</span>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Monthly Rate:</span>
                    <span style={{ fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '8px' }}>{formatCurrency(selectedRental.monthly_rate)}</span>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Deposit:</span>
                    <span style={{ fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '8px' }}>{formatCurrency(selectedRental.deposit_amount)}</span>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Total Amount:</span>
                    <span style={{ fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '8px' }}>{formatCurrency(selectedRental.total_amount)}</span>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Payment Method:</span>
                    <span style={{ fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '8px', textTransform: 'capitalize' }}>{selectedRental.payment_method}</span>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Address:</span>
                    <span style={{ fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '8px' }}>{selectedRental.address}</span>
                  </div>
                </div>
              </div>
              <button onClick={handleCloseModal} className="btn" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '13px', fontFamily: C.font, fontWeight: 500 }}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}