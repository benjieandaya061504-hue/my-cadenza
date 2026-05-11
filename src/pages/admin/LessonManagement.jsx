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

const INSTRUMENTS = ['Guitar', 'Piano', 'Violin', 'Drums', 'Voice', 'Ukulele', 'Bass', 'Cello']
const COURSE_TYPES = ['Music Theory — Beginner', 'Music Theory — Intermediate', 'Ear Training', 'Ensemble Workshop', 'Recital Prep', 'ABRSM Prep']

const CATEGORY_KINDS = [
  { value: 'instrument', label: 'Instrument' },
  { value: 'course', label: 'Course type' },
]

const initialPackages = () => [
  { id: 'p1', name: 'Guitar Starter Pack', durationMinutes: 45, sessionLimit: 8, categoryKind: 'instrument', category: 'Guitar', description: 'Intro chords & rhythm' },
  { id: 'p2', name: 'Piano Foundations', durationMinutes: 60, sessionLimit: 12, categoryKind: 'instrument', category: 'Piano', description: 'Reading & technique' },
  { id: 'p3', name: 'Theory Bootcamp', durationMinutes: 50, sessionLimit: 6, categoryKind: 'course', category: 'Music Theory — Beginner', description: 'Notation & intervals' },
  { id: 'p4', name: 'Drums Intensive', durationMinutes: 55, sessionLimit: 10, categoryKind: 'instrument', category: 'Drums', description: 'Stick control & grooves' },
]

const initialEnrollments = () => [
  { id: 'e1', studentName: 'Ana Reyes', packageId: 'p1', completedSessions: 5, lastSessionDate: '2026-05-08' },
  { id: 'e2', studentName: 'Marco Santos', packageId: 'p2', completedSessions: 3, lastSessionDate: '2026-05-06' },
  { id: 'e3', studentName: 'Pia Gomez', packageId: 'p1', completedSessions: 8, lastSessionDate: '2026-04-20' },
  { id: 'e4', studentName: 'Luis Tan', packageId: 'p4', completedSessions: 2, lastSessionDate: '2026-05-10' },
  { id: 'e5', studentName: 'Sofia Dela Cruz', packageId: 'p3', completedSessions: 1, lastSessionDate: '2026-05-01' },
]

