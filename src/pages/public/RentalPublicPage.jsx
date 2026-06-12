import { useMemo, useState } from 'react'
import PublicSectionNav from './PublicSectionNav'
import { usePublicSite } from './PublicSiteContext'
import { instrumentsAPI } from '../../services/api'

const INSTRUMENTS = [
  {
    id: '1',
    icon: '🎸',
    name: 'Yamaha F310 Acoustic Guitar',
    meta: 'Guitar · Serial: YF310-2218',
    rate: 500,
    deposit: 1000,
    status: 'Available',
  },
  {
    id: '2',
    icon: '🎹',
    name: 'Casio CT-S300 Keyboard',
    meta: 'Keyboard · Serial: CT-S300-0045',
    rate: 800,
    deposit: 1500,
    status: 'Available',
  },
  {
    id: '3',
    icon: '🎻',
    name: 'Stentor Student Violin 4/4',
    meta: 'Violin · Serial: ST-VL-0078',
    rate: 700,
    deposit: 1200,
    status: 'Rented Out',
  },
  {
    id: '4',
    icon: '🥁',
    name: 'Pearl Export Drum Kit',
    meta: 'Drums · Serial: PE-DK-0034',
    rate: 1200,
    deposit: 2000,
    status: 'Available',
  },
  {
    id: '5',
    icon: '🎸',
    name: 'Fender Squier Strat (Electric)',
    meta: 'Guitar · Serial: SQ-ST-0091',
    rate: 650,
    deposit: 1200,
    status: 'Available',
  },
  {
    id: '6',
    icon: '🎹',
    name: 'Yamaha P-45 Digital Piano',
    meta: 'Piano · Serial: YP45-0017',
    rate: 1500,
    deposit: 3000,
    status: 'Reserved',
  },
]

function statusBadge(status) {
  if (status === 'Available') return 'badge badge-green'
  if (status === 'Rented Out') return 'badge badge-coral'
  return 'badge badge-blue'
}

