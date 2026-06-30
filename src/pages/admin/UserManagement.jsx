import { useMemo, useState, useEffect, useCallback } from 'react'
import { usersAPI } from '../../services/api'

const C = {
  bg: '#0e0f13',
  bg2: '#13141a',
  bg3: '#1a1c24',
  bg4: '#1f2130',
  border: 'rgba(255,255,255,0.07)',
  border2: 'rgba(255,255,255,0.12)',
  text: '#f0eff4',
  text2: '#9b99a8',
  text3: '#5a5870',
  accent: '#7c6af7',
  accentL: '#a99cf9',
  accentD: '#5548d9',
  teal: '#2dd4bf',
  coral: '#f87171',
  gold: '#fbbf24',
  green: '#34d399',
  pink: '#f472b6',
  font: "'Outfit', sans-serif",
  display: "'Syne', sans-serif",
  mono: "'Space Mono', monospace",
}

const ROLES = ['admin', 'frontdesk', 'student']
const STATUSES = ['pending', 'approved', 'rejected']

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
  @keyframes umFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .um-row { transition: background 0.15s ease; }
  .um-row:hover { background: rgba(255,255,255,0.03) !important; }
  .um-pill { transition: all 0.18s ease; }
  .um-pill:hover { background: rgba(124,106,247,0.18) !important; color: #a99cf9 !important; }
`

function UserAvatar({ url, name, size = 36 }) {
  const initials = (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '10px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size > 40 ? '14px' : '11px',
        fontWeight: 700,
        fontFamily: C.font,
        color: C.accentL,
        background: `linear-gradient(135deg, ${C.accent}33, ${C.pink}22)`,
        border: `1px solid ${C.border}`,
      }}
    >
      {initials || '?'}
    </div>
  )
}

function sectionLabel(text) {
  return (
    <div
      style={{
        fontSize: '10px',
        fontWeight: 700,
        color: C.text3,
        textTransform: 'uppercase',
        letterSpacing: '.12em',
        marginTop: '4px',
        marginBottom: '8px',
        fontFamily: C.font,
      }}
    >
      {text}
    </div>
  )
}

function inputStyle(focused) {
  return {
    width: '100%',
    background: C.bg4,
    border: `1px solid ${focused ? 'rgba(124,106,247,0.45)' : C.border}`,
    borderRadius: '10px',
    padding: '10px 12px',
    color: C.text,
    fontFamily: C.font,
    fontSize: '13px',
    outline: 'none',
    boxShadow: focused ? '0 0 0 3px rgba(124,106,247,0.12)' : 'none',
  }
}

function UserFormModal({ mode, initial, onClose, onSave }) {
  const [username, setUsername] = useState(initial?.username ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [contactNumber, setContactNumber] = useState(initial?.contact_number ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')
  const [role, setRole] = useState(initial?.role ?? 'student')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [focus, setFocus] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !email.trim()) {
      setError('Username and email are required')
      return
    }

    if (mode === 'add' && password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    try {
      if (mode === 'add') {
      await onSave({
  username: username.trim(),
  email: email.trim(),
  contactNumber: contactNumber.trim(),  // ✅ camelCase - matches backend
  address: address.trim(),
  password,
  role,
})
      } else {
        await onSave({
          ...initial,
          username: username.trim(),
          email: email.trim(),
          contact_number: contactNumber.trim(),
          address: address.trim(),
        })
      }
      onClose()
    } catch (err) {
      console.error('Save error:', err)
      setError(err.response?.data?.error || 'Failed to save user')
    }
  }

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', animation: 'umFadeUp 0.25s ease both',
      }}
    >
      <div
        role="dialog"
        aria-labelledby="um-modal-title"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto',
          background: C.bg3, border: `1px solid ${C.border2}`,
          borderRadius: '16px', padding: '22px 22px 18px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.45)',
        }}
      >
        <div id="um-modal-title" style={{ fontFamily: C.display, fontSize: '18px', fontWeight: 700, color: C.text, marginBottom: '4px' }}>
          {mode === 'add' ? 'Add user account' : 'Update user account'}
        </div>
        <div style={{ fontSize: '12px', color: C.text3, fontFamily: C.font, marginBottom: '18px' }}>
          {mode === 'add' ? 'Create a new account for the music center.' : 'Save changes to this account.'}
        </div>
        {error && (
          <div style={{ padding: '10px 12px', marginBottom: '16px', borderRadius: '8px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: C.coral, fontSize: '12px', fontFamily: C.font }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sectionLabel('Login credentials')}
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px', fontFamily: C.font }}>Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)} required style={inputStyle(focus === 'user')} onFocus={() => setFocus('user')} onBlur={() => setFocus(null)} />
            </div>
            {mode === 'add' && (
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px', fontFamily: C.font }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required={mode === 'add'}
                  style={inputStyle(focus === 'pw')}
                  onFocus={() => setFocus('pw')}
                  onBlur={() => setFocus(null)}
                  autoComplete="new-password"
                />
              </div>
            )}

            {sectionLabel('Contact details')}
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px', fontFamily: C.font }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle(focus === 'email')} onFocus={() => setFocus('email')} onBlur={() => setFocus(null)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px', fontFamily: C.font }}>Contact Number</label>
              <input value={contactNumber} onChange={e => setContactNumber(e.target.value)} style={inputStyle(focus === 'phone')} onFocus={() => setFocus('phone')} onBlur={() => setFocus(null)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px', fontFamily: C.font }}>Address</label>
              <input value={address} onChange={e => setAddress(e.target.value)} style={inputStyle(focus === 'addr')} onFocus={() => setFocus('addr')} onBlur={() => setFocus(null)} />
            </div>

            {sectionLabel('User role')}
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px', fontFamily: C.font }}>Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                style={{ ...inputStyle(focus === 'role'), cursor: 'pointer', appearance: 'auto' }}
                onFocus={() => setFocus('role')}
                onBlur={() => setFocus(null)}
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="um-pill" style={{ padding: '9px 16px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 500 }}>
              Cancel
            </button>
            <button type="submit" style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: '#fff', cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 600 }}>
              {mode === 'add' ? 'Create account' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function UserViewModal({ user, onClose }) {
  if (!user) return null
  const st = user.status === 'approved'
    ? { bg: 'rgba(52,211,153,0.12)', c: C.green, label: 'Approved' }
    : user.status === 'rejected'
    ? { bg: 'rgba(248,113,113,0.1)', c: C.coral, label: 'Rejected' }
    : { bg: 'rgba(251,191,36,0.1)', c: C.gold, label: 'Pending' }

  const row = (label, value) => (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', padding: '8px 0', borderBottom: `1px solid ${C.border}`, fontSize: '13px' }}>
      <div style={{ color: C.text3, fontWeight: 600 }}>{label}</div>
      <div style={{ color: C.text, wordBreak: 'break-word' }}>{value || '—'}</div>
    </div>
  )
  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', animation: 'umFadeUp 0.25s ease both',
      }}
    >
      <div
        role="dialog"
        aria-labelledby="um-view-title"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto',
          background: C.bg3, border: `1px solid ${C.border2}`,
          borderRadius: '16px', padding: '22px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.45)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
          <UserAvatar name={user.username || user.email} size={72} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div id="um-view-title" style={{ fontFamily: C.display, fontSize: '18px', fontWeight: 700, color: C.text }}>{user.username}</div>
            <div style={{ fontSize: '12px', color: C.text3, fontFamily: C.mono, marginTop: '4px' }}>ID {user.id}</div>
            <span style={{ display: 'inline-flex', marginTop: '8px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: st.bg, color: st.c }}>{st.label}</span>
          </div>
        </div>
        {sectionLabel('Contact details')}
        {row('Email', user.email)}
        {row('Contact number', user.contact_number)}
        {row('Address', user.address)}
        {sectionLabel('Access')}
        {row('Role', user.role)}
        {row('Status', user.status)}
        {row('Member since', user.created_at ? user.created_at.slice(0, 10) : '—')}
        <button type="button" onClick={onClose} className="um-pill" style={{ marginTop: '18px', width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 600 }}>
          Close
        </button>
      </div>
    </div>
  )
}

/**
 * User management UI connected to backend API (add, view, search, filter by status/role, update, activate/deactivate).
 */
function UserManagement({ isMobile = false, isTablet = false }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [modal, setModal] = useState(null)
  const [viewUser, setViewUser] = useState(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await usersAPI.getAll()
      setUsers(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter(u => {
      if (statusFilter !== 'all' && u.status !== statusFilter) return false
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      if (!q) return true
      return (
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.contact_number && u.contact_number.toLowerCase().includes(q)) ||
        String(u.id).includes(q) ||
        (u.address && u.address.toLowerCase().includes(q))
      )
    })
  }, [users, search, statusFilter, roleFilter])

  const stats = useMemo(() => {
    const approved = users.filter(u => u.status === 'approved').length
    const pending = users.filter(u => u.status === 'pending').length
    const rejected = users.filter(u => u.status === 'rejected').length
    return { total: users.length, approved, pending, rejected }
  }, [users])

  const addUser = async (data) => {
    try {
      await usersAPI.addUser(data)
      await fetchUsers()
    } catch (err) {
      console.error('Failed to add user:', err)
      throw err
    }
  }

  const updateUser = async (updated) => {
    try {
      await usersAPI.update(updated.id, {
        username: updated.username,
        email: updated.email,
        contact_number: updated.contact_number,
        address: updated.address,
      })
      await fetchUsers()
    } catch (err) {
      console.error('Failed to update user:', err)
      throw err
    }
  }

  const setStatus = async (id, status) => {
    try {
      await usersAPI.updateStatus(id, status)
      await fetchUsers()
    } catch (err) {
      console.error('Failed to update user status:', err)
    }
  }

  const statusStyle = s =>
    s === 'approved'
      ? { bg: 'rgba(52,211,153,0.12)', c: C.green, dot: C.green, label: 'Approved' }
      : s === 'rejected'
      ? { bg: 'rgba(248,113,113,0.1)', c: C.coral, dot: C.coral, label: 'Rejected' }
      : { bg: 'rgba(251,191,36,0.1)', c: C.gold, dot: C.gold, label: 'Pending' }

  const roleBadge = (role) => {
    const map = {
      admin: C.pink,
      frontdesk: C.gold,
      student: C.teal,
    }
    const col = map[role] || C.text2
    return { color: col, bg: `${col}14`, border: `${col}35` }
  }

  const selectBase = {
    background: C.bg4,
    border: `1px solid ${C.border}`,
    borderRadius: '10px',
    padding: '8px 10px',
    color: C.text,
    fontFamily: C.font,
    fontSize: '13px',
    cursor: 'pointer',
    outline: 'none',
  }

  const roleLabel = (r) => {
    const map = { admin: 'Administrator', frontdesk: 'Front Desk', student: 'Student' }
    return map[r] || r
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: C.text3, fontFamily: C.font }}>
        Loading users...
      </div>
    )
  }

  return (
    <>
      <style>{css}</style>
      <div style={{ animation: 'umFadeUp 0.4s ease both', fontFamily: C.font }}>
        <div style={{ marginBottom: '22px' }}>
          <h1 style={{ fontFamily: C.display, fontSize: isMobile ? '22px' : '26px', fontWeight: 800, color: C.text, letterSpacing: '-0.02em', marginBottom: '6px' }}>
            User management
          </h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px', marginBottom: '18px' }}>
          {[
            { label: 'Total accounts', value: stats.total, sub: 'All roles', color: C.accent },
            { label: 'Approved', value: stats.approved, sub: 'Can sign in', color: C.green },
            { label: 'Pending', value: stats.pending, sub: 'Awaiting approval', color: C.gold },
          ].map((s, i) => (
            <div
              key={s.label}
              style={{
                background: C.bg3,
                border: `1px solid ${C.border}`,
                borderRadius: '14px',
                padding: '16px 18px',
                animation: `umFadeUp 0.35s ease ${i * 0.06}s both`,
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em' }}>{s.label}</div>
              <div style={{ fontFamily: C.display, fontSize: '26px', fontWeight: 700, color: C.text, marginTop: '4px' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: s.color, marginTop: '4px', fontWeight: 500 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            background: C.bg3,
            border: `1px solid ${C.border}`,
            borderRadius: '16px',
            padding: isMobile ? '14px' : '18px 20px',
            marginBottom: '14px',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: isMobile ? 'stretch' : 'center', marginBottom: '14px' }}>
            <div style={{ flex: isMobile ? '1 1 100%' : '1 1 200px', minWidth: 0, position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: C.text3, fontSize: '14px' }}>⌕</span>
              <input
                type="search"
                placeholder="Search by username, email, phone, or ID…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search user accounts"
                style={{
                  width: '100%',
                  background: C.bg4,
                  border: `1px solid ${C.border}`,
                  borderRadius: '10px',
                  padding: '9px 12px 9px 34px',
                  color: C.text,
                  fontFamily: C.font,
                  fontSize: '13px',
                  outline: 'none',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(124,106,247,0.45)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,106,247,0.1)' }}
                onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>Status</span>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...selectBase, minWidth: '120px' }} aria-label="Filter by account status">
                  <option value="all">All statuses</option>
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>Role</span>
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ ...selectBase, minWidth: '140px' }} aria-label="Filter by role">
                  <option value="all">All roles</option>
                  {ROLES.map(r => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setModal({ type: 'add' })}
              style={{
                marginLeft: isMobile ? 0 : 'auto',
                width: isMobile ? '100%' : 'auto',
                padding: '9px 18px',
                borderRadius: '10px',
                border: 'none',
                background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`,
                color: '#fff',
                cursor: 'pointer',
                fontFamily: C.font,
                fontSize: '13px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              + Add user
            </button>
          </div>
          <div style={{ fontSize: '11px', color: C.text3, marginBottom: '12px' }}>
            Showing <strong style={{ color: C.text2 }}>{filtered.length}</strong> of {users.length} accounts
          </div>

          <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${C.border}` }}>
            <table style={{ width: '100%', minWidth: isTablet ? '700px' : '780px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.bg4 }}>
                  {['User', 'Email', 'Contact', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th
                      key={h}
                      style={{
                        textAlign: h === 'Actions' ? 'right' : 'left',
                        padding: '10px 12px',
                        fontSize: '10px',
                        fontWeight: 600,
                        color: C.text3,
                        textTransform: 'uppercase',
                        letterSpacing: '.1em',
                        borderBottom: `1px solid ${C.border}`,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>
                      No accounts match your search or filters. Clear filters or add a new user.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u, i) => {
                    const st = statusStyle(u.status)
                    const rb = roleBadge(u.role)
                    return (
                      <tr key={u.id} className="um-row" style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <UserAvatar name={u.username} size={40} />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>{u.username}</div>
                              <div style={{ fontSize: '11px', color: C.text3, fontFamily: C.mono, marginTop: '2px' }}>ID {u.id}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px', fontSize: '12px', color: C.text2, verticalAlign: 'middle' }}>{u.email}</td>
                        <td style={{ padding: '12px', fontSize: '12px', color: C.text2, fontFamily: C.mono, verticalAlign: 'middle' }}>{u.contact_number || '—'}</td>
                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: 600,
                              color: rb.color,
                              background: rb.bg,
                              border: `1px solid ${rb.border}`,
                            }}
                          >
                            {roleLabel(u.role)}
                          </span>
                        </td>
                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: st.bg, color: st.c }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: st.dot }} />
                            {st.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '12px', color: C.text3, fontFamily: C.mono, verticalAlign: 'middle' }}>{u.created_at ? u.created_at.slice(0, 10) : '—'}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <button
                            type="button"
                            className="um-pill"
                            onClick={() => setViewUser(u)}
                            style={{ marginRight: '6px', padding: '6px 11px', borderRadius: '8px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="um-pill"
                            onClick={() => setModal({ type: 'edit', user: u })}
                            style={{ marginRight: '6px', padding: '6px 11px', borderRadius: '8px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}
                          >
                            Edit
                          </button>
                          {u.status === 'approved' ? (
                            <button
                              type="button"
                              onClick={() => setStatus(u.id, 'rejected')}
                              style={{ padding: '6px 11px', borderRadius: '8px', border: `1px solid rgba(248,113,113,0.35)`, background: 'rgba(248,113,113,0.08)', color: C.coral, cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                            >
                              Reject
                            </button>
                          ) : u.status === 'rejected' ? (
                            <button
                              type="button"
                              onClick={() => setStatus(u.id, 'approved')}
                              style={{ padding: '6px 11px', borderRadius: '8px', border: `1px solid rgba(52,211,153,0.35)`, background: 'rgba(52,211,153,0.1)', color: C.green, cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                            >
                              Approve
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => setStatus(u.id, 'approved')}
                                style={{ marginRight: '4px', padding: '6px 11px', borderRadius: '8px', border: `1px solid rgba(52,211,153,0.35)`, background: 'rgba(52,211,153,0.1)', color: C.green, cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => setStatus(u.id, 'rejected')}
                                style={{ padding: '6px 11px', borderRadius: '8px', border: `1px solid rgba(248,113,113,0.35)`, background: 'rgba(248,113,113,0.08)', color: C.coral, cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal?.type === 'add' && (
        <UserFormModal mode="add" onClose={() => setModal(null)} onSave={addUser} />
      )}
      {modal?.type === 'edit' && (
        <UserFormModal mode="edit" initial={modal.user} onClose={() => setModal(null)} onSave={updateUser} />
      )}
      {viewUser && <UserViewModal user={viewUser} onClose={() => setViewUser(null)} />}
    </>
  )
}

export default UserManagement