let nextPackageId = 5
let nextEnrollmentId = 6

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
  @keyframes lmFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .lm-row { transition: background 0.15s ease; }
  .lm-row:hover { background: rgba(255,255,255,0.03) !important; }
  .lm-pill { transition: all 0.18s ease; }
  .lm-pill:hover { background: rgba(124,106,247,0.18) !important; color: #a99cf9 !important; }
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

function PackageFormModal({ mode, initial, onClose, onSave }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [durationMinutes, setDurationMinutes] = useState(initial?.durationMinutes ?? 45)
  const [sessionLimit, setSessionLimit] = useState(initial?.sessionLimit ?? 8)
  const [categoryKind, setCategoryKind] = useState(initial?.categoryKind ?? 'instrument')
  const [category, setCategory] = useState(initial?.category ?? INSTRUMENTS[0])
  const [description, setDescription] = useState(initial?.description ?? '')
  const [focus, setFocus] = useState(null)

  const categoryOptions = categoryKind === 'instrument' ? INSTRUMENTS : COURSE_TYPES

  const handleSubmit = e => {
    e.preventDefault()
    if (!name.trim()) return
    const cat = categoryOptions.includes(category) ? category : categoryOptions[0]
    if (mode === 'add') {
      onSave({
        id: `p${nextPackageId++}`,
        name: name.trim(),
        durationMinutes: Math.max(15, Number(durationMinutes) || 45),
        sessionLimit: Math.max(1, Number(sessionLimit) || 1),
        categoryKind,
        category: cat,
        description: description.trim(),
      })
    } else {
      onSave({
        ...initial,
        name: name.trim(),
        durationMinutes: Math.max(15, Number(durationMinutes) || 45),
        sessionLimit: Math.max(1, Number(sessionLimit) || 1),
        categoryKind,
        category: cat,
        description: description.trim(),
      })
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
        padding: '20px', animation: 'lmFadeUp 0.25s ease both',
      }}
    >
      <div
        role="dialog"
        aria-labelledby="lm-pkg-title"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto',
          background: C.bg3, border: `1px solid ${C.border2}`,
          borderRadius: '16px', padding: '22px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.45)',
        }}
      >
        <div id="lm-pkg-title" style={{ fontFamily: C.display, fontSize: '18px', fontWeight: 700, color: C.text, marginBottom: '6px' }}>
          {mode === 'add' ? 'Create lesson package' : 'Update lesson package'}
        </div>
        <p style={{ fontSize: '12px', color: C.text3, marginBottom: '18px', lineHeight: 1.45 }}>
          Set duration per session, total session limit, and whether the package is grouped by instrument or course type.
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              {fieldLabel('Package name')}
              <input value={name} onChange={e => setName(e.target.value)} required style={inputStyle(focus === 'n')} onFocus={() => setFocus('n')} onBlur={() => setFocus(null)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                {fieldLabel('Lesson duration (min)')}
                <input type="number" min={15} step={5} value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)} style={inputStyle(focus === 'd')} onFocus={() => setFocus('d')} onBlur={() => setFocus(null)} />
              </div>
              <div>
                {fieldLabel('Session limit')}
                <input type="number" min={1} value={sessionLimit} onChange={e => setSessionLimit(e.target.value)} style={inputStyle(focus === 's')} onFocus={() => setFocus('s')} onBlur={() => setFocus(null)} />
              </div>
            </div>
            <div>
              {fieldLabel('Lesson category basis')}
              <select
                value={categoryKind}
                onChange={e => {
                  const k = e.target.value
                  setCategoryKind(k)
                  setCategory(k === 'instrument' ? INSTRUMENTS[0] : COURSE_TYPES[0])
                }}
                style={{ ...inputStyle(focus === 'k'), cursor: 'pointer' }}
                onFocus={() => setFocus('k')}
                onBlur={() => setFocus(null)}
              >
                {CATEGORY_KINDS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              {fieldLabel(categoryKind === 'instrument' ? 'Instrument' : 'Course type')}
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{ ...inputStyle(focus === 'c'), cursor: 'pointer' }}
                onFocus={() => setFocus('c')}
                onBlur={() => setFocus(null)}
              >
                {categoryOptions.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              {fieldLabel('Description (optional)')}
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ ...inputStyle(focus === 'x'), resize: 'vertical', minHeight: '72px' }} onFocus={() => setFocus('x')} onBlur={() => setFocus(null)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="lm-pill" style={{ padding: '9px 16px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 500 }}>
              Cancel
            </button>
            <button type="submit" style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: '#fff', cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 600 }}>
              {mode === 'add' ? 'Create package' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SessionProgressBar({ completed, total }) {
  const pct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '120px' }}>
      <div style={{ flex: 1, height: '6px', background: C.bg4, borderRadius: '20px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: '20px', background: `linear-gradient(90deg, ${C.teal}, ${C.accent})`, transition: 'width 0.35s ease' }} />
      </div>
      <span style={{ fontSize: '11px', fontFamily: C.mono, color: C.text3, width: '36px', textAlign: 'right' }}>{pct}%</span>
    </div>
  )
}

/**
 * Lesson administration: packages (CRUD, duration, sessions, categories) and enrollment progress (completed / remaining sessions).
 */
function LessonManagement({ isMobile = false, isTablet = false }) {
  const [tab, setTab] = useState('packages')
  const [packages, setPackages] = useState(initialPackages)
  const [enrollments, setEnrollments] = useState(initialEnrollments)
  const [pkgSearch, setPkgSearch] = useState('')
  const [pkgFilterKind, setPkgFilterKind] = useState('all')
  const [pkgFilterCategory, setPkgFilterCategory] = useState('all')
  const [progSearch, setProgSearch] = useState('')
  const [pkgModal, setPkgModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const packageById = useMemo(() => Object.fromEntries(packages.map(p => [p.id, p])), [packages])

  const filteredPackages = useMemo(() => {
    const q = pkgSearch.trim().toLowerCase()
    return packages.filter(p => {
      if (pkgFilterKind !== 'all' && p.categoryKind !== pkgFilterKind) return false
      if (pkgFilterCategory !== 'all' && p.category !== pkgFilterCategory) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      )
    })
  }, [packages, pkgSearch, pkgFilterKind, pkgFilterCategory])

  const allCategories = useMemo(() => {
    const s = new Set()
    packages.forEach(p => s.add(p.category))
    return ['all', ...Array.from(s).sort()]
  }, [packages])

  const filteredEnrollments = useMemo(() => {
    const q = progSearch.trim().toLowerCase()
    return enrollments.filter(e => {
      const pkg = packageById[e.packageId]
      if (!pkg) return false
      if (!q) return true
      return (
        e.studentName.toLowerCase().includes(q) ||
        pkg.name.toLowerCase().includes(q) ||
        pkg.category.toLowerCase().includes(q)
      )
    })
  }, [enrollments, progSearch, packageById])

  const progressStats = useMemo(() => {
    let totalSessions = 0
    let completed = 0
    enrollments.forEach(e => {
      const pkg = packageById[e.packageId]
      if (!pkg) return
      const cap = Math.min(e.completedSessions, pkg.sessionLimit)
      totalSessions += pkg.sessionLimit
      completed += cap
    })
    const remaining = Math.max(0, totalSessions - completed)
    return { rows: enrollments.filter(e => packageById[e.packageId]).length, totalSessions, completed, remaining }
  }, [enrollments, packageById])

  const addPackage = row => setPackages(prev => [...prev, row])
  const updatePackage = row => setPackages(prev => prev.map(p => (p.id === row.id ? row : p)))
  const removePackage = id => {
    setPackages(prev => prev.filter(p => p.id !== id))
    setEnrollments(prev => prev.filter(e => e.packageId !== id))
    setDeleteId(null)
  }

  const logSession = enrollmentId => {
    setEnrollments(prev =>
      prev.map(e => {
        if (e.id !== enrollmentId) return e
        const pkg = packageById[e.packageId]
        if (!pkg) return e
        if (e.completedSessions >= pkg.sessionLimit) return e
        return {
          ...e,
          completedSessions: e.completedSessions + 1,
          lastSessionDate: new Date().toISOString().slice(0, 10),
        }
      }),
    )
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

  const tabBtn = (id, label) => {
    const on = tab === id
    return (
      <button
        type="button"
        onClick={() => setTab(id)}
        style={{
          padding: '8px 16px',
          borderRadius: '10px',
          border: on ? `1px solid rgba(124,106,247,0.4)` : `1px solid ${C.border}`,
          background: on ? 'rgba(124,106,247,0.14)' : 'transparent',
          color: on ? C.accentL : C.text2,
          cursor: 'pointer',
          fontFamily: C.font,
          fontSize: '13px',
          fontWeight: on ? 600 : 500,
        }}
      >
        {label}
      </button>
    )
  }

  return (
    <>
      <style>{css}</style>
      <div style={{ animation: 'lmFadeUp 0.4s ease both', fontFamily: C.font }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontFamily: C.display, fontSize: isMobile ? '22px' : '26px', fontWeight: 800, color: C.text, letterSpacing: '-0.02em' }}>
            Lesson management
          </h1>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
          {tabBtn('packages', 'Lesson packages')}
          {tabBtn('progress', 'Progress & sessions')}
        </div>

        {tab === 'packages' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: 'Packages defined', value: packages.length, hint: 'Duration & session rules' },
                { label: 'Instrument-based', value: packages.filter(p => p.categoryKind === 'instrument').length, hint: 'Categories by instrument' },
                { label: 'Course-based', value: packages.filter(p => p.categoryKind === 'course').length, hint: 'Categories by course type' },
              ].map((s, i) => (
                <div
                  key={s.label}
                  style={{
                    background: C.bg3,
                    border: `1px solid ${C.border}`,
                    borderRadius: '14px',
                    padding: '16px 18px',
                    animation: `lmFadeUp 0.35s ease ${i * 0.05}s both`,
                  }}
                >
                  <div style={{ fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em' }}>{s.label}</div>
                  <div style={{ fontFamily: C.display, fontSize: '26px', fontWeight: 700, color: C.text, marginTop: '4px' }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: C.text2, marginTop: '4px' }}>{s.hint}</div>
                </div>
              ))}
            </div>

            <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: isMobile ? '14px' : '18px 20px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: isMobile ? 'stretch' : 'center', marginBottom: '14px' }}>
                <div style={{ flex: isMobile ? '1 1 100%' : '1 1 200px', minWidth: 0, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: C.text3, fontSize: '14px' }}>⌕</span>
                  <input
                    type="search"
                    placeholder="Search packages by name, category, or ID…"
                    value={pkgSearch}
                    onChange={e => setPkgSearch(e.target.value)}
                    aria-label="Search lesson packages"
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
                  <span style={{ fontSize: '10px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>Category basis</span>
                  <select value={pkgFilterKind} onChange={e => setPkgFilterKind(e.target.value)} style={{ ...selectBase, minWidth: '130px' }} aria-label="Filter by category kind">
                    <option value="all">All</option>
                    <option value="instrument">Instrument</option>
                    <option value="course">Course type</option>
                  </select>
                  <span style={{ fontSize: '10px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>Category</span>
                  <select value={pkgFilterCategory} onChange={e => setPkgFilterCategory(e.target.value)} style={{ ...selectBase, minWidth: '160px' }} aria-label="Filter by category">
                    {allCategories.map(c => (
                      <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setPkgModal({ type: 'add' })}
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
                  }}
                >
                  + Create package
                </button>
              </div>
              <div style={{ fontSize: '11px', color: C.text3, marginBottom: '12px' }}>
                Showing <strong style={{ color: C.text2 }}>{filteredPackages.length}</strong> of {packages.length} packages
              </div>

              <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${C.border}` }}>
                <table style={{ width: '100%', minWidth: isTablet ? '720px' : '800px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: C.bg4 }}>
                      {['Package', 'Duration', 'Sessions', 'Category', 'Actions'].map(h => (
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
                    {filteredPackages.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '36px 16px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>
                          No packages match your filters. Try clearing search or create a new package.
                        </td>
                      </tr>
                    ) : (
                      filteredPackages.map((p, i) => (
                        <tr key={p.id} className="lm-row" style={{ borderBottom: i < filteredPackages.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                          <td style={{ padding: '12px', verticalAlign: 'top' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>{p.name}</div>
                            <div style={{ fontSize: '11px', color: C.text3, fontFamily: C.mono, marginTop: '3px' }}>{p.id}</div>
                            {p.description && <div style={{ fontSize: '11px', color: C.text2, marginTop: '6px', maxWidth: '320px', lineHeight: 1.4 }}>{p.description}</div>}
                          </td>
                          <td style={{ padding: '12px', fontSize: '13px', color: C.text2, fontFamily: C.mono, verticalAlign: 'middle' }}>{p.durationMinutes} min</td>
                          <td style={{ padding: '12px', fontSize: '13px', color: C.text2, fontFamily: C.mono, verticalAlign: 'middle' }}>{p.sessionLimit}</td>
                          <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                            <div style={{ fontSize: '12px', color: C.text, fontWeight: 500 }}>{p.category}</div>
                            <div style={{ fontSize: '10px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.06em', marginTop: '4px' }}>
                              {p.categoryKind === 'instrument' ? 'Instrument' : 'Course type'}
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                            <button type="button" className="lm-pill" onClick={() => setPkgModal({ type: 'edit', pkg: p })} style={{ marginRight: '6px', padding: '6px 11px', borderRadius: '8px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}>
                              Edit
                            </button>
                            <button type="button" onClick={() => setDeleteId(p.id)} style={{ padding: '6px 11px', borderRadius: '8px', border: `1px solid rgba(248,113,113,0.35)`, background: 'rgba(248,113,113,0.08)', color: C.coral, cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
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
          </>
        )}

        {tab === 'progress' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: 'Active enrollments', value: progressStats.rows, hint: 'Students with a package' },
                { label: 'Sessions completed', value: progressStats.completed, hint: 'Across all packages' },
                { label: 'Sessions remaining', value: progressStats.remaining, hint: 'Planned but not done' },
                { label: 'Total planned sessions', value: progressStats.totalSessions, hint: 'Capacity in system' },
              ].map((s, i) => (
                <div
                  key={s.label}
                  style={{
                    background: C.bg3,
                    border: `1px solid ${C.border}`,
                    borderRadius: '14px',
                    padding: '16px 18px',
                    animation: `lmFadeUp 0.35s ease ${i * 0.04}s both`,
                  }}
                >
                  <div style={{ fontSize: '10px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em' }}>{s.label}</div>
                  <div style={{ fontFamily: C.display, fontSize: '24px', fontWeight: 700, color: C.text, marginTop: '4px' }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: C.text2, marginTop: '4px' }}>{s.hint}</div>
                </div>
              ))}
            </div>

            <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: isMobile ? '14px' : '18px 20px' }}>
              <div style={{ fontFamily: C.display, fontSize: '15px', fontWeight: 700, color: C.text, marginBottom: '6px' }}>Lesson progress records</div>

              <div style={{ marginBottom: '14px', maxWidth: '400px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: C.text3, fontSize: '14px' }}>⌕</span>
                <input
                  type="search"
                  placeholder="Search by student or package…"
                  value={progSearch}
                  onChange={e => setProgSearch(e.target.value)}
                  aria-label="Search progress records"
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

              <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${C.border}` }}>
                <table style={{ width: '100%', minWidth: isTablet ? '760px' : '880px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: C.bg4 }}>
                      {['Student', 'Package', 'Category', 'Completed', 'Remaining', 'Progress', 'Last session', ''].map(h => (
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
                    {filteredEnrollments.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ padding: '36px 16px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>
                          No progress records match your search, or no enrollments reference existing packages.
                        </td>
                      </tr>
                    ) : (
                      filteredEnrollments.map((e, i) => {
                        const pkg = packageById[e.packageId]
                        const total = pkg.sessionLimit
                        const done = Math.min(e.completedSessions, total)
                        const remaining = Math.max(0, total - done)
                        const complete = done >= total
                        return (
                          <tr key={e.id} className="lm-row" style={{ borderBottom: i < filteredEnrollments.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                            <td style={{ padding: '12px', fontSize: '13px', fontWeight: 600, color: C.text, verticalAlign: 'middle' }}>{e.studentName}</td>
                            <td style={{ padding: '12px', fontSize: '12px', color: C.text2, verticalAlign: 'middle' }}>{pkg.name}</td>
                            <td style={{ padding: '12px', fontSize: '12px', color: C.text2, verticalAlign: 'middle' }}>{pkg.category}</td>
                            <td style={{ padding: '12px', fontSize: '13px', fontFamily: C.mono, color: C.teal, fontWeight: 600, verticalAlign: 'middle' }}>{done}</td>
                            <td style={{ padding: '12px', fontSize: '13px', fontFamily: C.mono, color: complete ? C.text3 : C.gold, fontWeight: 600, verticalAlign: 'middle' }}>{remaining}</td>
                            <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                              <SessionProgressBar completed={done} total={total} />
                            </td>
                            <td style={{ padding: '12px', fontSize: '12px', color: C.text3, fontFamily: C.mono, verticalAlign: 'middle' }}>{e.lastSessionDate || '—'}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', verticalAlign: 'middle' }}>
                              <button
                                type="button"
                                disabled={complete}
                                onClick={() => logSession(e.id)}
                                style={{
                                  padding: '6px 11px',
                                  borderRadius: '8px',
                                  border: `1px solid ${complete ? C.border : `rgba(45,212,191,0.35)`}`,
                                  background: complete ? C.bg4 : 'rgba(45,212,191,0.1)',
                                  color: complete ? C.text3 : C.teal,
                                  cursor: complete ? 'not-allowed' : 'pointer',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                }}
                              >
                                Log session
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
          </>
        )}
      </div>

      {pkgModal?.type === 'add' && <PackageFormModal mode="add" onClose={() => setPkgModal(null)} onSave={addPackage} />}
      {pkgModal?.type === 'edit' && <PackageFormModal mode="edit" initial={pkgModal.pkg} onClose={() => setPkgModal(null)} onSave={updatePackage} />}

      {deleteId && (
        <div
          role="presentation"
          onClick={() => setDeleteId(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div onClick={ev => ev.stopPropagation()} style={{ background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: '16px', padding: '22px', maxWidth: '400px' }} role="dialog" aria-labelledby="lm-del-title">
            <div id="lm-del-title" style={{ fontFamily: C.display, fontSize: '17px', fontWeight: 700, color: C.text, marginBottom: '8px' }}>Remove package?</div>
            <p style={{ fontSize: '13px', color: C.text2, lineHeight: 1.5, marginBottom: '18px' }}>
              This will delete the package and remove linked enrollment progress rows for students on this package.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" className="lm-pill" onClick={() => setDeleteId(null)} style={{ padding: '8px 14px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontFamily: C.font, fontSize: '13px' }}>
                Cancel
              </button>
              <button type="button" onClick={() => removePackage(deleteId)} style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', background: C.coral, color: '#fff', cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 600 }}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default LessonManagement
