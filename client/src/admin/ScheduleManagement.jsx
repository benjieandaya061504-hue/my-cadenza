import { useState, useEffect, useRef, Fragment } from 'react'
import C from './theme.js'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/admin'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const STATUS_OPTIONS = ['Available', 'Unavailable', 'On Leave']

const getToken = () => localStorage.getItem('cadenza_token')

function formatTime(timeVal) {
  if (!timeVal) return ''
  const d = new Date(timeVal)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

// ─── Multi-select dropdown component ──────────────────────────────
function MultiSelectDropdown({
  label,
  options,
  selectedValues,
  onChange,
  getOptionLabel,
  getOptionValue,
  placeholder,
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Click outside to close
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const count = selectedValues.length
  const summary = count > 0
    ? `${count} ${label.toLowerCase()} selected`
    : `Select ${label.toLowerCase()} ▾`

  const allSelected = options.length > 0 && selectedValues.length === options.length

  const handleSelectAll = () => {
    onChange(options.map(o => getOptionValue(o)))
  }

  const handleClearAll = () => {
    onChange([])
  }

  const handleToggle = (val) => {
    onChange(prev =>
      prev.includes(val)
        ? prev.filter(v => v !== val)
        : [...prev, val]
    )
  }

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: 200 }}>
      <label style={{
        display: 'block', fontSize: '0.75rem', fontWeight: 600,
        color: C.text2, marginBottom: 5,
      }}>
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '8px 12px', borderRadius: 10,
          border: `1.5px solid ${C.border2}`, fontSize: '0.8rem',
          fontFamily: C.font, outline: 'none', background: '#fff',
          cursor: 'pointer', textAlign: 'left', color: count > 0 ? C.navy : C.text3,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <span>{summary}</span>
        <span style={{ fontSize: '0.7rem', color: C.text3, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          marginTop: 4, background: '#fff', borderRadius: 10,
          border: `1px solid ${C.border}`, boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
          maxHeight: 240, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}>
          {/* Select All / Clear All */}
          <div style={{
            display: 'flex', gap: 8, padding: '8px 12px',
            borderBottom: `1px solid ${C.border}`,
          }}>
            <button
              type="button"
              onClick={handleSelectAll}
              disabled={allSelected}
              style={{
                background: 'none', border: 'none', fontSize: '0.72rem',
                color: allSelected ? C.text3 : C.royal, cursor: allSelected ? 'default' : 'pointer',
                fontFamily: C.font, fontWeight: 600, padding: 0,
              }}
            >
              Select All
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              disabled={count === 0}
              style={{
                background: 'none', border: 'none', fontSize: '0.72rem',
                color: count === 0 ? C.text3 : C.coral, cursor: count === 0 ? 'default' : 'pointer',
                fontFamily: C.font, fontWeight: 600, padding: 0,
              }}
            >
              Clear All
            </button>
          </div>

          {/* Checkbox list */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {options.map(opt => {
              const val = getOptionValue(opt)
              const checked = selectedValues.includes(val)
              return (
                <label
                  key={val}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 12px', cursor: 'pointer',
                    fontSize: '0.8rem', color: C.text2,
                    background: checked ? 'rgba(37,99,235,0.06)' : 'transparent',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggle(val)}
                    style={{ accentColor: C.royal }}
                  />
                  {getOptionLabel(opt)}
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────
export default function ScheduleManagement({ isMobile, isTablet }) {
  // Instructor Schedules state
  const [schedules, setSchedules] = useState([])
  const [instructors, setInstructors] = useState([])
  const [timeSlots, setTimeSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Form state
  const [selectedInstructor, setSelectedInstructor] = useState('')
  const [selectedDays, setSelectedDays] = useState([])
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([])
  const [selectedStatus, setSelectedStatus] = useState('Available')
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [formSummary, setFormSummary] = useState(null)
  const [summaryExpanded, setSummaryExpanded] = useState(false)

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [editInstructor, setEditInstructor] = useState('')
  const [editDay, setEditDay] = useState('')
  const [editTimeSlot, setEditTimeSlot] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [editFormLoading, setEditFormLoading] = useState(false)
  const [editFormError, setEditFormError] = useState('')

  // Delete confirm state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingSchedule, setDeletingSchedule] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Clear All state
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clearLoading, setClearLoading] = useState(false)
  const [clearMessage, setClearMessage] = useState('')

  // Grouped table expand state — set of instructor IDs (as numbers)
  const [expandedInstructors, setExpandedInstructors] = useState(new Set())

  // Fetch all data
  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [schedRes, instrRes, slotsRes] = await Promise.all([
        fetch(`${API}/instructor-schedules`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
        fetch(`${API}/instructors`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
        fetch(`${API}/time-slots`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
      ])

      const schedData = await schedRes.json()
      const instrData = await instrRes.json()
      const slotsData = await slotsRes.json()

      if (schedData.success) setSchedules(schedData.data)
      else setError(schedData.message)

      if (instrData.success) setInstructors(instrData.data)
      if (slotsData.success) setTimeSlots(slotsData.data)
    } catch (err) {
      setError('Failed to load data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Get instructor full name
  const getInstructorName = (schedule) => {
    const staff = schedule?.instructor?.staff
    if (!staff) return 'Unknown'
    const parts = [staff.f_name, staff.m_name, staff.l_name].filter(Boolean)
    return parts.join(' ') || 'Unknown'
  }

  // Get instructor name from instructors list by id
  const getInstructorNameById = (id) => {
    const instr = instructors.find(i => i.id === parseInt(id))
    if (!instr?.staff) return 'Unknown'
    const parts = [instr.staff.f_name, instr.staff.m_name, instr.staff.l_name].filter(Boolean)
    return parts.join(' ') || 'Unknown'
  }

  // Get time slot label
  const getTimeSlotLabel = (slot) => {
    if (!slot) return ''
    // Use server-formatted 12-hour fields if available
    if (slot.formatted_start && slot.formatted_end) {
      return `${slot.formatted_start} - ${slot.formatted_end}`
    }
    // Fallback to raw formatting for legacy data
    return `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`
  }

  const getTimeSlotLabelById = (id) => {
    const slot = timeSlots.find(t => t.id === parseInt(id))
    return slot ? getTimeSlotLabel(slot) : ''
  }

  // Group schedules by instructor_id (numeric) for the grouped table
  const groupedByInstructorId = schedules.reduce((acc, s) => {
    const id = s.instructor_id
    if (!acc[id]) acc[id] = []
    acc[id].push(s)
    return acc
  }, {})

  // Compute total combinations for button label
  const totalCombinations = selectedDays.length * selectedTimeSlots.length

  // Handle Assign (batch) — sends day_of_week as array for cross-product
  const handleAssign = async () => {
    if (!selectedInstructor || selectedDays.length === 0 || selectedTimeSlots.length === 0) {
      setFormError('Please select instructor, at least one day, and at least one time slot.')
      return
    }

    setFormLoading(true)
    setFormError('')
    setFormSuccess('')
    setFormSummary(null)
    setSummaryExpanded(false)
    setClearMessage('')

    try {
      const res = await fetch(`${API}/instructor-schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          instructor_id: parseInt(selectedInstructor),
          day_of_week: selectedDays,
          time_slot_ids: selectedTimeSlots,
          status: selectedStatus,
        }),
      })

      const data = await res.json()

      if (data.success) {
        const createdCount = data.created?.length || 0
        const skippedCount = data.skipped?.length || 0

        setFormSummary({
          created: createdCount,
          skipped: skippedCount,
          createdEntries: data.created || [],
          skippedEntries: data.skipped || [],
        })

        setFormSuccess(`Assigned ${createdCount} new schedule entr${createdCount === 1 ? 'y' : 'ies'}.`)
        setSelectedInstructor('')
        setSelectedDays([])
        setSelectedTimeSlots([])
        setSelectedStatus('Available')
        fetchData()
      } else {
        setFormError(data.message || 'Failed to assign schedule.')
      }
    } catch (err) {
      setFormError('An error occurred. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  // Open Edit Modal
  const openEditModal = (schedule) => {
    setEditingSchedule(schedule)
    setEditInstructor(String(schedule.instructor_id))
    setEditDay(schedule.day_of_week)
    setEditTimeSlot(String(schedule.time_slot_id))
    setEditStatus(schedule.status || 'Available')
    setEditFormError('')
    setShowEditModal(true)
  }

  // Handle Edit
  const handleEdit = async () => {
    if (!editingSchedule) return

    setEditFormLoading(true)
    setEditFormError('')

    try {
      const res = await fetch(`${API}/instructor-schedules/${editingSchedule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          instructor_id: parseInt(editInstructor),
          day_of_week: editDay,
          time_slot_id: parseInt(editTimeSlot),
          status: editStatus,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setShowEditModal(false)
        setEditingSchedule(null)
        setClearMessage('')
        fetchData()
      } else {
        setEditFormError(data.message || 'Failed to update schedule.')
      }
    } catch (err) {
      setEditFormError('An error occurred. Please try again.')
    } finally {
      setEditFormLoading(false)
    }
  }

  // Open Delete Confirm
  const openDeleteConfirm = (schedule) => {
    setDeletingSchedule(schedule)
    setShowDeleteConfirm(true)
  }

  // Handle Delete
  const handleDelete = async () => {
    if (!deletingSchedule) return

    setDeleteLoading(true)

    try {
      const res = await fetch(`${API}/instructor-schedules/${deletingSchedule.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })

      const data = await res.json()

      if (data.success) {
        setShowDeleteConfirm(false)
        setDeletingSchedule(null)
        setClearMessage('')
        fetchData()
      } else {
        setError(data.message || 'Failed to delete schedule.')
        setShowDeleteConfirm(false)
        setDeletingSchedule(null)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setShowDeleteConfirm(false)
      setDeletingSchedule(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  // Handle Clear All
  const handleClearAll = async () => {
    if (!selectedInstructor) return

    setClearLoading(true)

    try {
      const res = await fetch(`${API}/instructor-schedules/instructor/${selectedInstructor}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })

      const data = await res.json()

      if (data.success) {
        const instrName = getInstructorNameById(selectedInstructor)
        setShowClearConfirm(false)
        setClearMessage(`✅ Cleared ${data.deletedCount} schedule entr${data.deletedCount === 1 ? 'y' : 'ies'} for ${instrName}.`)
        setFormSummary(null)
        setFormSuccess('')
        fetchData()
      } else {
        setClearMessage(`❌ ${data.message || 'Failed to clear schedule.'}`)
        setShowClearConfirm(false)
      }
    } catch (err) {
      setClearMessage('❌ An error occurred. Please try again.')
      setShowClearConfirm(false)
    } finally {
      setClearLoading(false)
    }
  }

  // Toggle expand for an instructor group
  const toggleExpand = (instructorId) => {
    setExpandedInstructors(prev => {
      const next = new Set(prev)
      if (next.has(instructorId)) {
        next.delete(instructorId)
      } else {
        next.add(instructorId)
      }
      return next
    })
  }

  // Shared styles
  const selectStyle = {
    padding: '8px 12px', borderRadius: 10, border: `1.5px solid ${C.border2}`,
    fontSize: '0.8rem', fontFamily: C.font, outline: 'none', background: '#fff',
    minWidth: 140,
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

  const modalOverlayStyle = {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20,
  }

  const modalStyle = {
    background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480,
    maxHeight: '90vh', overflow: 'auto',
    boxShadow: '0 24px 64px rgba(15,23,42,0.2)',
    padding: '28px 32px',
  }

  return (
    <div style={{ fontFamily: C.font }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: C.display, fontSize: '1.3rem', fontWeight: 700, color: C.navy, margin: 0 }}>Instructor Schedules</h2>
          <p style={{ fontSize: '0.8rem', color: C.text3, marginTop: 2 }}>
            {loading ? 'Loading...' : `${schedules.length} assignments`}
          </p>
        </div>
      </div>

      {/* Assign Form */}
      <div style={{
        background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`,
        padding: '1.2rem', marginBottom: 20,
      }}>
        <h3 style={{ fontFamily: C.display, fontSize: '0.95rem', fontWeight: 600, color: C.navy, margin: '0 0 14px' }}>
          Assign Instructor Schedule
        </h3>

        {formError && (
          <div style={{ padding: '10px 14px', background: 'rgba(248,113,113,0.1)', borderRadius: 8, marginBottom: 12, fontSize: '0.8rem', color: C.coral }}>
            {formError}
          </div>
        )}

        {/* Collapsible result summary */}
        {formSummary && (
          <div style={{
            marginBottom: 12, borderRadius: 8,
            background: 'rgba(16,185,129,0.08)',
            border: `1px solid rgba(16,185,129,0.2)`,
            overflow: 'hidden',
          }}>
            {/* Collapsed line */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 14px', fontSize: '0.8rem', color: C.green,
            }}>
              <span>
                ✅ {formSummary.created} assigned
                {formSummary.skipped > 0 && `, ${formSummary.skipped} skipped (already assigned)`}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setSummaryExpanded(s => !s)}
                  style={{
                    background: 'none', border: 'none', fontSize: '0.75rem',
                    color: C.royal, cursor: 'pointer', fontFamily: C.font,
                    fontWeight: 600, padding: '2px 0',
                  }}
                >
                  {summaryExpanded ? 'Hide details ▲' : 'Show details ▾'}
                </button>
                <button
                  type="button"
                  onClick={() => { setFormSummary(null); setFormSuccess('') }}
                  style={{
                    background: 'none', border: 'none', fontSize: '0.85rem',
                    color: C.text3, cursor: 'pointer', padding: 0, lineHeight: 1,
                  }}
                  title="Dismiss"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Expanded breakdown */}
            {summaryExpanded && (
              <div style={{
                borderTop: `1px solid rgba(16,185,129,0.15)`,
                padding: '10px 14px', fontSize: '0.78rem', color: C.text2,
                maxHeight: 200, overflowY: 'auto',
              }}>
                {formSummary.createdEntries.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, color: C.green, marginBottom: 4 }}>Created ({formSummary.createdEntries.length}):</div>
                    {formSummary.createdEntries.map((entry, i) => (
                      <div key={i} style={{ padding: '2px 0' }}>
                        {entry.day_of_week} — {getTimeSlotLabel(entry.time_slot)}
                      </div>
                    ))}
                  </div>
                )}
                {formSummary.skippedEntries.length > 0 && (
                  <div>
                    <div style={{ fontWeight: 600, color: C.gold, marginBottom: 4 }}>Skipped ({formSummary.skippedEntries.length}):</div>
                    {formSummary.skippedEntries.map((entry, i) => (
                      <div key={i} style={{ padding: '2px 0' }}>
                        {entry.day_of_week} — {getTimeSlotLabelById(entry.time_slot_id)} ({entry.reason})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Loading status message during assign */}
        {formLoading && (
          <div style={{
            marginBottom: 12, padding: '8px 14px', borderRadius: 8,
            background: 'rgba(37,99,235,0.08)',
            border: `1px solid rgba(37,99,235,0.2)`,
            fontSize: '0.8rem', color: C.royal,
          }}>
            Creating {totalCombinations} schedule entries...
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={labelStyle}>Instructor</label>
            <select
              value={selectedInstructor}
              onChange={e => setSelectedInstructor(e.target.value)}
              style={selectStyle}
            >
              <option value="">Select instructor</option>
              {instructors.map(i => (
                <option key={i.id} value={i.id}>
                  {[i.staff?.f_name, i.staff?.m_name, i.staff?.l_name].filter(Boolean).join(' ')}
                </option>
              ))}
            </select>
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
            options={timeSlots}
            selectedValues={selectedTimeSlots}
            onChange={setSelectedTimeSlots}
            getOptionLabel={t => getTimeSlotLabel(t)}
            getOptionValue={t => t.id}
            placeholder="Select time slots ▾"
          />

          <div>
            <label style={labelStyle}>Status</label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              style={selectStyle}
            >
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <button
            onClick={handleAssign}
            disabled={formLoading || totalCombinations === 0}
            style={{
              padding: '8px 20px', borderRadius: 10, border: 'none',
              background: `linear-gradient(135deg, ${C.royal}, ${C.purple})`,
              color: '#fff', fontSize: '0.82rem', fontWeight: 600, fontFamily: C.font,
              cursor: formLoading || totalCombinations === 0 ? 'not-allowed' : 'pointer',
              opacity: formLoading || totalCombinations === 0 ? 0.7 : 1,
              height: 38, whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {formLoading ? (
              <>
                <span style={{
                  display: 'inline-block', width: 14, height: 14,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  animation: 'cadenza-spin 0.6s linear infinite',
                }} />
                Assigning...
              </>
            ) : `Assign Selected (${totalCombinations})`}
          </button>
        </div>

        {/* Clear All Schedule button */}
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
          <button
            onClick={() => {
              const entryCount = schedules.filter(s => s.instructor_id === parseInt(selectedInstructor)).length
              if (entryCount === 0) {
                setClearMessage('This instructor has no schedule entries to clear.')
                return
              }
              setShowClearConfirm(true)
            }}
            disabled={!selectedInstructor || formLoading}
            style={{
              padding: '8px 20px', borderRadius: 10, border: `1.5px solid ${C.coral}`,
              background: selectedInstructor ? 'rgba(248,113,113,0.08)' : '#f5f5f5',
              color: selectedInstructor ? C.coral : C.text3,
              fontSize: '0.82rem', fontWeight: 600, fontFamily: C.font,
              cursor: selectedInstructor && !formLoading ? 'pointer' : 'not-allowed',
              opacity: selectedInstructor && !formLoading ? 1 : 0.6,
              height: 38, whiteSpace: 'nowrap',
            }}
          >
            {selectedInstructor
              ? `Clear All Schedule for ${getInstructorNameById(selectedInstructor)}`
              : 'Clear All Schedule (select instructor first)'}
          </button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.1)', borderRadius: 10, marginBottom: 16, fontSize: '0.8rem', color: C.coral }}>
          {error}
        </div>
      )}

      {/* Clear message display */}
      {clearMessage && (
        <div style={{
          padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: '0.8rem',
          background: clearMessage.startsWith('❌')
            ? 'rgba(248,113,113,0.1)'
            : clearMessage.startsWith('✅')
              ? 'rgba(16,185,129,0.08)'
              : 'rgba(245,158,11,0.1)',
          color: clearMessage.startsWith('❌')
            ? C.coral
            : clearMessage.startsWith('✅')
              ? C.green
              : C.gold,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>{clearMessage}</span>
          <button
            onClick={() => setClearMessage('')}
            style={{
              background: 'none', border: 'none', fontSize: '0.85rem',
              color: C.text3, cursor: 'pointer', padding: 0, lineHeight: 1,
            }}
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {/* Schedules Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.text3, fontSize: '0.9rem' }}>
          Loading schedules...
        </div>
      ) : schedules.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.text3, fontSize: '0.9rem' }}>
          No instructor schedules found. Use the form above to assign one.
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.mist }}>
                  {['Instructor', 'Day', 'Time', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', fontSize: '0.7rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedByInstructorId).map(([instructorId, entries]) => {
                  const id = parseInt(instructorId)
                  const isExpanded = expandedInstructors.has(id)
                  const remainingCount = entries.length - 1
                  const showToggle = entries.length > 1

                  return (
                    <Fragment key={id}>
                      {/* First row — always visible */}
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '12px 14px', fontSize: '0.85rem', fontWeight: 600, color: C.navy }}>
                          {getInstructorName(entries[0])}
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>{entries[0].day_of_week}</td>
                        <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>
                          {getTimeSlotLabel(entries[0].time_slot)}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            padding: '3px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
                            background: entries[0].status === 'Available' ? 'rgba(16,185,129,0.1)' :
                                         entries[0].status === 'Unavailable' ? 'rgba(248,113,113,0.1)' :
                                         'rgba(245,158,11,0.1)',
                            color: entries[0].status === 'Available' ? C.green :
                                   entries[0].status === 'Unavailable' ? C.coral :
                                   C.gold,
                          }}>{entries[0].status || 'Available'}</span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <button
                              onClick={() => openEditModal(entries[0])}
                              style={{
                                padding: '5px 12px', borderRadius: 8, border: `1.5px solid ${C.royal}`,
                                background: 'rgba(37,99,235,0.08)', color: C.royal,
                                fontSize: '0.72rem', fontWeight: 600, fontFamily: C.font,
                                cursor: 'pointer',
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => openDeleteConfirm(entries[0])}
                              style={{
                                padding: '5px 12px', borderRadius: 8, border: `1.5px solid ${C.coral}`,
                                background: 'rgba(248,113,113,0.08)', color: C.coral,
                                fontSize: '0.72rem', fontWeight: 600, fontFamily: C.font,
                                cursor: 'pointer',
                              }}
                            >
                              Delete
                            </button>
                            {showToggle && (
                              <button
                                onClick={() => toggleExpand(id)}
                                style={{
                                  padding: '5px 12px', borderRadius: 8, border: `1.5px solid ${C.border2}`,
                                  background: 'rgba(100,116,139,0.06)', color: C.text2,
                                  fontSize: '0.72rem', fontWeight: 600, fontFamily: C.font,
                                  cursor: 'pointer', whiteSpace: 'nowrap',
                                }}
                              >
                                {isExpanded ? `Show less` : `Show more (${remainingCount})`}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded rows — remaining entries */}
                      {isExpanded && entries.slice(1).map(entry => (
                        <tr key={entry.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: C.text3, fontStyle: 'italic' }}>
                            {/* blank — grouping indicator */}
                          </td>
                          <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2, borderLeft: `3px solid ${C.border}` }}>
                            {entry.day_of_week}
                          </td>
                          <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>
                            {getTimeSlotLabel(entry.time_slot)}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{
                              padding: '3px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
                              background: entry.status === 'Available' ? 'rgba(16,185,129,0.1)' :
                                           entry.status === 'Unavailable' ? 'rgba(248,113,113,0.1)' :
                                           'rgba(245,158,11,0.1)',
                              color: entry.status === 'Available' ? C.green :
                                     entry.status === 'Unavailable' ? C.coral :
                                     C.gold,
                            }}>{entry.status || 'Available'}</span>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                onClick={() => openEditModal(entry)}
                                style={{
                                  padding: '5px 12px', borderRadius: 8, border: `1.5px solid ${C.royal}`,
                                  background: 'rgba(37,99,235,0.08)', color: C.royal,
                                  fontSize: '0.72rem', fontWeight: 600, fontFamily: C.font,
                                  cursor: 'pointer',
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => openDeleteConfirm(entry)}
                                style={{
                                  padding: '5px 12px', borderRadius: 8, border: `1.5px solid ${C.coral}`,
                                  background: 'rgba(248,113,113,0.08)', color: C.coral,
                                  fontSize: '0.72rem', fontWeight: 600, fontFamily: C.font,
                                  cursor: 'pointer',
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingSchedule && (
        <div style={modalOverlayStyle} onClick={() => setShowEditModal(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: C.display, fontSize: '1.1rem', fontWeight: 700, color: C.navy, margin: 0 }}>
                Edit Schedule
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: C.text3, padding: '0 4px' }}
              >
                ✕
              </button>
            </div>

            {editFormError && (
              <div style={{ padding: '10px 14px', background: 'rgba(248,113,113,0.1)', borderRadius: 8, marginBottom: 16, fontSize: '0.8rem', color: C.coral }}>
                {editFormError}
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Instructor</label>
              <select
                value={editInstructor}
                onChange={e => setEditInstructor(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select instructor</option>
                {instructors.map(i => (
                  <option key={i.id} value={i.id}>
                    {[i.staff?.f_name, i.staff?.m_name, i.staff?.l_name].filter(Boolean).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Day</label>
              <select
                value={editDay}
                onChange={e => setEditDay(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select day</option>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Time Slot</label>
              <select
                value={editTimeSlot}
                onChange={e => setEditTimeSlot(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select time</option>
                {timeSlots.map(t => (
                  <option key={t.id} value={t.id}>
                    {getTimeSlotLabel(t)}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Status</label>
              <select
                value={editStatus}
                onChange={e => setEditStatus(e.target.value)}
                style={inputStyle}
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  padding: '10px 20px', borderRadius: 10, border: `1.5px solid ${C.border2}`,
                  background: '#fff', fontSize: '0.82rem', fontWeight: 600, fontFamily: C.font,
                  color: C.text2, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={editFormLoading}
                style={{
                  padding: '10px 24px', borderRadius: 10, border: 'none',
                  background: `linear-gradient(135deg, ${C.royal}, ${C.purple})`,
                  color: '#fff', fontSize: '0.82rem', fontWeight: 600, fontFamily: C.font,
                  cursor: editFormLoading ? 'not-allowed' : 'pointer', opacity: editFormLoading ? 0.7 : 1,
                }}
              >
                {editFormLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && deletingSchedule && (
        <div style={modalOverlayStyle} onClick={() => setShowDeleteConfirm(false)}>
          <div style={{ ...modalStyle, maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: C.display, fontSize: '1.1rem', fontWeight: 700, color: C.navy, margin: '0 0 12px' }}>
              Confirm Delete
            </h3>
            <p style={{ fontSize: '0.85rem', color: C.text2, margin: '0 0 20px', lineHeight: 1.5 }}>
              Are you sure you want to delete the schedule for <strong>{getInstructorName(deletingSchedule)}</strong> on <strong>{deletingSchedule.day_of_week}</strong> at <strong>{getTimeSlotLabel(deletingSchedule.time_slot)}</strong>?
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: '10px 20px', borderRadius: 10, border: `1.5px solid ${C.border2}`,
                  background: '#fff', fontSize: '0.82rem', fontWeight: 600, fontFamily: C.font,
                  color: C.text2, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                style={{
                  padding: '10px 24px', borderRadius: 10, border: 'none',
                  background: C.coral, color: '#fff', fontSize: '0.82rem',
                  fontWeight: 600, fontFamily: C.font,
                  cursor: deleteLoading ? 'not-allowed' : 'pointer', opacity: deleteLoading ? 0.7 : 1,
                }}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation */}
      {showClearConfirm && selectedInstructor && (
        <div style={modalOverlayStyle} onClick={() => setShowClearConfirm(false)}>
          <div style={{ ...modalStyle, maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: C.display, fontSize: '1.1rem', fontWeight: 700, color: C.navy, margin: '0 0 12px' }}>
              Clear All Schedule
            </h3>
            <p style={{ fontSize: '0.85rem', color: C.text2, margin: '0 0 20px', lineHeight: 1.5 }}>
              This will delete ALL schedule entries for <strong>{getInstructorNameById(selectedInstructor)}</strong> ({schedules.filter(s => s.instructor_id === parseInt(selectedInstructor)).length} entries). This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  padding: '10px 20px', borderRadius: 10, border: `1.5px solid ${C.border2}`,
                  background: '#fff', fontSize: '0.82rem', fontWeight: 600, fontFamily: C.font,
                  color: C.text2, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                disabled={clearLoading}
                style={{
                  padding: '10px 24px', borderRadius: 10, border: 'none',
                  background: C.coral, color: '#fff', fontSize: '0.82rem',
                  fontWeight: 600, fontFamily: C.font,
                  cursor: clearLoading ? 'not-allowed' : 'pointer', opacity: clearLoading ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {clearLoading ? (
                  <>
                    <span style={{
                      display: 'inline-block', width: 14, height: 14,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff', borderRadius: '50%',
                      animation: 'cadenza-spin 0.6s linear infinite',
                    }} />
                    Clearing...
                  </>
                ) : 'Yes, Clear All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global spinner animation */}
      <style>{`
        @keyframes cadenza-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}