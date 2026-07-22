import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PUBLIC_ROUTES } from '../../constants/publicRoutes'
import { usePublicSite } from './PublicSiteContext'
import { studentAPI } from '../../services/api'
import {
  MIN_ENROLL_SLOTS,
  seeded01,
  getFrequencyLabel,
  getNextWeekdayDate,
  formatDateLong,
  formatDateShort,
  calculateEndDate,
  DAY_NAMES,
  DAY_SHORT,
} from './enrollmentUtils'


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


function loadSaved(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

function saveState(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch { /* ignore */ }
}

function removeSaved(key) {
  try { localStorage.removeItem(key) } catch { /* ignore */ }
}

export default function EnrollmentPage() {
  const navigate = useNavigate()
  const { openSignupGate, showToast, openSuccessModal, signedUpUser, isLoggedIn, user } = usePublicSite()

  // ── Packages state (fetched from API) ──────────────────────────
  const [packages, setPackages] = useState([])
  const [packagesLoading, setPackagesLoading] = useState(true)
  const [packagesError, setPackagesError] = useState(null)
  // ── Package group selection (Phase A of step 1) ────────────────
  const [selectedPackageGroup, setSelectedPackageGroup] = useState(() => loadSaved('cz_en_pkg_group', null))
  
  // Persist package group selection
  useEffect(() => { saveState('cz_en_pkg_group', selectedPackageGroup) }, [selectedPackageGroup])

  // ── Derive unique package groups from packages data ────────────
  const packageGroups = useMemo(() => {
    const groups = new Set()
    packages.forEach(p => {
      const g = p.packageGroup ?? p.package_group
      if (g) groups.add(g)
    })
    return [...groups].sort((a, b) => {
      const na = parseInt(a.match(/\d+/)?.[0] || 0)
      const nb = parseInt(b.match(/\d+/)?.[0] || 0)
      return na - nb
    })
  }, [packages])
  
  // ── Lessons filtered by selected package group ─────────────────
  const filteredLessonsByGroup = useMemo(() => {
    if (!selectedPackageGroup) return []
    return packages.filter(p => {
      const g = p.packageGroup ?? p.package_group
      return g === selectedPackageGroup
    })
  }, [packages, selectedPackageGroup])

  // ── Restore state from localStorage on mount ────────────────
  const [step, setStep] = useState(() => loadSaved('cz_en_step', 1))
  const [lesson, setLesson] = useState(() => loadSaved('cz_en_lesson', null))
  const [selectedInstructor, setSelectedInstructor] = useState(() => loadSaved('cz_en_instructor', null))
  // selectedWeekdays holds an array of weekday indices (0=Sunday, 1=Monday, ... 6=Saturday)
  const [selectedWeekdays, setSelectedWeekdays] = useState(() => loadSaved('cz_en_weekdays', []))
  // selectedTimeSlot holds { start, end, label } for the single time slot (same for all days)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(() => loadSaved('cz_en_slot', null))
  const [form, setForm] = useState(() => loadSaved('cz_en_form', {
    fname: '', lname: '', email: '', phone: '', age: '',
    level: '', notes: '', refnum: '', paymethod: '', address: '', emergency: '',
  }))

  // ── Validation state ───────────────────────────────────────────
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // ── Fetch lesson packages on mount ─────────────────────────────
  useEffect(() => {
    setPackagesLoading(true)
    setPackagesError(null)
    studentAPI.getPublicPackages()
      .then((res) => {
        setPackages(res.data)
        console.log('Fetched packages:', res.data)
        setPackagesLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch lesson packages:', err)
        setPackagesError('Could not load available lessons. Please try again later.')
        setPackagesLoading(false)
      })
  }, [])

  // ── Persist state changes to localStorage ───────────────────
  useEffect(() => { saveState('cz_en_step', step) }, [step])
  useEffect(() => { saveState('cz_en_lesson', lesson) }, [lesson])
  useEffect(() => { saveState('cz_en_instructor', selectedInstructor) }, [selectedInstructor])
  useEffect(() => { saveState('cz_en_weekdays', selectedWeekdays) }, [selectedWeekdays])
  useEffect(() => { saveState('cz_en_slot', selectedTimeSlot) }, [selectedTimeSlot])
  useEffect(() => { saveState('cz_en_form', form) }, [form])

  // ── Clear all state when user logs in (fresh start, no pre-fill) ──
  const prevLoggedInRef = useRef(isLoggedIn)
  useEffect(() => {
    if (isLoggedIn && !prevLoggedInRef.current) {
      removeSaved('cz_en_step')
      removeSaved('cz_en_lesson')
      removeSaved('cz_en_instructor')
      removeSaved('cz_en_weekdays')
      removeSaved('cz_en_slot')
      removeSaved('cz_en_form')
      removeSaved('cz_en_pkg_group')

      setStep(1)
      setLesson(null)
      setSelectedPackageGroup(null)
      setSelectedInstructor(null)
      setSelectedWeekdays([])
      setSelectedTimeSlot(null)
      setForm({
        fname: '', lname: '', email: '', phone: '', age: '',
        level: '', notes: '', refnum: '', paymethod: '', address: '',
      })
      setErrors({})
      setTouched({})
    }
    prevLoggedInRef.current = isLoggedIn
  }, [isLoggedIn, user])

  // ── Package info ───────────────────────────────────────────────
  const requiredSlots = lesson?.sessionLimit ?? lesson?.session_limit ?? MIN_ENROLL_SLOTS
  const sessionsPerWeek = lesson?.sessionsPerWeek ?? lesson?.sessions_per_week ?? 1

  // ── Computed schedule: start date, end date, display text ──────
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

  const selectLesson = (L) => {
    if (isLoggedIn) {
      setLesson(L)
      return
    }
    openSignupGate({
      icon: '📚',
      title: 'Student Enrollment',
      subtitle: `Sign up to enroll in ${L.name}.`,
      onContinue: () => {
        setLesson(L)
      },
    })
  }

  const goStep = (n) => setStep(n)

  const toggleWeekday = (wd) => {
    setSelectedWeekdays((prev) => {
      const exists = prev.includes(wd)
      if (exists) {
        return prev.filter((d) => d !== wd)
      }
      if (prev.length >= sessionsPerWeek) {
        showToast(`You can select up to ${sessionsPerWeek} day(s) per week for this package.`)
        return prev
      }
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

  // Total amount is the package's fixed rate
  const totalAmount = lesson ? Number(lesson.rate) : 0

  const [submitting, setSubmitting] = useState(false)
  const submittedRef = useRef(false)
  // Refs to preserve confirmation data after state is cleared for Step 6
  const confirmRef = useRef({ form: {}, lesson: null, instructor: null, requiredSlots: 0, totalAmount: 0, scheduleText: '—' })

  // ── Validation helpers ──────────────────────────────────────────
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
    } else {
      showToast('Please fill in all required fields before proceeding.')
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

  const submitEnrollment = async () => {
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
    if (emptyFields.length > 0) {
      showToast(`Please fill in the following required field(s): ${emptyFields.join(', ')}`)
      return
    }

    setSubmitting(true)
    try {
      const userId = signedUpUser?.userId || user?.id
      if (!userId) {
        showToast('Please sign up first before submitting an enrollment request.')
        setSubmitting(false)
        return
      }

      const payload = {
        student_id: userId,
        first_name: form.fname || null,
        last_name: form.lname || null,
        email: form.email || null,
        course: lesson?.name || null,
        instructor: selectedInstructor?.name || null,
        schedule: scheduleTextRecurring !== '—' ? scheduleTextRecurring : null,
        program: form.level || null,
        notes: form.notes || null,
        contact_number: form.phone || null,
        student_address: form.address || null,
        emergency_contact: form.emergency || null,
        age: parseInt(form.age) || null,
        payment_reference: form.refnum.trim(),
        payment_method: form.paymethod || null,
        total_amount: totalAmount || null,
        package_id: lesson?.id || null,
        package_name: lesson?.name || null,
      }
      // Save confirmation data to refs BEFORE clearing state
      confirmRef.current = {
        form: { ...form },
        lesson: lesson ? { ...lesson } : null,
        instructor: selectedInstructor ? { ...selectedInstructor } : null,
        requiredSlots,
        totalAmount,
        scheduleText: scheduleTextRecurring,
      }

      await studentAPI.enroll(payload)
      setSubmitting(false)

      removeSaved('cz_en_step')
      removeSaved('cz_en_lesson')
      removeSaved('cz_en_instructor')
      removeSaved('cz_en_weekdays')
      removeSaved('cz_en_slot')
      removeSaved('cz_en_form')

      setForm({
        fname: '', lname: '', email: '', phone: '', age: '',
        level: '', notes: '', refnum: '', paymethod: '', address: '',
      })
      setLesson(null)
      setSelectedInstructor(null)
      setSelectedWeekdays([])
      setSelectedTimeSlot(null)
      setErrors({})
      setTouched({})

      try { sessionStorage.setItem('cz_en_just_submitted', '1') } catch { /* ignore */ }
      submittedRef.current = true

      openSuccessModal({
        title: 'Enrollment Submitted!',
        message:
          'Thank you! Your request has been received. Our front desk team will verify your payment and confirm your enrollment.',
      })
      setStep(6)
    } catch (err) {
      setSubmitting(false)
      const msg =
        err.response?.data?.error ||
        err.message ||
        'Enrollment submission failed. Please try later.'
      showToast(msg)
    }
  }

  const resetAll = () => {
    setStep(1)
    setLesson(null)
    setSelectedInstructor(null)
    setSelectedWeekdays([])
    setSelectedTimeSlot(null)
    setForm({
      fname: '', lname: '', email: '', phone: '', age: '',
      level: '', notes: '', refnum: '', paymethod: '', address: '',
    })
    setErrors({})
    setTouched({})
    removeSaved('cz_en_step')
    removeSaved('cz_en_lesson')
    removeSaved('cz_en_instructor')
    removeSaved('cz_en_weekdays')
    removeSaved('cz_en_slot')
    removeSaved('cz_en_form')
    navigate(PUBLIC_ROUTES.home)
  }

  const stepClass = (n) => {
    if (n < step) return 'he-si done'
    if (n === step) return 'he-si active'
    return 'he-si'
  }

  const inputStyle = (fieldKey) => {
    const hasError = touched[fieldKey] && errors[fieldKey]
    return {
      borderColor: hasError ? 'var(--coral)' : undefined,
      boxShadow: hasError ? '0 0 0 2px rgba(248,113,113,0.2)' : undefined,
    }
  }

  return (
    <div id="pub-enroll" className="pub-section" style={{ padding: 0, maxWidth: '100%' }}>
      <div
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '16px 40px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--text2)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            flexShrink: 0,
          }}
        >
          Enrollment
        </div>
        <div className="he-si-wrap">
          {[1, 2, 3, 4, 5, 6].map((n, i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
              <div className={stepClass(n)} id={`he-si-${n}`}>
                <div className="he-snum">{n === 6 ? '✓' : n}</div>
                <span>{['Lesson', 'Instructor', 'Schedule', 'Your Info', 'Payment', 'Done'][i]}</span>
              </div>
              {n < 6 ? <div className="he-sep" /> : null}
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
         STEP 1 – Choose Lesson Package
         ═══════════════════════════════════════════════════════════════ */}
      <div id="he-step-1" className={`he-step${step === 1 ? ' active' : ''}`}>
        <div className="he-wrap">
          <h1 className="he-title">Choose Your Lesson Package</h1>
          <p className="he-desc">
            Select a lesson package to enroll in. Each package includes a fixed number of sessions at a set price.
          </p>

          {packagesLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text2)', fontSize: 15 }}>
              Loading available lessons…
            </div>
          ) : packagesError ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ color: 'var(--coral)', fontSize: 14, marginBottom: 16 }}>{packagesError}</div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setPackagesLoading(true)
                  setPackagesError(null)
                  studentAPI.getPublicPackages()
                    .then((res) => { setPackages(res.data); setPackagesLoading(false) })
                    .catch(() => { setPackagesError('Could not load available lessons. Please try again later.'); setPackagesLoading(false) })
                }}
              >
                Retry
              </button>
            </div>
          ) : packages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text2)', fontSize: 15 }}>
              No lesson packages are available yet. Please check back later.
            </div>
          ) : !selectedPackageGroup ? (
            <>
              <p className="he-desc">
                Choose a package below, then select your preferred instrument or course within it.
              </p>
              <div className="he-lesson-grid">
                {packageGroups.map((group) => {
                  const lessonsInGroup = packages.filter(p => {
                    const g = p.packageGroup ?? p.package_group
                    return g === group
                  })
                  const minRate = Math.min(...lessonsInGroup.map(p => Number(p.rate)).filter(r => r > 0))
                  return (
                    <button
                      key={group}
                      type="button"
                      className="he-lesson-card"
                      onClick={() => setSelectedPackageGroup(group)}
                    >
                      <div className="he-sel-badge">▶</div>
                      <div className="he-l-name" style={{ fontSize: 18 }}>{group}</div>
                      <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6 }}>
                        {lessonsInGroup.length} lesson{lessonsInGroup.length > 1 ? 's' : ''} available
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--gold)', marginTop: 4 }}>
                        {lessonsInGroup.map(l => l.category).join(', ')}
                      </div>
                      {minRate > 0 && (
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal)', marginTop: 6 }}>
                          From ₱{minRate.toLocaleString()}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 16 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: 13 }}
                  onClick={() => {
                    setSelectedPackageGroup(null)
                    setLesson(null)
                  }}
                >
                  ← Back to all packages
                </button>
                <span style={{ marginLeft: 12, fontSize: 14, fontWeight: 600, color: 'var(--gold)' }}>
                  {selectedPackageGroup}
                </span>
              </div>
              <p className="he-desc">
                Select a specific lesson within {selectedPackageGroup}.
              </p>
              <div className="he-lesson-grid">
                {filteredLessonsByGroup.map((P) => {
                  const rate = Number(P.rate)
                  const sessionLimit = P.sessionLimit ?? P.session_limit
                  const durationMin = P.durationMinutes ?? P.duration_minutes
                  const spw = P.sessionsPerWeek ?? P.sessions_per_week ?? 1
                  return (
                    <button
                      key={P.id}
                      type="button"
                      className={`he-lesson-card${lesson?.id === P.id ? ' selected' : ''}`}
                      onClick={() => selectLesson(P)}
                    >
                      <div className="he-sel-badge">✓</div>
                      <div className="he-l-name">{P.name}</div>
                      <div className="he-l-rate" style={{ fontSize: 12, color: 'var(--gold)' }}>
                        {P.category}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>
                        {durationMin} min · {sessionLimit} sessions · {getFrequencyLabel(spw)}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--teal)', marginTop: 6 }}>
                        {rate > 0 ? `₱${rate.toLocaleString()}` : <span style={{ color: 'var(--text2)', fontWeight: 400 }}>Price TBD</span>}
                      </div>
                      {P.description && (
                        <div className="he-l-desc">{P.description}</div>
                      )}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          <div className="he-actions">
            <Link to={PUBLIC_ROUTES.home} className="btn btn-secondary">
              ← Back to Home
            </Link>
            {selectedPackageGroup && (
              <button type="button" className="btn btn-primary" disabled={!lesson} onClick={() => goStep(2)}>
                Next: Instructor →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
         STEP 2 – Choose Instructor
         ═══════════════════════════════════════════════════════════════ */}
      <div id="he-step-2" className={`he-step${step === 2 ? ' active' : ''}`}>
        <div className="he-wrap">
          <h1 className="he-title">Choose Your Instructor</h1>
          <p className="he-desc">
            {lesson?.instructors && lesson.instructors.length > 0
              ? `These instructors are assigned to teach "${lesson.name}". Select your preferred instructor.`
              : 'Select your preferred instructor.'}
          </p>
          {(!lesson?.instructors || lesson.instructors.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text2)', fontSize: 14, fontStyle: 'italic' }}>
              No instructors have been assigned to this package yet. Please contact the admin for assistance.
            </div>
          ) : (
            <div className="he-lesson-grid">
              {lesson.instructors.map((inst) => (
                <button
                  key={inst.id}
                  type="button"
                  className={`he-lesson-card${selectedInstructor?.id === inst.id ? ' selected' : ''}`}
                  onClick={() => setSelectedInstructor({
                    id: inst.id,
                    name: `${inst.first_name} ${inst.last_name}`,
                    desc: inst.specialization || 'Instructor',
                    email: inst.email || '',
                  })}
                >
                  <div className="he-sel-badge">✓</div>
                  <div className="he-l-icon">🎵</div>
                  <div className="he-l-name">{inst.first_name} {inst.last_name}</div>
                  {inst.specialization && (
                    <div className="he-l-desc">{inst.specialization}</div>
                  )}
                </button>
              ))}
            </div>
          )}
          <div className="he-actions">
            <button type="button" className="btn btn-secondary" onClick={() => goStep(1)}>
              ← Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!selectedInstructor || !lesson?.instructors || lesson.instructors.length === 0}
              onClick={() => goStep(3)}
            >
              Next: Schedule →
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
         STEP 3 – Set Your Recurring Schedule
         ═══════════════════════════════════════════════════════════════ */}
      <div id="he-step-3" className={`he-step${step === 3 ? ' active' : ''}`}>
        <div className="he-wrap" style={{ maxWidth: 700 }}>
          <div className="he-slot-header">
            <div>
              <div
                style={{
                  color: 'var(--gold)',
                  fontSize: 11,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                {lesson ? `${lesson.name} Lessons` : 'Lessons'}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Set Your Recurring Schedule</div>
            </div>
          </div>

          <div className="he-info-banner">
            <span style={{ fontSize: 15, flexShrink: 0 }} aria-hidden>
              💡
            </span>
            <span>
              Choose the <strong>day(s)</strong> and <strong>time</strong> for your lessons. This schedule repeats every week for the duration of your package.
            </span>
          </div>

          {/* ── Step 3a: Select Days ── */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
              Step 1: Choose your lesson day(s)
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>
              Select up to <strong style={{ color: 'var(--gold)' }}>{sessionsPerWeek}</strong> day(s) per week ({getFrequencyLabel(sessionsPerWeek)}).
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {DAY_SHORT.map((name, idx) => {
                const isSelected = selectedWeekdays.includes(idx)
                const isMaxed = !isSelected && selectedWeekdays.length >= sessionsPerWeek
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleWeekday(idx)}
                    disabled={!isSelected && isMaxed}
                    style={{
                      flex: 1,
                      minWidth: 80,
                      padding: '12px 10px',
                      borderRadius: 10,
                      border: isSelected
                        ? '2px solid var(--teal)'
                        : '1px solid var(--border)',
                      background: isSelected
                        ? 'rgba(15,212,180,0.12)'
                        : 'var(--surface)',
                      color: isSelected ? 'var(--teal)' : isMaxed ? 'var(--text3)' : 'var(--text)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: 13,
                      cursor: isMaxed ? 'not-allowed' : 'pointer',
                      opacity: isMaxed ? 0.4 : 1,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {name}
                  </button>
                )
              })}
            </div>
            {selectedWeekdays.length > 0 && (
              <div style={{ marginTop: 8, fontSize: 13, color: 'var(--teal)', fontWeight: 600 }}>
                Selected: {[...selectedWeekdays].sort().map(wd => DAY_NAMES[wd]).join(', ')}
              </div>
            )}
          </div>

          {/* ── Step 3b: Select Time Slot ── */}
          {selectedWeekdays.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
                Step 2: Choose your preferred time
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>
                Pick a time slot that will apply to <strong>all</strong> your selected day(s).
              </p>
              <div className="he-time-grid" style={{ marginTop: 0 }}>
                {/* Simulate slot availability with seeded01 */}
                {TIME_BLOCKS.map(([start, end]) => {
                  const available = seeded01(`he-slot-global|${start}`) > 0.2
                  const isSelected = selectedTimeSlot?.start === start
                  return (
                    <button
                      key={start}
                      type="button"
                      className={['he-tslot', available ? 'he-avail' : 'he-taken', isSelected ? 'he-sel-slot' : ''].filter(Boolean).join(' ')}
                      disabled={!available}
                      onClick={() => available && selectTimeSlot(start, end)}
                    >
                      {start} – {end}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Schedule Summary ── */}
          {selectedWeekdays.length > 0 && selectedTimeSlot && (
            <div
              style={{
                background: 'rgba(15,212,180,0.06)',
                border: '1px solid rgba(15,212,180,0.25)',
                borderRadius: 12,
                padding: '16px 20px',
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal)', marginBottom: 8 }}>
                📅 Your Recurring Schedule
              </div>
              <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600, marginBottom: 4 }}>
                Every {[...selectedWeekdays].sort().map(wd => DAY_NAMES[wd]).join(', ')} — {selectedTimeSlot.label}
              </div>
              {computedStartDate && computedEndDate && (
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                  {formatDateLong(computedStartDate)} – {formatDateLong(computedEndDate)} ({requiredSlots} sessions)
                </div>
              )}
            </div>
          )}

          <div className="he-actions">
            <button type="button" className="btn btn-secondary" onClick={() => goStep(2)}>
              ← Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={selectedWeekdays.length === 0 || !selectedTimeSlot}
              onClick={() => goStep(4)}
            >
              Next: Your Info →
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
         STEP 4 – Your Information
         ═══════════════════════════════════════════════════════════════ */}
      <div id="he-step-4" className={`he-step${step === 4 ? ' active' : ''}`}>
        <div className="he-wrap">
          <h1 className="he-title">Your Information</h1>
          <p className="he-desc">Please fill in your details. This will be used for enrollment records and confirmation.</p>
          <div className="he-form-grid">
            <div className="he-fg">
              <label>First Name <span style={{ color: 'var(--gold)' }}>*</span></label>
              <input value={form.fname} onChange={(e) => handleFieldChange('fname', e.target.value)} onBlur={() => handleFieldBlur('fname')} placeholder="e.g. Juan" style={inputStyle('fname')} />
              {touched.fname && errors.fname && <span style={{ fontSize: 11, color: 'var(--coral)', marginTop: 4, display: 'block' }}>{errors.fname}</span>}
            </div>
            <div className="he-fg">
              <label>Last Name <span style={{ color: 'var(--gold)' }}>*</span></label>
              <input value={form.lname} onChange={(e) => handleFieldChange('lname', e.target.value)} onBlur={() => handleFieldBlur('lname')} placeholder="e.g. dela Cruz" style={inputStyle('lname')} />
              {touched.lname && errors.lname && <span style={{ fontSize: 11, color: 'var(--coral)', marginTop: 4, display: 'block' }}>{errors.lname}</span>}
            </div>
            <div className="he-fg">
              <label>Gmail Address <span style={{ color: 'var(--gold)' }}>*</span></label>
              <input type="email" value={form.email} onChange={(e) => handleFieldChange('email', e.target.value)} onBlur={() => handleFieldBlur('email')} placeholder="yourname@gmail.com" style={inputStyle('email')} />
              {touched.email && errors.email && <span style={{ fontSize: 11, color: 'var(--coral)', marginTop: 4, display: 'block' }}>{errors.email}</span>}
              <span style={{ fontSize: 11, color: 'var(--text2)' }}>Confirmation and updates will be sent here</span>
            </div>
            <div className="he-fg">
              <label>Contact Number <span style={{ color: 'var(--gold)' }}>*</span></label>
              <input value={form.phone} onChange={(e) => handleFieldChange('phone', e.target.value.replace(/[^0-9+]/g, ''))} onBlur={() => handleFieldBlur('phone')} placeholder="+63 9XX XXX XXXX" style={inputStyle('phone')} />
              {touched.phone && errors.phone && <span style={{ fontSize: 11, color: 'var(--coral)', marginTop: 4, display: 'block' }}>{errors.phone}</span>}
            </div>
            <div className="he-fg he-fg-full">
              <label>Student Address <span style={{ color: 'var(--gold)' }}>*</span></label>
              <textarea rows={2} value={form.address} onChange={(e) => handleFieldChange('address', e.target.value)} onBlur={() => handleFieldBlur('address')} placeholder="e.g. 123 Rizal St., Barangay San Antonio, Makati City" style={inputStyle('address')} />
              {touched.address && errors.address && <span style={{ fontSize: 11, color: 'var(--coral)', marginTop: 4, display: 'block' }}>{errors.address}</span>}
            </div>
            <div className="he-fg">
              <label>Age <span style={{ color: 'var(--gold)' }}>*</span></label>
              <input type="number" value={form.age} onChange={(e) => handleFieldChange('age', e.target.value)} onBlur={() => handleFieldBlur('age')} placeholder="e.g. 16" min={4} max={80} style={inputStyle('age')} />
              {touched.age && errors.age && <span style={{ fontSize: 11, color: 'var(--coral)', marginTop: 4, display: 'block' }}>{errors.age}</span>}
            </div>
            <div className="he-fg">
              <label>Experience Level</label>
              <select value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}>
                <option value="">Select level...</option>
                <option>Complete Beginner</option>
                <option>Some Experience</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div className="he-fg he-fg-full">
              <label>Emergency Contact Number <span style={{ color: 'var(--gold)' }}>*</span></label>
              <input value={form.emergency} onChange={(e) => handleFieldChange('emergency', e.target.value.replace(/[^0-9+]/g, ''))} onBlur={() => handleFieldBlur('emergency')} placeholder="e.g. +63 9XX XXX XXXX" style={inputStyle('emergency')} />
              {touched.emergency && errors.emergency && <span style={{ fontSize: 11, color: 'var(--coral)', marginTop: 4, display: 'block' }}>{errors.emergency}</span>}
            </div>
            <div className="he-fg he-fg-full">
              <label>Special Requests / Notes</label>
              <textarea rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Any special requests, physical needs, or things your instructor should know..." />
            </div>
          </div>
          <div className="he-actions">
            <button type="button" className="btn btn-secondary" onClick={() => goStep(3)}>← Back</button>
            <button type="button" className="btn btn-primary" onClick={() => handleNextStep(5)}>Review & Pay →</button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
         STEP 5 – Review & Payment
         ═══════════════════════════════════════════════════════════════ */}
      <div id="he-step-5" className={`he-step${step === 5 ? ' active' : ''}`}>
        <div className="he-wrap">
          <h1 className="he-title">Review & Payment</h1>
          <p className="he-desc">
            Review your enrollment summary and complete the <strong>full payment</strong> to submit your request.
          </p>
          <div className="he-summary-card">
            <div className="he-sc-head">📋 Enrollment Summary</div>
            <div className="he-sc-body">
              <div className="he-sr">
                <span className="he-sr-l">Student Name</span>
                <span className="he-sr-v">{[form.fname, form.lname].filter(Boolean).join(' ') || '—'}</span>
              </div>
              <div className="he-sr">
                <span className="he-sr-l">Gmail</span>
                <span className="he-sr-v">{form.email || '—'}</span>
              </div>
              <div className="he-sr">
                <span className="he-sr-l">Package</span>
                <span className="he-sr-v">{lesson ? lesson.name : '—'}</span>
              </div>
              <div className="he-sr">
                <span className="he-sr-l">Category</span>
                <span className="he-sr-v">{lesson ? lesson.category : '—'}</span>
              </div>
              <div className="he-sr">
                <span className="he-sr-l">Instructor</span>
                <span className="he-sr-v">{selectedInstructor?.name || '—'}</span>
              </div>
              <div className="he-sr">
                <span className="he-sr-l">Package Sessions</span>
                <span className="he-sr-v">{lesson ? requiredSlots : '—'}</span>
              </div>
              <div className="he-sr">
                <span className="he-sr-l">Frequency</span>
                <span className="he-sr-v">{lesson ? getFrequencyLabel(sessionsPerWeek) : '—'}</span>
              </div>
              <div className="he-sr">
                <span className="he-sr-l">Recurring Schedule</span>
                <span className="he-sr-v" style={{ fontSize: 12, lineHeight: 1.9, whiteSpace: 'pre-line' }}>
                  {scheduleTextRecurring}
                </span>
              </div>
              <div className="he-sr he-sr-total">
                <span className="he-sr-l" style={{ fontSize: 15, fontWeight: 700 }}>Package Price</span>
                <span className="he-sr-v" style={{ fontSize: 20, color: 'var(--gold)' }}>
                  {lesson && totalAmount > 0 ? `₱${totalAmount.toLocaleString()}` : <span style={{ color: 'var(--text2)', fontSize: 14, fontWeight: 400 }}>Price TBD</span>}
                </span>
              </div>
              <div className="he-sr">
                <span className="he-sr-l">Full Payment Required</span>
                <span className="he-sr-v" style={{ fontSize: 16, color: 'var(--teal)' }}>
                  {lesson && totalAmount > 0 ? `₱${totalAmount.toLocaleString()}` : <span style={{ color: 'var(--text2)', fontSize: 14, fontWeight: 400 }}>Price TBD</span>}
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(15,212,180,.06)',
              border: '1px solid rgba(15,212,180,.25)',
              borderRadius: 12,
              padding: '20px 24px',
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal)', marginBottom: 10 }}>💳 How to Pay</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14 }}>
              Send the <strong style={{ color: 'var(--text)' }}>full payment</strong> via any of the following options, then enter your reference number below.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="he-pay-acct"><strong>GCash</strong><span>09XX XXX XXXX – Cadenza Music Center</span></div>
              <div className="he-pay-acct"><strong>Maya (PayMaya)</strong><span>09XX XXX XXXX – Cadenza Music Center</span></div>
              <div className="he-pay-acct"><strong>Bank Transfer (BDO)</strong><span>Account No: 0012-3456-7890 – Cadenza Music Inc.</span></div>
            </div>
          </div>

          <div className="he-summary-card">
            <div className="he-sc-head">📎 Payment Reference</div>
            <div className="he-sc-body">
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>
                  Reference Number <span style={{ color: 'var(--gold)' }}>*</span>
                </label>
                <input type="text" value={form.refnum} onChange={(e) => handleFieldChange('refnum', e.target.value)} onBlur={() => handleFieldBlur('refnum')} placeholder="e.g. GCash Ref: 1234567890" style={{ maxWidth: 400, ...inputStyle('refnum') }} />
                {touched.refnum && errors.refnum && <span style={{ fontSize: 11, color: 'var(--coral)', marginTop: 4, display: 'block' }}>{errors.refnum}</span>}
                <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>Enter the reference/transaction number from your payment</div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>
                  Payment Method <span style={{ color: 'var(--gold)' }}>*</span>
                </label>
                <select value={form.paymethod} onChange={(e) => handleFieldChange('paymethod', e.target.value)} onBlur={() => handleFieldBlur('paymethod')} style={{ maxWidth: 280, ...inputStyle('paymethod') }}>
                  <option value="">Select...</option>
                  <option>GCash</option>
                  <option>Maya (PayMaya)</option>
                  <option>BDO Bank Transfer</option>
                  <option>Other</option>
                </select>
                {touched.paymethod && errors.paymethod && <span style={{ fontSize: 11, color: 'var(--coral)', marginTop: 4, display: 'block' }}>{errors.paymethod}</span>}
              </div>
            </div>
          </div>

          <div className="he-info-banner" style={{ background: 'rgba(255,107,107,.07)', borderColor: 'rgba(255,107,107,.3)', color: 'var(--coral)' }}>
            <span style={{ fontSize: 15, flexShrink: 0 }} aria-hidden>⚠️</span>
            <span>Your enrollment request will be marked <strong>Pending</strong> until our front desk verifies your payment. You'll receive confirmation once approved.</span>
          </div>
          <div className="he-actions">
            <button type="button" className="btn btn-secondary" onClick={() => goStep(4)}>← Back</button>
            <button type="button" className="btn btn-primary" style={{ background: 'var(--teal)', color: 'var(--bg)' }} onClick={submitEnrollment}>✉️ Submit Enrollment Request</button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
         STEP 6 – Done / Confirmation
         ═══════════════════════════════════════════════════════════════ */}
      <div id="he-step-6" className={`he-step${step === 6 ? ' active' : ''}`}>
        <div className="he-wrap" style={{ textAlign: 'center', paddingTop: 80, paddingBottom: 80, maxWidth: 600 }}>
          <div style={{ fontSize: 68, marginBottom: 20, animation: 'pubLightHePop 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>🎉</div>
          <h1 className="he-title" style={{ fontSize: 28, textAlign: 'center' }}>Enrollment Submitted!</h1>
          <p className="he-desc" style={{ textAlign: 'center', maxWidth: 480, margin: '0 auto 28px' }}>
            Thank you! Your request has been received. Our front desk team will verify your payment and confirm your enrollment. Check your email for updates.
          </p>
          <div className="he-confirm-card">
            <div className="he-cc-row">
              <span style={{ color: 'var(--text2)' }}>Student</span>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>{[confirmRef.current.form.fname, confirmRef.current.form.lname].filter(Boolean).join(' ') || '—'}</span>
            </div>
            <div className="he-cc-row">
              <span style={{ color: 'var(--text2)' }}>Package</span>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>{confirmRef.current.lesson?.name || '—'}</span>
            </div>
            <div className="he-cc-row">
              <span style={{ color: 'var(--text2)' }}>Instructor</span>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>{confirmRef.current.instructor?.name || '—'}</span>
            </div>
            <div className="he-cc-row">
              <span style={{ color: 'var(--text2)' }}>Sessions</span>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>{confirmRef.current.requiredSlots}</span>
            </div>
            <div className="he-cc-row">
              <span style={{ color: 'var(--text2)' }}>Schedule</span>
              <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: 12, lineHeight: 1.9, whiteSpace: 'pre-line', textAlign: 'right' }}>
                {confirmRef.current.scheduleText}
              </span>
            </div>
            <div className="he-cc-row">
              <span style={{ color: 'var(--text2)' }}>Amount Paid (Full)</span>
              <span style={{ fontWeight: 600, color: 'var(--teal)' }}>
                {confirmRef.current.totalAmount > 0 ? `₱${confirmRef.current.totalAmount.toLocaleString()}` : <span style={{ color: 'var(--text2)', fontWeight: 400 }}>Price TBD</span>}
              </span>
            </div>
            <div className="he-cc-row">
              <span style={{ color: 'var(--text2)' }}>Payment Reference</span>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>{confirmRef.current.form.refnum || '—'}</span>
            </div>
            <div className="he-cc-row" style={{ borderBottom: 'none' }}>
              <span style={{ color: 'var(--text2)' }}>Status</span>
              <span style={{ background: 'rgba(240,180,41,.12)', border: '1px solid rgba(240,180,41,.35)', color: 'var(--gold)', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, letterSpacing: '1px', textTransform: 'uppercase' }}>
                ⏳ Pending Verification
              </span>
            </div>
          </div>
          <button type="button" className="btn btn-primary" onClick={resetAll}>← Back to Home</button>
        </div>
      </div>
    </div>
  )
}