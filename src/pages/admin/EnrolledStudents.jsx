import { useEffect, useState } from 'react'
import { enrollmentsAPI } from '../../services/api'

const C = {
  bg:       '#0e0f13',
  bg2:      '#13141a',
  bg3:      '#1a1c24',
  bg4:      '#1f2130',
  border:   'rgba(255,255,255,0.07)',
  border2:  'rgba(255,255,255,0.12)',
  text:     '#f0eff4',
  text2:    '#9b99a8',
  text3:    '#5a5870',
  accent:   '#7c6af7',
  accentL:  '#a99cf9',
  accentD:  '#5548d9',
  teal:     '#2dd4bf',
  coral:    '#f87171',
  gold:     '#fbbf24',
  green:    '#34d399',
  pink:     '#f472b6',
  font:     "'Outfit', sans-serif",
  display:  "'Syne', sans-serif",
  mono:     "'Space Mono', monospace",
}

export default function EnrolledStudents({ isMobile, isTablet }) {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchEnrollments()
  }, [])

  const fetchEnrollments = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await enrollmentsAPI.getApproved()
      setEnrollments(res.data || [])
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to load enrolled students.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const getStudentName = (e) => {
    if (e.student_name) return e.student_name
    const parts = [e.first_name, e.last_name].filter(Boolean)
    return parts.length > 0 ? parts.join(' ') : '—'
  }

  const filtered = searchTerm
    ? enrollments.filter((e) => {
        const fullName = getStudentName(e).toLowerCase()
        const email = (e.email || '').toLowerCase()
        const course = (e.course_requested || '').toLowerCase()
        const schedule = (e.schedule_requested || '').toLowerCase()
        const program = (e.program_requested || '').toLowerCase()
        const paymentMethod = (e.payment_method || '').toLowerCase()
        const address = (e.student_address || '').toLowerCase()
        const contact = (e.contact_number || '').toLowerCase()
        const q = searchTerm.toLowerCase()
        return fullName.includes(q) || email.includes(q) || course.includes(q) ||
               schedule.includes(q) || program.includes(q) || paymentMethod.includes(q) ||
               address.includes(q) || contact.includes(q)
      })
    : enrollments

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return '—'
    return '₱' + Number(amount).toLocaleString()
  }

  const getStudentContact = (e) => {
    return e.contact_number || e.user_contact || '—'
  }

  const getStudentEmail = (e) => {
    return e.email || '—'
  }

  const getCourse = (e) => {
    return e.course_requested || e.course_name || '—'
  }

  const getSchedule = (e) => {
    return e.schedule_requested || '—'
  }

  const getProgram = (e) => {
    return e.program_requested || '—'
  }

  const getPaymentMethod = (e) => {
    return e.payment_method || '—'
  }

  const getTotalAmount = (e) => {
    return e.total_amount !== null && e.total_amount !== undefined ? e.total_amount : e.net_fee
  }

  const getAddress = (e) => {
    return e.student_address || e.address || '—'
  }

  const getEnrollmentDate = (e) => {
    return e.enrollment_date || e.created_at || null
  }

  const handleView = (student) => {
    setSelectedStudent(student)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedStudent(null)
  }

  return (
    <>
      <div style={{ animation: 'fadeUp 0.4s ease both' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: C.display, fontSize: isMobile ? '24px' : '30px', fontWeight: 800, color: C.text, letterSpacing: '-0.02em', margin: 0 }}>
            Enrolled Students
          </h1>
          <p style={{ color: C.text3, fontSize: '13px', fontFamily: C.font, marginTop: '4px' }}>
            View all students whose enrollment has been approved by the front desk.
          </p>
        </div>

        {/* Search & count bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '16px', flexWrap: 'wrap', gap: '10px'
        }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: C.text3, fontSize: '14px', pointerEvents: 'none' }}>⌕</span>
            <input
              type="text"
              placeholder="Search by name, email, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px 10px 36px',
                background: C.bg3, border: `1px solid ${C.border}`,
                borderRadius: '10px', color: C.text, fontFamily: C.font, fontSize: '13px',
                outline: 'none', transition: 'border .15s, box-shadow .15s',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(124,106,247,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,106,247,0.1)' }}
              onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none' }}
            />
          </div>
          <div style={{ fontSize: '13px', color: C.text2, fontFamily: C.font }}>
            <strong style={{ color: C.accentL }}>{filtered.length}</strong> of <strong>{enrollments.length}</strong> students
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.32)',
            borderRadius: '10px', padding: '12px 16px', color: C.coral, fontSize: '13px',
            fontFamily: C.font, marginBottom: '16px'
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: C.text3, fontFamily: C.font }}>
            <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.5, animation: 'spin 1s linear infinite' }}>◌</div>
            <div style={{ fontSize: '14px' }}>Loading enrolled students...</div>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div style={{
            background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px',
            overflow: 'hidden', animation: 'fadeUp 0.5s ease 0.1s both'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {['Student Name', 'Email', 'Contact', 'Course', 'Program', 'Schedule', 'Payment', 'Amount', 'Enrolled Date', 'Actions'].map((h) => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '14px 12px', fontSize: '10px', fontWeight: 700,
                        color: C.text3, fontFamily: C.font, textTransform: 'uppercase',
                        letterSpacing: '.08em', borderBottom: `1px solid ${C.border}`
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '60px 20px', color: C.text3, fontFamily: C.font }}>
                        <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.4 }}>📭</div>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: C.text2, marginBottom: '4px' }}>
                          {searchTerm ? 'No students match your search' : 'No enrolled students yet'}
                        </div>
                        <div style={{ fontSize: '12px' }}>
                          {searchTerm ? 'Try adjusting your search terms.' : 'Approved students will appear here.'}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((enrollment, i) => (
                      <tr key={enrollment.id || i} style={{
                        borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none',
                        transition: 'background 0.15s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 12px', fontSize: '13px', fontWeight: 600, color: C.text, fontFamily: C.font }}>
                          {getStudentName(enrollment)}
                        </td>
                        <td style={{ padding: '14px 12px', fontSize: '12px', color: C.text2, fontFamily: C.font }}>
                          {getStudentEmail(enrollment)}
                        </td>
                        <td style={{ padding: '14px 12px', fontSize: '12px', fontFamily: C.mono, color: C.text2 }}>
                          {getStudentContact(enrollment)}
                        </td>
                        <td style={{ padding: '14px 12px', fontSize: '12px', color: C.text, fontFamily: C.font }}>
                          {getCourse(enrollment)}
                        </td>
                        <td style={{ padding: '14px 12px', fontSize: '12px', color: C.text2, fontFamily: C.font }}>
                          {getProgram(enrollment)}
                        </td>
                        <td style={{ padding: '14px 12px', fontSize: '11px', color: C.text2, fontFamily: C.font, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          title={getSchedule(enrollment)}>
                          {getSchedule(enrollment)}
                        </td>
                        <td style={{ padding: '14px 12px', fontSize: '12px', color: C.text2, fontFamily: C.font }}>
                          {getPaymentMethod(enrollment)}
                        </td>
                        <td style={{ padding: '14px 12px', fontSize: '12px', fontFamily: C.mono, color: C.gold, fontWeight: 600 }}>
                          {formatAmount(getTotalAmount(enrollment))}
                        </td>
                        <td style={{ padding: '14px 12px', fontSize: '11px', color: C.text3, fontFamily: C.font }}>
                          {formatDate(getEnrollmentDate(enrollment))}
                        </td>
                        <td style={{ padding: '14px 12px' }}>
                          <button
                            onClick={() => handleView(enrollment)}
                            className="btn"
                            style={{
                              padding: '6px 12px', borderRadius: '8px', border: `1px solid ${C.border}`,
                              background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '11px',
                              fontFamily: C.font, fontWeight: 500, transition: 'all .15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accentL }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text2 }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {enrollments.length > 0 && (
              <div style={{
                padding: '12px 16px', borderTop: `1px solid ${C.border}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: '12px', color: C.text3, fontFamily: C.font
              }}>
                <span>Total: <strong style={{ color: C.text }}>{enrollments.length}</strong> enrolled students</span>
                <button
                  onClick={fetchEnrollments}
                  style={{
                    padding: '6px 14px', borderRadius: '8px', border: `1px solid ${C.border}`,
                    background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '12px',
                    fontFamily: C.font, transition: 'all .15s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.bg }}
                  onMouseLeave={e => { e.currentTarget.style.background = C.bg4 }}
                >
                  ↻ Refresh
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Student Profile Modal — rendered outside the animated wrapper to avoid transform/position conflicts */}
      {showModal && selectedStudent && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: C.display, fontSize: '20px', fontWeight: 700, color: C.text }}>Student Profile</h2>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: C.text2, fontSize: '24px', cursor: 'pointer', padding: '4px' }}>×</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: `linear-gradient(135deg, ${C.accent}, ${C.pink})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, color: '#fff', fontFamily: C.font }}>
                {getStudentName(selectedStudent).split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: C.text, fontFamily: C.font }}>{getStudentName(selectedStudent)}</div>
                <div style={{ fontSize: '14px', color: C.text2, fontFamily: C.font }}>{getStudentEmail(selectedStudent)}</div>
                <div style={{ fontSize: '12px', color: C.text3, fontFamily: C.mono, marginTop: '2px' }}>{getStudentContact(selectedStudent)}</div>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, marginBottom: '8px' }}>Personal Information</div>
              <div style={{ display: 'grid', gap: '8px' }}>
                <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Address:</span>
                  <span style={{ fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '8px' }}>{getAddress(selectedStudent)}</span>
                </div>
                <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Age:</span>
                  <span style={{ fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '8px' }}>N/A</span>
                </div>
                <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Emergency Contact:</span>
                  <span style={{ fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '8px' }}>N/A</span>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, marginBottom: '8px' }}>Enrollment Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' }}>
                <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Course:</span>
                  <span style={{ fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{getCourse(selectedStudent)}</span>
                </div>
                <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Program:</span>
                  <span style={{ fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{getProgram(selectedStudent)}</span>
                </div>
                <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Instructor:</span>
                  <span style={{ fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{selectedStudent.instructor_requested || 'N/A'}</span>
                </div>
                <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Payment:</span>
                  <span style={{ fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{getPaymentMethod(selectedStudent)}</span>
                </div>
                <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Amount:</span>
                  <span style={{ fontSize: '13px', fontFamily: C.mono, color: C.gold, fontWeight: 600, marginLeft: '4px' }}>{formatAmount(getTotalAmount(selectedStudent))}</span>
                </div>
                <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Enrolled:</span>
                  <span style={{ fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{formatDate(getEnrollmentDate(selectedStudent))}</span>
                </div>
              </div>
              <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}`, marginTop: '8px' }}>
                <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Schedule:</span>
                <span
                  style={{
                    fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '4px',
                    whiteSpace: 'pre-line', display: 'block', marginTop: '4px', lineHeight: 1.7,
                  }}
                >
                  {getSchedule(selectedStudent)}
                </span>
              </div>
              <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}`, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Status:</span>
                <span
                  style={{
                    background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)',
                    color: C.green, fontSize: '11px', fontWeight: 700, padding: '4px 12px',
                    borderRadius: '20px', letterSpacing: '1px', textTransform: 'uppercase',
                  }}
                >
                  ✅ Approved
                </span>
              </div>
            </div>
            <button onClick={handleCloseModal} className="btn" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '13px', fontFamily: C.font, fontWeight: 500 }}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
