import { useState } from 'react'
import C from '../admin/theme.js'

export default function InstructorAvailability({ isMobile, isTablet }) {
  const [filter, setFilter] = useState('all')
  const [instructors, setInstructors] = useState([
    { id: 1, name: 'Mr. Cruz', specialization: 'Guitar, Piano', status: 'pending', schedule: ['Mon 9AM-12PM', 'Wed 2PM-6PM', 'Fri 10AM-3PM'], email: 'cruz@cadenza.edu', phone: '0917-123-4567' },
    { id: 2, name: 'Ms. Lim', specialization: 'Piano, Voice', status: 'approved', schedule: ['Tue 10AM-2PM', 'Thu 3PM-7PM', 'Sat 9AM-1PM'], email: 'lim@cadenza.edu', phone: '0918-234-5678' },
    { id: 3, name: 'Mr. Bautista', specialization: 'Drums, Percussion', status: 'pending', schedule: ['Mon 1PM-5PM', 'Wed 9AM-1PM', 'Fri 4PM-8PM'], email: 'bautista@cadenza.edu', phone: '0919-345-6789' },
    { id: 4, name: 'Ms. Reyes', specialization: 'Violin, Cello', status: 'approved', schedule: ['Tue 3PM-7PM', 'Thu 10AM-2PM', 'Sat 2PM-6PM'], email: 'reyes@cadenza.edu', phone: '0920-456-7890' },
    { id: 5, name: 'Mr. Santos', specialization: 'Guitar, Bass', status: 'pending', schedule: ['Mon 2PM-6PM', 'Wed 11AM-3PM', 'Fri 9AM-1PM'], email: 'santos@cadenza.edu', phone: '0921-567-8901' },
    { id: 6, name: 'Ms. Garcia', specialization: 'Voice, Choir', status: 'rejected', schedule: ['Tue 9AM-12PM', 'Thu 1PM-4PM', 'Sat 10AM-2PM'], email: 'garcia@cadenza.edu', phone: '0922-678-9012' },
  ])
  const [selectedInstructor, setSelectedInstructor] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const filteredInstructors = filter === 'all' ? instructors : instructors.filter(i => i.status === filter)

  const handleApprove = (id) => {
    setInstructors(instructors.map(i => i.id === id ? { ...i, status: 'approved' } : i))
  }

  const handleReject = (id) => {
    setInstructors(instructors.map(i => i.id === id ? { ...i, status: 'rejected' } : i))
  }

  const handleView = (instructor) => {
    setSelectedInstructor(instructor)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedInstructor(null)
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
        <h2 style={{ fontFamily: C.display, fontSize: '1.3rem', fontWeight: 700, color: C.navy, margin: '0 0 4px' }}>Instructor Availability</h2>
        <p style={{ fontSize: '0.8rem', color: C.text3, margin: 0 }}>Review and manage instructor-submitted availability schedules</p>
      </div>

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
            {f} ({f === 'all' ? instructors.length : instructors.filter(i => i.status === f).length})
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 14 }}>
        {filteredInstructors.map(instructor => {
          const sc = statusColors[instructor.status]
          return (
            <div key={instructor.id} style={{
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
                    {instructor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: C.navy, fontFamily: C.font }}>{instructor.name}</div>
                    <div style={{ fontSize: '0.75rem', color: C.text2, fontFamily: C.font }}>{instructor.specialization}</div>
                  </div>
                </div>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 700, color: sc.c,
                  background: sc.bg, padding: '4px 10px', borderRadius: 20,
                  fontFamily: C.font, letterSpacing: '.05em',
                }}>{sc.label}</span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, marginBottom: 8 }}>Proposed Schedule</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {instructor.schedule.map((slot, i) => (
                    <span key={i} style={{
                      fontSize: '0.7rem', color: C.text2, background: C.mist,
                      padding: '4px 10px', borderRadius: 8, fontFamily: C.font,
                    }}>{slot}</span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleView(instructor)} style={{
                  flex: 1, padding: '8px 12px', borderRadius: 10,
                  border: `1px solid ${C.border2}`, background: '#fff',
                  color: C.text2, cursor: 'pointer', fontSize: '0.75rem',
                  fontFamily: C.font, fontWeight: 500, transition: 'all 0.15s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.royal; e.currentTarget.style.color = C.royal }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border2; e.currentTarget.style.color = C.text2 }}
                >
                  View Profile
                </button>
                {instructor.status === 'pending' && (
                  <>
                    <button onClick={() => handleApprove(instructor.id)} style={{
                      flex: 1, padding: '8px 12px', borderRadius: 10, border: 'none',
                      background: `linear-gradient(135deg, ${C.green}, #059669)`,
                      color: '#fff', cursor: 'pointer', fontSize: '0.75rem',
                      fontFamily: C.font, fontWeight: 600,
                    }}>Approve</button>
                    <button onClick={() => handleReject(instructor.id)} style={{
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

      {showModal && selectedInstructor && (
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
              <h2 style={{ fontFamily: C.display, fontSize: '1.2rem', fontWeight: 700, color: C.navy, margin: 0 }}>Instructor Profile</h2>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: C.text3, fontSize: '1.5rem', cursor: 'pointer', padding: '0 4px' }}>×</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: `linear-gradient(135deg, ${C.royal}, ${C.purple})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 700, color: '#fff', fontFamily: C.font,
              }}>
                {selectedInstructor.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: C.navy, fontFamily: C.font }}>{selectedInstructor.name}</div>
                <div style={{ fontSize: '0.85rem', color: C.text2, fontFamily: C.font }}>{selectedInstructor.specialization}</div>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, marginBottom: 8 }}>Contact Information</div>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ padding: 12, borderRadius: 10, background: C.mist, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Email:</span>
                  <span style={{ fontSize: '0.82rem', color: C.text, fontFamily: C.font, marginLeft: 8 }}>{selectedInstructor.email}</span>
                </div>
                <div style={{ padding: 12, borderRadius: 10, background: C.mist, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Phone:</span>
                  <span style={{ fontSize: '0.82rem', color: C.text, fontFamily: C.font, marginLeft: 8 }}>{selectedInstructor.phone}</span>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, marginBottom: 8 }}>Proposed Schedule</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {selectedInstructor.schedule.map((slot, i) => (
                  <span key={i} style={{
                    fontSize: '0.75rem', color: C.text2, background: C.mist,
                    padding: '6px 12px', borderRadius: 8, fontFamily: C.font,
                  }}>{slot}</span>
                ))}
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