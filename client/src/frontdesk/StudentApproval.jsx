import { useState } from 'react'
import C from '../admin/theme.js'

export default function StudentApproval({ isMobile, isTablet }) {
  const [filter, setFilter] = useState('all')
  const [students, setStudents] = useState([
    { id: 1, name: 'Maria Santos', email: 'maria@email.com', phone: '0917-123-4567', course: 'Guitar', level: 'Beginner', package: 'Standard', status: 'pending', submitted: 'Mar 10, 2026', age: '22', address: '123 Rizal St., Manila', emergency_contact: '0917-111-2222', instructor: 'Mr. Cruz', schedule: 'Mon 9AM', total_amount: '4000', payment_method: 'GCash', payment_reference: 'GCASH-123' },
    { id: 2, name: 'John Reyes', email: 'john@email.com', phone: '0928-234-5678', course: 'Piano', level: 'Intermediate', package: 'Premium', status: 'pending', submitted: 'Mar 9, 2026', age: '25', address: '456 Mabini St., QC', emergency_contact: '0928-222-3333', instructor: 'Ms. Lim', schedule: 'Tue 10AM', total_amount: '6000', payment_method: 'Cash', payment_reference: 'N/A' },
    { id: 3, name: 'Ana Cruz', email: 'ana@email.com', phone: '0935-345-6789', course: 'Voice', level: 'Beginner', package: 'Standard', status: 'approved', submitted: 'Mar 8, 2026', age: '19', address: '789 Luna St., Makati', emergency_contact: '0935-333-4444', instructor: 'Mr. Cruz', schedule: 'Wed 11AM', total_amount: '4000', payment_method: 'Maya', payment_reference: 'MAYA-456' },
    { id: 4, name: 'Carlos Tan', email: 'carlos@email.com', phone: '0912-456-7890', course: 'Drums', level: 'Beginner', package: 'Standard', status: 'rejected', submitted: 'Mar 7, 2026', age: '28', address: '321 Bonifacio St., BGC', emergency_contact: '0912-444-5555', instructor: 'Mr. Bautista', schedule: 'Thu 1PM', total_amount: '5000', payment_method: 'Bank Transfer', payment_reference: 'BANK-789' },
  ])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [actionMsg, setActionMsg] = useState('')

  const filteredStudents = filter === 'all' ? students : students.filter(s => s.status === filter)

  const handleApprove = (id) => {
    setStudents(students.map(s => s.id === id ? { ...s, status: 'approved' } : s))
    setActionMsg('Enrollment approved successfully')
    setTimeout(() => setActionMsg(''), 3000)
  }

  const handleReject = (id) => {
    setStudents(students.map(s => s.id === id ? { ...s, status: 'rejected' } : s))
    setActionMsg('Enrollment rejected successfully')
    setTimeout(() => setActionMsg(''), 3000)
  }

  const handleView = (student) => {
    setSelectedStudent(student)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedStudent(null)
  }

  const statusColors = {
    pending: { bg: 'rgba(245,158,11,0.1)', c: C.gold, label: 'Pending' },
    approved: { bg: 'rgba(16,185,129,0.1)', c: C.green, label: 'Approved' },
    rejected: { bg: 'rgba(248,113,113,0.1)', c: C.coral, label: 'Rejected' },
  }

  const cols = isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)'

  return (
    <div style={{ fontFamily: C.font }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: C.display, fontSize: '1.3rem', fontWeight: 700, color: C.navy, margin: '0 0 4px' }}>Student Approval</h2>
        <p style={{ fontSize: '0.8rem', color: C.text3, margin: 0 }}>Review student registration requests and enrollment data</p>
      </div>

      {actionMsg && (
        <div style={{ padding: '10px 16px', marginBottom: 16, borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: C.green, fontSize: '0.82rem', fontFamily: C.font, fontWeight: 500 }}>
          {actionMsg}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px', borderRadius: 20, border: `1px solid ${filter === f ? C.royal : C.border2}`,
              background: filter === f ? 'rgba(37,99,235,0.08)' : '#fff',
              color: filter === f ? C.royal : C.text2,
              cursor: 'pointer', fontSize: '0.78rem', fontFamily: C.font, fontWeight: 500, textTransform: 'capitalize',
              transition: 'all 0.15s ease',
            }}
          >
            {f} ({f === 'all' ? students.length : students.filter(s => s.status === f).length})
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 14 }}>
        {filteredStudents.map(student => {
          const sc = statusColors[student.status]
          return (
            <div key={student.id} style={{
              background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`,
              padding: '1.2rem', boxShadow: '0 4px 12px rgba(30,41,59,0.04)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(30,41,59,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(30,41,59,0.04)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `linear-gradient(135deg, ${C.royal}, ${C.purple})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: C.font,
                  }}>
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: C.navy, fontFamily: C.font }}>{student.name}</div>
                    <div style={{ fontSize: '0.75rem', color: C.text2, fontFamily: C.font }}>{student.email}</div>
                    <div style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font, marginTop: 2 }}>{student.phone}</div>
                  </div>
                </div>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 700, color: sc.c,
                  background: sc.bg, padding: '4px 10px', borderRadius: 20,
                  fontFamily: C.font, letterSpacing: '.05em',
                }}>{sc.label}</span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, marginBottom: 8 }}>Enrollment Details</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                  <div><span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Course:</span><span style={{ fontSize: '0.75rem', color: C.text, fontFamily: C.font, marginLeft: 4 }}>{student.course}</span></div>
                  <div><span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Level:</span><span style={{ fontSize: '0.75rem', color: C.text, fontFamily: C.font, marginLeft: 4 }}>{student.level}</span></div>
                  <div><span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Package:</span><span style={{ fontSize: '0.75rem', color: C.text, fontFamily: C.font, marginLeft: 4 }}>{student.package}</span></div>
                  <div><span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Submitted:</span><span style={{ fontSize: '0.75rem', color: C.text, fontFamily: C.font, marginLeft: 4 }}>{student.submitted}</span></div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleView(student)} style={{
                  flex: 1, padding: '8px 12px', borderRadius: 10,
                  border: `1px solid ${C.border2}`, background: '#fff',
                  color: C.text2, cursor: 'pointer', fontSize: '0.75rem',
                  fontFamily: C.font, fontWeight: 500, transition: 'all 0.15s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.royal; e.currentTarget.style.color = C.royal }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border2; e.currentTarget.style.color = C.text2 }}
                >
                  View Details
                </button>
                {student.status === 'pending' && (
                  <>
                    <button onClick={() => handleApprove(student.id)} style={{
                      flex: 1, padding: '8px 12px', borderRadius: 10, border: 'none',
                      background: `linear-gradient(135deg, ${C.green}, #059669)`,
                      color: '#fff', cursor: 'pointer', fontSize: '0.75rem',
                      fontFamily: C.font, fontWeight: 600,
                    }}>Approve</button>
                    <button onClick={() => handleReject(student.id)} style={{
                      flex: 1, padding: '8px 12px', borderRadius: 10,
                      border: `1px solid rgba(248,113,113,0.3)`,
                      background: 'rgba(248,113,113,0.08)', color: C.coral,
                      cursor: 'pointer', fontSize: '0.75rem', fontFamily: C.font, fontWeight: 500,
                    }}>Reject</button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showModal && selectedStudent && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, padding: 24,
            maxWidth: 500, width: '100%', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 24px 64px rgba(15,23,42,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: C.display, fontSize: '1.2rem', fontWeight: 700, color: C.navy, margin: 0 }}>Student Profile</h2>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: C.text3, fontSize: '1.5rem', cursor: 'pointer', padding: '0 4px' }}>×</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: `linear-gradient(135deg, ${C.royal}, ${C.purple})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 700, color: '#fff', fontFamily: C.font,
              }}>
                {selectedStudent.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: C.navy, fontFamily: C.font }}>{selectedStudent.name}</div>
                <div style={{ fontSize: '0.85rem', color: C.text2, fontFamily: C.font }}>{selectedStudent.email}</div>
                <div style={{ fontSize: '0.75rem', color: C.text3, fontFamily: C.font, marginTop: 2 }}>{selectedStudent.phone}</div>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, marginBottom: 8 }}>Personal Information</div>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ padding: 12, borderRadius: 10, background: C.mist, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Age:</span>
                  <span style={{ fontSize: '0.82rem', color: C.text, fontFamily: C.font, marginLeft: 8 }}>{selectedStudent.age}</span>
                </div>
                <div style={{ padding: 12, borderRadius: 10, background: C.mist, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Address:</span>
                  <span style={{ fontSize: '0.82rem', color: C.text, fontFamily: C.font, marginLeft: 8 }}>{selectedStudent.address}</span>
                </div>
                <div style={{ padding: 12, borderRadius: 10, background: C.mist, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Emergency Contact:</span>
                  <span style={{ fontSize: '0.82rem', color: C.text, fontFamily: C.font, marginLeft: 8 }}>{selectedStudent.emergency_contact}</span>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, marginBottom: 8 }}>Enrollment Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                <div style={{ padding: 12, borderRadius: 10, background: C.mist, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Course:</span>
                  <span style={{ fontSize: '0.82rem', color: C.text, fontFamily: C.font, marginLeft: 4 }}>{selectedStudent.course}</span>
                </div>
                <div style={{ padding: 12, borderRadius: 10, background: C.mist, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Level:</span>
                  <span style={{ fontSize: '0.82rem', color: C.text, fontFamily: C.font, marginLeft: 4 }}>{selectedStudent.level}</span>
                </div>
                <div style={{ padding: 12, borderRadius: 10, background: C.mist, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Package:</span>
                  <span style={{ fontSize: '0.82rem', color: C.text, fontFamily: C.font, marginLeft: 4 }}>{selectedStudent.package}</span>
                </div>
                <div style={{ padding: 12, borderRadius: 10, background: C.mist, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Submitted:</span>
                  <span style={{ fontSize: '0.82rem', color: C.text, fontFamily: C.font, marginLeft: 4 }}>{selectedStudent.submitted}</span>
                </div>
                <div style={{ padding: 12, borderRadius: 10, background: C.mist, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Instructor:</span>
                  <span style={{ fontSize: '0.82rem', color: C.text, fontFamily: C.font, marginLeft: 4 }}>{selectedStudent.instructor}</span>
                </div>
                <div style={{ padding: 12, borderRadius: 10, background: C.mist, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Schedule:</span>
                  <span style={{ fontSize: '0.82rem', color: C.text, fontFamily: C.font, marginLeft: 4 }}>{selectedStudent.schedule}</span>
                </div>
                <div style={{ padding: 12, borderRadius: 10, background: C.mist, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Total Amount:</span>
                  <span style={{ fontSize: '0.82rem', color: C.teal, fontFamily: C.font, fontWeight: 600, marginLeft: 4 }}>₱{Number(selectedStudent.total_amount).toLocaleString()}</span>
                </div>
                <div style={{ padding: 12, borderRadius: 10, background: C.mist, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Payment Method:</span>
                  <span style={{ fontSize: '0.82rem', color: C.text, fontFamily: C.font, marginLeft: 4 }}>{selectedStudent.payment_method}</span>
                </div>
              </div>
            </div>
            <button onClick={handleCloseModal} style={{
              width: '100%', padding: '10px', borderRadius: 10,
              border: `1px solid ${C.border2}`, background: '#fff',
              color: C.text2, cursor: 'pointer', fontSize: '0.82rem',
              fontFamily: C.font, fontWeight: 500,
            }}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}