import { useState, useEffect } from 'react'
import C from './theme.js'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/admin'

export default function InstructorManagement({ isMobile, isTablet }) {
  const [instructors, setInstructors] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingInstructor, setEditingInstructor] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [selectedSpecialties, setSelectedSpecialties] = useState([])
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false)

  // Form state
  const [form, setForm] = useState({
    f_name: '',
    m_name: '',
    l_name: '',
    gender: '',
    contact_no: '',
    address: '',
  })

  const getToken = () => localStorage.getItem('cadenza_token')

  // Fetch instructors
  const fetchInstructors = async () => {
    try {
      const res = await fetch(`${API}/instructors`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (data.success) {
        setInstructors(data.data)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to load instructors.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch specialties
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

  const toggleSpecialty = (id) => {
    setSelectedSpecialties(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  useEffect(() => {
    fetchInstructors()
    fetchSpecialties()
  }, [])

  // Filter instructors by search
  const filtered = instructors.filter(i => {
    if (!search) return true
    const s = search.toLowerCase()
    const fullName = `${i.staff?.f_name || ''} ${i.staff?.l_name || ''}`.toLowerCase()
    return (
      fullName.includes(s) ||
      i.staff?.email?.toLowerCase().includes(s)
    )
  })

  const getFullName = (staff) => {
    const parts = [staff?.f_name, staff?.m_name, staff?.l_name].filter(Boolean)
    return parts.join(' ') || 'N/A'
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const openEditModal = (instructor) => {
    setEditingInstructor(instructor)
    const staff = instructor.staff || {}
    setForm({
      f_name: staff.f_name || '',
      m_name: staff.m_name || '',
      l_name: staff.l_name || '',
      gender: staff.gender || '',
      contact_no: staff.contact_no || '',
      address: staff.address || '',
    })
    // Pre-fill specialties
    const existingIds = (instructor.instructor_specialties || []).map(is => is.specialty_id)
    setSelectedSpecialties(existingIds)
    setFormError('')
    setFormSuccess('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingInstructor(null)
    setForm({
      f_name: '',
      m_name: '',
      l_name: '',
      gender: '',
      contact_no: '',
      address: '',
    })
    setSelectedSpecialties([])
    setShowSpecialtyDropdown(false)
    setFormError('')
    setFormSuccess('')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    if (!editingInstructor) return

    setFormLoading(true)

    try {
      const res = await fetch(`${API}/instructors/${editingInstructor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          staffData: {
            f_name: form.f_name,
            m_name: form.m_name || null,
            l_name: form.l_name,
            gender: form.gender || null,
            contact_no: form.contact_no || null,
            address: form.address || null,
          },
          specialty_ids: selectedSpecialties,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setFormSuccess('Instructor updated successfully!')
        setTimeout(() => {
          closeModal()
          fetchInstructors()
        }, 1000)
      } else {
        setFormError(data.message || 'Failed to update instructor.')
      }
    } catch (err) {
      setFormError('An error occurred. Please try again.')
    } finally {
      setFormLoading(false)
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
          <h2 style={{ fontFamily: C.display, fontSize: '1.3rem', fontWeight: 700, color: C.navy, margin: 0 }}>Instructor Management</h2>
          <p style={{ fontSize: '0.8rem', color: C.text3, marginTop: 2 }}>
            {loading ? 'Loading...' : `${filtered.length} instructors`}
          </p>
        </div>
        <input
          placeholder="Search instructors..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${C.border2}`,
            fontSize: '0.8rem', fontFamily: C.font, outline: 'none', width: 220,
          }}
        />
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.1)', borderRadius: 10, marginBottom: 16, fontSize: '0.8rem', color: C.coral }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.text3, fontSize: '0.9rem' }}>
          Loading instructors...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.text3, fontSize: '0.9rem' }}>
          No instructors found.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr 1fr', gap: 14 }}>
          {filtered.map(i => {
            const staff = i.staff
            return (
              <div key={i.id} style={{
                background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`,
                padding: '1.2rem', boxShadow: '0 4px 12px rgba(30,41,59,0.04)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: C.navy }}>{getFullName(staff)}</div>
                  </div>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600,
                    background: staff?.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(148,163,184,0.1)',
                    color: staff?.status === 'active' ? C.green : C.text3,
                  }}>{staff?.status || 'N/A'}</span>
                </div>

                <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 10, paddingTop: 10 }}>
                  {staff?.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: '0.7rem', color: C.text3, minWidth: 70 }}>Email</span>
                      <span style={{ fontSize: '0.78rem', color: C.text2 }}>{staff.email}</span>
                    </div>
                  )}
                  {staff?.contact_no && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: '0.7rem', color: C.text3, minWidth: 70 }}>Contact</span>
                      <span style={{ fontSize: '0.78rem', color: C.text2 }}>{staff.contact_no}</span>
                    </div>
                  )}
                  {staff?.gender && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: '0.7rem', color: C.text3, minWidth: 70 }}>Gender</span>
                      <span style={{ fontSize: '0.78rem', color: C.text2 }}>{staff.gender}</span>
                    </div>
                  )}
                  {staff?.hire_date && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: '0.7rem', color: C.text3, minWidth: 70 }}>Hired</span>
                      <span style={{ fontSize: '0.78rem', color: C.text2 }}>{formatDate(staff.hire_date)}</span>
                    </div>
                  )}
                  <div style={{ marginTop: 8, textAlign: 'right' }}>
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
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit Instructor Modal */}
      {showModal && editingInstructor && (
        <div style={modalOverlayStyle} onClick={closeModal}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: C.display, fontSize: '1.1rem', fontWeight: 700, color: C.navy, margin: 0 }}>
                Edit Instructor
              </h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: C.text3, padding: '0 4px' }}>✕</button>
            </div>

            <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(37,99,235,0.06)', borderRadius: 8, fontSize: '0.82rem', color: C.navy }}>
              <strong>{getFullName(editingInstructor.staff)}</strong>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input
                    type="text"
                    name="f_name"
                    value={form.f_name}
                    onChange={handleInputChange}
                    placeholder="First name"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Middle Name</label>
                  <input
                    type="text"
                    name="m_name"
                    value={form.m_name}
                    onChange={handleInputChange}
                    placeholder="Middle name"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input
                    type="text"
                    name="l_name"
                    value={form.l_name}
                    onChange={handleInputChange}
                    placeholder="Last name"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>Gender</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleInputChange}
                    style={inputStyle}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Contact No.</label>
                  <input
                    type="text"
                    name="contact_no"
                    value={form.contact_no}
                    onChange={handleInputChange}
                    placeholder="Contact number"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Address</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleInputChange}
                  placeholder="Address"
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {/* Specialties Section */}
              <div style={{ borderTop: `1px solid ${C.border}`, margin: '16px 0', paddingTop: 16 }}>
                <h4 style={{ fontFamily: C.display, fontSize: '0.9rem', fontWeight: 600, color: C.navy, margin: '0 0 12px' }}>Specialties</h4>
                <div style={{ position: 'relative' }}>
                  <div
                    onClick={() => setShowSpecialtyDropdown(!showSpecialtyDropdown)}
                    style={{
                      ...inputStyle, cursor: 'pointer', display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', minHeight: 40,
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', color: selectedSpecialties.length > 0 ? C.navy : C.text3 }}>
                      {selectedSpecialties.length > 0
                        ? `${selectedSpecialties.length} specialty(ies) selected`
                        : 'Select specialties...'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: C.text3 }}>{showSpecialtyDropdown ? '▲' : '▼'}</span>
                  </div>
                  {showSpecialtyDropdown && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                      background: '#fff', border: `1px solid ${C.border2}`, borderRadius: 10,
                      maxHeight: 200, overflow: 'auto', boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
                      marginTop: 4,
                    }}>
                      {specialties.filter(s => s.status === 'Active').map(s => (
                        <div
                          key={s.id}
                          onClick={() => toggleSpecialty(s.id)}
                          style={{
                            padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                            fontSize: '0.82rem', color: C.text2, borderBottom: `1px solid ${C.border}`,
                            background: selectedSpecialties.includes(s.id) ? 'rgba(37,99,235,0.06)' : 'transparent',
                          }}
                        >
                          <div style={{
                            width: 18, height: 18, borderRadius: 4, border: `2px solid ${selectedSpecialties.includes(s.id) ? C.royal : C.border2}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: selectedSpecialties.includes(s.id) ? C.royal : 'transparent',
                          }}>
                            {selectedSpecialties.includes(s.id) && (
                              <span style={{ color: '#fff', fontSize: '0.65rem', fontWeight: 700 }}>✓</span>
                            )}
                          </div>
                          <span>{s.specialty_name}</span>
                        </div>
                      ))}
                      {specialties.filter(s => s.status === 'Active').length === 0 && (
                        <div style={{ padding: 14, fontSize: '0.8rem', color: C.text3, textAlign: 'center' }}>
                          No active specialties available.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p style={{ fontSize: '0.7rem', color: C.text3, marginTop: 6 }}>
                  Select one or more specialties for this instructor.
                </p>
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
                  {formLoading ? 'Saving...' : 'Update Instructor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}