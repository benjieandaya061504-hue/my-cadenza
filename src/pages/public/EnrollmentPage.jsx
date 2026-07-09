import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PUBLIC_ROUTES } from '../../constants/publicRoutes'
import { usePublicSite } from './PublicSiteContext'
import { studentAPI } from '../../services/api'
import {
  MIN_ENROLL_SLOTS,
  TOTAL_SLOT_POOL,
  addMonths,
  buildEnrollmentWeeks,
  seeded01,
  startOfMonth,
  toDateKey,
} from './enrollmentUtils'

const LESSONS = [
  {
    name: 'Drums',
    icon: '🥁',
    rate: 500,
    desc: 'Learn rhythm, beats, and percussion techniques from beginner to advanced.',
  },
  {
    name: 'Guitar',
    icon: '🎸',
    rate: 450,
    desc: 'Acoustic or electric — chords, strumming, fingerpicking, and more.',
  },
  {
    name: 'Violin',
    icon: '🎻',
    rate: 550,
    desc: 'Classical and contemporary violin for children and adults alike.',
  },
  {
    name: 'Piano',
    icon: '🎹',
    rate: 500,
    desc: 'From scales to sonatas — keyboard fundamentals to performance-level skills.',
  },
  {
    name: 'Saxophone',
    icon: '🎷',
    rate: 500,
    desc: 'Jazz, classical, and pop — an incredibly expressive and rewarding instrument.',
  },
]

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

function dayKind(date, monthCursor) {
  const inMonth = date.getMonth() === monthCursor.getMonth()
  if (!inMonth) return 'empty'
  const key = toDateKey(date)
  const s = seeded01(`he-day|${key}`)
  if (s < 0.22) return 'unavail'
  if (s < 0.88) return 'slots'
  return 'unavail'
}

