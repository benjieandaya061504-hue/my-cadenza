import { useState, useEffect } from 'react'
import C from './theme.js'
import MultiSelectDropdown from './MultiSelectDropdown.jsx'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/admin'

export default function StudioRoomManagement({ isMobile, isTablet }) {
  const [rooms, setRooms] = useState([])
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
    room_name: '',
    hourly_rate: '',
    status: 'Active',
  })

  const getToken = () => localStorage.getItem('cadenza_token')

  // Fetch rooms
  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API}/rooms`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (data.success) {
        setRooms(data.data)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to load rooms.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  // Filter rooms by search
  const filtered = rooms.filter(r => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      r.room_name?.toLowerCase().includes(s) ||
      r.status?.toLowerCase().includes(s)
    )
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setForm({
      room_name: '',
      hourly_rate: '',
      status: 'Active',
    })
    setFormError('')
    setFormSuccess('')
    setEditingId(null)
  }

  const openAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (room) => {
    setForm({
      room_name: room.room_name || '',
      hourly_rate: room.hourly_rate != null ? String(room.hourly_rate) : '',
      status: room.status || 'Active',
    })
    setEditingId(room.id)
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

    if (!form.room_name) {
      setFormError('Room name is required.')
      return
    }

    if (!form.hourly_rate) {
      setFormError('Hourly rate is required.')
      return
    }

    setFormLoading(true)

    try {
      const isEdit = editingId !== null
      const url = isEdit ? `${API}/rooms/${editingId}` : `${API}/rooms`
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          room_name: form.room_name,
          hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : null,
          status: form.status,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setFormSuccess(isEdit ? 'Room updated successfully!' : 'Room created successfully!')
        setTimeout(() => {
          closeModal()
          fetchRooms()
        }, 1000)
      } else {
        setFormError(data.message || `Failed to ${isEdit ? 'update' : 'create'} room.`)
      }
    } catch (err) {
      setFormError('An error occurred. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  // ─── Placeholder data (swap with API data later) ────────────────
  const PLACEHOLDER_TIME_SLOTS = [
    { id: 1, formatted_start: '8:00 AM', formatted_end: '9:00 AM' },
    { id: 2, formatted_start: '9:00 AM', formatted_end: '10:00 AM' },
    { id: 3, formatted_start: '10:00 AM', formatted_end: '11:00 AM' },
    { id: 4, formatted_start: '11:00 AM', formatted_end: '12:00 PM' },
    { id: 5, formatted_start: '12:00 PM', formatted_end: '1:00 PM' },
    { id: 6, formatted_start: '1:00 PM', formatted_end: '2:00 PM' },
    { id: 7, formatted_start: '2:00 PM', formatted_end: '3:00 PM' },
    { id: 8, formatted_start: '3:00 PM', formatted_end: '4:00 PM' },
    { id: 9, formatted_start: '4:00 PM', formatted_end: '5:00 PM' },
    { id: 10, formatted_start: '5:00 PM', formatted_end: '6:00 PM' },
  ]

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // ─── Band Room Schedule form state ──────────────────────────────
  const [bandRoomName, setBandRoomName] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [selectedDays, setSelectedDays] = useState([])
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([])
  const [scheduleStatus, setScheduleStatus] = useState('Active')
  const [scheduleFormError, setScheduleFormError] = useState('')
  const [scheduleFormSuccess, setScheduleFormSuccess] = useState('')

  const getTimeSlotLabel = (slot) => {
    if (!slot) return ''
    if (slot.formatted_start && slot.formatted_end) {
      return `${slot.formatted_start} - ${slot.formatted_end}`
    }
    return ''
  }

  const handleAssignSchedule = (e) => {
    e.preventDefault()
    setScheduleFormError('')
    setScheduleFormSuccess('')

    if (!bandRoomName.trim()) {
      setScheduleFormError('Please enter a band room name.')
      return
    }
    if (!hourlyRate) {
      setScheduleFormError('Please enter an hourly rate.')
      return
    }
    if (selectedDays.length === 0) {
      setScheduleFormError('Please select at least one day.')
      return
    }
    if (selectedTimeSlots.length === 0) {
      setScheduleFormError('Please select at least one time slot.')
      return
    }

    const selectedSlotLabels = selectedTimeSlots
      .map(id => PLACEHOLDER_TIME_SLOTS.find(s => s.id === id))
      .filter(Boolean)
      .map(s => getTimeSlotLabel(s))

    const formData = {
      room_name: bandRoomName.trim(),
      hourly_rate: parseFloat(hourlyRate),
      days: selectedDays,
      time_slot_ids: selectedTimeSlots,
      time_slot_labels: selectedSlotLabels,
      status: scheduleStatus,
    }

    // TODO: wire to API — POST /api/admin/band-room-schedules
    console.log('Band Room Schedule Form Data:', formData)
    setScheduleFormSuccess('Schedule logged to console. (Placeholder — no API call yet.)')
  }

  const formatPrice = (rate) => {
    if (rate == null) return '-'
    return `₱${parseFloat(rate).toFixed(2)}`
  }

  const statusStyle = (status) => {
    switch (status) {
      case 'Active': return { bg: 'rgba(16,185,129,0.1)', c: C.green }
      case 'Inactive': return { bg: 'rgba(148,163,184,0.1)', c: C.text3 }
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
      {/* ===== ROOMS SECTION ===== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: C.display, fontSize: '1.3rem', fontWeight: 700, color: C.navy, margin: 0 }}>Studio Room Management</h2>
          <p style={{ fontSize: '0.8rem', color: C.text3, marginTop: 2 }}>
            {loading ? 'Loading...' : `${filtered.length} rooms`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder="Search rooms..."
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
            + Add Room
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
          Loading rooms...
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.mist }}>
                  {['Room Name', 'Hourly Rate', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', fontSize: '0.7rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: C.text3, fontSize: '0.85rem' }}>
                      No rooms found.
                    </td>
                  </tr>
                ) : (
                  filtered.map(r => {
                    const ss = statusStyle(r.status)
                    return (
                      <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '12px 14px', fontSize: '0.85rem', fontWeight: 600, color: C.navy }}>{r.room_name}</td>
                        <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>
                          {r.hourly_rate ? formatPrice(r.hourly_rate) + '/hr' : '-'}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            padding: '3px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
                            background: ss.bg, color: ss.c,
                          }}>{r.status}</span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <button
                            onClick={() => openEditModal(r)}
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

      {/* ===== ADD BAND ROOM SCHEDULE SECTION ===== */}
      <div style={{
        background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`,
        padding: '1.2rem', marginBottom: 20,
      }}>
        <h3 style={{ fontFamily: C.display, fontSize: '0.95rem', fontWeight: 600, color: C.navy, margin: '0 0 14px' }}>
          ADD BAND ROOM SCHEDULE
        </h3>

        {scheduleFormError && (
          <div style={{ padding: '10px 14px', background: 'rgba(248,113,113,0.1)', borderRadius: 8, marginBottom: 12, fontSize: '0.8rem', color: C.coral }}>
            {scheduleFormError}
          </div>
        )}

        {scheduleFormSuccess && (
          <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.1)', borderRadius: 8, marginBottom: 12, fontSize: '0.8rem', color: C.green }}>
            {scheduleFormSuccess}
          </div>
        )}

        <form onSubmit={handleAssignSchedule}>
          {/* Row 1: Band Room, Hourly Rate, Days, Time Slots */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 10 }}>
            <div>
              <label style={labelStyle}>Band Room</label>
              <input
                type="text"
                value={bandRoomName}
                onChange={e => setBandRoomName(e.target.value)}
                placeholder="e.g. Band Room 1"
                style={{
                  padding: '8px 12px', borderRadius: 10, border: `1.5px solid ${C.border2}`,
                  fontSize: '0.8rem', fontFamily: C.font, outline: 'none', background: '#fff',
                  minWidth: 160, boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={labelStyle}>Hourly Rate (₱)</label>
              <input
                type="number"
                value={hourlyRate}
                onChange={e => setHourlyRate(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                style={{
                  padding: '8px 12px', borderRadius: 10, border: `1.5px solid ${C.border2}`,
                  fontSize: '0.8rem', fontFamily: C.font, outline: 'none', background: '#fff',
                  minWidth: 140, boxSizing: 'border-box',
                }}
              />
            </div>

            <MultiSelectDropdown
              label="Days"
              options={DAYS}
              selectedValues={selectedDays}
              onChange={setSelectedDays}
              getOptionLabel={d => d}
              getOptionValue={d => d}
              placeholder="Select days ▾"
            />

            <MultiSelectDropdown
              label="Time Slots"
              options={PLACEHOLDER_TIME_SLOTS}
              selectedValues={selectedTimeSlots}
              onChange={setSelectedTimeSlots}
              getOptionLabel={s => getTimeSlotLabel(s)}
              getOptionValue={s => s.id}
              placeholder="Select time slots ▾"
            />
          </div>

          {/* Row 2: Status (full width) */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Status</label>
            <select
              value={scheduleStatus}
              onChange={e => setScheduleStatus(e.target.value)}
              style={{
                padding: '8px 12px', borderRadius: 10, border: `1.5px solid ${C.border2}`,
                fontSize: '0.8rem', fontFamily: C.font, outline: 'none', background: '#fff',
                minWidth: 160,
              }}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Submit button — bottom-right */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              style={{
                padding: '8px 20px', borderRadius: 10, border: 'none',
                background: `linear-gradient(135deg, ${C.royal}, ${C.purple})`,
                color: '#fff', fontSize: '0.82rem', fontWeight: 600, fontFamily: C.font,
                cursor: 'pointer', height: 38, whiteSpace: 'nowrap',
              }}
            >
              Assign Schedule
            </button>
          </div>
        </form>
      </div>

      {/* Add/Edit Room Modal */}
      {showModal && (
        <div style={modalOverlayStyle} onClick={closeModal}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: C.display, fontSize: '1.1rem', fontWeight: 700, color: C.navy, margin: 0 }}>
                {editingId ? 'Edit Room' : 'Add New Room'}
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
                <label style={labelStyle}>Room Name *</label>
                <input
                  type="text"
                  name="room_name"
                  value={form.room_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Studio A"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Hourly Rate (₱) *</label>
                <input
                  type="number"
                  name="hourly_rate"
                  value={form.hourly_rate}
                  onChange={handleInputChange}
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
                  value={form.status}
                  onChange={handleInputChange}
                  style={inputStyle}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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
                  {formLoading ? 'Saving...' : editingId ? 'Update Room' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}