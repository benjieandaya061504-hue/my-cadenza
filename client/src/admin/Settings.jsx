import { useState, useEffect } from 'react'
import C from './theme.js'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/admin'

export default function Settings({ isMobile, isTablet }) {
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
    specialty_name: '',
    status: 'Active',
  })

  const getToken = () => localStorage.getItem('cadenza_token')

  // Fetch specialties
  const fetchSpecialties = async () => {
    try {
      const res = await fetch(`${API}/specialties`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (data.success) {
        setSpecialties(data.data)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to load specialties.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSpecialties()
  }, [])

  // Filter specialties by search
  const filtered = specialties.filter(s => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      s.specialty_name?.toLowerCase().includes(q) ||
      s.status?.toLowerCase().includes(q)
    )
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setForm({
      specialty_name: '',
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

  const openEditModal = (spec) => {
    setForm({
      specialty_name: spec.specialty_name || '',
      status: spec.status || 'Active',
    })
    setEditingId(spec.id)
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

    if (!form.specialty_name) {
      setFormError('Specialty name is required.')
      return
    }

    setFormLoading(true)

    try {
      const isEdit = editingId !== null
      const url = isEdit ? `${API}/specialties/${editingId}` : `${API}/specialties`
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          specialty_name: form.specialty_name,
          status: form.status,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setFormSuccess(isEdit ? 'Specialty updated successfully!' : 'Specialty created successfully!')
        setTimeout(() => {
          closeModal()
          fetchSpecialties()
        }, 1000)
      } else {
        setFormError(data.message || `Failed to ${isEdit ? 'update' : 'create'} specialty.`)
      }
    } catch (err) {
      setFormError('An error occurred. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/specialties/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (data.success) {
        setDeleteConfirm(null)
        fetchSpecialties()
      } else {
        setError(data.message || 'Failed to delete specialty.')
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
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: C.display, fontSize: '1.3rem', fontWeight: 700, color: C.navy, margin: 0 }}>
          Settings
        </h2>
        <p style={{ fontSize: '0.8rem', color: C.text3, marginTop: 2 }}>
          Manage system-wide settings and configurations
        </p>
      </div>

      {/* Specialty Management Section */}
      <div style={{
        background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`,
        overflow: 'hidden', marginBottom: 24,
      }}>
        <div style={{
          padding: '18px 22px', borderBottom: `1px solid ${C.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <h3 style={{ fontFamily: C.display, fontSize: '1rem', fontWeight: 700, color: C.navy, margin: 0 }}>
              Specialty Management
            </h3>
            <p style={{ fontSize: '0.75rem', color: C.text3, marginTop: 2 }}>
              {loading ? 'Loading...' : `${filtered.length} specialties`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              placeholder="Search specialties..."
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
              + Add Specialty
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
            Loading specialties...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.mist }}>
                  {['#', 'Specialty Name', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', fontSize: '0.7rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: C.text3, fontSize: '0.85rem' }}>
                      No specialties found.
                    </td>
                  </tr>
                ) : (
                  filtered.map(s => {
                    const ss = statusStyle(s.status)
                    return (
                      <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text3 }}>{s.id}</td>
                        <td style={{ padding: '12px 14px', fontSize: '0.85rem', fontWeight: 600, color: C.navy }}>
                          {s.specialty_name || '-'}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            padding: '3px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
                            background: ss.bg, color: ss.c,
                          }}>{s.status}</span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => openEditModal(s)}
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
                              onClick={() => setDeleteConfirm(s.id)}
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
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={modalOverlayStyle} onClick={() => setDeleteConfirm(null)}>
          <div style={{ ...modalStyle, maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: C.display, fontSize: '1.1rem', fontWeight: 700, color: C.navy, margin: '0 0 12px' }}>
              Confirm Delete
            </h3>
            <p style={{ fontSize: '0.85rem', color: C.text2, marginBottom: 20 }}>
              Are you sure you want to delete this specialty? This action cannot be undone.
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
                onClick={() => handleDelete(deleteConfirm)}
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

      {/* Add/Edit Specialty Modal */}
      {showModal && (
        <div style={modalOverlayStyle} onClick={closeModal}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: C.display, fontSize: '1.1rem', fontWeight: 700, color: C.navy, margin: 0 }}>
                {editingId ? 'Edit Specialty' : 'Add New Specialty'}
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
                <label style={labelStyle}>Specialty Name *</label>
                <input
                  type="text"
                  name="specialty_name"
                  value={form.specialty_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Piano Beginner, Guitar Intermediate"
                  style={inputStyle}
                />
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
                  {formLoading ? 'Saving...' : editingId ? 'Update Specialty' : 'Create Specialty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}