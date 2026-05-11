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

const AUDIENCES = [
  { value: 'students', label: 'Students' },
  { value: 'instructors', label: 'Instructors' },
  { value: 'frontdesk', label: 'Front desk' },
  { value: 'all', label: 'Everyone' },
]

const CATEGORIES = ['Schedule & holidays', 'Billing & payments', 'Exams & recitals', 'Policy & guidelines', 'System notice']
const URGENCY_LEVELS = ['Info', 'Reminder', 'Urgent']
const STATUSES = ['Draft', 'Scheduled', 'Sent']

const initialAnnouncements = () => [
  {
    id: 'a1',
    title: 'Holiday schedule – No lessons on May 20',
    audience: 'students',
    category: 'Schedule & holidays',
    urgency: 'Reminder',
    status: 'Sent',
    channel: 'Dashboard + SMS',
    createdAt: '2026-05-09T10:15:00',
    scheduledFor: '2026-05-09T10:20:00',
    createdBy: 'System Admin',
  },
  {
    id: 'a2',
    title: 'Front desk opening moved to 9:30 AM tomorrow',
    audience: 'frontdesk',
    category: 'System notice',
    urgency: 'Urgent',
    status: 'Sent',
    channel: 'Dashboard only',
    createdAt: '2026-05-10T07:45:00',
    scheduledFor: '2026-05-10T08:00:00',
    createdBy: 'Operations',
  },
  {
    id: 'a3',
    title: 'Instructor calibration meeting – Friday 6 PM',
    audience: 'instructors',
    category: 'Policy & guidelines',
    urgency: 'Info',
    status: 'Scheduled',
    channel: 'Dashboard + Email',
    createdAt: '2026-05-11T09:00:00',
    scheduledFor: '2026-05-15T18:00:00',
    createdBy: 'Academic Lead',
  },
]

