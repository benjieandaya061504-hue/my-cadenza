import { useState, useEffect } from 'react'
import C from './theme.js'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/admin'

const FREQUENCY_OPTIONS = [
  { value: 1, label: '1 time / week' },
  { value: 2, label: '2 times / week' },
  { value: 3, label: '3 times / week' },
  { value: 4, label: '4 times / week' },
  { value: 5, label: '5 times / week' },
  { value: 6, label: '6 times / week' },
  { value: 7, label: '7 times / week' },
]

const DURATION_UNITS = ['Month(s)', 'Week(s)', 'Quarter(s)']

const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced']

const STATUS_OPTIONS = ['Active', 'Inactive']

function formatTime(timeVal) {
  if (!timeVal) return ''
  const d = new Date(timeVal)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

export default function LessonPackageManagement({ isMobile, isTablet }) {
  // List view state
  const [packages, setPackages] = useState([])
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [view, setView] = useState('list') // 'list' | 'create' | 'edit'

  // Form state
  const [form, setForm] = useState({
    package_name: '',
    lesson_id: '',
    total_session: 4,
    duration_number: 1,
    duration_unit: 'Month(s)',
    session: 1,
    fee: '',
    level_name: 'Beginner',
    status: 'Active',
  })
  const [editingId, setEditingId] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Matching instructors state
  const [matchedInstructors, setMatchedInstructors] = useState([])
  const [instructorsLoading, setInstructorsLoading] = useState(false)
  const [instructorSearch, setInstructorSearch] = useState('')
  const [expandedInstructor, setExpandedInstructor] = useState(null)

  const getToken = () => localStorage.getItem('cadenza_token')

  // Fetch packages and lessons on mount
  const fetchPackages = async () => {
    try {
      const res = await fetch(`${API}/packages`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (data.success) {
        setPackages(data.data)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to load packages.')
    } finally {
      setLoading(false)
    }
  }

  const fetchLessons = async () => {
    try {
      const res = await fetch(`${API}/lessons`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (data.success) {
        setLessons(data.data)
      }
    } catch (err) {
      // ignore
    }
  }

  useEffect(() => {
    fetchPackages()
    fetchLessons()
  }, [])

  // Fetch matching instructors when lesson_id changes
  useEffect(() => {
    if (!form.lesson_id) {
      setMatchedInstructors([])
      return
    }

    const fetchInstructors = async () => {
      setInstructorsLoading(true)
      try {
        const res = await fetch(`${API}/lessons/${form.lesson_id}/available-instructors`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        })
        const data = await res.json()
        if (data.success) {
          setMatchedInstructors(data.data)
        } else {
          setMatchedInstructors([])
        }
      } catch (err) {
        setMatchedInstructors([])
      } finally {
        setInstructorsLoading(false)
      }
    }

    fetchInstructors()
  }, [form.lesson_id])

  // Computed values
  const selectedLesson = lessons.find(l => l.id === parseInt(form.lesson_id))

  const computedSummary = () => {
    const parts = []
    if (form.total_session) parts.push(`${form.total_session} sessions`)
    if (form.session) parts.push(`${form.session} time(s) per week`)
    if (form.duration_number && form.duration_unit) parts.push(`for ${form.duration_number} ${form.duration_unit}`)
    return parts.length > 0 ? parts.join(' - ') : '—'
  }

  // Filter packages by search
  const filteredPackages = packages.filter(p => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      p.package_name?.toLowerCase().includes(s) ||
      p.lesson_name?.toLowerCase().includes(s) ||
      p.level_name?.toLowerCase().includes(s)
    )
  })

  // Filter matched instructors by search
  const filteredInstructors = matchedInstructors.filter(i => {
    if (!instructorSearch) return true
    const s = instructorSearch.toLowerCase()
    const name = `${i.staff?.f_name || ''} ${i.staff?.l_name || ''}`.toLowerCase()
    const specialty = i.instructor_specialties?.[0]?.specialties?.specialty_name?.toLowerCase() || ''
    return name.includes(s) || specialty.includes(s)
  })

  const getFullName = (staff) => {
    const parts = [staff?.f_name, staff?.m_name, staff?.l_name].filter(Boolean)
    return parts.join(' ') || 'Unknown'
  }

  const getInitials = (staff) => {
    const first = staff?.f_name?.[0] || ''
    const last = staff?.l_name?.[0] || ''
    return (first + last).toUpperCase() || '?'
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setForm({
      package_name: '',
      lesson_id: '',
      total_session: 4,
      duration_number: 1,
      duration_unit: 'Month(s)',
      session: 1,
      fee: '',
      level_name: 'Beginner',
      status: 'Active',
    })
    setFormError('')
    setFormSuccess('')
    setEditingId(null)
    setMatchedInstructors([])
  }

  const openCreateView = () => {
    resetForm()
    setView('create')
  }

  const openEditView = (pkg) => {
    // Parse duration back into number + unit
    let durationNumber = 1
    let durationUnit = 'Month(s)'
    if (pkg.duration) {
      const match = pkg.duration.match(/^(\d+)\s+(.+)$/)
      if (match) {
        durationNumber = parseInt(match[1])
        durationUnit = match[2]
      }
    }

    setForm({
      package_name: pkg.package_name || '',
      lesson_id: String(pkg.lesson_id || ''),
      total_session: pkg.total_session || 4,
      duration_number: durationNumber,
      duration_unit: durationUnit,
      session: pkg.session || 1,
      fee: String(pkg.fee || ''),
      level_name: pkg.level_name || 'Beginner',
      status: pkg.status || 'Active',
    })
    setEditingId(pkg.id)
    setFormError('')
    setFormSuccess('')
    setView('create')
  }

  const cancelForm = () => {
    resetForm()
    setView('list')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    if (!form.package_name) {
      setFormError('Package name is required.')
      return
    }
    if (!form.lesson_id) {
      setFormError('Lesson type is required.')
      return
    }
    if (!form.fee || parseFloat(form.fee) <= 0) {
      setFormError('Valid fee is required.')
      return
    }

    setFormLoading(true)

    try {
      const isEdit = editingId !== null
      const url = isEdit ? `${API}/packages/${editingId}` : `${API}/packages`
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          package_name: form.package_name,
          lesson_id: parseInt(form.lesson_id),
          total_session: form.total_session,
          duration: `${form.duration_number} ${form.duration_unit}`,
          session: form.session,
          fee: parseFloat(form.fee),
          level_name: form.level_name,
          status: form.status,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setFormSuccess(isEdit ? 'Package updated successfully!' : 'Package created successfully!')
        setTimeout(() => {
          cancelForm()
          fetchPackages()
        }, 1000)
      } else {
        setFormError(data.message || `Failed to ${isEdit ? 'update' : 'create'} package.`)
      }
    } catch (err) {
      setFormError('An error occurred. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/packages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (data.success) {
        setDeleteConfirm(null)
        fetchPackages()
      } else {
        setError(data.message || 'Failed to delete package.')
      }
    } catch (err) {
      setError('An error occurred while deleting.')
    }
  }

  const statusStyle = (status) => {
    switch (status) {
      case 'Active': return { bg: 'rgba(16,185,129,0.1)', c: C.green }
      case 'Inactive': return { bg: 'rgba(248,113,113,0.1)', c: C.coral }
      default: return { bg: 'rgba(148,163,184,0.1)', c: C.text3 }
    }
  }

  // Shared styles
  const cardStyle = {
    background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`,
    padding: '1.5rem', marginBottom: 20,
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
    background: '#fff', borderRadius: 20, width: '100%', maxWidth: 400,
    maxHeight: '90vh', overflow: 'auto',
    boxShadow: '0 24px 64px rgba(15,23,42,0.2)',
    padding: '28px 32px',
  }

  // ─── LIST VIEW ──────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div style={{ fontFamily: C.font }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontFamily: C.display, fontSize: '1.3rem', fontWeight: 700, color: C.navy, margin: 0 }}>Lesson Packages</h2>
            <p style={{ fontSize: '0.8rem', color: C.text3, marginTop: 2 }}>
              {loading ? 'Loading...' : `${filteredPackages.length} packages`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              placeholder="Search packages..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${C.border2}`,
                fontSize: '0.8rem', fontFamily: C.font, outline: 'none', width: 220,
              }}
            />
            <button
              onClick={openCreateView}
              style={{
                padding: '8px 18px', borderRadius: 10, border: 'none',
                background: `linear-gradient(135deg, ${C.royal}, ${C.purple})`,
                color: '#fff', fontSize: '0.8rem', fontWeight: 600,
                fontFamily: C.font, cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              + Create Package
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
            Loading packages...
          </div>
        ) : filteredPackages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: C.text3, fontSize: '0.9rem' }}>
            {packages.length === 0 ? 'No packages found. Click "Create Package" to add one.' : 'No packages match your search.'}
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.mist }}>
                    {['Package', 'Lesson', 'Sessions', 'Duration', 'Fee', 'Level', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', fontSize: '0.7rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPackages.map(p => {
                    const ss = statusStyle(p.status)
                    return (
                      <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '12px 14px', fontSize: '0.85rem', fontWeight: 600, color: C.navy }}>{p.package_name}</td>
                        <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>{p.lesson_name || '—'}</td>
                        <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>{p.total_session || '—'}</td>
                        <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>{p.duration || '—'}</td>
                        <td style={{ padding: '12px 14px', fontSize: '0.85rem', fontWeight: 600, color: C.navy }}>₱{parseFloat(p.fee).toLocaleString()}</td>
                        <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>{p.level_name || '—'}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            padding: '3px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
                            background: ss.bg, color: ss.c,
                          }}>{p.status}</span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => openEditView(p)}
                              style={{
                                padding: '5px 14px', borderRadius: 8, border: `1.5px solid ${C.royal}`,
                                background: 'rgba(37,99,235,0.08)', color: C.royal,
                                fontSize: '0.72rem', fontWeight: 600, fontFamily: C.font,
                                cursor: 'pointer',
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(p)}
                              style={{
                                padding: '5px 14px', borderRadius: 8, border: `1.5px solid ${C.coral}`,
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
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div style={modalOverlayStyle} onClick={() => setDeleteConfirm(null)}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontFamily: C.display, fontSize: '1.1rem', fontWeight: 700, color: C.navy, margin: '0 0 12px' }}>
                Confirm Delete
              </h3>
              <p style={{ fontSize: '0.85rem', color: C.text2, marginBottom: 20 }}>
                Are you sure you want to delete <strong>{deleteConfirm.package_name}</strong>? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  style={{
                    padding: '10px 20px', borderRadius: 10, border: `1.5px solid ${C.border2}`,
                    background: '#fff', fontSize: '0.82rem', fontWeight: 600, fontFamily: C.font,
                    color: C.text2, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  style={{
                    padding: '10px 24px', borderRadius: 10, border: 'none',
                    background: `linear-gradient(135deg, ${C.coral}, ${C.coral})`,
                    color: '#fff', fontSize: '0.82rem', fontWeight: 600, fontFamily: C.font,
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ─── CREATE/EDIT VIEW ───────────────────────────────────────
  return (
    <div style={{ fontFamily: C.font }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.75rem', color: C.text3, marginBottom: 4 }}>
        <span style={{ cursor: 'pointer' }} onClick={cancelForm}>Lesson Packages</span>
        <span style={{ margin: '0 6px' }}>{'>'}</span>
        <span style={{ color: C.navy, fontWeight: 600 }}>{editingId ? 'Edit Package' : 'Create Package'}</span>
      </div>

      {/* Title */}
      <h2 style={{ fontFamily: C.display, fontSize: '1.3rem', fontWeight: 700, color: C.navy, margin: '0 0 4px' }}>
        {editingId ? 'Edit Lesson Package' : 'Create Lesson Package'}
      </h2>
      <p style={{ fontSize: '0.8rem', color: C.text3, marginBottom: 20 }}>
        Configure your package details. Matching instructors will be shown automatically.
      </p>

      {formError && (
        <div style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.1)', borderRadius: 10, marginBottom: 16, fontSize: '0.8rem', color: C.coral }}>
          {formError}
        </div>
      )}

      {formSuccess && (
        <div style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.1)', borderRadius: 10, marginBottom: 16, fontSize: '0.8rem', color: C.green }}>
          {formSuccess}
        </div>
      )}

      {/* Form Card */}
      <div style={cardStyle}>
        {/* Row 1: Package Name + Lesson Type + Fee */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Package Name</label>
            <input
              type="text"
              name="package_name"
              value={form.package_name}
              onChange={handleInputChange}
              placeholder="e.g. Piano Beginner Package"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Lesson Type</label>
            <select
              name="lesson_id"
              value={form.lesson_id}
              onChange={handleInputChange}
              style={inputStyle}
            >
              <option value="">Select lesson type</option>
              {lessons.map(l => (
                <option key={l.id} value={l.id}>{l.lesson_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Fee (₱) *</label>
            <input
              type="number"
              name="fee"
              value={form.fee}
              onChange={handleInputChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Row 2: Sessions stepper + Duration + Frequency + Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
          {/* Sessions Stepper */}
          <div>
            <label style={labelStyle}>Sessions</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, total_session: Math.max(1, (prev.total_session || 1) - 1) }))}
                style={{
                  width: 36, height: 36, borderRadius: 8, border: `1.5px solid ${C.border2}`,
                  background: '#fff', fontSize: '1.1rem', fontWeight: 600, color: C.navy,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: C.font,
                }}
              >−</button>
              <div style={{
                flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 10,
                border: `1.5px solid ${C.border2}`, fontSize: '1rem', fontWeight: 700, color: C.navy,
                fontFamily: C.font,
              }}>
                {form.total_session}
              </div>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, total_session: (prev.total_session || 0) + 1 }))}
                style={{
                  width: 36, height: 36, borderRadius: 8, border: `1.5px solid ${C.border2}`,
                  background: '#fff', fontSize: '1.1rem', fontWeight: 600, color: C.navy,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: C.font,
                }}
              >+</button>
            </div>
            <div style={{ fontSize: '0.7rem', color: C.text3, marginTop: 4, textAlign: 'center' }}>
              Total sessions
            </div>
          </div>

          {/* Duration */}
          <div>
            <label style={labelStyle}>Duration</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="number"
                name="duration_number"
                value={form.duration_number}
                onChange={handleInputChange}
                min="1"
                style={{ ...inputStyle, width: 70, flex: 'none' }}
              />
              <select
                name="duration_unit"
                value={form.duration_unit}
                onChange={handleInputChange}
                style={inputStyle}
              >
                {DURATION_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div style={{ fontSize: '0.7rem', color: C.text3, marginTop: 4 }}>
              Total duration
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label style={labelStyle}>Frequency</label>
            <select
              name="session"
              value={form.session}
              onChange={e => setForm(prev => ({ ...prev, session: parseInt(e.target.value) }))}
              style={inputStyle}
            >
              {FREQUENCY_OPTIONS.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <div style={{ fontSize: '0.7rem', color: C.text3, marginTop: 4 }}>
              How often lessons occur
            </div>
          </div>

          {/* Package Summary */}
          <div style={{
            background: `linear-gradient(135deg, ${C.royal}10, ${C.purple}10)`,
            border: `1px solid ${C.purple}30`,
            borderRadius: 12, padding: '14px 16px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              Package Summary
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: C.navy, lineHeight: 1.4 }}>
              {computedSummary()}
            </div>
          </div>
        </div>

        {/* Row 3: Level + Status */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 4 }}>
          <div>
            <label style={labelStyle}>Level</label>
            <select
              name="level_name"
              value={form.level_name}
              onChange={handleInputChange}
              style={inputStyle}
            >
              {LEVEL_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleInputChange}
              style={inputStyle}
            >
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Matching Instructors Section */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 4 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontFamily: C.display, fontSize: '0.95rem', fontWeight: 700, color: C.navy, margin: 0 }}>
                Matching Instructors
                {selectedLesson && <span style={{ fontWeight: 400 }}> (Specializing in {selectedLesson.lesson_name})</span>}
              </h3>
              {matchedInstructors.length > 0 && (
                <span style={{
                  padding: '2px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700,
                  background: 'rgba(37,99,235,0.1)', color: C.royal,
                }}>
                  {matchedInstructors.length}
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.75rem', color: C.text3, margin: '4px 0 0' }}>
              Instructors are automatically matched based on the selected lesson type.
            </p>
          </div>
          {matchedInstructors.length > 0 && (
            <input
              placeholder="Search instructors..."
              value={instructorSearch}
              onChange={e => setInstructorSearch(e.target.value)}
              style={{
                padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${C.border2}`,
                fontSize: '0.8rem', fontFamily: C.font, outline: 'none', width: 220,
              }}
            />
          )}
        </div>

        {!form.lesson_id ? (
          <div style={{ textAlign: 'center', padding: 40, color: C.text3, fontSize: '0.85rem' }}>
            Select a lesson type above to see matching instructors.
          </div>
        ) : instructorsLoading ? (
          <div style={{ textAlign: 'center', padding: 40, color: C.text3, fontSize: '0.85rem' }}>
            Loading matching instructors...
          </div>
        ) : matchedInstructors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: C.text3, fontSize: '0.85rem' }}>
            {selectedLesson && !selectedLesson.specialty_id
              ? 'This lesson has no specialty assigned. Set one in Lesson Management first.'
              : 'No instructors found with this specialty.'}
          </div>
        ) : filteredInstructors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: C.text3, fontSize: '0.85rem' }}>
            No instructors match your search.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.mist }}>
                  {['Instructor', 'Specialty', 'Status', 'Available Schedule'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', fontSize: '0.7rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredInstructors.map(instr => {
                  const hasSchedules = instr.instructor_schedules?.length > 0
                  const isExpanded = expandedInstructor === instr.id
                  return (
                    <>
                      <tr key={instr.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: '50%',
                              background: `linear-gradient(135deg, ${C.royal}, ${C.purple})`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontSize: '0.75rem', fontWeight: 700,
                              fontFamily: C.font, flexShrink: 0,
                            }}>
                              {getInitials(instr.staff)}
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: C.navy }}>
                              {getFullName(instr.staff)}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>
                          {instr.instructor_specialties?.[0]?.specialties?.specialty_name || '—'}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600,
                            background: instr.staff?.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(148,163,184,0.1)',
                            color: instr.staff?.status === 'active' ? C.green : C.text3,
                          }}>
                            {instr.staff?.status === 'active' ? 'Active' : instr.staff?.status || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          {hasSchedules ? (
                            <button
                              type="button"
                              onClick={() => setExpandedInstructor(isExpanded ? null : instr.id)}
                              style={{
                                padding: '4px 12px', borderRadius: 8, border: `1.5px solid ${C.border2}`,
                                background: 'rgba(100,116,139,0.06)', color: C.text2,
                                fontSize: '0.72rem', fontWeight: 600, fontFamily: C.font,
                                cursor: 'pointer',
                              }}
                            >
                              {isExpanded ? 'Hide schedule' : `Show schedule (${instr.instructor_schedules.length})`}
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: C.text3 }}>No schedule set</span>
                          )}
                        </td>
                      </tr>
                      {isExpanded && hasSchedules && (
                        <tr key={`${instr.id}-schedules`} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td colSpan={4} style={{ padding: '8px 14px 12px 14px', background: C.mist }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {instr.instructor_schedules.map(sched => (
                                <span key={sched.id} style={{
                                  padding: '4px 10px', borderRadius: 8, fontSize: '0.72rem',
                                  background: '#fff', border: `1px solid ${C.border2}`,
                                  color: C.text2, fontWeight: 500,
                                }}>
                                  {sched.day_of_week} {sched.time_slot ? `${formatTime(sched.time_slot.start_time)}-${formatTime(sched.time_slot.end_time)}` : ''}
                                  {sched.status !== 'Available' && (
                                    <span style={{ color: sched.status === 'Unavailable' ? C.coral : C.gold, marginLeft: 4 }}>
                                      ({sched.status})
                                    </span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button
          onClick={cancelForm}
          style={{
            padding: '10px 24px', borderRadius: 10, border: `1.5px solid ${C.border2}`,
            background: '#fff', fontSize: '0.82rem', fontWeight: 600, fontFamily: C.font,
            color: C.text2, cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={formLoading}
          style={{
            padding: '10px 24px', borderRadius: 10, border: 'none',
            background: `linear-gradient(135deg, ${C.royal}, ${C.purple})`,
            color: '#fff', fontSize: '0.82rem', fontWeight: 600, fontFamily: C.font,
            cursor: formLoading ? 'not-allowed' : 'pointer', opacity: formLoading ? 0.7 : 1,
          }}
        >
          {formLoading ? 'Saving...' : editingId ? 'Update Package' : 'Create Package'}
        </button>
      </div>
    </div>
  )
}