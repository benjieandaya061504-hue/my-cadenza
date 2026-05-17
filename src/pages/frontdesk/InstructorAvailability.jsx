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
`

function InstructorCard({ instructor, onApprove, onReject, onView }) {
  const statusColors = {
    pending: { bg: 'rgba(251,191,36,0.12)', c: C.gold, label: 'Pending' },
    approved: { bg: 'rgba(52,211,153,0.12)', c: C.green, label: 'Approved' },
    rejected: { bg: 'rgba(248,113,113,0.12)', c: C.coral, label: 'Rejected' },
  }
  const sc = statusColors[instructor.status]

  return (
    <div className="card" style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `linear-gradient(135deg, ${C.accent}, ${C.pink})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: '#fff', fontFamily: C.font }}>
            {instructor.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: C.text, fontFamily: C.font }}>{instructor.name}</div>
            <div style={{ fontSize: '12px', color: C.text2, fontFamily: C.font }}>{instructor.specialization}</div>
          </div>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 700, color: sc.c, background: sc.bg, padding: '4px 10px', borderRadius: '20px', fontFamily: C.font, letterSpacing: '.05em' }}>{sc.label}</span>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, marginBottom: '8px' }}>Proposed Schedule</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {instructor.schedule.map((slot, i) => (
            <span key={i} style={{ fontSize: '11px', color: C.text2, background: C.bg4, padding: '4px 10px', borderRadius: '8px', fontFamily: C.mono }}>{slot}</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => onView(instructor)} className="btn" style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 500 }}>
          View Profile
        </button>
        {instructor.status === 'pending' && (
          <>
            <button onClick={() => onApprove(instructor.id)} className="btn" style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${C.green}, '#059669')`, color: '#fff', cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 600 }}>
              Approve
            </button>
            <button onClick={() => onReject(instructor.id)} className="btn" style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: `1px solid rgba(248,113,113,0.3)`, background: 'rgba(248,113,113,0.1)', color: C.coral, cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 500 }}>
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  )
}

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

  const cols = isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)'

  return (
    <>
      <style>{css}</style>
      <div style={{ fontFamily: C.font }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: C.display, fontSize: isMobile ? '24px' : '30px', fontWeight: 800, color: C.text, letterSpacing: '-0.02em', marginBottom: '8px' }}>Instructor Availability</h1>
          <p style={{ color: C.text3, fontSize: '13px' }}>Review and manage instructor-submitted availability schedules</p>
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
              {f} ({f === 'all' ? instructors.length : instructors.filter(i => i.status === f).length})
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: cols, gap: '14px' }}>
          {filteredInstructors.map(instructor => (
            <InstructorCard
              key={instructor.id}
              instructor={instructor}
              onApprove={handleApprove}
              onReject={handleReject}
              onView={handleView}
            />
          ))}
        </div>

        {showModal && selectedInstructor && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: C.display, fontSize: '20px', fontWeight: 700, color: C.text }}>Instructor Profile</h2>
                <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: C.text2, fontSize: '24px', cursor: 'pointer', padding: '4px' }}>×</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: `linear-gradient(135deg, ${C.accent}, ${C.pink})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, color: '#fff', fontFamily: C.font }}>
                  {selectedInstructor.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: C.text, fontFamily: C.font }}>{selectedInstructor.name}</div>
                  <div style={{ fontSize: '14px', color: C.text2, fontFamily: C.font }}>{selectedInstructor.specialization}</div>
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, marginBottom: '8px' }}>Contact Information</div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Email:</span>
                    <span style={{ fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '8px' }}>{selectedInstructor.email}</span>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Phone:</span>
                    <span style={{ fontSize: '13px', color: C.text, fontFamily: C.font, marginLeft: '8px' }}>{selectedInstructor.phone}</span>
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, marginBottom: '8px' }}>Proposed Schedule</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedInstructor.schedule.map((slot, i) => (
                    <span key={i} style={{ fontSize: '12px', color: C.text2, background: C.bg4, padding: '6px 12px', borderRadius: '8px', fontFamily: C.mono }}>{slot}</span>
                  ))}
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

