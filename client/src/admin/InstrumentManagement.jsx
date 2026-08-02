import { useState, useEffect } from 'react'
import C from './theme.js'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/admin'

export default function InstrumentManagement({ isMobile, isTablet }) {
  const [instruments, setInstruments] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  // Form state
  const [form, setForm] = useState({
    instrument_name: '',
    brand: '',
    model: '',
    serial_number: '',
    quantity: '',
    rental_rate: '',
    rate_type: 'per hour',
    purchase_date: '',
    status: 'Good',
  })

  const getToken = () => localStorage.getItem('cadenza_token')

  // Fetch instruments
  const fetchInstruments = async () => {
    try {
      const res = await fetch(`${API}/instruments`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (data.success) {
        setInstruments(data.data)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to load instruments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInstruments()
  }, [])

  // Filter instruments by search
  const filtered = instruments.filter(i => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      i.instrument_name?.toLowerCase().includes(s) ||
      i.brand?.toLowerCase().includes(s) ||
      i.model?.toLowerCase().includes(s)
    )
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setForm({
      instrument_name: '',
      brand: '',
      model: '',
      serial_number: '',
      quantity: '',
      rental_rate: '',
      rate_type: 'per hour',
      purchase_date: '',
      status: 'Good',
    })
    setFormError('')
    setFormSuccess('')
    setEditingId(null)
  }

  const openAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (inst) => {
    setForm({
      instrument_name: inst.instrument_name || '',
      brand: inst.brand || '',
      model: inst.model || '',
      serial_number: inst.serial_number || '',
      quantity: inst.quantity != null ? String(inst.quantity) : '',
      rental_rate: inst.rental_rate != null ? String(inst.rental_rate) : '',
      rate_type: inst.rate_type || 'per hour',
      purchase_date: inst.purchase_date ? inst.purchase_date.split('T')[0] : '',
      status: inst.status || 'Good',
    })
    setEditingId(inst.id)
    setFormError('')
    setFormSuccess('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    if (!form.instrument_name) {
      setFormError('Instrument name is required.')
      return
    }

    setFormLoading(true)

    try {
      const isEdit = editingId !== null
      const url = isEdit ? `${API}/instruments/${editingId}` : `${API}/instruments`
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          instrument_name: form.instrument_name,
          brand: form.brand || null,
          model: form.model || null,
          serial_number: form.serial_number || null,
          quantity: form.quantity ? parseInt(form.quantity) : null,
          rental_rate: form.rental_rate ? parseFloat(form.rental_rate) : null,
          rate_type: form.rate_type || null,
          purchase_date: form.purchase_date || null,
          status: form.status,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setFormSuccess(isEdit ? 'Instrument updated successfully!' : 'Instrument created successfully!')
        setTimeout(() => {
          closeModal()
          fetchInstruments()
        }, 1000)
      } else {
        setFormError(data.message || `Failed to ${isEdit ? 'update' : 'create'} instrument.`)
      }
    } catch (err) {
      setFormError('An error occurred. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  const formatPrice = (rate) => {
    if (rate == null) return '-'
    return `₱${parseFloat(rate).toFixed(2)}`
  }

  const statusStyle = (status) => {
    switch (status) {
      case 'Good': return { bg: 'rgba(16,185,129,0.1)', c: C.green }
      case 'Needs Maintenance': return { bg: 'rgba(245,158,11,0.1)', c: C.gold }
      case 'Damaged': return { bg: 'rgba(248,113,113,0.1)', c: C.coral }
      default: return { bg: 'rgba(148,163,184,0.1)', c: C.text3 }
    }
  }

  const modalOverlayStyle = {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20,
  }

  const modalStyle = {
    background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520,
    maxHeight: '90vh', overflow: 'auto',
    boxShadow: '0 24px 64px rgba(15,23,42,0.2)',
    padding: '28px 32px',
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: `1.5px solid ${C.border2}`, fontSize: '0.82rem',
    fontFamily: C.font, outline: 'none', background: '#fff',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    display: 'block', fontSize: '0.75rem', fontWeight: 600,
    color: C.text2, marginBottom: 5,
  }

  return (
    <div style={{ fontFamily: C.font }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: C.display, fontSize: '1.3rem', fontWeight: 700, color: C.navy, margin: 0 }}>Instrument Management</h2>
          <p style={{ fontSize: '0.8rem', color: C.text3, marginTop: 2 }}>
            {loading ? 'Loading...' : `${filtered.length} instruments`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder="Search instruments..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${C.border2}`,
              fontSize: '0.8rem', fontFamily: C.font, outline: 'none', width: 220,
            }}
          />
          <button
            onClick={openAddModal}
            style={{
              padding: '8px 18px', borderRadius: 10, border: 'none',
              background: `linear-gradient(135deg, ${C.royal}, ${C.purple})`,
              color: '#fff', fontSize: '0.8rem', fontWeight: 600,
              fontFamily: C.font, cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            + Add Instrument
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.1)', borderRadius: 10, marginBottom: 16, fontSize: '0.8rem', color: C.coral }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.text3, fontSize: '0.9rem' }}>
          Loading instruments...
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.mist }}>
                  {['Instrument', 'Brand', 'Model', 'Quantity', 'Rate', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', fontSize: '0.7rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: C.text3, fontSize: '0.85rem' }}>
                      No instruments found.
                    </td>
                  </tr>
                ) : (
                  filtered.map(i => {
                    const ss = statusStyle(i.status)
                    return (
                      <tr key={i.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '12px 14px', fontSize: '0.85rem', fontWeight: 600, color: C.navy }}>{i.instrument_name}</td>
                        <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>{i.brand || '-'}</td>
                        <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>{i.model || '-'}</td>
                        <td style={{ padding: '12px 14px', fontSize: '0.85rem', fontWeight: 600, color: C.navy }}>{i.quantity ?? '-'}</td>
                        <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>
                          {i.rental_rate ? `${formatPrice(i.rental_rate)}${i.rate_type ? '/' + i.rate_type : ''}` : '-'}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            padding: '3px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
                            background: ss.bg, color: ss.c,
                          }}>{i.status}</span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <button
                            onClick={() => openEditModal(i)}
                            style={{
                              padding: '5px 14px', borderRadius: 8, border: `1.5px solid ${C.royal}`,
                              background: 'rgba(37,99,235,0.08)', color: C.royal,
                              fontSize: '0.72rem', fontWeight: 600, fontFamily: C.font,
                              cursor: 'pointer',
                            }}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Instrument Modal */}
      {showModal && (
        <div style={modalOverlayStyle} onClick={closeModal}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: C.display, fontSize: '1.1rem', fontWeight: 700, color: C.navy, margin: 0 }}>
                {editingId ? 'Edit Instrument' : 'Add New Instrument'}
              </h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: C.text3, padding: '0 4px' }}>✕</button>
            </div>

            {formError && (
              <div style={{ padding: '10px 14px', background: 'rgba(248,113,113,0.1)', borderRadius: 8, marginBottom: 16, fontSize: '0.8rem', color: C.coral }}>
                {formError}
              </div>
            )}

            {formSuccess && (
              <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.1)', borderRadius: 8, marginBottom: 16, fontSize: '0.8rem', color: C.green }}>
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Instrument Name *</label>
                <input
                  type="text"
                  name="instrument_name"
                  value={form.instrument_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Yamaha C7 Grand Piano"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={form.brand}
                    onChange={handleInputChange}
                    placeholder="e.g. Yamaha"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Model</label>
                  <input
                    type="text"
                    name="model"
                    value={form.model}
                    onChange={handleInputChange}
                    placeholder="e.g. C7"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Serial Number</label>
                  <input
                    type="text"
                    name="serial_number"
                    value={form.serial_number}
                    onChange={handleInputChange}
                    placeholder="Serial number"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Rental Rate (₱)</label>
                  <input
                    type="number"
                    name="rental_rate"
                    value={form.rental_rate}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Rate Type</label>
                  <select
                    name="rate_type"
                    value={form.rate_type}
                    onChange={handleInputChange}
                    style={inputStyle}
                  >
                    <option value="per hour">Per Hour</option>
                    <option value="per day">Per Day</option>
                    <option value="per session">Per Session</option>
                    <option value="per month">Per Month</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Purchase Date</label>
                  <input
                    type="date"
                    name="purchase_date"
                    value={form.purchase_date}
                    onChange={handleInputChange}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleInputChange}
                    style={inputStyle}
                  >
                    <option value="Good">Good</option>
                    <option value="Needs Maintenance">Needs Maintenance</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    padding: '10px 20px', borderRadius: 10, border: `1.5px solid ${C.border2}`,
                    background: '#fff', fontSize: '0.82rem', fontWeight: 600, fontFamily: C.font,
                    color: C.text2, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  style={{
                    padding: '10px 24px', borderRadius: 10, border: 'none',
                    background: `linear-gradient(135deg, ${C.royal}, ${C.purple})`,
                    color: '#fff', fontSize: '0.82rem', fontWeight: 600, fontFamily: C.font,
                    cursor: formLoading ? 'not-allowed' : 'pointer', opacity: formLoading ? 0.7 : 1,
                  }}
                >
                  {formLoading ? 'Saving...' : editingId ? 'Update Instrument' : 'Create Instrument'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}