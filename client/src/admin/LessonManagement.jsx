import { useState, useEffect } from 'react'
import C from './theme.js'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/admin'

export default function LessonManagement({ isMobile, isTablet }) {
  const [lessons, setLessons] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Form state
  const [form, setForm] = useState({
    lesson_name: '',
    specialty_id: '',
    status: 'Active',
  })

  const getToken = () => localStorage.getItem('cadenza_token')

  // Fetch lessons
  const fetchLessons = async () => {
    try {
      const res = await fetch(`${API}/lessons`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (data.success) {
        setLessons(data.data)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to load lessons.')
    } finally {
      setLoading(false)
    }
  }

  const fetchSpecialties = async () => {
    try {
      const res = await fetch(`${API}/specialties`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (data.success) {
        setSpecialties(data.data)
      }
    } catch (err) {
      // ignore
    }
  }

  useEffect(() => {
    fetchLessons()
    fetchSpecialties()
  }, [])

  // Filter lessons by search
  const filtered = lessons.filter(l => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      l.lesson_name?.toLowerCase().includes(s)
    )
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setForm({ lesson_name: '', specialty_id: '', status: 'Active' })
    setFormError('')
    setFormSuccess('')
    setEditingId(null)
  }

  const openAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (lesson) => {
    setForm({
      lesson_name: lesson.lesson_name || '',
      specialty_id: lesson.specialty_id ? String(lesson.specialty_id) : '',
      status: lesson.status || 'Active',
    })
    setEditingId(lesson.id)
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

    if (!form.lesson_name) {
      setFormError('Lesson name is required.')
      return
    }

    setFormLoading(true)

    try {
      const isEdit = editingId !== null
      const url = isEdit ? `${API}/lessons/${editingId}` : `${API}/lessons`
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          lesson_name: form.lesson_name,
          specialty_id: form.specialty_id,
          status: form.status,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setFormSuccess(isEdit ? 'Lesson updated successfully!' : 'Lesson created successfully!')
        setTimeout(() => {
          closeModal()
          fetchLessons()
        }, 1000)
      } else {
        setFormError(data.message || `Failed to ${isEdit ? 'update' : 'create'} lesson.`)
      }
    } catch (err) {
      setFormError('An error occurred. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/lessons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (data.success) {
        setDeleteConfirm(null)
        fetchLessons()
      } else {
        setError(data.message || 'Failed to delete lesson.')
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

  // Modal styles (matching Settings.jsx exactly)
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
      {/* Card header — matching Specialty Management exactly */}
      <div style={{
        padding: '18px 22px', borderBottom: `1px solid ${C.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h3 style={{ fontFamily: C.display, fontSize: '1rem', fontWeight: 700, color: C.navy, margin: 0 }}>
            Lesson Management
          </h3>
          <p style={{ fontSize: '0.75rem', color: C.text3, marginTop: 2 }}>
            {loading ? 'Loading...' : `${filtered.length} lessons`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder="Search lessons..."
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
            + Add Lesson
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 22px', background: 'rgba(248,113,113,0.1)', fontSize: '0.8rem', color: C.coral }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.text3, fontSize: '0.9rem' }}>
          Loading lessons...
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.mist }}>
                {['Lesson', 'Specialty', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', fontSize: '0.7rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
                {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: C.text3, fontSize: '0.85rem' }}>
                    No lessons found.
                  </td>
                </tr>
              ) : (
                filtered.map(l => {
                  const ss = statusStyle(l.status)
                  return (
                    <tr key={l.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '12px 14px', fontSize: '0.85rem', fontWeight: 600, color: C.navy }}>{l.lesson_name}</td>
                      <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>
                        {l.specialties?.specialty_name || <span style={{ color: C.text3, fontStyle: 'italic' }}>None</span>}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '3px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
                          background: ss.bg, color: ss.c,
                        }}>{l.status}</span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => openEditModal(l)}
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
                            onClick={() => setDeleteConfirm(l)}
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
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal — matching Specialty Management exactly */}
      {deleteConfirm && (
        <div style={modalOverlayStyle} onClick={() => setDeleteConfirm(null)}>
          <div style={{ ...modalStyle, maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: C.display, fontSize: '1.1rem', fontWeight: 700, color: C.navy, margin: '0 0 12px' }}>
              Confirm Delete
            </h3>
            <p style={{ fontSize: '0.85rem', color: C.text2, marginBottom: 20 }}>
              Are you sure you want to delete <strong>{deleteConfirm.lesson_name}</strong>? This action cannot be undone.
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

      {/* Add/Edit Lesson Modal — matching Specialty Management exactly */}
      {showModal && (
        <div style={modalOverlayStyle} onClick={closeModal}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: C.display, fontSize: '1.1rem', fontWeight: 700, color: C.navy, margin: 0 }}>
                {editingId ? 'Edit Lesson' : 'Add New Lesson'}
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
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Lesson Name *</label>
                <input
                  type="text"
                  name="lesson_name"
                  value={form.lesson_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Piano Fundamentals"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Specialty</label>
                <select
                  name="specialty_id"
                  value={form.specialty_id}
                  onChange={handleInputChange}
                  style={inputStyle}
                >
                  <option value="">— None —</option>
                  {specialties.map(s => (
                    <option key={s.id} value={s.id}>{s.specialty_name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
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
                  {formLoading ? 'Saving...' : editingId ? 'Update Lesson' : 'Create Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}