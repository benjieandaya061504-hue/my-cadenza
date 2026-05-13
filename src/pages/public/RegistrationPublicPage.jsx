import { useMemo, useState } from 'react'
import PublicSectionNav from './PublicSectionNav'
import { usePublicSite } from './PublicSiteContext'

const INITIAL_ROWS = [
  {
    id: '1',
    name: 'Ana Reyes',
    email: 'ana.reyes@email.com',
    phone: '+63 912 345 6789',
    initials: 'AR',
    avatarBg: 'linear-gradient(135deg,#4f8ef7,#0fd4b4)',
    course: 'Guitar',
    package: 'Intermediate',
    schedule: 'Mon/Wed 9AM',
    applied: 'Today',
    status: 'Pending',
  },
  {
    id: '2',
    name: 'Diego Padilla',
    email: 'diego@email.com',
    phone: '+63 917 111 2222',
    initials: 'DP',
    avatarBg: 'linear-gradient(135deg,#a78bfa,#6c63ff)',
    course: 'Piano',
    package: 'Advanced',
    schedule: 'Tue/Thu 3PM',
    applied: 'Mar 10',
    status: 'Pending',
  },
  {
    id: '3',
    name: 'Rita Valdez',
    email: 'rita@email.com',
    phone: '+63 918 333 4444',
    initials: 'RV',
    avatarBg: 'linear-gradient(135deg,#22c55e,#0fd4b4)',
    course: 'Violin',
    package: 'Beginner',
    schedule: 'Sat 10AM',
    applied: 'Mar 9',
    status: 'Approved',
  },
  {
    id: '4',
    name: 'Carlo Mendoza',
    email: 'carlo@email.com',
    phone: '+63 920 555 6666',
    initials: 'CM',
    avatarBg: '#2e3850',
    course: 'Drums',
    package: 'Beginner',
    schedule: 'Wed 4PM',
    applied: 'Mar 7',
    status: 'Rejected',
  },
]

function badgeClass(status) {
  if (status === 'Approved') return 'badge badge-green'
  if (status === 'Rejected') return 'badge badge-coral'
  return 'badge badge-gold'
}

export default function RegistrationPublicPage() {
  const { showToast } = usePublicSite()
  const [rows, setRows] = useState(INITIAL_ROWS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [active, setActive] = useState(null)
  const [remarks, setRemarks] = useState('')

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const q = search.trim().toLowerCase()
      if (q && !r.name.toLowerCase().includes(q)) return false
      if (statusFilter && r.status !== statusFilter) return false
      if (courseFilter && r.course !== courseFilter) return false
      return true
    })
  }, [rows, search, statusFilter, courseFilter])

  const openDetail = (row) => {
    setActive(row)
    setRemarks('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setActive(null)
  }

  const approveRow = (id) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'Approved' } : r)))
    showToast('Application approved.')
    closeModal()
  }

  const rejectRow = (id) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'Rejected' } : r)))
    showToast('Application rejected.')
    closeModal()
  }

  return (
    <div id="page-registration" className="pub-section">
      <PublicSectionNav label="Registration" />
      <div className="pub-page-header">
        <h2>Student Approval</h2>
        <p>Review, approve, or reject student enrollment applications — REQ067–REQ071</p>
      </div>
      <div className="toolbar">
        <input
          className="search-box"
          type="search"
          placeholder="Search by student name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <select className="filter-select" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
          <option value="">All Courses</option>
          <option value="Guitar">Guitar</option>
          <option value="Piano">Piano</option>
          <option value="Violin">Violin</option>
          <option value="Drums">Drums</option>
        </select>
      </div>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Course</th>
              <th>Package</th>
              <th>Schedule</th>
              <th>Applied</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} data-name={r.name} data-status={r.status} data-course={r.course}>
                <td>
                  <div className="flex" style={{ alignItems: 'center' }}>
                    <div className="user-avatar" style={{ background: r.avatarBg }}>
                      {r.initials}
                    </div>
                    <div style={{ marginLeft: 8 }}>
                      <div>{r.name}</div>
                      <div className="text-xs text-dim">
                        {r.status === 'Approved' ? 'Returning' : 'New'} student · {r.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  {r.course === 'Guitar' && '🎸 '}
                  {r.course === 'Piano' && '🎹 '}
                  {r.course === 'Violin' && '🎻 '}
                  {r.course === 'Drums' && '🥁 '}
                  {r.course}
                </td>
                <td>{r.package}</td>
                <td className="text-sm">{r.schedule}</td>
                <td className="text-dim text-sm">{r.applied}</td>
                <td>
                  <span className={badgeClass(r.status)}>{r.status}</span>
                </td>
                <td>
                  <div className="flex" style={{ gap: 4, flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => openDetail(r)}>
                      View
                    </button>
                    {r.status === 'Pending' ? (
                      <>
                        <button type="button" className="btn btn-sm btn-teal" onClick={() => approveRow(r.id)}>
                          Approve
                        </button>
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => rejectRow(r.id)}>
                          Reject
                        </button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`modal-overlay${modalOpen ? ' open' : ''}`} role="presentation">
        <div
          className="modal"
          style={{ width: 500 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reg-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <span className="modal-title" id="reg-modal-title">
              Enrollment Application Details
            </span>
            <button type="button" className="modal-close" onClick={closeModal}>
              ✕
            </button>
          </div>
          {active ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div
                  className="user-avatar"
                  style={{
                    width: 44,
                    height: 44,
                    fontSize: 15,
                    background: active.avatarBg,
                  }}
                >
                  {active.initials}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{active.name}</div>
                  <div className="text-xs text-dim">{active.email}</div>
                </div>
                <span className={badgeClass(active.status)} style={{ marginLeft: 'auto' }}>
                  {active.status}
                </span>
              </div>
              <div
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: 14,
                  marginBottom: 16,
                }}
              >
                <div className="flex-between mb8">
                  <span className="text-muted text-sm">Course Applied</span>
                  <span style={{ fontWeight: 500 }}>
                    {active.course} {active.package}
                  </span>
                </div>
                <div className="flex-between mb8">
                  <span className="text-muted text-sm">Preferred Schedule</span>
                  <span>{active.schedule}</span>
                </div>
                <div className="flex-between mb8">
                  <span className="text-muted text-sm">Contact Number</span>
                  <span>{active.phone}</span>
                </div>
                <div className="flex-between">
                  <span className="text-muted text-sm">Date Applied</span>
                  <span className="text-dim text-sm">{active.applied}</span>
                </div>
              </div>
              <div className="form-row">
                <div>
                  <label htmlFor="rd2-remarks">Remarks (optional)</label>
                  <textarea
                    id="rd2-remarks"
                    placeholder="e.g. Approved. Please schedule orientation."
                    rows={2}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Close
                </button>
                {active.status === 'Pending' ? (
                  <>
                    <button type="button" className="btn btn-danger" onClick={() => rejectRow(active.id)}>
                      Reject
                    </button>
                    <button type="button" className="btn btn-teal" onClick={() => approveRow(active.id)}>
                      Approve
                    </button>
                  </>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
