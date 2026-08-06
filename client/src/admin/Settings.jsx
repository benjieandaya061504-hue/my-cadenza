import { useState, useEffect, useRef } from 'react'
import C from './theme.js'
import LessonManagement from './LessonManagement.jsx'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/admin'

// Mapping: package_type_name → display label & number
const PACKAGE_TYPE_LABELS = {
  Starter: 'Package 1',
  Popular: 'Package 2',
  Advanced: 'Package 3',
  Intensive: 'Package 4',
}

const PACKAGE_TYPE_OPTIONS = [
  { value: 'Starter', label: 'Package 1 (Starter)' },
  { value: 'Popular', label: 'Package 2 (Popular)' },
  { value: 'Advanced', label: 'Package 3 (Advanced)' },
  { value: 'Intensive', label: 'Package 4 (Intensive)' },
]

export default function Settings({ isMobile, isTablet }) {
  const [lessonSearch, setLessonSearch] = useState('')
  const lessonAddRef = useRef(null)
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

  // ===== Package Type state =====
  const [packageTypes, setPackageTypes] = useState([])
  const [ptSearch, setPtSearch] = useState('')
  const [ptLoading, setPtLoading] = useState(true)
  const [ptError, setPtError] = useState('')
  const [showPtModal, setShowPtModal] = useState(false)
  const [ptEditingId, setPtEditingId] = useState(null)
  const [ptFormLoading, setPtFormLoading] = useState(false)
  const [ptFormError, setPtFormError] = useState('')
  const [ptFormSuccess, setPtFormSuccess] = useState('')
  const [ptDeleteConfirm, setPtDeleteConfirm] = useState(null)
  const [ptForm, setPtForm] = useState({
    package_type_name: '',
    session: '',
    frequency: '',
    duration: '',
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

  // ===== Package Type functions =====
  const fetchPackageTypes = async () => {
    try {
      const res = await fetch(`${API}/package-types`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (data.success) {
        setPackageTypes(data.data)
      } else {
        setPtError(data.message)
      }
    } catch (err) {
      setPtError('Failed to load package types.')
    } finally {
      setPtLoading(false)
    }
  }

  useEffect(() => {
    fetchPackageTypes()
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

  // Filter package types by search
  const ptFiltered = packageTypes.filter(pt => {
    if (!ptSearch) return true
    const q = ptSearch.toLowerCase()
    const displayLabel = PACKAGE_TYPE_LABELS[pt.package_type_name] || pt.package_type_name
    return (
      displayLabel.toLowerCase().includes(q) ||
      pt.package_type_name?.toLowerCase().includes(q) ||
      pt.session?.toString().includes(q) ||
      pt.frequency?.toLowerCase().includes(q) ||
      pt.duration?.toLowerCase().includes(q) ||
      pt.status?.toLowerCase().includes(q)
    )
  })

  const ptHandleInputChange = (e) => {
    const { name, value } = e.target
    setPtForm(prev => ({ ...prev, [name]: value }))
  }

  const ptResetForm = () => {
    setPtForm({
      package_type_name: '',
      session: '',
      frequency: '',
      duration: '',
      status: 'Active',
    })
    setPtFormError('')
    setPtFormSuccess('')
    setPtEditingId(null)
  }

  const ptOpenAddModal = () => {
    ptResetForm()
    setShowPtModal(true)
  }

  const ptOpenEditModal = (pt) => {
    setPtForm({
      package_type_name: pt.package_type_name || '',
      session: pt.session?.toString() || '',
      frequency: pt.frequency || '',
      duration: pt.duration || '',
      status: pt.status || 'Active',
    })
    setPtEditingId(pt.id)
    setPtFormError('')
    setPtFormSuccess('')
    setShowPtModal(true)
  }

  const ptCloseModal = () => {
    setShowPtModal(false)
    ptResetForm()
  }

  const ptHandleSubmit = async (e) => {
    e.preventDefault()
    setPtFormError('')
    setPtFormSuccess('')

    if (!ptForm.package_type_name) {
      setPtFormError('Package type name is required.')
      return
    }

    if (!ptForm.session || !ptForm.frequency || !ptForm.duration) {
      setPtFormError('Session, frequency, and duration are required.')
      return
    }

    setPtFormLoading(true)

    try {
      const isEdit = ptEditingId !== null
      const url = isEdit ? `${API}/package-types/${ptEditingId}` : `${API}/package-types`
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          package_type_name: ptForm.package_type_name,
          session: parseInt(ptForm.session),
          frequency: ptForm.frequency,
          duration: ptForm.duration,
          status: ptForm.status,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setPtFormSuccess(isEdit ? 'Package type updated successfully!' : 'Package type created successfully!')
        setTimeout(() => {
          ptCloseModal()
          fetchPackageTypes()
        }, 1000)
      } else {
        setPtFormError(data.message || `Failed to ${isEdit ? 'update' : 'create'} package type.`)
      }
    } catch (err) {
      setPtFormError('An error occurred. Please try again.')
    } finally {
      setPtFormLoading(false)
    }
  }

  const ptHandleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/package-types/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (data.success) {
        setPtDeleteConfirm(null)
        fetchPackageTypes()
      } else {
        setPtError(data.message || 'Failed to delete package type.')
      }
    } catch (err) {
      setPtError('An error occurred while deleting.')
    }
  }

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

      {/* Lesson Management Section */}
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
              Lesson Management
            </h3>
            <p style={{ fontSize: '0.75rem', color: C.text3, marginTop: 2 }}>
              Manage lesson types and their specialty assignments
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              placeholder="Search lessons..."
              value={lessonSearch}
              onChange={e => setLessonSearch(e.target.value)}
              style={{
                padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${C.border2}`,
                fontSize: '0.8rem', fontFamily: C.font, outline: 'none', width: 220,
              }}
            />
            <button
              onClick={() => lessonAddRef.current?.()}
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
        <LessonManagement
          isMobile={isMobile}
          isTablet={isTablet}
          embedded={true}
          searchTerm={lessonSearch}
          onSearchChange={setLessonSearch}
          addRef={lessonAddRef}
        />
      </div>

      {/* Package Type Management Section */}
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
              Package Type Management
            </h3>
            <p style={{ fontSize: '0.75rem', color: C.text3, marginTop: 2 }}>
              {ptLoading ? 'Loading...' : `${ptFiltered.length} package types`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              placeholder="Search package types..."
              value={ptSearch}
              onChange={e => setPtSearch(e.target.value)}
              style={{
                padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${C.border2}`,
                fontSize: '0.8rem', fontFamily: C.font, outline: 'none', width: 220,
              }}
            />
            <button
              onClick={ptOpenAddModal}
              style={{
                padding: '8px 18px', borderRadius: 10, border: 'none',
                background: `linear-gradient(135deg, ${C.royal}, ${C.purple})`,
                color: '#fff', fontSize: '0.8rem', fontWeight: 600,
                fontFamily: C.font, cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              + Add Package Type
            </button>
          </div>
        </div>

        {ptError && (
          <div style={{ padding: '12px 22px', background: 'rgba(248,113,113,0.1)', fontSize: '0.8rem', color: C.coral }}>
            {ptError}
          </div>
        )}

        {ptLoading ? (
          <div style={{ textAlign: 'center', padding: 60, color: C.text3, fontSize: '0.9rem' }}>
            Loading package types...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.mist }}>
                  {['#', 'Package', 'Session', 'Frequency', 'Duration', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', fontSize: '0.7rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ptFiltered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: C.text3, fontSize: '0.85rem' }}>
                      No package types found.
                    </td>
                  </tr>
                ) : (
                  ptFiltered.map(pt => {
                    const ss = statusStyle(pt.status)
                    const displayLabel = PACKAGE_TYPE_LABELS[pt.package_type_name] || pt.package_type_name
                    return (
                      <tr key={pt.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text3 }}>{pt.id}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: C.navy }}>
                            {displayLabel}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: C.text3, marginTop: 2 }}>
                            {pt.package_type_name || '-'}
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>{pt.session ?? '-'}</td>
                        <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>{pt.frequency || '-'}</td>
                        <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>{pt.duration || '-'}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            padding: '3px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
                            background: ss.bg, color: ss.c,
                          }}>{pt.status}</span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => ptOpenEditModal(pt)}
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
                              onClick={() => setPtDeleteConfirm(pt.id)}
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

      {/* Package Type Delete Confirmation Modal */}
      {ptDeleteConfirm && (
        <div style={modalOverlayStyle} onClick={() => setPtDeleteConfirm(null)}>
          <div style={{ ...modalStyle, maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: C.display, fontSize: '1.1rem', fontWeight: 700, color: C.navy, margin: '0 0 12px' }}>
              Confirm Delete
            </h3>
            <p style={{ fontSize: '0.85rem', color: C.text2, marginBottom: 20 }}>
              Are you sure you want to delete this package type? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setPtDeleteConfirm(null)}
                style={{
                  padding: '10px 20px', borderRadius: 10, border: `1.5px solid ${C.border2}`,
                  background: '#fff', fontSize: '0.82rem', fontWeight: 600, fontFamily: C.font,
                  color: C.text2, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => ptHandleDelete(ptDeleteConfirm)}
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

      {/* Add/Edit Package Type Modal */}
      {showPtModal && (
        <div style={modalOverlayStyle} onClick={ptCloseModal}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: C.display, fontSize: '1.1rem', fontWeight: 700, color: C.navy, margin: 0 }}>
                {ptEditingId ? 'Edit Package Type' : 'Add New Package Type'}
              </h3>
              <button onClick={ptCloseModal} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: C.text3, padding: '0 4px' }}>✕</button>
            </div>

            {ptFormError && (
              <div style={{ padding: '10px 14px', background: 'rgba(248,113,113,0.1)', borderRadius: 8, marginBottom: 16, fontSize: '0.8rem', color: C.coral }}>
                {ptFormError}
              </div>
            )}

            {ptFormSuccess && (
              <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.1)', borderRadius: 8, marginBottom: 16, fontSize: '0.8rem', color: C.green }}>
                {ptFormSuccess}
              </div>
            )}

            <form onSubmit={ptHandleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Package Type *</label>
                <select
                  name="package_type_name"
                  value={ptForm.package_type_name}
                  onChange={ptHandleInputChange}
                  style={inputStyle}
                >
                  <option value="">-- Select Package Type --</option>
                  {PACKAGE_TYPE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Session *</label>
                <input
                  type="number"
                  name="session"
                  value={ptForm.session}
                  onChange={ptHandleInputChange}
                  placeholder="e.g. 4"
                  min="1"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Frequency *</label>
                <input
                  type="text"
                  name="frequency"
                  value={ptForm.frequency}
                  onChange={ptHandleInputChange}
                  placeholder="e.g. Weekly"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Duration *</label>
                <input
                  type="text"
                  name="duration"
                  value={ptForm.duration}
                  onChange={ptHandleInputChange}
                  placeholder="e.g. 1 Month"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Status</label>
                <select
                  name="status"
                  value={ptForm.status}
                  onChange={ptHandleInputChange}
                  style={inputStyle}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button
                  type="button"
                  onClick={ptCloseModal}
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
                  disabled={ptFormLoading}
                  style={{
                    padding: '10px 24px', borderRadius: 10, border: 'none',
                    background: `linear-gradient(135deg, ${C.royal}, ${C.purple})`,
                    color: '#fff', fontSize: '0.82rem', fontWeight: 600, fontFamily: C.font,
                    cursor: ptFormLoading ? 'not-allowed' : 'pointer', opacity: ptFormLoading ? 0.7 : 1,
                  }}
                >
                  {ptFormLoading ? 'Saving...' : ptEditingId ? 'Update Package Type' : 'Create Package Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
