import { useState } from 'react'

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
  mono: '"Space Mono", monospace',
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(124,106,247,0.3); border-radius: 4px; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .card { animation: fadeUp 0.4s ease both; transition: all 0.2s ease; }
  .card:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,0.35); }
  .btn { transition: all 0.15s ease; }
  .btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
  .row { transition: background 0.15s ease; }
  .row:hover { background: rgba(255,255,255,0.03); }
`

function StudentCard({ student, onApprove, onReject, onView }) {
  const statusColors = {
    pending: { bg: 'rgba(251,191,36,0.12)', c: C.gold, label: 'Pending' },
    approved: { bg: 'rgba(52,211,153,0.12)', c: C.green, label: 'Approved' },
    rejected: { bg: 'rgba(248,113,113,0.12)', c: C.coral, label: 'Rejected' },
  }
  const sc = statusColors[student.status]

  return (
    <div className="card row" style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `linear-gradient(135deg, ${C.accent}, ${C.pink})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: '#fff', fontFamily: C.font }}>
            {student.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: C.text, fontFamily: C.font }}>{student.name}</div>
            <div style={{ fontSize: '12px', color: C.text2, fontFamily: C.font }}>{student.email}</div>
            <div style={{ fontSize: '11px', color: C.text3, fontFamily: C.mono, marginTop: '2px' }}>{student.phone}</div>
          </div>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 700, color: sc.c, background: sc.bg, padding: '4px 10px', borderRadius: '20px', fontFamily: C.font, letterSpacing: '.05em' }}>{sc.label}</span>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, marginBottom: '8px' }}>Enrollment Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Course:</span>
            <span style={{ fontSize: '12px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{student.course}</span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Level:</span>
            <span style={{ fontSize: '12px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{student.level}</span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Package:</span>
            <span style={{ fontSize: '12px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{student.package}</span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Submitted:</span>
            <span style={{ fontSize: '12px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{student.submitted}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => onView(student)} className="btn" style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 500 }}>
          View Details
        </button>
        {student.status === 'pending' && (
          <>
            <button onClick={() => onApprove(student.id)} className="btn" style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${C.green}, '#059669')`, color: '#fff', cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 600 }}>
              Approve
            </button>
            <button onClick={() => onReject(student.id)} className="btn" style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: `1px solid rgba(248,113,113,0.3)`, background: 'rgba(248,113,113,0.1)', color: C.coral, cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 500 }}>
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function StudentApproval({ isMobile, isTablet }) {
  const [filter, setFilter] = useState('all')
  const [students, setStudents] = useState([
    { id: 1, name: 'Maria Santos', email: 'maria.s@email.com', phone: '0917-123-4567', course: 'Guitar', level: 'Beginner', package: 'Monthly (8 sessions)', status: 'pending', submitted: '2 hours ago', address: '123 Main St, Manila', age: 25, emergencyContact: 'Juan Santos - 0917-111-2222' },
    { id: 2, name: 'John Reyes', email: 'john.reyes@email.com', phone: '0928-234-5678', course: 'Piano', level: 'Intermediate', package: 'Quarterly (24 sessions)', status: 'pending', submitted: '5 hours ago', address: '456 Oak Ave, Quezon City', age: 30, emergencyContact: 'Maria Reyes - 0928-333-4444' },
    { id: 3, name: 'Ana Cruz', email: 'ana.cruz@email.com', phone: '0935-345-6789', course: 'Voice', level: 'Beginner', package: 'Monthly (8 sessions)', status: 'approved', submitted: 'Yesterday', address: '789 Pine Rd, Makati', age: 22, emergencyContact: 'Pedro Cruz - 0935-555-6666' },
    { id: 4, name: 'Carlos Tan', email: 'carlos.tan@email.com', phone: '0912-456-7890', course: 'Drums', level: 'Beginner', package: 'Monthly (8 sessions)', status: 'pending', submitted: 'Yesterday', address: '321 Elm St, Pasig', age: 28, emergencyContact: 'Linda Tan - 0912-777-8888' },
    { id: 5, name: 'Sofia Del', email: 'sofia.del@email.com', phone: '0945-567-8901', course: 'Violin', level: 'Advanced', package: 'Quarterly (24 sessions)', status: 'rejected', submitted: '2 days ago', address: '654 Maple Dr, Taguig', age: 35, emergencyContact: 'Rico Del - 0945-999-0000' },
  ])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const filteredStudents = filter === 'all' ? students : students.filter(s => s.status === filter)

  const handleApprove = (id) => {
    setStudents(students.map(s => s.id === id ? { ...s, status: 'approved' } : s))
  }

  const handleReject = (id) => {
    setStudents(students.map(s => s.id === id ? { ...s, status: 'rejected' } : s))
  }

  const handleView = (student) => {
    setSelectedStudent(student)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedStudent(null)
  }

  const cols = isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)'

  return (
    <>
      <style>{css}</style>
      <div style={{ fontFamily: C.font }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: C.display, fontSize: isMobile ? '24px' : '30px', fontWeight: 800, color: C.text, letterSpacing: '-0.02em', marginBottom: '8px' }}>Student Approval</h1>
          <p style={{ color: C.text3, fontSize: '13px' }}>Review student registration requests and enrollment data</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="btn"
              style={{
                padding: '8px 16px', borderRadius: '20px', border: `1px solid ${filter === f ? C.accent : C.border}`,
                background: filter === f ? 'rgba(124,106,247,0.15)' : C.bg3,
                color: filter === f ? C.accentL : C.text2,
                cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 500, textTransform: 'capitalize',
              }}
            >
              {f} ({f === 'all' ? students.length : students.filter(s => s.status === f).length})
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: cols, gap: '14px' }}>
          {filteredStudents.map(student => (
            <StudentCard
              key={student.id}
              student={student}
              onApprove={handleApprove}
              onReject={handleReject}
              onView={handleView}
            />
          ))}
        </div>

        {showModal && selectedStudent && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: C.display, fontSize: '20px', fontWeight: 700, color: C.text }}>Student Profile</h2>
                <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: C.text2, fontSize: '24px', cursor: 'pointer', padding: '4px' }}>×</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: `linear-gradient(135deg, ${C.accent}, ${C.pink})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, color: '#fff', fontFamily: C.font }}>
                  {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: C.text, fontFamily: C.font }}>{selectedStudent.name}</div>
                  <div style={{ fontSize: '14px', color: C.text2, fontFamily: C.font }}>{selectedStudent.email}</div>
                  <div style={{ fontSize: '12px', color: C.text3, fontFamily: C.mono, marginTop: '2px' }}>{selectedStudent.phone}</div>
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, marginBottom: '8px' }}>Personal Information</div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Age:</span>
                    <span style={{ fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '8px' }}>{selectedStudent.age}</span>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Address:</span>
                    <span style={{ fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '8px' }}>{selectedStudent.address}</span>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Emergency Contact:</span>
                    <span style={{ fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '8px' }}>{selectedStudent.emergencyContact}</span>
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, marginBottom: '8px' }}>Enrollment Details</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' }}>
                  <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Course:</span>
                    <span style={{ fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{selectedStudent.course}</span>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Level:</span>
                    <span style={{ fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{selectedStudent.level}</span>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Package:</span>
                    <span style={{ fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{selectedStudent.package}</span>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Submitted:</span>
                    <span style={{ fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '4px' }}>{selectedStudent.submitted}</span>
                  </div>
                </div>
              </div>
              <button onClick={handleCloseModal} className="btn" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '13px', fontFamily: C.font, fontWeight: 500 }}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