export default function RentalPublicPage() {
  const { openSignupGate, openSuccessModal, showToast } = usePublicSite()
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [payMethod, setPayMethod] = useState('')
  const [form, setForm] = useState({
    name: '',
    contact: '',
    email: '',
    address: '',
    start: '2026-03-15',
    duration: '1',
    gcashNum: '',
    gcashRef: '',
    bank: '',
    chequeNo: '',
  })

  const monthsCost = useMemo(() => {
    if (!selected) return 0
    const m = parseInt(form.duration, 10) || 1
    return selected.rate * m
  }, [selected, form.duration])

  const openRental = (item) => {
    if (item.status !== 'Available') return
    openSignupGate({
      icon: item.icon,
      title: 'Instrument Rental',
      subtitle: 'Sign up to request this instrument rental.',
      onContinue: () => {
        setSelected(item)
        setPayMethod('')
        setModalOpen(true)
      },
    })
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelected(null)
  }

  const submitRental = async () => {
    if (!form.name.trim() || !form.contact.trim()) {
      showToast('Please enter your name and contact number.')
      return
    }
    try {
      await instrumentsAPI.createRental({
        instrument_id: selected.id,
        renter_name: form.name.trim(),
        rental_start_date: form.start || new Date().toISOString().slice(0, 10),
        rental_type: 'monthly',
        rate_at_time_of_rental: selected.rate,
        deposit_amount: selected.deposit,
        notes: `Contact: ${form.contact}, Email: ${form.email}, Address: ${form.address}`,
      })
      openSuccessModal({
        title: 'Rental Request Submitted!',
        message: 'Your request has been received. Our team will review and contact you within 24 hours.',
      })
      closeModal()
    } catch (err) {
      console.error('Rental error:', err)
      showToast('Failed to submit rental request. Please try again.')
    }
  }

  return (
    <div id="pub-rental" className="pub-section">
      <PublicSectionNav label="Instrument Rental" />
      <div className="pub-page-header">
        <h2>Instrument Rental</h2>
        <p>Browse available instruments, view rates, and submit a rental request online. — REQ167–REQ171</p>
      </div>
      <div className="toolbar">
        <input className="search-box" type="search" placeholder="Search instruments..." disabled />
        <select className="filter-select" disabled>
          <option>All Types</option>
        </select>
        <select className="filter-select" disabled>
          <option>All Availability</option>
        </select>
      </div>
      <div className="grid-3 mb16">
        {INSTRUMENTS.map((item) => (
          <div key={item.id} className="instrument-card">
            <div className="instr-icon">{item.icon}</div>
            <div className="instr-name">{item.name}</div>
            <div className="instr-meta">{item.meta}</div>
            <div className="divider" />
            <div className="flex-between text-sm mb12">
              <span className="text-muted">Rental Rate</span>
              <span className="mono">₱{item.rate} / month</span>
            </div>
            <div className="flex-between text-sm mb12">
              <span className="text-muted">Security Deposit</span>
              <span className="mono">₱{item.deposit.toLocaleString()}</span>
            </div>
            <div className="flex-between text-sm mb16">
              <span className="text-muted">Status</span>
              <span className={statusBadge(item.status)}>{item.status}</span>
            </div>
            <button
              type="button"
              className={`btn btn-sm ${item.status === 'Available' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={item.status !== 'Available'}
              onClick={() => openRental(item)}
            >
              {item.status === 'Available' ? 'Request Rental' : item.status === 'Reserved' ? 'Reserved' : 'Unavailable'}
            </button>
          </div>
        ))}
      </div>

      <div className={`modal-overlay${modalOpen ? ' open' : ''}`} role="presentation">
        <div
          className="modal"
          style={{ width: 520 }}
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <span className="modal-title">Request Instrument Rental</span>
            <button type="button" className="modal-close" onClick={closeModal}>
              ✕
            </button>
          </div>
          {selected ? (
            <>
              <div
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: 14,
                  marginBottom: 16,
                }}
              >
                <div style={{ fontWeight: 600 }}>{selected.name}</div>
                <div className="text-sm text-dim mt4">
                  ₱{selected.rate}/mo · Deposit ₱{selected.deposit.toLocaleString()}
                </div>
              </div>
              <div className="section-heading">
                Your Details <span className="sh-line" />
              </div>
              <div className="form-row cols2">
                <div>
                  <label>Full Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label>Contact Number</label>
                  <input
                    value={form.contact}
                    onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                    placeholder="+63 9XX XXX XXXX"
                  />
                </div>
              </div>
              <div className="form-row cols2">
                <div>
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label>Complete Address</label>
                  <input
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    placeholder="Home address"
                  />
                </div>
              </div>
              <div className="form-row cols2">
                <div>
                  <label>Rental Start Date</label>
                  <input
                    type="date"
                    value={form.start}
                    onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))}
                  />
                </div>
                <div>
                  <label>Duration</label>
                  <select value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}>
                    <option value="1">1 Month</option>
                    <option value="2">2 Months</option>
                    <option value="3">3 Months</option>
                    <option value="6">6 Months</option>
                  </select>
                </div>
              </div>
              <div
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: 14,
                  marginBottom: 16,
                }}
              >
                <div className="flex-between text-sm">
                  <span className="text-muted">Estimated rental ({form.duration} mo)</span>
                  <span className="mono text-accent">₱{monthsCost.toLocaleString()}</span>
                </div>
              </div>
              <div className="section-heading">
                Payment Method <span className="sh-line" />
              </div>
              <div className="pay-method-grid">
                <button
                  type="button"
                  className={`pay-method-card${payMethod === 'cash' ? ' selected' : ''}`}
                  onClick={() => setPayMethod('cash')}
                >
                  <div className="pm-icon">💵</div>
                  <div className="pm-label">Cash</div>
                  <div className="text-xs text-dim mt4">Pay at counter</div>
                </button>
                <button
                  type="button"
                  className={`pay-method-card${payMethod === 'gcash' ? ' selected' : ''}`}
                  onClick={() => setPayMethod('gcash')}
                >
                  <div className="pm-icon">📱</div>
                  <div className="pm-label">GCash</div>
                  <div className="text-xs text-dim mt4">+63 917 000 0000</div>
                </button>
                <button
                  type="button"
                  className={`pay-method-card${payMethod === 'cheque' ? ' selected' : ''}`}
                  onClick={() => setPayMethod('cheque')}
                >
                  <div className="pm-icon">🏦</div>
                  <div className="pm-label">Cheque</div>
                  <div className="text-xs text-dim mt4">Payable to Cadenza</div>
                </button>
              </div>
              {payMethod === 'gcash' ? (
                <div className="form-row cols2">
                  <div>
                    <label>GCash Number</label>
                    <input
                      value={form.gcashNum}
                      onChange={(e) => setForm((f) => ({ ...f, gcashNum: e.target.value }))}
                      placeholder="+63 9XX XXX XXXX"
                    />
                  </div>
                  <div>
                    <label>GCash Reference #</label>
                    <input
                      value={form.gcashRef}
                      onChange={(e) => setForm((f) => ({ ...f, gcashRef: e.target.value }))}
                      placeholder="13-digit reference"
                    />
                  </div>
                </div>
              ) : null}
              {payMethod === 'cheque' ? (
                <div className="form-row cols2">
                  <div>
                    <label>Bank Name</label>
                    <input
                      value={form.bank}
                      onChange={(e) => setForm((f) => ({ ...f, bank: e.target.value }))}
                      placeholder="e.g. BDO, BPI, Metrobank"
                    />
                  </div>
                  <div>
                    <label>Cheque Number</label>
                    <input
                      value={form.chequeNo}
                      onChange={(e) => setForm((f) => ({ ...f, chequeNo: e.target.value }))}
                      placeholder="Cheque number"
                    />
                  </div>
                </div>
              ) : null}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={submitRental}>
                  Submit Rental Request →
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
