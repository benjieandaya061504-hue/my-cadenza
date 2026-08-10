import { useState, useEffect } from 'react'
import { authenticatedFetch, getApiBase } from '../utils/authUtils'
import C from '../admin/theme.js'

export default function RescheduleApproval({ isMobile, isTablet }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [actionMsg, setActionMsg] = useState('')
  const [actionError, setActionError] = useState('')

  const API = getApiBase()

  const fetchRequests = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await authenticatedFetch(`${API}/api/admin/reschedule/pending`)
      const data = await res.json()
      if (data.success) {
        setRequests(data.data)
      } else {
        setError(data.message || 'Failed to load reschedule requests.')
      }
    } catch (err) {
      setError(err.message || 'Network error loading requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const filtered = filter === 'all'
    ? requests
    : requests.filter(r => r.status === filter)

  const handleApprove = async (id) => {
    setActionMsg('')
    setActionError('')
    try {
      const res = await authenticatedFetch(`${API}/api/admin/reschedule/${id}/approve`, {
        method: 'PUT',
      })
      const data = await res.json()
      if (data.success) {
        setActionMsg('Reschedule approved successfully')
        fetchRequests()
      } else {
        setActionError(data.message || 'Failed to approve reschedule.')
      }
    } catch (err) {
      setActionError(err.message || 'Network error approving reschedule.')
    }
    setTimeout(() => { setActionMsg(''); setActionError('') }, 3000)
  }

  const handleReject = async (id) => {
    setActionMsg('')
    setActionError('')
    try {
      const res = await authenticatedFetch(`${API}/api/admin/reschedule/${id}/reject`, {
        method: 'PUT',
      })
      const data = await res.json()
      if (data.success) {
        setActionMsg('Reschedule rejected')
        fetchRequests()
      } else {
        setActionError(data.message || 'Failed to reject reschedule.')
      }
    } catch (err) {
      setActionError(err.message || 'Network error rejecting reschedule.')
    }
    setTimeout(() => { setActionMsg(''); setActionError('') }, 3000)
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
        <p style={{ fontSize: '0.8rem', color: C.text3, margin: 0 }}>Review and manage lesson reschedule requests</p>
      </div>

      {actionMsg && (
        <div style={{ padding: '10px 16px', marginBottom: 16, borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: C.green, fontSize: '0.82rem', fontFamily: C.font, fontWeight: 500 }}>
          {actionMsg}
        </div>
      )}
      {actionError && (
        <div style={{ padding: '10px 16px', marginBottom: 16, borderRadius: 10, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: C.coral, fontSize: '0.82rem', fontFamily: C.font, fontWeight: 500 }}>
          {actionError}
        </div>
      )}
      {error && (
        <div style={{ padding: '10px 16px', marginBottom: 16, borderRadius: 10, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: C.coral, fontSize: '0.82rem', fontFamily: C.font, fontWeight: 500 }}>
          {error}
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
            {f} ({f === 'all' ? requests.length : requests.filter(r => r.status === f).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: C.text3, fontSize: '0.85rem' }}>Loading reschedule requests...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: C.text3, fontSize: '0.85rem' }}>No {filter === 'all' ? '' : filter} reschedule requests found.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 14 }}>
          {filtered.map(req => {
            const sc = statusColors[req.status] || statusColors.pending
            return (
              <div key={req.id} style={{
                background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`,
                padding: '1.2rem', boxShadow: '0 4px 12px rgba(30,41,59,0.04)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(30,41,59,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(30,41,59,0.04)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: `linear-gradient(135deg, ${C.teal}, ${C.green})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: C.font,
                    }}>
                      {req.student_name?.split(' ').map(n => n[0]).join('') || '?'}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: C.navy, fontFamily: C.font }}>{req.student_name}</div>
                      <div style={{ fontSize: '0.75rem', color: C.text2, fontFamily: C.font }}>{req.course}</div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700, color: sc.c,
                    background: sc.bg, padding: '4px 10px', borderRadius: 20,
                    fontFamily: C.font, letterSpacing: '.05em',
                  }}>{sc.label}</span>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, marginBottom: 6 }}>Schedule Change</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <div style={{ padding: 8, borderRadius: 8, background: C.mist, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: '0.65rem', color: C.text3, fontFamily: C.font }}>Original</div>
                      <div style={{ fontSize: '0.75rem', color: C.text, fontFamily: C.font }}>{req.original_date} {req.original_time}</div>
                    </div>
                    <div style={{ padding: 8, borderRadius: 8, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <div style={{ fontSize: '0.65rem', color: C.text3, fontFamily: C.font }}>New</div>
                      <div style={{ fontSize: '0.75rem', color: C.green, fontFamily: C.font, fontWeight: 500 }}>{req.new_date} {req.new_time}</div>
                    </div>
                  </div>
                </div>

                {req.reason && (
                  <div style={{ marginBottom: 12, padding: 8, borderRadius: 8, background: C.mist, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: '0.65rem', color: C.text3, fontFamily: C.font, marginBottom: 2 }}>Reason</div>
                    <div style={{ fontSize: '0.75rem', color: C.text, fontFamily: C.font }}>{req.reason}</div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  {req.status === 'pending' && (
                    <>
                      <button onClick={() => handleApprove(req.id)} style={{
                        flex: 1, padding: '8px 12px', borderRadius: 10, border: 'none',
                        background: `linear-gradient(135deg, ${C.green}, #059669)`,
                        color: '#fff', cursor: 'pointer', fontSize: '0.75rem',
                        fontFamily: C.font, fontWeight: 600,
                      }}>Approve</button>
                      <button onClick={() => handleReject(req.id)} style={{
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
      )}
    </div>
  )
}