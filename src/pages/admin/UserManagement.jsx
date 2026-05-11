import { useMemo, useState } from 'react'

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

const ROLES = ['Student', 'Instructor', 'Front Desk', 'Administrator']
const STATUSES = ['active', 'inactive']

const initialUsers = () => [
  { id: '1', name: 'Ana Reyes', email: 'ana.reyes@email.com', phone: '+63 917 111 2233', role: 'Student', status: 'active', createdAt: '2025-11-02' },
  { id: '2', name: 'Marco Santos', email: 'marco.santos@email.com', phone: '+63 918 222 3344', role: 'Student', status: 'active', createdAt: '2025-10-18' },
  { id: '3', name: 'Mr. Cruz', email: 'cruz.instructor@cadenza.edu', phone: '+63 919 333 4455', role: 'Instructor', status: 'active', createdAt: '2024-03-01' },
  { id: '4', name: 'Ms. Lim', email: 'lim.instructor@cadenza.edu', phone: '+63 920 444 5566', role: 'Instructor', status: 'inactive', createdAt: '2024-01-15' },
  { id: '5', name: 'Pia Gomez', email: 'pia.gomez@email.com', phone: '+63 921 555 6677', role: 'Student', status: 'inactive', createdAt: '2025-08-20' },
  { id: '6', name: 'Luis Tan', email: 'luis.tan@email.com', phone: '+63 922 666 7788', role: 'Student', status: 'active', createdAt: '2026-01-10' },
  { id: '7', name: 'Rosa Navarro', email: 'rosa.navarro@cadenza.edu', phone: '+63 923 777 8899', role: 'Front Desk', status: 'active', createdAt: '2025-06-01' },
  { id: '8', name: 'System Admin', email: 'admin@cadenza.edu', phone: '—', role: 'Administrator', status: 'active', createdAt: '2023-01-01' },
]

const USER_DETAIL_DEFAULTS = {
  username: '',
  dateOfBirth: '',
  addressLine: '',
  city: '',
  emergencyContact: '',
  profilePhotoUrl: null,
}

const seededUsers = () =>
  initialUsers().map(u => ({
    ...USER_DETAIL_DEFAULTS,
    ...u,
    username:
      u.username ||
      (typeof u.email === 'string' && u.email.includes('@') ? u.email.split('@')[0] : `user_${u.id}`),
  }))

