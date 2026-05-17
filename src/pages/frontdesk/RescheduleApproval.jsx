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

function RescheduleCard({ request, onApprove, onReject, onModify }) {
  const statusColors = {
    pending: { bg: 'rgba(251,191,36,0.12)', c: C.gold, label: 'Pending' },
    approved: { bg: 'rgba(52,211,153,0.12)', c: C.green, label: 'Approved' },
    rejected: { bg: 'rgba(248,113,113,0.12)', c: C.coral, label: 'Rejected' },
  }
  const sc = statusColors[request.status]

  return (
    <div className="card row" style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: C.text, fontFamily: C.font }}>{request.student}</div>
          <div style={{ fontSize: '12px', color: C.text2, fontFamily: C.font }}>{request.instructor}</div>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 700, color: sc.c, background: sc.bg, padding: '4px 10px', borderRadius: '20px', fontFamily: C.font, letterSpacing: '.05em' }}>{sc.label}</span>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, marginBottom: '8px' }}>Schedule Change</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: '10px', color: C.text3, fontFamily: C.font, marginBottom: '4px' }}>Original</div>
            <div style={{ fontSize: '13px', color: C.text, fontFamily: C.mono, fontWeight: 600 }}>{request.originalTime}</div>
            <div style={{ fontSize: '11px', color: C.text2, fontFamily: C.font }}>{request.originalRoom}</div>
          </div>
          <div style={{ padding: '12px', borderRadius: '10px', background: `rgba(124,106,247,0.1)`, border: `1px solid rgba(124,106,247,0.25)` }}>
            <div style={{ fontSize: '10px', color: C.accentL, fontFamily: C.font, marginBottom: '4px' }}>Requested</div>
            <div style={{ fontSize: '13px', color: C.text, fontFamily: C.mono, fontWeight: 600 }}>{request.requestedTime}</div>
            <div style={{ fontSize: '11px', color: C.text2, fontFamily: C.font }}>{request.requestedRoom}</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: C.text3, fontFamily: C.font, marginBottom: '4px' }}>Reason: {request.reason}</div>
        <div style={{ fontSize: '11px', color: C.text3, fontFamily: C.font }}>Requested: {request.requested}</div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        {request.status === 'pending' && (
          <>
            <button onClick={() => onApprove(request.id)} className="btn" style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${C.green}, '#059669')`, color: '#fff', cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 600 }}>
              Approve
            </button>
            <button onClick={() => onModify(request.id)} className="btn" style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 500 }}>
              Modify
            </button>
            <button onClick={() => onReject(request.id)} className="btn" style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: `1px solid rgba(248,113,113,0.3)`, background: 'rgba(248,113,113,0.1)', color: C.coral, cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 500 }}>
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function RescheduleApproval({ isMobile, isTablet }) {
  const [filter, setFilter] = useState('all')
  const [requests, setRequests] = useState([
    { id: 1, student: 'Ana Reyes', instructor: 'Mr. Cruz', originalTime: 'Mon 10:00 AM', originalRoom: 'Studio A', requestedTime: 'Tue 2:00 PM', requestedRoom: 'Studio B', reason: 'Work conflict', status: 'pending', requested: '2 hours ago' },
    { id: 2, student: 'Marco Santos', instructor: 'Ms. Lim', originalTime: 'Wed 3:00 PM', originalRoom: 'Studio B', requestedTime: 'Thu 4:00 PM', requestedRoom: 'Studio B', reason: 'Family emergency', status: 'pending', requested: '5 hours ago' },
    { id: 3, student: 'Pia Gomez', instructor: 'Mr. Cruz', originalTime: 'Fri 11:00 AM', originalRoom: 'Studio A', requestedTime: 'Sat 10:00 AM', requestedRoom: 'Studio A', reason: 'School event', status: 'approved', requested: 'Yesterday' },
    { id: 4, student: 'Luis Tan', instructor: 'Ms. Reyes', originalTime: 'Mon 1:00 PM', originalRoom: 'Studio C', requestedTime: 'Mon 3:00 PM', requestedRoom: 'Studio C', reason: 'Doctor appointment', status: 'pending', requested: 'Yesterday' },
  ])
  const [showModifyModal, setShowModifyModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [newTime, setNewTime] = useState('')
  const [newRoom, setNewRoom] = useState('')

  const filteredRequests = filter === 'all' ? requests : requests.filter(r => r.status === filter)

  const handleApprove = (id) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'approved' } : r))
  }

  const handleReject = (id) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'rejected' } : r))
  }

  const handleModify = (id) => {
    const request = requests.find(r => r.id === id)
    setSelectedRequest(request)
    setNewTime(request.requestedTime)
    setNewRoom(request.requestedRoom)
    setShowModifyModal(true)
  }

  const handleSaveModify = () => {
    setRequests(requests.map(r => r.id === selectedRequest.id ? { ...r, requestedTime: newTime, requestedRoom: newRoom } : r))
    setShowModifyModal(false)
    setSelectedRequest(null)
    setNewTime('')
    setNewRoom('')
  }

  const handleCloseModifyModal = () => {
    setShowModifyModal(false)
    setSelectedRequest(null)
    setNewTime('')
    setNewRoom('')
  }

  const cols = isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)'

  return (
    <>
      <style>{css}</style>
      <div style={{ fontFamily: C.font }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: C.display, fontSize: isMobile ? '24px' : '30px', fontWeight: 800, color: C.text, letterSpacing: '-0.02em', marginBottom: '8px' }}>Reschedule Approval</h1>
          <p style={{ color: C.text3, fontSize: '13px' }}>Manage lesson reschedule requests from clients or instructors</p>
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
              {f} ({f === 'all' ? requests.length : requests.filter(r => r.status === f).length})
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: cols, gap: '14px' }}>
          {filteredRequests.map(request => (
            <RescheduleCard
              key={request.id}
              request={request}
              onApprove={handleApprove}
              onReject={handleReject}
              onModify={handleModify}
            />
          ))}
        </div>

        {showModifyModal && selectedRequest && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: C.display, fontSize: '18px', fontWeight: 700, color: C.text }}>Modify Reschedule</h2>
                <button onClick={handleCloseModifyModal} style={{ background: 'none', border: 'none', color: C.text2, fontSize: '24px', cursor: 'pointer', padding: '4px' }}>×</button>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: '8px' }}>New Time</label>
                <input
                  type="text"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.mono, fontSize: '13px', outline: 'none' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: '8px' }}>New Room</label>
                <input
                  type="text"
                  value={newRoom}
                  onChange={e => setNewRoom(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: C.bg4, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.font, fontSize: '13px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleSaveModify} className="btn" style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: '#fff', cursor: 'pointer', fontSize: '13px', fontFamily: C.font, fontWeight: 600 }}>
                  Save Changes
                </button>
                <button onClick={handleCloseModifyModal} className="btn" style={{ flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '13px', fontFamily: C.font, fontWeight: 500 }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

