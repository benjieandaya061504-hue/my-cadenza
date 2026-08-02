import { useState } from 'react'
import C from '../admin/theme.js'

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

  const statusColors = {
    pending: { bg: 'rgba(245,158,11,0.1)', c: C.gold, label: 'Pending' },
    approved: { bg: 'rgba(16,185,129,0.1)', c: C.green, label: 'Approved' },
    rejected: { bg: 'rgba(248,113,113,0.1)', c: C.coral, label: 'Rejected' },
  }

  const cols = isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)'

  return (
    <div style={{ fontFamily: C.font }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: C.display, fontSize: '1.3rem', fontWeight: 700, color: C.navy, margin: '0 0 4px' }}>Reschedule Approval</h2>
        <p style={{ fontSize: '0.8rem', color: C.text3, margin: 0 }}>Manage lesson reschedule requests from clients or instructors</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 16px', borderRadius: 20, border: `1px solid ${filter === f ? C.royal : C.border2}`,
            background: filter === f ? 'rgba(37,99,235,0.08)' : '#fff',
            color: filter === f ? C.royal : C.text2,
            cursor: 'pointer', fontSize: '0.78rem', fontFamily: C.font, fontWeight: 500, textTransform: 'capitalize',
            transition: 'all 0.15s ease',
          }}>
            {f} ({f === 'all' ? requests.length : requests.filter(r => r.status === f).length})
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 14 }}>
        {filteredRequests.map(request => {
          const sc = statusColors[request.status]
          return (
            <div key={request.id} style={{
              background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`,
              padding: '1.2rem', boxShadow: '0 4px 12px rgba(30,41,59,0.04)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(30,41,59,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(30,41,59,0.04)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: C.navy, fontFamily: C.font }}>{request.student}</div>
                  <div style={{ fontSize: '0.75rem', color: C.text2, fontFamily: C.font }}>{request.instructor}</div>
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: sc.c, background: sc.bg, padding: '4px 10px', borderRadius: 20, fontFamily: C.font, letterSpacing: '.05em' }}>{sc.label}</span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, marginBottom: 8 }}>Schedule Change</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
                  <div style={{ padding: 12, borderRadius: 10, background: C.mist, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: '0.65rem', color: C.text3, fontFamily: C.font, marginBottom: 4 }}>Original</div>
                    <div style={{ fontSize: '0.82rem', color: C.text, fontFamily: C.font, fontWeight: 600 }}>{request.originalTime}</div>
                    <div style={{ fontSize: '0.7rem', color: C.text2, fontFamily: C.font }}>{request.originalRoom}</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 10, background: 'rgba(37,99,235,0.06)', border: `1px solid rgba(37,99,235,0.2)` }}>
                    <div style={{ fontSize: '0.65rem', color: C.royal, fontFamily: C.font, marginBottom: 4 }}>Requested</div>
                    <div style={{ fontSize: '0.82rem', color: C.text, fontFamily: C.font, fontWeight: 600 }}>{request.requestedTime}</div>
                    <div style={{ fontSize: '0.7rem', color: C.text2, fontFamily: C.font }}>{request.requestedRoom}</div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font, marginBottom: 4 }}>Reason: {request.reason}</div>
                <div style={{ fontSize: '0.7rem', color: C.text3, fontFamily: C.font }}>Requested: {request.requested}</div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {request.status === 'pending' && (
                  <>
                    <button onClick={() => handleApprove(request.id)} style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${C.green}, #059669)`, color: '#fff', cursor: 'pointer', fontSize: '0.75rem', fontFamily: C.font, fontWeight: 600 }}>Approve</button>
                    <button onClick={() => handleModify(request.id)} style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: `1px solid ${C.border2}`, background: '#fff', color: C.text2, cursor: 'pointer', fontSize: '0.75rem', fontFamily: C.font, fontWeight: 500 }}>Modify</button>
                    <button onClick={() => handleReject(request.id)} style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: `1px solid rgba(248,113,113,0.3)`, background: 'rgba(248,113,113,0.08)', color: C.coral, cursor: 'pointer', fontSize: '0.75rem', fontFamily: C.font, fontWeight: 500 }}>Reject</button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showModifyModal && selectedRequest && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, maxWidth: 400, width: '100%', boxShadow: '0 24px 64px rgba(15,23,42,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: C.display, fontSize: '1.1rem', fontWeight: 700, color: C.navy, margin: 0 }}>Modify Reschedule</h2>
              <button onClick={handleCloseModifyModal} style={{ background: 'none', border: 'none', color: C.text3, fontSize: '1.5rem', cursor: 'pointer', padding: '0 4px' }}>×</button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: 8 }}>New Time</label>
              <input type="text" value={newTime} onChange={e => setNewTime(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: C.mist, border: `1px solid ${C.border2}`, color: C.text, fontFamily: C.font, fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: 8 }}>New Room</label>
              <input type="text" value={newRoom} onChange={e => setNewRoom(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: C.mist, border: `1px solid ${C.border2}`, color: C.text, fontFamily: C.font, fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSaveModify} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${C.royal}, ${C.purple})`, color: '#fff', cursor: 'pointer', fontSize: '0.82rem', fontFamily: C.font, fontWeight: 600 }}>Save Changes</button>
              <button onClick={handleCloseModifyModal} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${C.border2}`, background: '#fff', color: C.text2, cursor: 'pointer', fontSize: '0.82rem', fontFamily: C.font, fontWeight: 500 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}