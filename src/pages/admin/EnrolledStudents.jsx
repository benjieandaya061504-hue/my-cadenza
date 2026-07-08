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

  const filtered = searchTerm
    ? enrollments.filter((e) => {
        const name = e.student_name || e.first_name || ''
        const email = e.email || ''
        const course = e.course_requested || ''
        const q = searchTerm.toLowerCase()
        return name.toLowerCase().includes(q) || email.toLowerCase().includes(q) || course.toLowerCase().includes(q)
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

  const getStudentName = (e) => {
    if (e.student_name) return e.student_name
    const parts = [e.first_name, e.last_name].filter(Boolean)
    return parts.length > 0 ? parts.join(' ') : '—'
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

  return (
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
                  {['Student Name', 'Email', 'Contact', 'Course', 'Program', 'Schedule', 'Payment', 'Amount', 'Enrolled Date'].map((h) => (
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
                    <td colSpan={9} style={{ textAlign: 'center', padding: '60px 20px', color: C.text3, fontFamily: C.font }}>
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
                    <tr key={enrollment.enrollment_id || i} style={{
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
  )
}