let nextId = 9

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
  if (url) {
    return (
      <img
        src={url}
        alt=""
        style={{
          width: size,
          height: size,
          borderRadius: '10px',
          objectFit: 'cover',
          border: `1px solid ${C.border}`,
          flexShrink: 0,
        }}
      />
    )
  }
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
  const [name, setName] = useState(initial?.name ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [role, setRole] = useState(initial?.role ?? 'Student')
  const [password, setPassword] = useState('')
  const [focus, setFocus] = useState(null)
  const [username, setUsername] = useState(initial?.username ?? '')
  const [dateOfBirth, setDateOfBirth] = useState(initial?.dateOfBirth ?? '')
  const [addressLine, setAddressLine] = useState(initial?.addressLine ?? '')
  const [city, setCity] = useState(initial?.city ?? '')
  const [emergencyContact, setEmergencyContact] = useState(initial?.emergencyContact ?? '')
  const [photoPreview, setPhotoPreview] = useState(initial?.profilePhotoUrl ?? null)
  const [newPassword, setNewPassword] = useState('')

  const onPhotoChange = e => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      setPhotoPreview(typeof reader.result === 'string' ? reader.result : null)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    const loginUser = (username.trim() || email.split('@')[0] || '').replace(/\s+/g, '')
    const extra = {
      username: loginUser,
      dateOfBirth: dateOfBirth.trim(),
      addressLine: addressLine.trim(),
      city: city.trim(),
      emergencyContact: emergencyContact.trim(),
      profilePhotoUrl: photoPreview || null,
    }
    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '—',
      role,
      ...extra,
    }
    if (mode === 'add') {
      onSave({
        ...payload,
        id: String(nextId++),
        status: 'active',
        createdAt: new Date().toISOString().slice(0, 10),
        tempPassword: password.trim() || undefined,
      })
    } else {
      const merged = { ...initial, ...payload }
      if (newPassword.trim()) merged.lastCredentialUpdate = new Date().toISOString().slice(0, 10)
      onSave(merged)
    }
    onClose()
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
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sectionLabel('Profile photo')}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <UserAvatar url={photoPreview} name={name} size={64} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input type="file" accept="image/*" onChange={onPhotoChange} style={{ fontSize: '12px', color: C.text2, maxWidth: '220px' }} />
                {photoPreview && (
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    className="um-pill"
                    style={{ alignSelf: 'flex-start', padding: '5px 10px', borderRadius: '8px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text3, cursor: 'pointer', fontSize: '11px', fontFamily: C.font }}
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>

            {sectionLabel('Personal information')}
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px', fontFamily: C.font }}>Full name</label>
              <input value={name} onChange={e => setName(e.target.value)} required style={inputStyle(focus === 'name')} onFocus={() => setFocus('name')} onBlur={() => setFocus(null)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px', fontFamily: C.font }}>Date of birth</label>
              <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} style={inputStyle(focus === 'dob')} onFocus={() => setFocus('dob')} onBlur={() => setFocus(null)} />
            </div>

            {sectionLabel('Contact details')}
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px', fontFamily: C.font }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle(focus === 'email')} onFocus={() => setFocus('email')} onBlur={() => setFocus(null)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px', fontFamily: C.font }}>Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle(focus === 'phone')} onFocus={() => setFocus('phone')} onBlur={() => setFocus(null)} placeholder="Optional" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px', fontFamily: C.font }}>Address line</label>
              <input value={addressLine} onChange={e => setAddressLine(e.target.value)} style={inputStyle(focus === 'addr')} onFocus={() => setFocus('addr')} onBlur={() => setFocus(null)} placeholder="Street, unit, barangay…" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px', fontFamily: C.font }}>City / region</label>
              <input value={city} onChange={e => setCity(e.target.value)} style={inputStyle(focus === 'city')} onFocus={() => setFocus('city')} onBlur={() => setFocus(null)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px', fontFamily: C.font }}>Emergency contact</label>
              <input value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} style={inputStyle(focus === 'em')} onFocus={() => setFocus('em')} onBlur={() => setFocus(null)} placeholder="Name and phone" />
            </div>

            {sectionLabel('Login credentials')}
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px', fontFamily: C.font }}>Username (sign-in ID)</label>
              <input value={username} onChange={e => setUsername(e.target.value)} style={inputStyle(focus === 'user')} onFocus={() => setFocus('user')} onBlur={() => setFocus(null)} placeholder="Defaults from email if empty" autoComplete="username" />
            </div>
            {mode === 'add' && (
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px', fontFamily: C.font }}>Initial password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle(focus === 'pw')} onFocus={() => setFocus('pw')} onBlur={() => setFocus(null)} placeholder="Optional — invite flow may apply" autoComplete="new-password" />
              </div>
            )}
            {mode === 'edit' && (
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px', fontFamily: C.font }}>New password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle(focus === 'npw')} onFocus={() => setFocus('npw')} onBlur={() => setFocus(null)} placeholder="Leave blank to keep current password" autoComplete="new-password" />
              </div>
            )}

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
                  <option key={r} value={r}>{r}</option>
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
  const st = user.status === 'active'
    ? { bg: 'rgba(52,211,153,0.12)', c: C.green, label: 'Active' }
    : { bg: 'rgba(248,113,113,0.1)', c: C.coral, label: 'Inactive' }
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
          <UserAvatar url={user.profilePhotoUrl} name={user.name} size={72} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div id="um-view-title" style={{ fontFamily: C.display, fontSize: '18px', fontWeight: 700, color: C.text }}>{user.name}</div>
            <div style={{ fontSize: '12px', color: C.text3, fontFamily: C.mono, marginTop: '4px' }}>ID {user.id}</div>
            <span style={{ display: 'inline-flex', marginTop: '8px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: st.bg, color: st.c }}>{st.label}</span>
          </div>
        </div>
        {sectionLabel('Personal information')}
        {row('Full name', user.name)}
        {row('Date of birth', user.dateOfBirth)}
        {sectionLabel('Contact details')}
        {row('Email', user.email)}
        {row('Phone', user.phone)}
        {row('Address', user.addressLine)}
        {row('City / region', user.city)}
        {row('Emergency contact', user.emergencyContact)}
        {sectionLabel('Login credentials')}
        {row('Username', user.username)}
        {row('Password', '••••••••' + (user.lastCredentialUpdate ? ` (updated ${user.lastCredentialUpdate})` : ''))}
        {sectionLabel('Access')}
        {row('Role', user.role)}
        {row('Member since', user.createdAt)}
        <button type="button" onClick={onClose} className="um-pill" style={{ marginTop: '18px', width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 600 }}>
          Close
        </button>
      </div>
    </div>
  )
}

/**
 * REQ007–REQ013: User management UI (add, view, search, filter by status/role, update, activate, deactivate).
 */
function UserManagement({ isMobile = false, isTablet = false }) {
  const [users, setUsers] = useState(() => seededUsers())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [modal, setModal] = useState(null)
  const [viewUser, setViewUser] = useState(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter(u => {
      if (statusFilter !== 'all' && u.status !== statusFilter) return false
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      if (!q) return true
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q) ||
        u.id.includes(q) ||
        (u.username && String(u.username).toLowerCase().includes(q)) ||
        (u.addressLine && u.addressLine.toLowerCase().includes(q)) ||
        (u.city && u.city.toLowerCase().includes(q)) ||
        (u.emergencyContact && u.emergencyContact.toLowerCase().includes(q))
      )
    })
  }, [users, search, statusFilter, roleFilter])

  const stats = useMemo(() => {
    const active = users.filter(u => u.status === 'active').length
    const inactive = users.length - active
    return { total: users.length, active, inactive }
  }, [users])

  const addUser = row => {
    const { tempPassword: _tp, ...rest } = row
    setUsers(prev => [...prev, rest])
  }

  const updateUser = updated => {
    setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)))
  }

  const setStatus = (id, status) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, status } : u)))
  }

  const statusStyle = s =>
    s === 'active'
      ? { bg: 'rgba(52,211,153,0.12)', c: C.green, dot: C.green, label: 'Active' }
      : { bg: 'rgba(248,113,113,0.1)', c: C.coral, dot: C.coral, label: 'Inactive' }

  const roleBadge = role => {
    const map = {
      Student: C.teal,
      Instructor: C.accentL,
      'Front Desk': C.gold,
      Administrator: C.pink,
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
            { label: 'Active', value: stats.active, sub: 'Can sign in', color: C.green },
            { label: 'Inactive', value: stats.inactive, sub: 'Access suspended', color: C.coral },
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
                placeholder="Search by name, email, phone, username, address, or ID…"
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
                    <option key={s} value={s}>{s === 'active' ? 'Active' : 'Inactive'}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>Role</span>
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ ...selectBase, minWidth: '140px' }} aria-label="Filter by role">
                  <option value="all">All roles</option>
                  {ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
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
                  {['User', 'Email', 'Phone', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
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
                            <UserAvatar url={u.profilePhotoUrl} name={u.name} size={40} />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>{u.name}</div>
                              <div style={{ fontSize: '11px', color: C.text3, fontFamily: C.mono, marginTop: '2px' }}>ID {u.id}</div>
                              <div style={{ fontSize: '10px', color: C.text3, marginTop: '2px' }}>@{u.username || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px', fontSize: '12px', color: C.text2, verticalAlign: 'middle' }}>{u.email}</td>
                        <td style={{ padding: '12px', fontSize: '12px', color: C.text2, fontFamily: C.mono, verticalAlign: 'middle' }}>{u.phone}</td>
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
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: st.bg, color: st.c }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: st.dot }} />
                            {st.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '12px', color: C.text3, fontFamily: C.mono, verticalAlign: 'middle' }}>{u.createdAt}</td>
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
                          {u.status === 'inactive' ? (
                            <button
                              type="button"
                              onClick={() => setStatus(u.id, 'active')}
                              style={{ padding: '6px 11px', borderRadius: '8px', border: `1px solid rgba(52,211,153,0.35)`, background: 'rgba(52,211,153,0.1)', color: C.green, cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                            >
                              Activate
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setStatus(u.id, 'inactive')}
                              style={{ padding: '6px 11px', borderRadius: '8px', border: `1px solid rgba(248,113,113,0.35)`, background: 'rgba(248,113,113,0.08)', color: C.coral, cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                            >
                              Deactivate
                            </button>
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
