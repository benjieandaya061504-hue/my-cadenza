import { useState, useEffect } from 'react'
import C from './theme.js'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/admin'

export default function StudioBooking({ isMobile, isTablet }) {
  const [rentals, setRentals] = useState([])
  const [clients, setClients] = useState([])
  const [rooms, setRooms] = useState([])
  const [rentalSearch, setRentalSearch] = useState('')
  const [rentalLoading, setRentalLoading] = useState(true)
  const [rentalError, setRentalError] = useState('')
  const [showRentalModal, setShowRentalModal] = useState(false)
  const [rentalEditingId, setRentalEditingId] = useState(null)
  const [rentalFormLoading, setRentalFormLoading] = useState(false)
  const [rentalFormError, setRentalFormError] = useState('')
  const [rentalFormSuccess, setRentalFormSuccess] = useState('')
  const [rentalForm, setRentalForm] = useState({
    client_id: '',
    band_room_id: '',
    rental_date: '',
    start_time: '',
    end_time: '',
    total_amount: '',
    status: 'Pending',
  })

  const getToken = () => localStorage.getItem('cadenza_token')

  const rentalStatusStyle = (status) => {
    switch (status) {
      case 'Pending': return { bg: 'rgba(245,158,11,0.1)', c: '#D97706' }
      case 'Confirmed': return { bg: 'rgba(16,185,129,0.1)', c: C.green }
      case 'Cancelled': return { bg: 'rgba(248,113,113,0.1)', c: C.coral }
      default: return { bg: 'rgba(148,163,184,0.1)', c: C.text3 }
    }
  }

  const fetchRentals = async () => {
    try {
      const res = await fetch(`${API}/band-room-rentals`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (data.success) {
        setRentals(data.data)
      } else {
        setRentalError(data.message)
      }
    } catch (err) {
      setRentalError('Failed to load rentals.')
    } finally {
      setRentalLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const res = await fetch(`${API}/clients`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (data.success) {
        setClients(data.data)
      }
    } catch (err) {
      // silently fail — clients will show as empty dropdown
    }
  }

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API}/rooms`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (data.success) {
        setRooms(data.data)
      }
    } catch (err) {
      // silently fail — rooms will show as empty dropdown
    }
  }

  useEffect(() => {
    fetchRentals()
    fetchClients()
    fetchRooms()
  }, [])

  // Auto-calculate total_amount when room, start_time, and end_time change
  useEffect(() => {
    if (rentalForm.band_room_id && rentalForm.start_time && rentalForm.end_time) {
      const selectedRoom = rooms.find(r => r.id === parseInt(rentalForm.band_room_id))
      if (selectedRoom?.hourly_rate) {
        // Parse times
        const [startH, startM] = rentalForm.start_time.split(':').map(Number)
        const [endH, endM] = rentalForm.end_time.split(':').map(Number)
        const startMinutes = startH * 60 + startM
        const endMinutes = endH * 60 + endM
        const durationMinutes = endMinutes - startMinutes
        if (durationMinutes > 0) {
          const durationHours = durationMinutes / 60
          const calculated = parseFloat(selectedRoom.hourly_rate) * durationHours
          setRentalForm(prev => ({
            ...prev,
            total_amount: calculated.toFixed(2),
          }))
          return
        }
      }
    }
    // Don't clear if user manually typed something — only clear if we're auto-calculating
  }, [rentalForm.band_room_id, rentalForm.start_time, rentalForm.end_time, rooms])

  const rentalFiltered = rentals.filter(r => {
    if (!rentalSearch) return true
    const s = rentalSearch.toLowerCase()
    return (
      (r.client_name || '').toLowerCase().includes(s) ||
      (r.room_name || '').toLowerCase().includes(s) ||
      (r.status || '').toLowerCase().includes(s)
    )
  })

  const rentalHandleInputChange = (e) => {
    const { name, value } = e.target
    setRentalForm(prev => ({ ...prev, [name]: value }))
  }

  const rentalResetForm = () => {
    setRentalForm({
      client_id: '',
      band_room_id: '',
      rental_date: '',
      start_time: '',
      end_time: '',
      total_amount: '',
      status: 'Pending',
    })
    setRentalFormError('')
    setRentalFormSuccess('')
    setRentalEditingId(null)
  }

  const rentalOpenAddModal = () => {
    rentalResetForm()
    setShowRentalModal(true)
  }

  const rentalOpenEditModal = (rental) => {
    setRentalForm({
      client_id: String(rental.client_id || ''),
      band_room_id: String(rental.band_room_id || ''),
      rental_date: rental.rental_date ? rental.rental_date.slice(0, 10) : '',
      start_time: rental.start_time ? rental.start_time.slice(0, 5) : '',
      end_time: rental.end_time ? rental.end_time.slice(0, 5) : '',
      total_amount: rental.total_amount != null ? String(rental.total_amount) : '',
      status: rental.status || 'Pending',
    })
    setRentalEditingId(rental.id)
    setRentalFormError('')
    setRentalFormSuccess('')
    setShowRentalModal(true)
  }

  const rentalCloseModal = () => {
    setShowRentalModal(false)
    rentalResetForm()
  }

  const rentalHandleSubmit = async (e) => {
    e.preventDefault()
    setRentalFormError('')
    setRentalFormSuccess('')

    if (!rentalForm.client_id) {
      setRentalFormError('Client is required.')
      return
    }
    if (!rentalForm.band_room_id) {
      setRentalFormError('Room is required.')
      return
    }

    setRentalFormLoading(true)

    try {
      const isEdit = rentalEditingId !== null
      const url = isEdit ? `${API}/band-room-rentals/${rentalEditingId}` : `${API}/band-room-rentals`
      const method = isEdit ? 'PUT' : 'POST'

      const body = {
        client_id: parseInt(rentalForm.client_id),
        band_room_id: parseInt(rentalForm.band_room_id),
        rental_date: rentalForm.rental_date || null,
        start_time: rentalForm.start_time || null,
        end_time: rentalForm.end_time || null,
        total_amount: rentalForm.total_amount ? parseFloat(rentalForm.total_amount) : null,
        status: rentalForm.status,
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (data.success) {
        setRentalFormSuccess(isEdit ? 'Rental updated successfully!' : 'Rental created successfully!')
        setTimeout(() => {
          rentalCloseModal()
          fetchRentals()
        }, 1000)
      } else {
        setRentalFormError(data.message || `Failed to ${isEdit ? 'update' : 'create'} rental.`)
      }
    } catch (err) {
      setRentalFormError('An error occurred. Please try again.')
    } finally {
      setRentalFormLoading(false)
    }
  }

  const formatPrice = (rate) => {
    if (rate == null) return '-'
    return `₱${parseFloat(rate).toFixed(2)}`
  }

  const formatTime = (time) => {
    if (!time) return '-'
    // time comes as HH:mm:ss from DB time column
    const parts = time.split(':')
    if (parts.length < 2) return time
    const h = parseInt(parts[0])
    const m = parts[1]
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${m} ${ampm}`
  }

  const formatDate = (date) => {
    if (!date) return '-'
    const d = new Date(date + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
      {/* ===== RENTALS SECTION ===== */}
      <div style={{
        background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`,
        overflow: 'hidden', marginBottom: 24,
      }}>
        <div style={{
          padding: '18px 22px', borderBottom: `1px solid ${C.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <h2 style={{ fontFamily: C.display, fontSize: '1.3rem', fontWeight: 700, color: C.navy, margin: 0 }}>
              Studio Booking
            </h2>
            <p style={{ fontSize: '0.8rem', color: C.text3, marginTop: 2 }}>
              {rentalLoading ? 'Loading...' : `${rentalFiltered.length} room rentals`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              placeholder="Search rentals..."
              value={rentalSearch}
              onChange={e => setRentalSearch(e.target.value)}
              style={{
                padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${C.border2}`,
                fontSize: '0.8rem', fontFamily: C.font, outline: 'none', width: 220,
              }}
            />
            <button
              onClick={rentalOpenAddModal}
              style={{
                padding: '8px 18px', borderRadius: 10, border: 'none',
                background: `linear-gradient(135deg, ${C.royal}, ${C.purple})`,
                color: '#fff', fontSize: '0.8rem', fontWeight: 600,
                fontFamily: C.font, cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              + Add Rental
            </button>
          </div>
        </div>

        {rentalError && (
          <div style={{ padding: '12px 22px', background: 'rgba(248,113,113,0.1)', fontSize: '0.8rem', color: C.coral }}>
            {rentalError}
          </div>
        )}

        {rentalLoading ? (
          <div style={{ textAlign: 'center', padding: 60, color: C.text3, fontSize: '0.9rem' }}>
            Loading rentals...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.mist }}>
                  {['Client', 'Room', 'Date', 'Time', 'Total Amount', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', fontSize: '0.7rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rentalFiltered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: C.text3, fontSize: '0.85rem' }}>
                      No rentals found.
                    </td>
                  </tr>
                ) : (
                  rentalFiltered.map(r => {
                    const ss = rentalStatusStyle(r.status)
                    return (
                      <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: C.navy }}>
                            {r.client_name || '-'}
                          </div>
                          {r.client_email && (
                            <div style={{ fontSize: '0.7rem', color: C.text3, marginTop: 2 }}>
                              {r.client_email}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: C.text2 }}>
                          {r.room_name || '-'}
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>
                          {formatDate(r.rental_date)}
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>
                          {formatTime(r.start_time)} – {formatTime(r.end_time)}
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.85rem', fontWeight: 600, color: C.navy }}>
                          {r.total_amount != null ? formatPrice(r.total_amount) : '-'}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            padding: '3px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
                            background: ss.bg, color: ss.c,
                          }}>{r.status}</span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <button
                            onClick={() => rentalOpenEditModal(r)}
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
        )}
      </div>

      {/* Add/Edit Rental Modal */}
      {showRentalModal && (
        <div style={modalOverlayStyle} onClick={rentalCloseModal}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: C.display, fontSize: '1.1rem', fontWeight: 700, color: C.navy, margin: 0 }}>
                {rentalEditingId ? 'Edit Rental' : 'Add New Rental'}
              </h3>
              <button onClick={rentalCloseModal} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: C.text3, padding: '0 4px' }}>✕</button>
            </div>

            {rentalFormError && (
              <div style={{ padding: '10px 14px', background: 'rgba(248,113,113,0.1)', borderRadius: 8, marginBottom: 16, fontSize: '0.8rem', color: C.coral }}>
                {rentalFormError}
              </div>
            )}

            {rentalFormSuccess && (
              <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.1)', borderRadius: 8, marginBottom: 16, fontSize: '0.8rem', color: C.green }}>
                {rentalFormSuccess}
              </div>
            )}

            <form onSubmit={rentalHandleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Client *</label>
                <select
                  name="client_id"
                  value={rentalForm.client_id}
                  onChange={rentalHandleInputChange}
                  style={inputStyle}
                >
                  <option value="">-- Select Client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.f_name || ''} {c.l_name || ''}{c.email ? ` (${c.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Room *</label>
                <select
                  name="band_room_id"
                  value={rentalForm.band_room_id}
                  onChange={rentalHandleInputChange}
                  style={inputStyle}
                >
                  <option value="">-- Select Room --</option>
                  {/* Only show Active rooms in the dropdown — same filter as before */}
                  {rooms.filter(r => r.status === 'Active').map(r => (
                    <option key={r.id} value={r.id}>
                      {r.room_name} {r.hourly_rate ? `(${formatPrice(r.hourly_rate)}/hr)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Date</label>
                <input
                  type="date"
                  name="rental_date"
                  value={rentalForm.rental_date}
                  onChange={rentalHandleInputChange}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Start Time</label>
                  <input
                    type="time"
                    name="start_time"
                    value={rentalForm.start_time}
                    onChange={rentalHandleInputChange}
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>End Time</label>
                  <input
                    type="time"
                    name="end_time"
                    value={rentalForm.end_time}
                    onChange={rentalHandleInputChange}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>
                  Total Amount (₱)
                  {rentalForm.band_room_id && rentalForm.start_time && rentalForm.end_time && (
                    <span style={{ fontSize: '0.7rem', color: C.text3, fontWeight: 400, marginLeft: 6 }}>
                      (auto-calculated, editable)
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  name="total_amount"
                  value={rentalForm.total_amount}
                  onChange={rentalHandleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Status</label>
                <select
                  name="status"
                  value={rentalForm.status}
                  onChange={rentalHandleInputChange}
                  style={inputStyle}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button
                  type="button"
                  onClick={rentalCloseModal}
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
                  disabled={rentalFormLoading}
                  style={{
                    padding: '10px 24px', borderRadius: 10, border: 'none',
                    background: `linear-gradient(135deg, ${C.royal}, ${C.purple})`,
                    color: '#fff', fontSize: '0.82rem', fontWeight: 600, fontFamily: C.font,
                    cursor: rentalFormLoading ? 'not-allowed' : 'pointer', opacity: rentalFormLoading ? 0.7 : 1,
                  }}
                >
                  {rentalFormLoading ? 'Saving...' : rentalEditingId ? 'Update Rental' : 'Create Rental'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}