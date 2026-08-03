import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import {
  getFrequencyLabel,
  getNextWeekdayDate,
  formatDateLong,
  formatDateShort,
  calculateEndDate,
  DAY_NAMES,
  DAY_SHORT,
} from './enrollmentUtils'
import { fetchLessonPackages } from './enrollmentData'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ─── Helper to flatten programs into a single package array ──────
function flattenPrograms(programs) {
  const result = []
  ;(programs || []).forEach((prog) => {
    ;(prog.packages || []).forEach((pkg) => {
      result.push({ ...pkg, programId: prog.id, programName: prog.name, category: prog.category })
    })
  })
  return result
}

const TIME_BLOCKS = [
  ['08:00', '09:00'],
  ['09:00', '10:00'],
  ['10:00', '11:00'],
  ['11:00', '12:00'],
  ['13:00', '14:00'],
  ['14:00', '15:00'],
  ['15:00', '16:00'],
  ['16:00', '17:00'],
]

const FIELD_LABELS = {
  fname: 'First Name',
  lname: 'Last Name',
  email: 'Gmail Address',
  phone: 'Contact Number',
  address: 'Student Address',
  age: 'Age',
  emergency: 'Emergency Contact Number',
  refnum: 'Payment Reference Number',
}

export default function EnrollmentModal({ isOpen, onClose, initialPackage }) {
  // ── Data fetching state ────────────────────────────────────────
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(null)

  // ── Step state ──────────────────────────────────────────────────
  const [step, setStep] = useState(1)
  const [selectedPackageGroup, setSelectedPackageGroup] = useState(null)
  const [lesson, setLesson] = useState(null)
  const [selectedInstructor, setSelectedInstructor] = useState(null)
  const [selectedWeekdays, setSelectedWeekdays] = useState([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [form, setForm] = useState({
    fname: '', lname: '', email: '', phone: '', age: '',
    level: '', notes: '', refnum: '', paymethod: '', address: '', emergency: '',
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const confirmRef = useRef({ form: {}, lesson: null, instructor: null, requiredSlots: 0, totalAmount: 0, scheduleText: '—' })

  // ── Instructor availability state ──────────────────────────────
  const [availability, setAvailability] = useState([])
  const [availLoading, setAvailLoading] = useState(false)
  const [availError, setAvailError] = useState(null)

  // Fetch instructor availability when an instructor is selected
  useEffect(() => {
    if (!selectedInstructor) {
      setAvailability([])
      setAvailError(null)
      return
    }
    setAvailLoading(true)
    setAvailError(null)
    setSelectedWeekdays([])
    setSelectedTimeSlot(null)
    fetch(`${API_BASE}/api/public/instructor-availability/${selectedInstructor.id}`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setAvailability(json.data)
        } else {
          setAvailError(json.message || 'Failed to load availability.')
        }
        setAvailLoading(false)
      })
      .catch(err => {
        setAvailError(err.message || 'Network error.')
        setAvailLoading(false)
      })
  }, [selectedInstructor])

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      setFetchError(null)
      fetchLessonPackages()
        .then((data) => {
          setPrograms(data)
          setLoading(false)
        })
        .catch((err) => {
          setFetchError(err.message)
          setLoading(false)
        })
    }
  }, [isOpen])

  // Derived: flattened packages from live programs
  const allPackages = useMemo(() => flattenPrograms(programs), [programs])

  // Reset step state when modal opens, and pre-select package if initialPackage is provided
  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setSelectedPackageGroup(null)
      setLesson(null)
      setSelectedInstructor(null)
      setSelectedWeekdays([])
      setSelectedTimeSlot(null)
      setForm({
        fname: '', lname: '', email: '', phone: '', age: '',
        level: '', notes: '', refnum: '', paymethod: '', address: '', emergency: '',
      })
      setErrors({})
      setTouched({})
      setSubmitting(false)
    }
  }, [isOpen])

  // Pre-select package once programs are loaded and initialPackage is set
  useEffect(() => {
    if (isOpen && initialPackage && programs.length > 0) {
      const program = programs.find(p => p.id === initialPackage)
      if (program && program.packages && program.packages.length > 0) {
        setSelectedPackageGroup(program.packageGroup)
        const firstPkg = allPackages.find(
          p => p.programId === initialPackage || p.category === program.category
        )
        if (firstPkg) setLesson(firstPkg)
      }
    }
  }, [isOpen, initialPackage, programs, allPackages])

  // ── Derived data ────────────────────────────────────────────────
  const packageGroups = useMemo(() => {
    const groups = new Set()
    allPackages.forEach(p => {
      const g = p.packageGroup
      if (g) groups.add(g)
    })
    return [...groups].sort((a, b) => {
      const na = parseInt(a.match(/\d+/)?.[0] || 0)
      const nb = parseInt(b.match(/\d+/)?.[0] || 0)
      return na - nb
    })
  }, [allPackages])

  const filteredLessonsByGroup = useMemo(() => {
    if (!selectedPackageGroup) return []
    return allPackages.filter(p => p.packageGroup === selectedPackageGroup)
  }, [selectedPackageGroup, allPackages])

  const requiredSlots = lesson?.sessionLimit ?? 4
  const sessionsPerWeek = lesson?.sessionsPerWeek ?? 1
  const totalAmount = lesson ? Number(lesson.rate) : 0

  const computedStartDate = useMemo(() => {
    if (selectedWeekdays.length === 0) return null
    const sorted = [...selectedWeekdays].sort((a, b) => a - b)
    return getNextWeekdayDate(sorted[0])
  }, [selectedWeekdays])

  const computedEndDate = useMemo(() => {
    if (!computedStartDate) return null
    return calculateEndDate(computedStartDate, requiredSlots, sessionsPerWeek, selectedWeekdays)
  }, [computedStartDate, requiredSlots, sessionsPerWeek, selectedWeekdays])

  const scheduleTextRecurring = useMemo(() => {
    if (selectedWeekdays.length === 0 || !computedStartDate || !computedEndDate) return '—'
    const dayNames = [...selectedWeekdays].sort().map(wd => DAY_NAMES[wd]).join(', ')
    const timeStr = selectedTimeSlot ? selectedTimeSlot.label : 'TBD'
    return `${dayNames} — ${timeStr}\n${formatDateShort(computedStartDate)} – ${formatDateShort(computedEndDate)} (${requiredSlots} sessions)`
  }, [selectedWeekdays, computedStartDate, computedEndDate, selectedTimeSlot, requiredSlots])

  // ── Handlers ────────────────────────────────────────────────────
  const goStep = (n) => setStep(n)

  const toggleWeekday = (wd) => {
    setSelectedWeekdays((prev) => {
      const exists = prev.includes(wd)
      if (exists) return prev.filter((d) => d !== wd)
      if (prev.length >= sessionsPerWeek) return prev
      return [...prev, wd]
    })
  }

  const selectTimeSlot = (start, end) => {
    const label = `${start} – ${end}`
    if (selectedTimeSlot && selectedTimeSlot.start === start) {
      setSelectedTimeSlot(null)
    } else {
      setSelectedTimeSlot({ start, end, label })
    }
  }

  const handleFieldChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const handleFieldBlur = (key) => {
    setTouched((prev) => ({ ...prev, [key]: true }))
    if (!form[key].trim()) {
      setErrors((prev) => ({
        ...prev,
        [key]: `${FIELD_LABELS[key] || key} is required`,
      }))
    } else {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const validateStep = (stepNum) => {
    const newErrors = { ...errors }
    const newTouched = { ...touched }
    let hasError = false

    if (stepNum === 4) {
      const step4Fields = ['fname', 'lname', 'email', 'phone', 'address', 'age']
      step4Fields.forEach((key) => {
        newTouched[key] = true
        if (!form[key].toString().trim()) {
          newErrors[key] = `${FIELD_LABELS[key]} is required`
          hasError = true
        } else {
          delete newErrors[key]
        }
      })
    } else if (stepNum === 5) {
      newTouched.refnum = true
      if (!form.refnum.trim()) {
        newErrors.refnum = 'Payment Reference Number is required'
        hasError = true
      } else {
        delete newErrors.refnum
      }
      newTouched.paymethod = true
      if (!form.paymethod.trim()) {
        newErrors.paymethod = 'Payment Method is required'
        hasError = true
      } else {
        delete newErrors.paymethod
      }
    }

    setTouched(newTouched)
    setErrors(newErrors)
    return !hasError
  }

  const handleNextStep = (nextStep) => {
    if (validateStep(step)) {
      setStep(nextStep)
    }
  }

  const handleSubmit = () => {
    const requiredFields = [
      { key: 'fname', label: 'First Name' },
      { key: 'lname', label: 'Last Name' },
      { key: 'email', label: 'Gmail Address' },
      { key: 'phone', label: 'Contact Number' },
      { key: 'address', label: 'Student Address' },
      { key: 'age', label: 'Age' },
      { key: 'refnum', label: 'Payment Reference Number' },
      { key: 'paymethod', label: 'Payment Method' },
    ]
    const emptyFields = requiredFields
      .filter((f) => !form[f.key].trim())
      .map((f) => f.label)
    if (emptyFields.length > 0) return

    // Save confirmation data
    confirmRef.current = {
      form: { ...form },
      lesson: lesson ? { ...lesson } : null,
      instructor: selectedInstructor ? { ...selectedInstructor } : null,
      requiredSlots,
      totalAmount,
      scheduleText: scheduleTextRecurring,
    }

    setSubmitting(true)
    // Simulate submission
    setTimeout(() => {
      setSubmitting(false)
      setStep(6)
    }, 800)
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleRetry = useCallback(() => {
    setLoading(true)
    setFetchError(null)
    fetchLessonPackages()
      .then((data) => {
        setPrograms(data)
        setLoading(false)
      })
      .catch((err) => {
        setFetchError(err.message)
        setLoading(false)
      })
  }, [])

  // ── Render helpers ──────────────────────────────────────────────
  const stepClass = (n) => {
    if (n < step) return 'en-si done'
    if (n === step) return 'en-si active'
    return 'en-si'
  }

  const inputStyle = (fieldKey) => {
    const hasError = touched[fieldKey] && errors[fieldKey]
    return {
      borderColor: hasError ? 'var(--coral)' : undefined,
      boxShadow: hasError ? '0 0 0 2px rgba(248,113,113,0.2)' : undefined,
    }
  }

  const stepLabels = ['Lesson', 'Instructor', 'Schedule', 'Your Info', 'Payment', 'Done']

  // ── Close on Escape ─────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="en-modal-overlay" onClick={handleOverlayClick}>
      <div className="en-modal-box">
        <button className="en-modal-close" type="button" onClick={onClose} aria-label="Close enrollment">✕</button>

        {/* ── Step Indicator ── */}
        <div className="en-step-bar">
          {[1, 2, 3, 4, 5, 6].map((n, i) => (
            <div key={n} className="en-step-item">
              <div className={stepClass(n)}>
                <div className="en-si-num">{n === 6 ? '✓' : n}</div>
                <span className="en-si-label">{stepLabels[i]}</span>
              </div>
              {n < 6 && <div className="en-step-sep" />}
            </div>
          ))}
        </div>

        {/* ── Scrollable Body ── */}
        <div className="en-modal-body">

        {/* ═══════════════════════════════════════════════════════════
           STEP 1 – Choose Lesson Package
           ═══════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="en-step-content">
            <h2 className="en-step-title">Choose Your Lesson Package</h2>
            <p className="en-step-desc">
              Select a lesson package to enroll in. Each package includes a fixed number of sessions at a set price.
            </p>

            {/* Loading state */}
            {loading && (
              <div className="en-empty-state">
                <div style={{ marginBottom: 8 }}>⏳</div>
                Loading available lesson packages...
              </div>
            )}

            {/* Error state */}
            {fetchError && !loading && (
              <div className="en-empty-state">
                <div style={{ marginBottom: 8, fontSize: '1.2rem' }}>⚠️</div>
                <p style={{ marginBottom: 12, color: 'var(--coral, #DC2626)' }}>
                  Could not load lesson packages. {fetchError}
                </p>
                <button
                  type="button"
                  className="en-btn en-btn-primary en-btn-sm"
                  onClick={handleRetry}
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty state — no packages at all */}
            {!loading && !fetchError && allPackages.length === 0 && (
              <div className="en-empty-state">
                <div style={{ marginBottom: 8, fontSize: '1.2rem' }}>📭</div>
                No lesson packages are available at this time. Please check back later or contact the front desk for assistance.
              </div>
            )}

            {/* Normal state — package groups */}
            {!loading && !fetchError && allPackages.length > 0 && !selectedPackageGroup && (
              <>
                <p className="en-step-desc" style={{ marginBottom: 16 }}>
                  Choose a package group, then select your preferred instrument or course within it.
                </p>
                <div className="en-card-grid">
                  {packageGroups.map((group) => {
                    const lessonsInGroup = allPackages.filter(p => p.packageGroup === group)
                    const minRate = Math.min(...lessonsInGroup.map(p => Number(p.rate)).filter(r => r > 0))
                    return (
                      <button
                        key={group}
                        type="button"
                        className="en-card"
                        onClick={() => setSelectedPackageGroup(group)}
                      >
                        <div className="en-card-name">{group}</div>
                        <div className="en-card-meta">
                          {lessonsInGroup.length} lesson{lessonsInGroup.length > 1 ? 's' : ''} available
                        </div>
                        <div className="en-card-cats">
                          {lessonsInGroup.map(l => l.category).join(', ')}
                        </div>
                        {minRate > 0 && (
                          <div className="en-card-price">From ₱{minRate.toLocaleString()}</div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            {/* Selected package group — show individual packages */}
            {!loading && !fetchError && allPackages.length > 0 && selectedPackageGroup && (
              <>
                <div className="en-back-row">
                  <button type="button" className="en-btn en-btn-secondary en-btn-sm" onClick={() => { setSelectedPackageGroup(null); setLesson(null) }}>
                    ← Back to all packages
                  </button>
                  <span className="en-badge-group">{selectedPackageGroup}</span>
                </div>
                <p className="en-step-desc" style={{ marginBottom: 16 }}>
                  Select a specific lesson within {selectedPackageGroup}.
                </p>
                <div className="en-card-grid">
                  {filteredLessonsByGroup.map((P) => {
                    const rate = Number(P.rate)
                    const spw = P.sessionsPerWeek ?? 1
                    return (
                      <button
                        key={P.id}
                        type="button"
                        className={`en-card${lesson?.id === P.id ? ' selected' : ''}`}
                        onClick={() => setLesson(P)}
                      >
                        <div className="en-card-check">✓</div>
                        <div className="en-card-name">{P.name}</div>
                        <div className="en-card-cats">{P.category}</div>
                        <div className="en-card-meta">
                          {P.durationMinutes} min · {P.sessionLimit} sessions · {getFrequencyLabel(spw)}
                        </div>
                        <div className="en-card-price">
                          {rate > 0 ? `₱${rate.toLocaleString()}` : 'Price TBD'}
                        </div>
                        {P.description && (
                          <div className="en-card-desc">{P.description}</div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            <div className="en-actions">
              <button type="button" className="en-btn en-btn-secondary" onClick={onClose}>← Cancel</button>
              {selectedPackageGroup && (
                <button type="button" className="en-btn en-btn-primary" disabled={!lesson} onClick={() => goStep(2)}>
                  Next: Instructor →
                </button>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
           STEP 2 – Choose Instructor
           ═══════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="en-step-content">
            <h2 className="en-step-title">Choose Your Instructor</h2>
            <p className="en-step-desc">
              {lesson?.instructors && lesson.instructors.length > 0
                ? `These instructors are assigned to teach "${lesson.name}". Select your preferred instructor.`
                : 'Select your preferred instructor.'}
            </p>
            {(!lesson?.instructors || lesson.instructors.length === 0) ? (
              <div className="en-empty-state">
                No instructors have been assigned to this package yet. Please contact the admin for assistance.
              </div>
            ) : (
              <div className="en-card-grid">
                {lesson.instructors.map((inst) => (
                  <button
                    key={inst.id}
                    type="button"
                    className={`en-card${selectedInstructor?.id === inst.id ? ' selected' : ''}`}
                    onClick={() => setSelectedInstructor({
                      id: inst.id,
                      name: `${inst.first_name} ${inst.last_name}`,
                      desc: inst.specialization || 'Instructor',
                    })}
                  >
                    <div className="en-card-check">✓</div>
                    <div className="en-card-icon">🎵</div>
                    <div className="en-card-name">{inst.first_name} {inst.last_name}</div>
                    {inst.specialization && (
                      <div className="en-card-desc">{inst.specialization}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
            <div className="en-actions">
              <button type="button" className="en-btn en-btn-secondary" onClick={() => goStep(1)}>← Back</button>
              <button
                type="button"
                className="en-btn en-btn-primary"
                disabled={!selectedInstructor || !lesson?.instructors || lesson.instructors.length === 0}
                onClick={() => goStep(3)}
              >
                Next: Schedule →
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
           STEP 3 – Set Your Recurring Schedule
           ═══════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="en-step-content">
            <div className="en-schedule-header">
              <div className="en-schedule-badge">
                {lesson ? `${lesson.name} Lessons` : 'Lessons'}
              </div>
              <h2 className="en-step-title" style={{ marginTop: 4 }}>Set Your Recurring Schedule</h2>
            </div>

            <div className="en-info-banner">
              <span aria-hidden>💡</span>
              <span>
                Choose the <strong>day(s)</strong> and <strong>time</strong> for your lessons. This schedule repeats every week for the duration of your package.
              </span>
            </div>

            {/* Step 3a: Select Days */}
            <div className="en-schedule-section">
              <h3 className="en-schedule-subtitle">Step 1: Choose your lesson day(s)</h3>
              <p className="en-schedule-hint">
                Select up to <strong>{sessionsPerWeek}</strong> day(s) per week ({getFrequencyLabel(sessionsPerWeek)}).
              </p>
              <div className="en-day-grid">
                {DAY_SHORT.map((name, idx) => {
                  const isSelected = selectedWeekdays.includes(idx)
                  const isMaxed = !isSelected && selectedWeekdays.length >= sessionsPerWeek
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleWeekday(idx)}
                      disabled={!isSelected && isMaxed}
                      className={`en-day-btn${isSelected ? ' selected' : ''}${isMaxed ? ' maxed' : ''}`}
                    >
                      {name}
                    </button>
                  )
                })}
              </div>
              {selectedWeekdays.length > 0 && (
                <div className="en-selected-days">
                  Selected: {[...selectedWeekdays].sort().map(wd => DAY_NAMES[wd]).join(', ')}
                </div>
              )}
            </div>

            {/* Step 3b: Select Time Slot */}
            {selectedWeekdays.length > 0 && (
              <div className="en-schedule-section">
                <h3 className="en-schedule-subtitle">Step 2: Choose your preferred time</h3>
                <p className="en-schedule-hint">
                  Pick a time slot that will apply to <strong>all</strong> your selected day(s).
                </p>

                {/* Loading state for availability */}
                {availLoading && (
                  <div className="en-empty-state" style={{ padding: '20px 10px' }}>
                    <div style={{ marginBottom: 8 }}>⏳</div>
                    Loading available time slots...
                  </div>
                )}

                {/* Error state */}
                {availError && !availLoading && (
                  <div className="en-empty-state" style={{ padding: '20px 10px' }}>
                    <div style={{ marginBottom: 8, fontSize: '1.2rem' }}>⚠️</div>
                    <p style={{ marginBottom: 0, color: 'var(--coral, #DC2626)' }}>
                      Could not load availability. {availError}
                    </p>
                  </div>
                )}

                {/* Empty state — instructor has no available slots */}
                {!availLoading && !availError && availability.length === 0 && (
                  <div className="en-empty-state" style={{ padding: '20px 10px' }}>
                    <div style={{ marginBottom: 8, fontSize: '1.2rem' }}>📭</div>
                    <p style={{ marginBottom: 0 }}>
                      This instructor has no open slots right now — please choose a different instructor or check back later.
                    </p>
                  </div>
                )}

                {/* Available time slots — filtered by selected day(s) */}
                {!availLoading && !availError && availability.length > 0 && (
                  <div className="en-time-grid">
                    {availability
                      .filter(slot => selectedWeekdays.some(wd => DAY_SHORT[wd] === slot.day_of_week))
                      .map((slot) => {
                        const startStr = slot.label.split(' – ')[0]
                        const isSelected = selectedTimeSlot?.start === startStr
                        return (
                          <button
                            key={`${slot.day_of_week}|${startStr}`}
                            type="button"
                            className={`en-time-slot${isSelected ? ' selected' : ''}`}
                            onClick={() => selectTimeSlot(startStr, slot.label.split(' – ')[1])}
                          >
                            {slot.label}
                          </button>
                        )
                      })}
                  </div>
                )}
              </div>
            )}

            {/* Schedule Summary */}
            {selectedWeekdays.length > 0 && selectedTimeSlot && (
              <div className="en-schedule-summary">
                <div className="en-schedule-summary-title">📅 Your Recurring Schedule</div>
                <div className="en-schedule-summary-line">
                  Every {[...selectedWeekdays].sort().map(wd => DAY_NAMES[wd]).join(', ')} — {selectedTimeSlot.label}
                </div>
                {computedStartDate && computedEndDate && (
                  <div className="en-schedule-summary-dates">
                    {formatDateLong(computedStartDate)} – {formatDateLong(computedEndDate)} ({requiredSlots} sessions)
                  </div>
                )}
              </div>
            )}

            <div className="en-actions">
              <button type="button" className="en-btn en-btn-secondary" onClick={() => goStep(2)}>← Back</button>
              <button
                type="button"
                className="en-btn en-btn-primary"
                disabled={selectedWeekdays.length === 0 || !selectedTimeSlot}
                onClick={() => goStep(4)}
              >
                Next: Your Info →
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
           STEP 4 – Your Information
           ═══════════════════════════════════════════════════════════ */}
        {step === 4 && (
          <div className="en-step-content">
            <h2 className="en-step-title">Your Information</h2>
            <p className="en-step-desc">Please fill in your details. This will be used for enrollment records and confirmation.</p>
            <div className="en-form-grid">
              <div className="en-fg">
                <label>First Name <span className="en-required">*</span></label>
                <input value={form.fname} onChange={(e) => handleFieldChange('fname', e.target.value)} onBlur={() => handleFieldBlur('fname')} placeholder="e.g. Juan" style={inputStyle('fname')} />
                {touched.fname && errors.fname && <span className="en-field-error">{errors.fname}</span>}
              </div>
              <div className="en-fg">
                <label>Last Name <span className="en-required">*</span></label>
                <input value={form.lname} onChange={(e) => handleFieldChange('lname', e.target.value)} onBlur={() => handleFieldBlur('lname')} placeholder="e.g. dela Cruz" style={inputStyle('lname')} />
                {touched.lname && errors.lname && <span className="en-field-error">{errors.lname}</span>}
              </div>
              <div className="en-fg">
                <label>Gmail Address <span className="en-required">*</span></label>
                <input type="email" value={form.email} onChange={(e) => handleFieldChange('email', e.target.value)} onBlur={() => handleFieldBlur('email')} placeholder="yourname@gmail.com" style={inputStyle('email')} />
                {touched.email && errors.email && <span className="en-field-error">{errors.email}</span>}
                <span className="en-field-hint">Confirmation and updates will be sent here</span>
              </div>
              <div className="en-fg">
                <label>Contact Number <span className="en-required">*</span></label>
                <input value={form.phone} onChange={(e) => handleFieldChange('phone', e.target.value.replace(/[^0-9+]/g, ''))} onBlur={() => handleFieldBlur('phone')} placeholder="+63 9XX XXX XXXX" style={inputStyle('phone')} />
                {touched.phone && errors.phone && <span className="en-field-error">{errors.phone}</span>}
              </div>
              <div className="en-fg en-fg-full">
                <label>Student Address <span className="en-required">*</span></label>
                <textarea rows={2} value={form.address} onChange={(e) => handleFieldChange('address', e.target.value)} onBlur={() => handleFieldBlur('address')} placeholder="e.g. 123 Rizal St., Barangay San Antonio, Makati City" style={inputStyle('address')} />
                {touched.address && errors.address && <span className="en-field-error">{errors.address}</span>}
              </div>
              <div className="en-fg">
                <label>Age <span className="en-required">*</span></label>
                <input type="number" value={form.age} onChange={(e) => handleFieldChange('age', e.target.value)} onBlur={() => handleFieldBlur('age')} placeholder="e.g. 16" min={4} max={80} style={inputStyle('age')} />
                {touched.age && errors.age && <span className="en-field-error">{errors.age}</span>}
              </div>
              <div className="en-fg">
                <label>Experience Level</label>
                <select value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}>
                  <option value="">Select level...</option>
                  <option>Complete Beginner</option>
                  <option>Some Experience</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div className="en-fg en-fg-full">
                <label>Emergency Contact Number</label>
                <input value={form.emergency} onChange={(e) => handleFieldChange('emergency', e.target.value.replace(/[^0-9+]/g, ''))} onBlur={() => handleFieldBlur('emergency')} placeholder="e.g. +63 9XX XXX XXXX" style={inputStyle('emergency')} />
              </div>
              <div className="en-fg en-fg-full">
                <label>Special Requests / Notes</label>
                <textarea rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Any special requests, physical needs, or things your instructor should know..." />
              </div>
            </div>
            <div className="en-actions">
              <button type="button" className="en-btn en-btn-secondary" onClick={() => goStep(3)}>← Back</button>
              <button type="button" className="en-btn en-btn-primary" onClick={() => handleNextStep(5)}>Review & Pay →</button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
           STEP 5 – Review & Payment
           ═══════════════════════════════════════════════════════════ */}
        {step === 5 && (
          <div className="en-step-content">
            <h2 className="en-step-title">Review & Payment</h2>
            <p className="en-step-desc">
              Review your enrollment summary and complete the <strong>full payment</strong> to submit your request.
            </p>

            <div className="en-summary-card">
              <div className="en-summary-head">📋 Enrollment Summary</div>
              <div className="en-summary-body">
                <div className="en-summary-row">
                  <span className="en-summary-label">Student Name</span>
                  <span className="en-summary-value">{[form.fname, form.lname].filter(Boolean).join(' ') || '—'}</span>
                </div>
                <div className="en-summary-row">
                  <span className="en-summary-label">Gmail</span>
                  <span className="en-summary-value">{form.email || '—'}</span>
                </div>
                <div className="en-summary-row">
                  <span className="en-summary-label">Package</span>
                  <span className="en-summary-value">{lesson ? lesson.name : '—'}</span>
                </div>
                <div className="en-summary-row">
                  <span className="en-summary-label">Category</span>
                  <span className="en-summary-value">{lesson ? lesson.category : '—'}</span>
                </div>
                <div className="en-summary-row">
                  <span className="en-summary-label">Instructor</span>
                  <span className="en-summary-value">{selectedInstructor?.name || '—'}</span>
                </div>
                <div className="en-summary-row">
                  <span className="en-summary-label">Package Sessions</span>
                  <span className="en-summary-value">{lesson ? requiredSlots : '—'}</span>
                </div>
                <div className="en-summary-row">
                  <span className="en-summary-label">Frequency</span>
                  <span className="en-summary-value">{lesson ? getFrequencyLabel(sessionsPerWeek) : '—'}</span>
                </div>
                <div className="en-summary-row">
                  <span className="en-summary-label">Recurring Schedule</span>
                  <span className="en-summary-value en-schedule-pre">{scheduleTextRecurring}</span>
                </div>
                <div className="en-summary-row en-summary-total">
                  <span className="en-summary-label" style={{ fontSize: 15, fontWeight: 700 }}>Package Price</span>
                  <span className="en-summary-value en-price">
                    {lesson && totalAmount > 0 ? `₱${totalAmount.toLocaleString()}` : 'Price TBD'}
                  </span>
                </div>
                <div className="en-summary-row">
                  <span className="en-summary-label">Full Payment Required</span>
                  <span className="en-summary-value en-price-sub">
                    {lesson && totalAmount > 0 ? `₱${totalAmount.toLocaleString()}` : 'Price TBD'}
                  </span>
                </div>
              </div>
            </div>

            <div className="en-payment-info">
              <div className="en-payment-info-title">💳 How to Pay</div>
              <p className="en-payment-info-desc">
                Send the <strong>full payment</strong> via any of the following options, then enter your reference number below.
              </p>
              <div className="en-payment-accounts">
                <div className="en-pay-acct"><strong>GCash</strong><span>09XX XXX XXXX – Cadenza Music Center</span></div>
                <div className="en-pay-acct"><strong>Maya (PayMaya)</strong><span>09XX XXX XXXX – Cadenza Music Center</span></div>
                <div className="en-pay-acct"><strong>Bank Transfer (BDO)</strong><span>Account No: 0012-3456-7890 – Cadenza Music Inc.</span></div>
              </div>
            </div>

            <div className="en-summary-card">
              <div className="en-summary-head">📎 Payment Reference</div>
              <div className="en-summary-body">
                <div className="en-fg" style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                    Reference Number <span className="en-required">*</span>
                  </label>
                  <input type="text" value={form.refnum} onChange={(e) => handleFieldChange('refnum', e.target.value)} onBlur={() => handleFieldBlur('refnum')} placeholder="e.g. GCash Ref: 1234567890" style={{ maxWidth: 400, ...inputStyle('refnum') }} />
                  {touched.refnum && errors.refnum && <span className="en-field-error">{errors.refnum}</span>}
                  <span className="en-field-hint">Enter the reference/transaction number from your payment</span>
                </div>
                <div className="en-fg">
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                    Payment Method <span className="en-required">*</span>
                  </label>
                  <select value={form.paymethod} onChange={(e) => handleFieldChange('paymethod', e.target.value)} onBlur={() => handleFieldBlur('paymethod')} style={{ maxWidth: 280, ...inputStyle('paymethod') }}>
                    <option value="">Select...</option>
                    <option>GCash</option>
                    <option>Maya (PayMaya)</option>
                    <option>BDO Bank Transfer</option>
                    <option>Other</option>
                  </select>
                  {touched.paymethod && errors.paymethod && <span className="en-field-error">{errors.paymethod}</span>}
                </div>
              </div>
            </div>

            <div className="en-info-banner en-warning-banner">
              <span aria-hidden>⚠️</span>
              <span>Your enrollment request will be marked <strong>Pending</strong> until our front desk verifies your payment. You'll receive confirmation once approved.</span>
            </div>

            <div className="en-actions">
              <button type="button" className="en-btn en-btn-secondary" onClick={() => goStep(4)}>← Back</button>
              <button type="button" className="en-btn en-btn-primary en-btn-submit" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : '✉️ Submit Enrollment Request'}
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
           STEP 6 – Done / Confirmation
           ═══════════════════════════════════════════════════════════ */}
        {step === 6 && (
          <div className="en-step-content en-done-step">
            <div className="en-done-icon">🎉</div>
            <h2 className="en-step-title" style={{ textAlign: 'center' }}>Enrollment Submitted!</h2>
            <p className="en-step-desc" style={{ textAlign: 'center', maxWidth: 480, margin: '0 auto 28px' }}>
              Thank you! Your request has been received. Our front desk team will verify your payment and confirm your enrollment. Check your email for updates.
            </p>
            <div className="en-confirm-card">
              <div className="en-confirm-row">
                <span className="en-confirm-label">Student</span>
                <span className="en-confirm-value">{[confirmRef.current.form.fname, confirmRef.current.form.lname].filter(Boolean).join(' ') || '—'}</span>
              </div>
              <div className="en-confirm-row">
                <span className="en-confirm-label">Package</span>
                <span className="en-confirm-value">{confirmRef.current.lesson?.name || '—'}</span>
              </div>
              <div className="en-confirm-row">
                <span className="en-confirm-label">Instructor</span>
                <span className="en-confirm-value">{confirmRef.current.instructor?.name || '—'}</span>
              </div>
              <div className="en-confirm-row">
                <span className="en-confirm-label">Sessions</span>
                <span className="en-confirm-value">{confirmRef.current.requiredSlots}</span>
              </div>
              <div className="en-confirm-row">
                <span className="en-confirm-label">Schedule</span>
                <span className="en-confirm-value en-schedule-pre">{confirmRef.current.scheduleText}</span>
              </div>
              <div className="en-confirm-row">
                <span className="en-confirm-label">Amount Paid (Full)</span>
                <span className="en-confirm-value en-price">
                  {confirmRef.current.totalAmount > 0 ? `₱${confirmRef.current.totalAmount.toLocaleString()}` : 'Price TBD'}
                </span>
              </div>
              <div className="en-confirm-row">
                <span className="en-confirm-label">Payment Reference</span>
                <span className="en-confirm-value">{confirmRef.current.form.refnum || '—'}</span>
              </div>
              <div className="en-confirm-row" style={{ borderBottom: 'none' }}>
                <span className="en-confirm-label">Status</span>
                <span className="en-confirm-badge">⏳ Pending Verification</span>
              </div>
            </div>
            <button type="button" className="en-btn en-btn-primary" onClick={onClose}>← Close</button>
          </div>
        )}
        </div>{/* end en-modal-body */}
      </div>{/* end en-modal-box */}

      <style>{`
        /* ── Modal Overlay (enrollment-specific) ── */
        .en-modal-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(15,23,42,0.55);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 0;
          opacity: 0; visibility: hidden;
          transition: opacity 0.25s ease, visibility 0.25s ease;
        }
        .en-modal-overlay { opacity: 1; visibility: visible; }

        .en-modal-box {
          position: relative;
          width: 90vw; max-width: 960px;
          height: 88vh;
          background: var(--white);
          border-radius: 24px;
          box-shadow: 0 40px 80px -20px rgba(15,23,42,0.45);
          padding: 1.8rem 2rem 1.5rem;
          display: flex; flex-direction: column;
          transform: translateY(20px) scale(0.95);
          opacity: 0;
          transition: transform 0.25s ease-out, opacity 0.25s ease-out;
        }
        .en-modal-overlay .en-modal-box { transform: translateY(0) scale(1); opacity: 1; }

        /* Scrollable body area inside the modal */
        .en-modal-body {
          flex: 1; overflow-y: auto;
          padding-right: 4px;
          margin-top: 0;
        }
        .en-modal-body::-webkit-scrollbar { width: 5px; }
        .en-modal-body::-webkit-scrollbar-track { background: transparent; }
        .en-modal-body::-webkit-scrollbar-thumb { background: rgba(30,41,59,0.15); border-radius: 10px; }

        .en-modal-box::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 180px; height: 180px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(96,165,250,0.20), transparent 70%);
          z-index: 0; pointer-events: none;
        }

        .en-modal-close {
          position: absolute; top: 1.2rem; right: 1.2rem;
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: var(--navy); font-size: 1rem; border: none;
          background: rgba(30,41,59,0.06); cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease; z-index: 5;
        }
        .en-modal-close:hover { background: rgba(37,99,235,0.12); color: var(--royal); transform: rotate(90deg); }

        /* ── Step Indicator Bar (sticky at top) ── */
        .en-step-bar {
          display: flex; align-items: center; gap: 0;
          padding: 0 0 16px; margin-bottom: 16px;
          border-bottom: 1px solid rgba(30,41,59,0.08);
          position: sticky; top: 0; z-index: 3;
          background: var(--white);
          flex-shrink: 0;
        }
        .en-step-item { display: flex; align-items: center; flex: 1; }
        .en-si {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.5px;
          color: rgba(30,41,59,0.35); white-space: nowrap;
        }
        .en-si.done { color: var(--royal); }
        .en-si.active { color: var(--navy); }
        .en-si-num {
          width: 24px; height: 24px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700;
          background: rgba(30,41,59,0.08); color: rgba(30,41,59,0.35);
          flex-shrink: 0;
        }
        .en-si.done .en-si-num { background: var(--royal); color: #fff; }
        .en-si.active .en-si-num { background: linear-gradient(135deg, var(--royal), var(--purple)); color: #fff; }
        .en-si-label { display: none; }
        @media (min-width: 560px) { .en-si-label { display: inline; } }
        .en-step-sep {
          flex: 1; height: 1px; margin: 0 8px;
          background: rgba(30,41,59,0.1);
        }
        .en-si.done + .en-step-sep { background: var(--royal); }

        /* ── Step Content ── */
        .en-step-content {
          position: relative; z-index: 1;
          animation: enStepFadeIn 0.2s ease-out;
        }
        @keyframes enStepFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .en-step-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.3rem; font-weight: 800;
          color: var(--navy); margin-bottom: 6px;
          letter-spacing: 0.3px; text-transform: uppercase;
        }
        .en-step-desc {
          font-size: 0.9rem; line-height: 1.6;
          color: var(--text); margin-bottom: 20px;
        }

        /* ── Card Grid ── */
        .en-card-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 12px; margin-bottom: 20px;
        }
        @media (max-width: 500px) { .en-card-grid { grid-template-columns: 1fr; } }
        .en-card {
          position: relative; text-align: left;
          padding: 1.2rem 1rem; border-radius: 16px;
          border: 1.5px solid rgba(30,41,59,0.1);
          background: var(--white); cursor: pointer;
          transition: all 0.2s ease; font-family: inherit;
        }
        .en-card:hover { border-color: var(--royal); box-shadow: 0 6px 16px rgba(37,99,235,0.1); }
        .en-card.selected { border-color: var(--royal); background: rgba(37,99,235,0.04); box-shadow: 0 0 0 2px rgba(37,99,235,0.15); }
        .en-card-check {
          position: absolute; top: 8px; right: 8px;
          width: 22px; height: 22px; border-radius: 50%;
          background: rgba(30,41,59,0.08); color: transparent;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; transition: all 0.2s ease;
        }
        .en-card.selected .en-card-check { background: var(--royal); color: #fff; }
        .en-card-icon { font-size: 1.5rem; margin-bottom: 6px; }
        .en-card-name { font-size: 0.95rem; font-weight: 700; color: var(--navy); margin-bottom: 2px; }
        .en-card-cats { font-size: 0.72rem; color: var(--purple); font-weight: 600; margin-bottom: 4px; }
        .en-card-meta { font-size: 0.75rem; color: var(--text); }
        .en-card-price { font-size: 0.95rem; font-weight: 700; color: var(--royal); margin-top: 6px; }
        .en-card-desc { font-size: 0.75rem; color: var(--text); margin-top: 6px; line-height: 1.5; }

        .en-back-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .en-badge-group {
          font-size: 0.75rem; font-weight: 700; letter-spacing: 0.5px;
          color: var(--purple); text-transform: uppercase;
        }
        .en-empty-state {
          text-align: center; padding: 40px 20px;
          color: var(--text); font-size: 0.9rem; font-style: italic;
        }

        /* ── Buttons ── */
        .en-actions {
          display: flex; justify-content: space-between; gap: 12px;
          padding-top: 16px; border-top: 1px solid rgba(30,41,59,0.08);
        }
        .en-btn {
          padding: 0.75rem 1.6rem; border-radius: 999px;
          font-size: 0.8rem; font-weight: 700; letter-spacing: 0.5px;
          text-transform: uppercase; cursor: pointer; border: none;
          font-family: inherit; transition: all 0.25s ease;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .en-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .en-btn-sm { padding: 0.5rem 1.2rem; font-size: 0.7rem; }
        .en-btn-primary {
          background: linear-gradient(100deg, var(--royal), var(--purple));
          color: #fff; box-shadow: 0 8px 18px rgba(37,99,235,0.25);
        }
        .en-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 22px rgba(37,99,235,0.32); }
        .en-btn-secondary {
          background: transparent; color: var(--navy);
          border: 1.5px solid rgba(30,41,59,0.14);
        }
        .en-btn-secondary:hover { border-color: var(--royal); color: var(--royal); background: rgba(37,99,235,0.06); }
        .en-btn-submit { background: var(--teal, #0f766e); }
        .en-btn-submit:hover:not(:disabled) { background: var(--teal, #0f766e); filter: brightness(1.1); }

        /* ── Schedule Step ── */
        .en-schedule-header { margin-bottom: 12px; }
        .en-schedule-badge {
          font-size: 0.7rem; font-weight: 700; letter-spacing: 1px;
          text-transform: uppercase; color: var(--purple);
        }
        .en-schedule-section { margin-bottom: 24px; }
        .en-schedule-subtitle {
          font-size: 0.85rem; font-weight: 700; color: var(--navy); margin-bottom: 6px;
        }
        .en-schedule-hint { font-size: 0.75rem; color: var(--text); margin-bottom: 10px; }
        .en-day-grid { display: flex; gap: 6px; flex-wrap: wrap; }
        .en-day-btn {
          flex: 1; min-width: 64px; padding: 10px 8px; border-radius: 10px;
          border: 1px solid rgba(30,41,59,0.12); background: var(--white);
          font-size: 0.8rem; font-weight: 600; font-family: inherit;
          color: var(--text); cursor: pointer; transition: all 0.15s ease;
        }
        .en-day-btn:hover { border-color: var(--royal); }
        .en-day-btn.selected { border-color: var(--royal); background: rgba(37,99,235,0.1); color: var(--royal); font-weight: 700; }
        .en-day-btn.maxed { opacity: 0.4; cursor: not-allowed; }
        .en-selected-days { margin-top: 8px; font-size: 0.8rem; font-weight: 600; color: var(--royal); }
        .en-time-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        @media (min-width: 500px) { .en-time-grid { grid-template-columns: 1fr 1fr 1fr; } }
        .en-time-slot {
          padding: 10px; border-radius: 10px; border: 1px solid rgba(30,41,59,0.12);
          background: var(--white); font-size: 0.78rem; font-weight: 600;
          font-family: inherit; color: var(--text); cursor: pointer; transition: all 0.15s ease;
        }
        .en-time-slot:hover { border-color: var(--royal); }
        .en-time-slot.selected { border-color: var(--royal); background: rgba(37,99,235,0.1); color: var(--royal); }
        .en-schedule-summary {
          background: rgba(37,99,235,0.06); border: 1px solid rgba(37,99,235,0.2);
          border-radius: 12px; padding: 14px 18px; margin-bottom: 20px;
        }
        .en-schedule-summary-title { font-size: 0.8rem; font-weight: 700; color: var(--royal); margin-bottom: 6px; }
        .en-schedule-summary-line { font-size: 0.85rem; font-weight: 600; color: var(--navy); }
        .en-schedule-summary-dates { font-size: 0.78rem; color: var(--text); margin-top: 4px; }

        /* ── Info Banner ── */
        .en-info-banner {
          display: flex; align-items: flex-start; gap: 10px;
          background: rgba(37,99,235,0.06); border: 1px solid rgba(37,99,235,0.2);
          border-radius: 10px; padding: 12px 16px; margin-bottom: 20px;
          font-size: 0.82rem; line-height: 1.65; color: var(--text);
        }
        .en-warning-banner { background: rgba(255,107,107,0.07); border-color: rgba(255,107,107,0.3); color: var(--coral, #DC2626); }

        /* ── Form ── */
        .en-form-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
          margin-bottom: 20px;
        }
        .en-fg-full { grid-column: 1 / -1; }
        .en-fg label { font-size: 0.78rem; font-weight: 600; color: var(--navy); display: block; margin-bottom: 4px; }
        .en-required { color: var(--purple); }
        .en-fg input, .en-fg select, .en-fg textarea {
          width: 100%; padding: 0.65rem 0.85rem; border-radius: 10px;
          border: 1.5px solid rgba(30,41,59,0.12); font-size: 0.85rem;
          font-family: inherit; color: var(--navy); background: var(--white);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .en-fg input:focus, .en-fg select:focus, .en-fg textarea:focus {
          outline: none; border-color: var(--royal);
          box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
        }
        .en-fg textarea { resize: vertical; min-height: 44px; }
        .en-field-error { display: block; font-size: 0.7rem; color: var(--coral, #DC2626); margin-top: 4px; }
        .en-field-hint { display: block; font-size: 0.7rem; color: var(--text); margin-top: 2px; opacity: 0.7; }

        /* ── Summary Card ── */
        .en-summary-card {
          border: 1px solid rgba(30,41,59,0.1); border-radius: 14px;
          margin-bottom: 16px; overflow: hidden;
        }
        .en-summary-head {
          padding: 12px 18px; font-size: 0.82rem; font-weight: 700;
          background: rgba(37,99,235,0.05); border-bottom: 1px solid rgba(30,41,59,0.08);
          color: var(--navy);
        }
        .en-summary-body { padding: 12px 18px; }
        .en-summary-row {
          display: flex; justify-content: space-between; align-items: flex-start;
          padding: 8px 0; border-bottom: 1px solid rgba(30,41,59,0.06);
          gap: 12px;
        }
        .en-summary-row:last-child { border-bottom: none; }
        .en-summary-label { font-size: 0.78rem; color: var(--text); flex-shrink: 0; }
        .en-summary-value { font-size: 0.82rem; font-weight: 600; color: var(--navy); text-align: right; }
        .en-summary-total { border-top: 2px solid rgba(30,41,59,0.12); padding-top: 12px; margin-top: 4px; }
        .en-price { color: var(--purple); font-size: 1.1rem; }
        .en-price-sub { color: var(--royal); }
        .en-schedule-pre { white-space: pre-line; line-height: 1.7; font-size: 0.75rem; }

        /* ── Payment Info ── */
        .en-payment-info {
          background: rgba(37,99,235,0.06); border: 1px solid rgba(37,99,235,0.2);
          border-radius: 12px; padding: 16px 20px; margin-bottom: 16px;
        }
        .en-payment-info-title { font-size: 0.82rem; font-weight: 700; color: var(--royal); margin-bottom: 6px; }
        .en-payment-info-desc { font-size: 0.78rem; color: var(--text); margin-bottom: 12px; }
        .en-payment-accounts { display: flex; flex-direction: column; gap: 6px; }
        .en-pay-acct {
          display: flex; gap: 8px; align-items: center;
          font-size: 0.78rem; color: var(--text);
        }
        .en-pay-acct strong { color: var(--navy); min-width: 100px; }

        /* ── Done / Confirmation ── */
        .en-done-step { text-align: center; padding: 40px 20px; }
        .en-done-icon {
          font-size: 3.5rem; margin-bottom: 16px;
          animation: enPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes enPop { 0% { transform: scale(0.4) rotate(-15deg); opacity: 0; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
        .en-confirm-card {
          max-width: 480px; margin: 0 auto 24px;
          border: 1px solid rgba(30,41,59,0.1); border-radius: 14px;
          overflow: hidden; text-align: left;
        }
        .en-confirm-row {
          display: flex; justify-content: space-between; align-items: flex-start;
          padding: 12px 18px; border-bottom: 1px solid rgba(30,41,59,0.06);
          gap: 12px;
        }
        .en-confirm-label { font-size: 0.78rem; color: var(--text); flex-shrink: 0; }
        .en-confirm-value { font-size: 0.82rem; font-weight: 600; color: var(--navy); text-align: right; }
        .en-confirm-badge {
          background: rgba(240,180,41,0.12); border: 1px solid rgba(240,180,41,0.35);
          color: #b8860b; font-size: 0.65rem; font-weight: 700;
          padding: 4px 12px; border-radius: 20px; letter-spacing: 1px;
          text-transform: uppercase; white-space: nowrap;
        }

        /* ── Mobile Full-Screen ── */
        @media (max-width: 600px) {
          .en-modal-box {
            width: 100vw; height: 100vh;
            max-width: none; border-radius: 0;
            padding: 1.5rem 1.2rem 1rem;
          }
          .en-modal-overlay { padding: 0; }
        }

        /* ── Scrollbar ── */
        .en-modal-box::-webkit-scrollbar { width: 5px; }
        .en-modal-box::-webkit-scrollbar-track { background: transparent; }
        .en-modal-box::-webkit-scrollbar-thumb { background: rgba(30,41,59,0.15); border-radius: 10px; }
      `}</style>
    </div>
  )
}