import { useState, useEffect, useCallback } from 'react'
import C from './theme.js'
import SavedPackagesSummary from './SavedPackagesSummary.jsx'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/admin'
const getToken = () => localStorage.getItem('cadenza_token')

// ─── Tag pill colors mapped by package_type_name ─────────────
const TAG_STYLES = {
  'Starter':   { bg: 'rgba(148,163,184,0.1)', color: C.text3 },
  'Popular':   { bg: 'rgba(245,158,11,0.1)',  color: C.gold },
  'Advanced':  { bg: 'rgba(20,184,166,0.1)',  color: C.teal },
  'Intensive': { bg: 'rgba(248,113,113,0.1)', color: C.coral },
}

const getTagStyle = (name) => TAG_STYLES[name] || { bg: 'rgba(148,163,184,0.1)', color: C.text3 }

// ─── Shared style constants ───
const pillStyle = (bg, color) => ({
  padding: '3px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
  background: bg, color, whiteSpace: 'nowrap',
})

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: `1.5px solid ${C.border2}`, fontSize: '0.82rem',
  fontFamily: C.font, outline: 'none', background: '#fff',
  boxSizing: 'border-box',
}

const packageCardStyle = {
  background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`,
  padding: '1.5rem',
}

const dividerStyle = { borderBottom: `1px solid ${C.border}`, margin: '14px 0' }

// ─── Responsive helper ───
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mql = window.matchMedia(query)
    const handler = (e) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

// ─── Icons (inline SVGs) ───
function GuitarIcon({ size = 20, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m11.9 12.1 4.514-4.514" />
      <path d="M20.1 2.3a1 1 0 0 0-1.4 0l-1.114 1.114A2 2 0 0 0 17 4.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 17.414 6.07L15 8.485" />
      <path d="m10 9.5 4.5 4.5" />
      <path d="M12 22c.518 0 1.02-.104 1.477-.304A5 5 0 0 0 16.5 17.5c0-.5-.5-1-1-1H9.5c-.5 0-1 .5-1 1a5 5 0 0 0 3.023 4.196c.457.2.96.304 1.477.304Z" />
      <path d="M12 6a5 5 0 0 1 5 5" />
      <path d="M12 6a5 5 0 0 0-5 5" />
    </svg>
  )
}

function DownArrowIcon({ size = 14, color = C.text3 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  )
}

function CheckIcon({ size = 16, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

// ─── Individual package card ───
function PackageCard({ pkg, fee, onFeeChange, onSave, saving, saved }) {
  const tagStyle = getTagStyle(pkg.package_type_name)

  const rows = [
    { label: 'Duration', value: pkg.duration },
    { label: 'Sessions', value: `${pkg.session} Sessions` },
    { label: 'Frequency', value: pkg.frequency },
  ]

  return (
    <div style={packageCardStyle}>
      {/* Top row: name + tag pill */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: C.navy }}>{pkg.package_type_name}</span>
        <span style={pillStyle(tagStyle.bg, tagStyle.color)}>{pkg.package_type_name}</span>
      </div>

      <div style={dividerStyle} />

      {/* Read-only details */}
      {rows.map(row => (
        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
          <span style={{ fontSize: '0.78rem', color: C.text2 }}>{row.label}</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: C.navy }}>{row.value}</span>
        </div>
      ))}

      <div style={dividerStyle} />

      {/* Fee — the only editable field */}
      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: C.navy, marginBottom: 8 }}>Fee</div>
      <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: C.text2 }}>₱</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={fee}
          onChange={(e) => onFeeChange(pkg.package_type_id, e.target.value)}
          placeholder="0"
          style={{
            flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: C.font, fontSize: '0.9rem', fontWeight: 600, color: C.navy,
          }}
        />
      </div>
      <div style={{ fontSize: '0.7rem', color: C.text3, marginTop: 6, marginBottom: 12 }}>
        Students enrolled in this package will use this fee.
      </div>

      {/* Save button + success feedback */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={() => onSave(pkg.package_type_id)}
          disabled={saving || !fee || parseFloat(fee) <= 0}
          style={{
            padding: '8px 20px', borderRadius: 10, border: 'none',
            background: saving
              ? C.border2
              : `linear-gradient(135deg, ${C.royal}, ${C.purple})`,
            color: '#fff', fontSize: '0.78rem', fontWeight: 600,
            fontFamily: C.font, cursor: saving || !fee || parseFloat(fee) <= 0 ? 'not-allowed' : 'pointer',
            opacity: saving || !fee || parseFloat(fee) <= 0 ? 0.6 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        {saved && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
            background: 'rgba(16,185,129,0.1)', color: C.green,
            animation: 'fadeInOut 2s ease-in-out forwards',
          }}>
            <CheckIcon size={14} color={C.green} />
            Saved
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Fees tab (merged inline from LessonPackageFees.jsx) ───
function LessonPackageFees() {
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Lessons dropdown
  const [lessons, setLessons] = useState([])
  const [selectedLessonId, setSelectedLessonId] = useState('')
  const [lessonsLoading, setLessonsLoading] = useState(true)

  // Package templates with fees
  const [packageTypes, setPackageTypes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Local editable fee state (keyed by package_type_id)
  const [fees, setFees] = useState({})

  // Per-card saving state (keyed by package_type_id)
  const [savingMap, setSavingMap] = useState({})
  // Per-card saved confirmation (keyed by package_type_id)
  const [savedMap, setSavedMap] = useState({})

  // Track package_ids locally so subsequent saves do update not insert
  const [packageIdMap, setPackageIdMap] = useState({})

  // Instructors matching this lesson's specialty (display-only)
  const [instructors, setInstructors] = useState([])
  const [instructorsLoading, setInstructorsLoading] = useState(false)
  const [instructorsMessage, setInstructorsMessage] = useState('')
  const [instructorsError, setInstructorsError] = useState('')

  // Fetch lessons on mount
  useEffect(() => {
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
      } finally {
        setLessonsLoading(false)
      }
    }
    fetchLessons()
  }, [])

  // Fetch package templates when lesson is selected
  useEffect(() => {
    if (!selectedLessonId) {
      setPackageTypes([])
      setFees({})
      setPackageIdMap({})
      return
    }

    const fetchPackageFees = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API}/lesson-package-fees/${selectedLessonId}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        })
        const data = await res.json()
        if (data.success) {
          setPackageTypes(data.data)
          // Initialize local fee state and package_id tracking from API response
          const initialFees = {}
          const initialPackageIds = {}
          data.data.forEach(pt => {
            initialFees[pt.package_type_id] = pt.fee !== null ? String(pt.fee) : ''
            initialPackageIds[pt.package_type_id] = pt.package_id || null
          })
          setFees(initialFees)
          setPackageIdMap(initialPackageIds)
        } else {
          setError(data.message || 'Failed to load package fees.')
        }
      } catch (err) {
        setError('Failed to load package fees.')
      } finally {
        setLoading(false)
      }
    }

    fetchPackageFees()
  }, [selectedLessonId])

  // Fetch instructors matching this lesson's specialty when lesson is selected
  useEffect(() => {
    if (!selectedLessonId) {
      setInstructors([])
      setInstructorsMessage('')
      setInstructorsError('')
      return
    }

    const fetchInstructors = async () => {
      setInstructorsLoading(true)
      setInstructorsError('')
      setInstructorsMessage('')
      try {
        const res = await fetch(`${API}/lessons/${selectedLessonId}/available-instructors`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        })
        const data = await res.json()
        if (data.success) {
          setInstructors(data.data || [])
          if (data.message) {
            setInstructorsMessage(data.message)
          } else if (!data.data || data.data.length === 0) {
            setInstructorsMessage('No instructors assigned to this specialty yet.')
          }
        } else {
          setInstructorsError(data.message || 'Failed to load available instructors.')
        }
      } catch (err) {
        setInstructorsError('Failed to load available instructors.')
      } finally {
        setInstructorsLoading(false)
      }
    }

    fetchInstructors()
  }, [selectedLessonId])

  const handleFeeChange = (packageTypeId, value) => {
    setFees(prev => ({ ...prev, [packageTypeId]: value }))
    // Clear saved state when user edits
    setSavedMap(prev => ({ ...prev, [packageTypeId]: false }))
  }

  const handleSave = useCallback(async (packageTypeId) => {
    // Client-side validation
    const feeValue = fees[packageTypeId]
    if (!feeValue || parseFloat(feeValue) <= 0) {
      return
    }

    setSavingMap(prev => ({ ...prev, [packageTypeId]: true }))
    setError('')

    try {
      const res = await fetch(`${API}/lesson-package-fees`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          lesson_id: parseInt(selectedLessonId),
          package_type_id: packageTypeId,
          fee: parseFloat(feeValue),
        }),
      })

      const data = await res.json()

      if (data.success) {
        // Update local package_id tracking so subsequent saves do update not insert
        if (data.data.id) {
          setPackageIdMap(prev => ({ ...prev, [packageTypeId]: data.data.id }))
        }
        // Show saved confirmation
        setSavedMap(prev => ({ ...prev, [packageTypeId]: true }))
        // Auto-fade after 2 seconds
        setTimeout(() => {
          setSavedMap(prev => ({ ...prev, [packageTypeId]: false }))
        }, 2000)
      } else {
        setError(data.message || 'Failed to save fee.')
      }
    } catch (err) {
      setError('An error occurred while saving.')
    } finally {
      setSavingMap(prev => ({ ...prev, [packageTypeId]: false }))
    }
  }, [fees, selectedLessonId])

  const selectedLesson = lessons.find(l => l.id === parseInt(selectedLessonId))

  return (
    <div style={{ fontFamily: C.font }}>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 4 }}>
        <div>
          <h2 style={{ fontFamily: C.display, fontSize: '1.3rem', fontWeight: 700, color: C.navy, margin: 0 }}>
            Lesson Package Fees
          </h2>
          <p style={{ fontSize: '0.8rem', color: C.text3, marginTop: 4, marginBottom: 0 }}>
            Set the fee for each package. Package details are fixed and cannot be changed.
          </p>
        </div>
        <span style={pillStyle('rgba(37,99,235,0.1)', C.royal)}>4 packages only</span>
      </div>

      <div style={{ ...dividerStyle, marginTop: 16 }} />

      {/* ─── Lesson Type Selector ─── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
        Lesson Type
      </div>

      <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10, flexShrink: 0,
          background: `linear-gradient(135deg, ${C.royal}, ${C.purple})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <GuitarIcon />
        </div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <select
            value={selectedLessonId}
            onChange={(e) => setSelectedLessonId(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 10,
              border: `1.5px solid ${C.border2}`, fontSize: '0.82rem',
              fontFamily: C.font, outline: 'none', background: '#fff',
              fontWeight: 600, color: C.navy, cursor: 'pointer',
            }}
          >
            <option value="">Select a lesson type...</option>
            {lessons.map(l => (
              <option key={l.id} value={l.id}>{l.lesson_name}</option>
            ))}
          </select>
          {selectedLesson && (
            <div style={{ fontSize: '0.75rem', color: C.text3, marginTop: 4 }}>
              {packageTypes.length} package templates available
            </div>
          )}
          {!selectedLesson && (
            <div style={{ fontSize: '0.75rem', color: C.text3, marginTop: 4 }}>
              {lessonsLoading ? 'Loading lessons...' : 'Select a lesson type to see package fees.'}
            </div>
          )}
        </div>
        {selectedLesson && (
          <span style={pillStyle('rgba(16,185,129,0.1)', C.green)}>Active</span>
        )}
      </div>

      <div style={{ ...dividerStyle, marginTop: 20 }} />

      {/* ─── Instructors for this specialty (display-only) ─── */}
      {selectedLessonId && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Instructors for this specialty
          </div>

          {instructorsLoading && (
            <div style={{ fontSize: '0.8rem', color: C.text3, fontStyle: 'italic', padding: '8px 0' }}>
              Loading instructors...
            </div>
          )}

          {instructorsError && !instructorsLoading && (
            <div style={{ padding: '8px 14px', background: 'rgba(248,113,113,0.1)', borderRadius: 8, fontSize: '0.78rem', color: C.coral }}>
              {instructorsError}
            </div>
          )}

          {!instructorsLoading && !instructorsError && instructorsMessage && instructors.length === 0 && (
            <div style={{ fontSize: '0.8rem', color: C.text3, fontStyle: 'italic', padding: '6px 0' }}>
              {instructorsMessage}
            </div>
          )}

          {!instructorsLoading && !instructorsError && instructors.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {instructors.map(inst => {
                const fullName = [inst.staff?.f_name, inst.staff?.m_name, inst.staff?.l_name]
                  .filter(Boolean).join(' ') || 'N/A'
                const specialtyName = inst.instructor_specialties?.[0]?.specialties?.specialty_name || null
                return (
                  <div key={inst.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 14px', borderRadius: 10,
                    background: C.mist, border: `1px solid ${C.border}`,
                    fontSize: '0.8rem',
                  }}>
                    <span style={{ fontSize: '0.9rem' }}>🎵</span>
                    <span style={{ fontWeight: 600, color: C.navy }}>{fullName}</span>
                    {specialtyName && (
                      <span style={{ fontSize: '0.7rem', color: C.text3, padding: '1px 8px', borderRadius: 12, background: 'rgba(30,41,59,0.06)' }}>
                        {specialtyName}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── Error / Loading / Package Cards Grid ─── */}
      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.1)', borderRadius: 10, marginBottom: 16, fontSize: '0.8rem', color: C.coral }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.text3, fontSize: '0.9rem' }}>
          Loading package fees...
        </div>
      ) : !selectedLessonId ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.text3, fontSize: '0.9rem' }}>
          Select a lesson type above to view and manage package fees.
        </div>
      ) : packageTypes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.text3, fontSize: '0.9rem' }}>
          No package templates found. Please seed the package_type table first.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, alignItems: 'start' }}>
          {packageTypes.slice(0, 2).map(pt => (
            <PackageCard
              key={pt.package_type_id}
              pkg={pt}
              fee={fees[pt.package_type_id] ?? ''}
              onFeeChange={handleFeeChange}
              onSave={handleSave}
              saving={savingMap[pt.package_type_id] || false}
              saved={savedMap[pt.package_type_id] || false}
            />
          ))}

          {/* Decorative down arrow centered between the two rows */}
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', margin: '2px 0' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: C.mist, border: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.text3,
            }}>
              <DownArrowIcon />
            </div>
          </div>

          {packageTypes.slice(2).map(pt => (
            <PackageCard
              key={pt.package_type_id}
              pkg={pt}
              fee={fees[pt.package_type_id] ?? ''}
              onFeeChange={handleFeeChange}
              onSave={handleSave}
              saving={savingMap[pt.package_type_id] || false}
              saved={savedMap[pt.package_type_id] || false}
            />
          ))}
        </div>
      )}

      {/* Keyframe animation for fade-in-out */}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(4px); }
          15% { opacity: 1; transform: translateY(0); }
          70% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}

// ─── Main component ───
export default function LessonPackageManagement({ isMobile, isTablet }) {
  const [section, setSection] = useState('fees') // 'fees' | 'saved'

  const tabStyle = (active) => ({
    padding: '10px 20px', borderRadius: 10, border: 'none',
    fontSize: '0.82rem', fontWeight: 600, fontFamily: C.font,
    cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
    background: active ? `linear-gradient(135deg, ${C.royal}, ${C.purple})` : '#fff',
    color: active ? '#fff' : C.text2,
    border: active ? 'none' : `1.5px solid ${C.border2}`,
  })

  return (
    <div style={{ fontFamily: C.font }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <button style={tabStyle(section === 'fees')} onClick={() => setSection('fees')}>
          Package Fees
        </button>
        <button style={tabStyle(section === 'saved')} onClick={() => setSection('saved')}>
          Saved Packages
        </button>
      </div>

      {section === 'fees' ? <LessonPackageFees /> : <SavedPackagesSummary />}
    </div>
  )
}