function slotTimesForDay(dateKey) {
  return TIME_BLOCKS.map(([start, end]) => {
    const available = seeded01(`he-slot|${dateKey}|${start}`) > 0.38
    return { start, end, label: `${start} – ${end}`, available }
  })
}

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

  // ── Restore state from localStorage on mount ────────────────
  const [step, setStep] = useState(() => loadSaved('cz_en_step', 1))
  const [lesson, setLesson] = useState(() => loadSaved('cz_en_lesson', null))
  const [monthCursor, setMonthCursor] = useState(() => {
    const saved = loadSaved('cz_en_month', null)
    return saved ? new Date(saved) : startOfMonth(new Date())
  })
  const [pickedDay, setPickedDay] = useState(() => {
    const saved = loadSaved('cz_en_picked', null)
    return saved ? new Date(saved) : null
  })
  const [selectedSlots, setSelectedSlots] = useState(() => loadSaved('cz_en_slots', []))
  const [form, setForm] = useState(() => loadSaved('cz_en_form', {
    fname: '', lname: '', email: '', phone: '', age: '',
    level: '', notes: '', refnum: '', paymethod: '', address: '',
  }))

  // ── Persist state changes to localStorage ───────────────────
  useEffect(() => { saveState('cz_en_step', step) }, [step])
  useEffect(() => { saveState('cz_en_lesson', lesson) }, [lesson])
  useEffect(() => { saveState('cz_en_month', monthCursor) }, [monthCursor])
  useEffect(() => { saveState('cz_en_picked', pickedDay) }, [pickedDay])
  useEffect(() => { saveState('cz_en_slots', selectedSlots) }, [selectedSlots])
  useEffect(() => { saveState('cz_en_form', form) }, [form])

  // Pre-fill form with existing enrollment data when a logged-in user visits
  useEffect(() => {
    if (!isLoggedIn || !user) return

    // Only pre-fill name/email from session if the form fields are empty
    // (user might have data restored from localStorage already)
    setForm((f) => ({
      ...f,
      fname: f.fname || user.firstName || '',
      lname: f.lname || user.lastName || '',
      email: f.email || user.email || '',
    }))

    // Fetch existing enrollment data
    studentAPI.getEnrollments(user.id)
      .then((res) => {
        const enrollments = res.data
        // Find the most recent pending enrollment
        const pendingEnrollment = Array.isArray(enrollments)
          ? enrollments.find((e) => e.status === 'pending')
          : null
        if (pendingEnrollment) {
          setForm((f) => ({
            ...f,
            phone: f.phone || pendingEnrollment.contact_number || '',
            address: f.address || pendingEnrollment.student_address || '',
            level: f.level || pendingEnrollment.program_requested || '',
            notes: f.notes || pendingEnrollment.notes || '',
            refnum: f.refnum || pendingEnrollment.payment_reference || '',
            paymethod: f.paymethod || pendingEnrollment.payment_method || '',
          }))
        }
      })
      .catch(() => {
        // No existing enrollment found, just keep the form as-is with user data
      })
  }, [isLoggedIn, user])

  const monthLabel = useMemo(
    () =>
      monthCursor.toLocaleString(undefined, {
        month: 'long',
        year: 'numeric',
      }),
    [monthCursor],
  )

  const weeks = useMemo(() => buildEnrollmentWeeks(monthCursor), [monthCursor])

  const pickedKey = pickedDay ? toDateKey(pickedDay) : null
  const timeRows = pickedKey ? slotTimesForDay(pickedKey) : []

  const slotsRemaining = Math.max(0, TOTAL_SLOT_POOL - selectedSlots.length * 3)
  const fillPct = Math.min(100, Math.round(((TOTAL_SLOT_POOL - slotsRemaining) / TOTAL_SLOT_POOL) * 100))

  const selectLesson = (L) => {
    if (isLoggedIn) {
      setLesson(L)
      return
    }
    openSignupGate({
      icon: L.icon,
      title: 'Student Enrollment',
      subtitle: `Sign up to enroll in ${L.name} lessons.`,
      onContinue: () => {
        setLesson(L)
      },
    })
  }

  const goStep = (n) => setStep(n)

  const onPickDay = (d, kind) => {
    if (kind !== 'slots') return
    setPickedDay(d)
  }

  const toggleTimeSlot = (t) => {
    if (!pickedKey || !t.available) return
    const id = `${pickedKey}|${t.start}`
    setSelectedSlots((prev) => {
      const exists = prev.some((s) => s.id === id)
      if (exists) return prev.filter((s) => s.id !== id)
      const sameDay = prev.filter((s) => s.dateKey === pickedKey)
      if (sameDay.length >= 1) {
        showToast('You may select only 1 slot per day.')
        return prev
      }
      return [...prev, { id, dateKey: pickedKey, label: `${pickedKey} ${t.label}`, short: t.label }]
    })
  }

  const removeChip = (id) => {
    setSelectedSlots((prev) => prev.filter((s) => s.id !== id))
  }

  const scheduleText = selectedSlots.length === 0 ? '—' : selectedSlots.map((s) => s.label).join('\n')

  const totalAmount = lesson ? lesson.rate * selectedSlots.length : 0

  const [submitting, setSubmitting] = useState(false)

  const submitEnrollment = async () => {
    if (!form.refnum.trim()) {
      showToast('Please enter your payment reference number.')
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
        schedule: scheduleText !== '—' ? scheduleText : null,
        program: form.level || null,
        notes: form.notes || null,
        contact_number: form.phone || null,
        student_address: form.address || null,
        payment_reference: form.refnum.trim(),
        payment_method: form.paymethod || null,
        total_amount: totalAmount || null
      }
      await studentAPI.enroll(payload)
      setSubmitting(false)
      openSuccessModal({
        title: 'Enrollment Submitted!',
        message:
          'Thank you! Your request has been received. Our front desk team will verify your payment and confirm your enrollment.',
      })
      setStep(5)
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
    setMonthCursor(startOfMonth(new Date()))
    setPickedDay(null)
    setSelectedSlots([])
    setForm({
      fname: '',
      lname: '',
      email: '',
      phone: '',
      age: '',
      level: '',
      notes: '',
      refnum: '',
      paymethod: '',
      address: '',
    })
    // Clear all saved state
    removeSaved('cz_en_step')
    removeSaved('cz_en_lesson')
    removeSaved('cz_en_month')
    removeSaved('cz_en_picked')
    removeSaved('cz_en_slots')
    removeSaved('cz_en_form')
    navigate(PUBLIC_ROUTES.home)
  }

  const stepClass = (n) => {
    if (n < step) return 'he-si done'
    if (n === step) return 'he-si active'
    return 'he-si'
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
          {[1, 2, 3, 4, 5].map((n, i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
              <div className={stepClass(n)} id={`he-si-${n}`}>
                <div className="he-snum">{n === 5 ? '✓' : n}</div>
                <span>{['Lesson', 'Schedule', 'Your Info', 'Payment', 'Done'][i]}</span>
              </div>
              {n < 5 ? <div className="he-sep" /> : null}
            </div>
          ))}
        </div>
      </div>

      <div id="he-step-1" className={`he-step${step === 1 ? ' active' : ''}`}>
        <div className="he-wrap">
          <h1 className="he-title">Choose Your Instrument</h1>
          <p className="he-desc">
            Select the instrument lesson you'd like to enroll in. Each lesson is 1 hour per slot.
          </p>
          <div className="he-lesson-grid">
            {LESSONS.map((L) => (
              <button
                key={L.name}
                type="button"
                className={`he-lesson-card${lesson?.name === L.name ? ' selected' : ''}`}
                onClick={() => selectLesson(L)}
              >
                <div className="he-sel-badge">✓</div>
                <div className="he-l-icon">{L.icon}</div>
                <div className="he-l-name">{L.name}</div>
                <div className="he-l-rate">₱{L.rate} / hr</div>
                <div className="he-l-desc">{L.desc}</div>
              </button>
            ))}
          </div>
          <div className="he-actions">
            <Link to={PUBLIC_ROUTES.home} className="btn btn-secondary">
              ← Back to Home
            </Link>
            <button type="button" className="btn btn-primary" disabled={!lesson} onClick={() => goStep(2)}>
              Next: Schedule →
            </button>
          </div>
        </div>
      </div>

      <div id="he-step-2" className={`he-step${step === 2 ? ' active' : ''}`}>
        <div className="he-wrap" style={{ maxWidth: 1000 }}>
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
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Pick Your Schedule</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 5 }}>Total Slot Availability</div>
              <div
                style={{
                  width: 170,
                  height: 7,
                  background: 'var(--border)',
                  borderRadius: 4,
                  overflow: 'hidden',
                  marginLeft: 'auto',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    background: 'var(--gold)',
                    borderRadius: 4,
                    width: `${fillPct}%`,
                    transition: 'width 0.3s',
                  }}
                />
              </div>
              <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: 13, marginTop: 4 }}>
                <span style={{ color: 'var(--gold)' }}>{slotsRemaining}</span> of{' '}
                <span>{TOTAL_SLOT_POOL}</span> slots remaining
              </div>
            </div>
          </div>

          <div className="he-info-banner">
            <span style={{ fontSize: 15, flexShrink: 0 }} aria-hidden>
              💡
            </span>
            <span>
              Select available dates <span style={{ color: 'var(--teal)', fontWeight: 600 }}>(teal)</span> on the
              calendar. Each slot is <strong>1 hour</strong>. You may select <strong>1 slot per day</strong>, and must
              book a <strong>minimum of 4 slots total</strong> to proceed.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <button type="button" className="he-cal-btn" onClick={() => setMonthCursor((m) => addMonths(m, -1))}>
              ‹
            </button>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{monthLabel}</div>
            <button type="button" className="he-cal-btn" onClick={() => setMonthCursor((m) => addMonths(m, 1))}>
              ›
            </button>
            <span style={{ color: 'var(--text2)', fontSize: 13, marginLeft: 8 }}>
              Selected: <strong style={{ color: 'var(--gold)' }}>{selectedSlots.length}</strong> / {MIN_ENROLL_SLOTS}{' '}
              min slots
            </span>
          </div>

          <div className="he-cal-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="he-cal-label">
                {d}
              </div>
            ))}
            {weeks.flatMap((week) =>
              week.map((day) => {
                const inMonth = day.getMonth() === monthCursor.getMonth()
                const kind = inMonth ? dayKind(day, monthCursor) : 'empty'
                const key = toDateKey(day)
                const isSel = pickedKey === key
                const cellClass = [
                  'he-cal-cell',
                  kind === 'empty' ? 'he-empty' : '',
                  kind === 'unavail' ? 'he-unavail' : '',
                  kind === 'slots' ? 'he-has-slots' : '',
                  isSel ? 'he-sel-day' : '',
                ]
                  .filter(Boolean)
                  .join(' ')
                return (
                  <button
                    key={key}
                    type="button"
                    className={cellClass}
                    disabled={kind !== 'slots'}
                    onClick={() => onPickDay(day, kind)}
                  >
                    <div className="he-cdate">{day.getDate()}</div>
                    {kind === 'slots' ? (
                      <div className="he-ccount">{3 + Math.floor(seeded01(`cnt-${key}`) * 5)} open</div>
                    ) : null}
                  </button>
                )
              }),
            )}
          </div>

          <div className={`he-time-panel${pickedKey ? ' visible' : ''}`}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Available Times</div>
            <div style={{ color: 'var(--text2)', fontSize: 12, marginBottom: 14 }}>
              Click a time slot to select it. Each slot = 1 hour.
            </div>
            <div className="he-time-grid">
              {timeRows.map((t) => {
                const id = `${pickedKey}|${t.start}`
                const sel = selectedSlots.some((s) => s.id === id)
                const cls = ['he-tslot', t.available ? 'he-avail' : 'he-taken', sel ? 'he-sel-slot' : '']
                  .filter(Boolean)
                  .join(' ')
                return (
                  <button
                    key={t.start}
                    type="button"
                    className={cls}
                    disabled={!t.available}
                    onClick={() => toggleTimeSlot(t)}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="he-ssb">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>Your Selected Slots</span>
              <span style={{ color: 'var(--gold)', fontSize: 12 }}>{selectedSlots.length} slots selected</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, minHeight: 28 }}>
              {selectedSlots.length === 0 ? (
                <span style={{ color: 'var(--text2)', fontSize: 12, fontStyle: 'italic' }}>
                  No slots selected yet. Click a teal day on the calendar.
                </span>
              ) : (
                selectedSlots.map((s) => (
                  <span key={s.id} className="he-chip">
                    {s.label}
                    <button type="button" onClick={() => removeChip(s.id)} aria-label={`Remove ${s.label}`}>
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="he-actions">
            <button type="button" className="btn btn-secondary" onClick={() => goStep(1)}>
              ← Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={selectedSlots.length < MIN_ENROLL_SLOTS}
              onClick={() => goStep(3)}
            >
              Next: Your Info →
            </button>
          </div>
        </div>
      </div>

      <div id="he-step-3" className={`he-step${step === 3 ? ' active' : ''}`}>
        <div className="he-wrap">
          <h1 className="he-title">Your Information</h1>
          <p className="he-desc">Please fill in your details. This will be used for enrollment records and confirmation.</p>
          <div className="he-form-grid">
            <div className="he-fg">
              <label>
                First Name <span style={{ color: 'var(--gold)' }}>*</span>
              </label>
              <input
                value={form.fname}
                onChange={(e) => setForm((f) => ({ ...f, fname: e.target.value }))}
                placeholder="e.g. Juan"
              />
            </div>
            <div className="he-fg">
              <label>
                Last Name <span style={{ color: 'var(--gold)' }}>*</span>
              </label>
              <input
                value={form.lname}
                onChange={(e) => setForm((f) => ({ ...f, lname: e.target.value }))}
                placeholder="e.g. dela Cruz"
              />
            </div>
            <div className="he-fg">
              <label>
                Gmail Address <span style={{ color: 'var(--gold)' }}>*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="yourname@gmail.com"
              />
              <span style={{ fontSize: 11, color: 'var(--text2)' }}>Confirmation and updates will be sent here</span>
            </div>
            <div className="he-fg">
              <label>
                Contact Number <span style={{ color: 'var(--gold)' }}>*</span>
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/[^0-9+]/g, '') }))}
                placeholder="+63 9XX XXX XXXX"
              />
            </div>
            <div className="he-fg he-fg-full">
              <label>
                Student Address <span style={{ color: 'var(--gold)' }}>*</span>
              </label>
              <textarea
                rows={2}
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="e.g. 123 Rizal St., Barangay San Antonio, Makati City"
              />
            </div>
            <div className="he-fg">
              <label>Age</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                placeholder="e.g. 16"
                min={4}
                max={80}
              />
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
              <label>Special Requests / Notes</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Any special requests, physical needs, or things your instructor should know..."
              />
            </div>
          </div>
          <div className="he-actions">
            <button type="button" className="btn btn-secondary" onClick={() => goStep(2)}>
              ← Back
            </button>
            <button type="button" className="btn btn-primary" onClick={() => goStep(4)}>
              Review & Pay →
            </button>
          </div>
        </div>
      </div>

      <div id="he-step-4" className={`he-step${step === 4 ? ' active' : ''}`}>
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
                <span className="he-sr-l">Instrument</span>
                <span className="he-sr-v">{lesson ? `${lesson.icon} ${lesson.name}` : '—'}</span>
              </div>
              <div className="he-sr">
                <span className="he-sr-l">Number of Slots</span>
                <span className="he-sr-v">{selectedSlots.length || '—'}</span>
              </div>
              <div className="he-sr">
                <span className="he-sr-l">Rate per Slot</span>
                <span className="he-sr-v">{lesson ? `₱${lesson.rate}` : '—'}</span>
              </div>
              <div className="he-sr">
                <span className="he-sr-l">Schedule</span>
                <span className="he-sr-v" style={{ fontSize: 12, lineHeight: 1.9, whiteSpace: 'pre-line' }}>
                  {scheduleText}
                </span>
              </div>
              <div className="he-sr he-sr-total">
                <span className="he-sr-l" style={{ fontSize: 15, fontWeight: 700 }}>
                  Total Amount
                </span>
                <span className="he-sr-v" style={{ fontSize: 20, color: 'var(--gold)' }}>
                  {lesson ? `₱${totalAmount.toLocaleString()}` : '—'}
                </span>
              </div>
              <div className="he-sr">
                <span className="he-sr-l">Full Payment Required</span>
                <span className="he-sr-v" style={{ fontSize: 16, color: 'var(--teal)' }}>
                  {lesson ? `₱${totalAmount.toLocaleString()}` : '—'}
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
              Send the <strong style={{ color: 'var(--text)' }}>full payment</strong> via any of the following options,
              then enter your reference number below.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="he-pay-acct">
                <strong>GCash</strong>
                <span>09XX XXX XXXX – Cadenza Music Center</span>
              </div>
              <div className="he-pay-acct">
                <strong>Maya (PayMaya)</strong>
                <span>09XX XXX XXXX – Cadenza Music Center</span>
              </div>
              <div className="he-pay-acct">
                <strong>Bank Transfer (BDO)</strong>
                <span>Account No: 0012-3456-7890 – Cadenza Music Inc.</span>
              </div>
            </div>
          </div>

          <div className="he-summary-card">
            <div className="he-sc-head">📎 Payment Reference</div>
            <div className="he-sc-body">
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>
                  Reference Number <span style={{ color: 'var(--gold)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.refnum}
                  onChange={(e) => setForm((f) => ({ ...f, refnum: e.target.value }))}
                  placeholder="e.g. GCash Ref: 1234567890"
                  style={{ maxWidth: 400 }}
                />
                <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>
                  Enter the reference/transaction number from your payment
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>
                  Payment Method
                </label>
                <select
                  value={form.paymethod}
                  onChange={(e) => setForm((f) => ({ ...f, paymethod: e.target.value }))}
                  style={{ maxWidth: 280 }}
                >
                  <option value="">Select...</option>
                  <option>GCash</option>
                  <option>Maya (PayMaya)</option>
                  <option>BDO Bank Transfer</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>

          <div
            className="he-info-banner"
            style={{
              background: 'rgba(255,107,107,.07)',
              borderColor: 'rgba(255,107,107,.3)',
              color: 'var(--coral)',
            }}
          >
            <span style={{ fontSize: 15, flexShrink: 0 }} aria-hidden>
              ⚠️
            </span>
            <span>
              Your enrollment request will be marked <strong>Pending</strong> until our front desk verifies your
              payment. You'll receive confirmation once approved.
            </span>
          </div>
          <div className="he-actions">
            <button type="button" className="btn btn-secondary" onClick={() => goStep(3)}>
              ← Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ background: 'var(--teal)', color: 'var(--bg)' }}
              onClick={submitEnrollment}
            >
              ✉️ Submit Enrollment Request
            </button>
          </div>
        </div>
      </div>

      <div id="he-step-5" className={`he-step${step === 5 ? ' active' : ''}`}>
        <div className="he-wrap" style={{ textAlign: 'center', paddingTop: 80, paddingBottom: 80, maxWidth: 600 }}>
          <div style={{ fontSize: 68, marginBottom: 20, animation: 'pubLightHePop 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
            🎉
          </div>
          <h1 className="he-title" style={{ fontSize: 28, textAlign: 'center' }}>
            Enrollment Submitted!
          </h1>
          <p className="he-desc" style={{ textAlign: 'center', maxWidth: 480, margin: '0 auto 28px' }}>
            Thank you! Your request has been received. Our front desk team will verify your payment and confirm your
            enrollment. Check your email for updates.
          </p>
          <div className="he-confirm-card">
            <div className="he-cc-row">
              <span style={{ color: 'var(--text2)' }}>Student</span>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                {[form.fname, form.lname].filter(Boolean).join(' ') || '—'}
              </span>
            </div>
            <div className="he-cc-row">
              <span style={{ color: 'var(--text2)' }}>Instrument</span>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>{lesson?.name || '—'}</span>
            </div>
            <div className="he-cc-row">
              <span style={{ color: 'var(--text2)' }}>Slots Booked</span>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>{selectedSlots.length}</span>
            </div>
            <div className="he-cc-row">
              <span style={{ color: 'var(--text2)' }}>Amount Paid (Full)</span>
              <span style={{ fontWeight: 600, color: 'var(--teal)' }}>₱{totalAmount.toLocaleString()}</span>
            </div>
            <div className="he-cc-row">
              <span style={{ color: 'var(--text2)' }}>Payment Reference</span>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>{form.refnum || '—'}</span>
            </div>
            <div className="he-cc-row" style={{ borderBottom: 'none' }}>
              <span style={{ color: 'var(--text2)' }}>Status</span>
              <span
                style={{
                  background: 'rgba(240,180,41,.12)',
                  border: '1px solid rgba(240,180,41,.35)',
                  color: 'var(--gold)',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: 20,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                ⏳ Pending Verification
              </span>
            </div>
          </div>
          <button type="button" className="btn btn-primary" onClick={resetAll}>
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}