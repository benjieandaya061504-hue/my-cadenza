import { useState, useEffect } from 'react'
import C from './theme.js'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/admin'
const getToken = () => localStorage.getItem('cadenza_token')

export default function SavedPackagesSummary() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPackages = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/lesson-packages-summary`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (data.success) {
        setPackages(data.data)
      } else {
        setError(data.message || 'Failed to load saved packages.')
      }
    } catch (err) {
      setError('Failed to load saved packages.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  // Status pill style matching InstrumentManagement pattern
  const statusPillStyle = (status) => ({
    padding: '3px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
    background: status === 'Active'
      ? 'rgba(16,185,129,0.1)'
      : status === 'Inactive'
        ? 'rgba(248,113,113,0.1)'
        : 'rgba(245,158,11,0.1)',
    color: status === 'Active'
      ? C.green
      : status === 'Inactive'
        ? C.coral
        : C.gold,
    whiteSpace: 'nowrap',
  })

  // Format fee
  const formatFee = (fee) => {
    if (fee === null || fee === undefined) return '—'
    return `₱${Number(fee).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const columns = ['Lesson', 'Package', 'Duration', 'Sessions', 'Frequency', 'Fee', 'Status']

  return (
    <div style={{ fontFamily: C.font }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: C.display, fontSize: '1.3rem', fontWeight: 700, color: C.navy, margin: 0 }}>
            Saved Packages
          </h2>
          <p style={{ fontSize: '0.8rem', color: C.text3, marginTop: 2 }}>
            {loading ? 'Loading...' : `${packages.length} package(s) saved`}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.1)', borderRadius: 10, marginBottom: 16, fontSize: '0.8rem', color: C.coral }}>
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.text3, fontSize: '0.9rem' }}>
          Loading saved packages...
        </div>
      ) : packages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.text3, fontSize: '0.9rem' }}>
          No saved packages yet. Use the <strong>Package Fees</strong> tab to create one.
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.mist }}>
                  {columns.map(h => (
                    <th key={h} style={{ padding: '12px 14px', fontSize: '0.7rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {packages.map(pkg => (
                  <tr key={pkg.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '12px 14px', fontSize: '0.85rem', fontWeight: 600, color: C.navy }}>
                      {pkg.lesson_name || '—'}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>
                      {pkg.package_type_name || '—'}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>
                      {pkg.duration || '—'}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>
                      {pkg.session !== null ? `${pkg.session} Sessions` : '—'}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: C.text2 }}>
                      {pkg.frequency || '—'}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '0.8rem', fontWeight: 600, color: C.navy }}>
                      {formatFee(pkg.fee)}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={statusPillStyle(pkg.status)}>
                        {pkg.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}