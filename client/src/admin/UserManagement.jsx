import { useState, useEffect } from 'react'
import C from './theme.js'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/admin'

export default function UserManagement({ isMobile, isTablet }) {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [selectedSpecialties, setSelectedSpecialties] = useState([])
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false)

  // Form state
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role_id: 2,
    // Staff fields for instructor
    f_name: '',
    m_name: '',
    l_name: '',
    gender: '',
    contact_no: '',
    address: '',
  })

  const getToken = () => localStorage.getItem('cadenza_token')

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/users`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (data.success) {
        setUsers(data.data)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API}/roles`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (data.success) {
        setRoles(data.data)
      }
    } catch (err) {
      // ignore
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
    fetchUsers()
    fetchRoles()
    fetchSpecialties()
  }, [])

  // Filter users by search
  const filtered = users.filter(u => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      u.email?.toLowerCase().includes(s) ||
      u.role?.role_name?.toLowerCase().includes(s) ||
      u.staff?.f_name?.toLowerCase().includes(s) ||
      u.staff?.l_name?.toLowerCase().includes(s)
    )
  })

  const statusStyle = status => {
    switch (status) {
      case 'active': return { bg: 'rgba(16,185,129,0.1)', c: C.green }
      case 'inactive': return { bg: 'rgba(148,163,184,0.1)', c: C.text3 }
      case 'suspended': return { bg: 'rgba(248,113,113,0.1)', c: C.coral }
      default: return { bg: 'rgba(148,163,184,0.1)', c: C.text3 }
    }
  }

  const roleStyle = roleName => {
    switch (roleName) {
      case 'admin': return { bg: 'rgba(37,99,235,0.1)', c: C.royal }
      case 'frontdesk': return { bg: 'rgba(124,58,237,0.1)', c: C.purple }
      case 'instructor': return { bg: 'rgba(16,185,129,0.1)', c: C.green }
      default: return { bg: 'rgba(148,163,184,0.1)', c: C.text3 }
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setForm({
      email: '',
      password: '',
      confirmPassword: '',
      role_id: 2,
      f_name: '',
      m_name: '',
      l_name: '',
      gender: '',
      contact_no: '',
      address: '',
    })
    setFormError('')
    setFormSuccess('')
    setEditingId(null)
  }

  const openAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (user) => {
    setForm({
      email: user.email || '',
      password: '',
      confirmPassword: '',
      role_id: user.role_id || 2,
      f_name: user.staff?.f_name || '',
      m_name: user.staff?.m_name || '',
      l_name: user.staff?.l_name || '',
      gender: user.staff?.gender || '',
      contact_no: user.staff?.contact_no || '',
      address: user.staff?.address || '',
    })
    setEditingId(user.id)
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

    const isEdit = editingId !== null

    // Validate
    if (!form.email) {
      setFormError('Email is required.')
      return
    }

    if (!isEdit && (!form.password || !form.confirmPassword)) {
      setFormError('Password and confirm password are required.')
      return
    }

    if (form.password && form.password !== form.confirmPassword) {
      setFormError('Passwords do not match.')
      return
    }

    if (form.password && form.password.length < 6) {
      setFormError('Password must be at least 6 characters.')
      return
    }

    // If instructor, validate staff fields
    if (parseInt(form.role_id) === 3) {
      if (!form.f_name || !form.l_name) {
        setFormError('First name and last name are required for instructors.')
        return
      }
    }

    setFormLoading(true)

    try {
      const body = {
        email: form.email,
        password: form.password,
        role_id: parseInt(form.role_id),
      }

      // If instructor, include staff data and specialties
      if (parseInt(form.role_id) === 3) {
        body.staffData = {
          f_name: form.f_name,
          m_name: form.m_name || null,
          l_name: form.l_name,
          gender: form.gender || null,
          contact_no: form.contact_no || null,
          address: form.address || null,
        }
        body.specialty_ids = selectedSpecialties
      }

      const url = isEdit ? `${API}/users/${editingId}` : `${API}/users`
      const method = isEdit ? 'PUT' : 'POST'

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
        setFormSuccess(isEdit ? 'User updated successfully!' : 'User created successfully!')
        setTimeout(() => {
          closeModal()
          fetchUsers()
        }, 1000)
      } else {
        setFormError(data.message || `Failed to ${isEdit ? 'update' : 'create'} user.`)
      }
    } catch (err) {
      setFormError('An error occurred. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  const getUserName = (u) => {
    if (u.staff?.f_name || u.staff?.l_name) {
      return `${u.staff.f_name || ''} ${u.staff.l_name || ''}`.trim()
    }
    return u.email
  }

  // Modal styles
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
          <h2 style={{ fontFamily: C.display, fontSize: '1.3rem', fontWeight: 700, color: C.navy, margin: 0 }}>User Management</h2>
          <p style={{ fontSize: '0.8rem', color: C.text3, marginTop: 2 }}>
            {loading ? 'Loading...' : `${filtered.length} users`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder="Search users..."
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
            + Add User
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
          Loading users...
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.mist }}>
                  {['Name', 'Email', 'Role', 'Status', 'Created', 'Action'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', fontSize: '0.7rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: C.text3, fontSize: '0.85rem' }}>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filtered.map(u => {
                    const ss = statusStyle(u.status)
                    const rs = roleStyle(u.role?.role_name)
                    const createdDate = u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'
                    return (
                      <tr key={u.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '12px 14px', fontSize: '0.85rem', fontWeight: 600, color: C.navy }}>{getUserName(u)}</td>
                        <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>{u.email}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            padding: '3px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
                            background: rs.bg, color: rs.c,
                          }}>{u.role?.role_name}</span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600, background: ss.bg, color: ss.c }}>{u.status}</span>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: C.text3 }}>{createdDate}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <button
                            onClick={() => openEditModal(u)}
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

      {/* Add User Modal */}
      {showModal && (
        <div style={modalOverlayStyle} onClick={closeModal}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: C.display, fontSize: '1.1rem', fontWeight: 700, color: C.navy, margin: 0 }}>
                {editingId ? 'Edit User' : 'Add New User'}
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
                <label style={labelStyle}>Role</label>
                <select
                  name="role_id"
                  value={form.role_id}
                  onChange={handleInputChange}
                  style={inputStyle}
                >
                  {roles.filter(r => r.role_name !== 'admin').map(r => (
                    <option key={r.id} value={r.id}>{r.role_name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  placeholder="e.g. user@cadenzamusic.com"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    placeholder="Min 6 characters"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm password"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Instructor fields */}
              {parseInt(form.role_id) === 3 && (
                <>
                  <div style={{ borderTop: `1px solid ${C.border}`, margin: '16px 0', paddingTop: 16 }}>
                    <h4 style={{ fontFamily: C.display, fontSize: '0.9rem', fontWeight: 600, color: C.navy, margin: '0 0 12px' }}>Staff Information</h4>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={labelStyle}>First Name *</label>
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
                        <label style={labelStyle}>Last Name *</label>
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
                      Click to select one or more specialties for this instructor.
                    </p>
                  </div>
                </>
              )}

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
                {formLoading ? 'Saving...' : editingId ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}