let nextAnnouncementId = 4

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
  @keyframes amFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .am-row { transition: background 0.15s ease; }
  .am-row:hover { background: rgba(255,255,255,0.03) !important; }
  .am-pill { transition: all 0.18s ease; }
  .am-pill:hover { background: rgba(124,106,247,0.18) !important; color: #a99cf9 !important; }
`

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

function fieldLabel(text) {
  return (
    <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px', fontFamily: C.font }}>
      {text}
    </label>
  )
}

function formatDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}

function audienceLabel(a) {
  return AUDIENCES.find(x => x.value === a)?.label || a
}

function statusPill(status) {
  const map = {
    Draft: { bg: 'rgba(156,163,175,0.15)', c: '#e5e7eb' },
    Scheduled: { bg: 'rgba(251,191,36,0.15)', c: C.gold },
    Sent: { bg: 'rgba(52,211,153,0.15)', c: C.green },
  }
  const s = map[status] || map.Draft
  return (
    <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', background: s.bg, color: s.c }}>
      {status}
    </span>
  )
}

function urgencyPill(urgency) {
  const map = {
    Info: { bg: 'rgba(124,106,247,0.15)', c: C.accentL },
    Reminder: { bg: 'rgba(56,189,248,0.15)', c: '#38bdf8' },
    Urgent: { bg: 'rgba(248,113,113,0.18)', c: C.coral },
  }
  const s = map[urgency] || map.Info
  return (
    <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px', background: s.bg, color: s.c, textTransform: 'uppercase', letterSpacing: '.08em' }}>
      {urgency}
    </span>
  )
}

function ComposeAnnouncementModal({ onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [audience, setAudience] = useState('all')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [urgency, setUrgency] = useState('Info')
  const [status, setStatus] = useState('Scheduled')
  const [scheduledFor, setScheduledFor] = useState('')
  const [channel, setChannel] = useState('Dashboard only')
  const [body, setBody] = useState('')
  const [focus, setFocus] = useState(null)

  const submit = e => {
    e.preventDefault()
    if (!title.trim()) return
    const nowIso = new Date().toISOString()
    const payload = {
      id: `a${nextAnnouncementId++}`,
      title: title.trim(),
      audience,
      category,
      urgency,
      status,
      channel: channel.trim() || 'Dashboard only',
      createdAt: nowIso,
      scheduledFor: status === 'Draft' ? '' : scheduledFor || nowIso,
      createdBy: 'Administrator',
      body: body.trim(),
    }
    onSave(payload)
    onClose()
  }

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'amFadeUp 0.25s ease both' }}
    >
      <div
        role="dialog"
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: '16px', padding: '22px', boxShadow: '0 24px 48px rgba(0,0,0,0.45)' }}
      >
        <div style={{ fontFamily: C.display, fontSize: '18px', fontWeight: 700, color: C.text, marginBottom: '6px' }}>Send announcement</div>
        <p style={{ fontSize: '12px', color: C.text3, marginBottom: '16px', lineHeight: 1.5 }}>
          Notify students, instructors, or front desk about important operational events so the music center runs smoothly.
        </p>
        <form onSubmit={submit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              {fieldLabel('Title')}
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                style={inputStyle(focus === 't')}
                onFocus={() => setFocus('t')}
                onBlur={() => setFocus(null)}
                placeholder="e.g. System maintenance at 8 PM tonight"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                {fieldLabel('Audience')}
                <select
                  value={audience}
                  onChange={e => setAudience(e.target.value)}
                  style={{ ...inputStyle(focus === 'a'), cursor: 'pointer' }}
                  onFocus={() => setFocus('a')}
                  onBlur={() => setFocus(null)}
                >
                  {AUDIENCES.map(a => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
              <div>
                {fieldLabel('Urgency')}
                <select
                  value={urgency}
                  onChange={e => setUrgency(e.target.value)}
                  style={{ ...inputStyle(focus === 'u'), cursor: 'pointer' }}
                  onFocus={() => setFocus('u')}
                  onBlur={() => setFocus(null)}
                >
                  {URGENCY_LEVELS.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                {fieldLabel('Category')}
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  style={{ ...inputStyle(focus === 'c'), cursor: 'pointer' }}
                  onFocus={() => setFocus('c')}
                  onBlur={() => setFocus(null)}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                {fieldLabel('Status')}
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  style={{ ...inputStyle(focus === 's'), cursor: 'pointer' }}
                  onFocus={() => setFocus('s')}
                  onBlur={() => setFocus(null)}
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <div>
                {fieldLabel('Channel / delivery')}
                <input
                  value={channel}
                  onChange={e => setChannel(e.target.value)}
                  style={inputStyle(focus === 'ch')}
                  onFocus={() => setFocus('ch')}
                  onBlur={() => setFocus(null)}
                  placeholder="e.g. Dashboard + SMS"
                />
              </div>
              <div>
                {fieldLabel('Send at')}
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={e => setScheduledFor(e.target.value)}
                  style={inputStyle(focus === 'dt')}
                  onFocus={() => setFocus('dt')}
                  onBlur={() => setFocus(null)}
                />
                <div style={{ marginTop: '4px', fontSize: '10px', color: C.text3 }}>
                  Leave blank to send immediately (for Sent).
                </div>
              </div>
            </div>
            <div>
              {fieldLabel('Message')}
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={4}
                style={{ ...inputStyle(focus === 'b'), resize: 'vertical', minHeight: '80px' }}
                onFocus={() => setFocus('b')}
                onBlur={() => setFocus(null)}
                placeholder="Add important details so students, instructors, or front desk know what action to take."
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              className="am-pill"
              style={{ padding: '9px 16px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 500 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: '#fff', cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 600 }}
            >
              Save announcement
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AnnouncementManagement({ isMobile = false, isTablet = false }) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements)
  const [search, setSearch] = useState('')
  const [audienceFilter, setAudienceFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [composeOpen, setComposeOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const stats = useMemo(() => {
    const total = announcements.length
    const scheduled = announcements.filter(a => a.status === 'Scheduled').length
    const sent = announcements.filter(a => a.status === 'Sent').length
    const draft = announcements.filter(a => a.status === 'Draft').length
    return { total, scheduled, sent, draft }
  }, [announcements])

  const filteredAnnouncements = useMemo(() => {
    const q = search.trim().toLowerCase()
    return announcements.filter(a => {
      if (audienceFilter !== 'all' && a.audience !== audienceFilter) return false
      if (statusFilter !== 'all' && a.status !== statusFilter) return false
      if (categoryFilter !== 'all' && a.category !== categoryFilter) return false
      if (!q) return true
      return (
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.body || '').toLowerCase().includes(q) ||
        (a.channel || '').toLowerCase().includes(q)
      )
    })
  }, [announcements, search, audienceFilter, statusFilter, categoryFilter])

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

  const addAnnouncement = row => setAnnouncements(prev => [row, ...prev])
  const removeAnnouncement = id => setAnnouncements(prev => prev.filter(a => a.id !== id))

  return (
    <>
      <style>{css}</style>
      <div style={{ animation: 'amFadeUp 0.4s ease both', fontFamily: C.font }}>
        <div style={{ marginBottom: '18px' }}>
          <h1 style={{ fontFamily: C.display, fontSize: isMobile ? '22px' : '26px', fontWeight: 800, color: C.text, letterSpacing: '-0.02em' }}>
            Announcement management
          </h1>
          <p style={{ marginTop: '4px', fontSize: '13px', color: C.text3 }}>
            Send timely notifications to students, instructors, and front desk, and track key operational announcements across the music center.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
          {[
            { label: 'Announcements', value: stats.total, hint: 'Total created' },
            { label: 'Scheduled', value: stats.scheduled, hint: 'Upcoming sends' },
            { label: 'Sent', value: stats.sent, hint: 'Delivered notifications' },
            { label: 'Drafts', value: stats.draft, hint: 'Not yet scheduled' },
          ].map((s, i) => (
            <div
              key={s.label}
              style={{
                background: C.bg3,
                border: `1px solid ${C.border}`,
                borderRadius: '12px',
                padding: '12px 14px',
                animation: `amFadeUp 0.35s ease ${i * 0.04}s both`,
              }}
            >
              <div style={{ fontSize: '9px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em' }}>{s.label}</div>
              <div style={{ fontFamily: C.display, fontSize: '22px', fontWeight: 700, color: C.text, marginTop: '2px' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: C.text2, marginTop: '4px' }}>{s.hint}</div>
            </div>
          ))}
        </div>

        <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: isMobile ? '14px' : '18px 20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: isMobile ? 'stretch' : 'center', marginBottom: '14px' }}>
            <div style={{ flex: isMobile ? '1 1 100%' : '1 1 220px', minWidth: 0, position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: C.text3, fontSize: '14px' }}>⌕</span>
              <input
                type="search"
                placeholder="Search announcements by title, category, or content…"
                value={search}
                onChange={e => setSearch(e.target.value)}
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
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(124,106,247,0.45)'
                  e.target.style.boxShadow = '0 0 0 3px rgba(124,106,247,0.1)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = C.border
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>Audience</span>
              <select
                value={audienceFilter}
                onChange={e => setAudienceFilter(e.target.value)}
                style={{ ...selectBase, minWidth: '130px' }}
              >
                <option value="all">All</option>
                {AUDIENCES.map(a => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
              <span style={{ fontSize: '10px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>Status</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ ...selectBase, minWidth: '120px' }}
              >
                <option value="all">All</option>
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <span style={{ fontSize: '10px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>Category</span>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                style={{ ...selectBase, minWidth: '150px' }}
              >
                <option value="all">All</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: '0 0 auto', marginLeft: isMobile ? 0 : 'auto', display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setAudienceFilter('all')
                  setStatusFilter('all')
                  setCategoryFilter('all')
                }}
                className="am-pill"
                style={{ padding: '9px 14px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 500 }}
              >
                Clear filters
              </button>
              <button
                type="button"
                onClick={() => setComposeOpen(true)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`,
                  color: '#fff',
                  cursor: 'pointer',
                  fontFamily: C.font,
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                + New announcement
              </button>
            </div>
          </div>

          <div style={{ fontSize: '11px', color: C.text3, marginBottom: '10px' }}>
            Showing <strong style={{ color: C.text2 }}>{filteredAnnouncements.length}</strong> of {announcements.length} announcements
          </div>

          <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${C.border}` }}>
            <table style={{ width: '100%', minWidth: isTablet ? '760px' : '880px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.bg4 }}>
                  {['Title', 'Audience', 'Status', 'Category', 'Urgency', 'Schedule', ''].map(h => (
                    <th
                      key={h || 'act'}
                      style={{
                        textAlign: h === '' ? 'right' : 'left',
                        padding: '10px 12px',
                        fontSize: '10px',
                        fontWeight: 600,
                        color: C.text3,
                        textTransform: 'uppercase',
                        letterSpacing: '.1em',
                        borderBottom: `1px solid ${C.border}`,
                      }}
                    >
                      {h || ' '}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAnnouncements.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '36px 16px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>
                      No announcements match your filters. Try clearing search or compose a new announcement.
                    </td>
                  </tr>
                ) : (
                  filteredAnnouncements.map((a, i) => (
                    <tr key={a.id} className="am-row" style={{ borderBottom: i < filteredAnnouncements.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                      <td style={{ padding: '12px', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>{a.title}</div>
                        <div style={{ fontSize: '11px', color: C.text3, marginTop: '4px' }}>
                          Channel: <span style={{ color: C.text2 }}>{a.channel}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: C.text3, marginTop: '2px' }}>
                          Created: <span style={{ color: C.text2 }}>{formatDateTime(a.createdAt)}</span> · {a.createdBy}
                        </div>
                      </td>
                      <td style={{ padding: '12px', fontSize: '12px', color: C.text2, verticalAlign: 'middle' }}>
                        {audienceLabel(a.audience)}
                      </td>
                      <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                        {statusPill(a.status)}
                      </td>
                      <td style={{ padding: '12px', fontSize: '12px', color: C.text2, verticalAlign: 'middle' }}>
                        {a.category}
                      </td>
                      <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                        {urgencyPill(a.urgency)}
                      </td>
                      <td style={{ padding: '12px', fontSize: '12px', color: C.text2, verticalAlign: 'middle', fontFamily: C.mono }}>
                        {a.status === 'Draft' ? '—' : formatDateTime(a.scheduledFor)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                        <button
                          type="button"
                          onClick={() => setDeleteId(a.id)}
                          style={{ padding: '6px 11px', borderRadius: '8px', border: `1px solid rgba(248,113,113,0.35)`, background: 'rgba(248,113,113,0.08)', color: C.coral, cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {composeOpen && (
        <ComposeAnnouncementModal onClose={() => setComposeOpen(false)} onSave={addAnnouncement} />
      )}

      {deleteId && (
        <div
          role="presentation"
          onClick={() => setDeleteId(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: '16px', padding: '22px', maxWidth: '380px' }}
            role="dialog"
          >
            <div style={{ fontFamily: C.display, fontSize: '17px', fontWeight: 700, color: C.text, marginBottom: '8px' }}>
              Remove announcement?
            </div>
            <p style={{ fontSize: '13px', color: C.text2, lineHeight: 1.5, marginBottom: '18px' }}>
              This will delete the announcement from the list. It will not recall notifications that were already sent.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="am-pill"
                onClick={() => setDeleteId(null)}
                style={{ padding: '8px 14px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontFamily: C.font, fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  removeAnnouncement(deleteId)
                  setDeleteId(null)
                }}
                style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', background: C.coral, color: '#fff', cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 600 }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AnnouncementManagement

