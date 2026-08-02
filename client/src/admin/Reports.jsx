import { useState } from 'react'
import C from './theme.js'

function EnrollmentSummaryReport({ isMobile, isTablet }) {
  const data = [
    { program: 'Piano', enrolled: 45, active: 38, completed: 12 },
    { program: 'Guitar', enrolled: 52, active: 44, completed: 18 },
    { program: 'Drums', enrolled: 18, active: 15, completed: 6 },
    { program: 'Violin', enrolled: 22, active: 19, completed: 8 },
    { program: 'Voice', enrolled: 15, active: 12, completed: 5 },
    { program: 'Bass', enrolled: 10, active: 8, completed: 3 },
  ]
  return (
    <div>
      <h3 style={{ fontFamily: C.display, fontSize: '1rem', fontWeight: 700, color: C.navy, marginBottom: 12 }}>Enrollment Summary</h3>
      <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: C.mist }}>
            {['Program', 'Enrolled', 'Active', 'Completed'].map(h => (
              <th key={h} style={{ padding: '10px 14px', fontSize: '0.68rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: '10px 14px', fontSize: '0.82rem', fontWeight: 600, color: C.navy }}>{d.program}</td>
                <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: C.text2 }}>{d.enrolled}</td>
                <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: C.green, fontWeight: 600 }}>{d.active}</td>
                <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: C.text2 }}>{d.completed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function BillingReport({ isMobile, isTablet }) {
  const data = [
    { month: 'January', charges: 185000, invoices: 142000, balance: 43000 },
    { month: 'February', charges: 192000, invoices: 158000, balance: 34000 },
    { month: 'March', charges: 178000, invoices: 165000, balance: 13000 },
    { month: 'April', charges: 201000, invoices: 180000, balance: 21000 },
  ]
  const fmt = n => `₱${n.toLocaleString()}`
  return (
    <div>
      <h3 style={{ fontFamily: C.display, fontSize: '1rem', fontWeight: 700, color: C.navy, marginBottom: 12 }}>Billing Report</h3>
      <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: C.mist }}>
            {['Month', 'Charges', 'Invoices', 'Balance'].map(h => (
              <th key={h} style={{ padding: '10px 14px', fontSize: '0.68rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: '10px 14px', fontSize: '0.82rem', fontWeight: 600, color: C.navy }}>{d.month}</td>
                <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: C.text2 }}>{fmt(d.charges)}</td>
                <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: C.green, fontWeight: 600 }}>{fmt(d.invoices)}</td>
                <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: C.coral, fontWeight: 600 }}>{fmt(d.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PaymentReport({ isMobile, isTablet }) {
  const data = [
    { date: '2026-07-20', student: 'Ana Reyes', amount: 2500, method: 'GCash', status: 'Completed' },
    { date: '2026-07-20', student: 'Marco Santos', amount: 3800, method: 'Bank Transfer', status: 'Completed' },
    { date: '2026-07-19', student: 'Luis Tan', amount: 1500, method: 'Cash', status: 'Completed' },
    { date: '2026-07-18', student: 'Pia Santos', amount: 4200, method: 'GCash', status: 'Pending' },
    { date: '2026-07-18', student: 'Ben Torres', amount: 2000, method: 'Credit Card', status: 'Completed' },
  ]
  return (
    <div>
      <h3 style={{ fontFamily: C.display, fontSize: '1rem', fontWeight: 700, color: C.navy, marginBottom: 12 }}>Payment Report</h3>
      <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: C.mist }}>
            {['Date', 'Student', 'Amount', 'Method', 'Status'].map(h => (
              <th key={h} style={{ padding: '10px 14px', fontSize: '0.68rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: '10px 14px', fontSize: '0.78rem', color: C.text3 }}>{d.date}</td>
                <td style={{ padding: '10px 14px', fontSize: '0.82rem', fontWeight: 600, color: C.navy }}>{d.student}</td>
                <td style={{ padding: '10px 14px', fontSize: '0.8rem', fontWeight: 600, color: C.navy }}>₱{d.amount.toLocaleString()}</td>
                <td style={{ padding: '10px 14px', fontSize: '0.78rem', color: C.text2 }}>{d.method}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600,
                    background: d.status === 'Completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                    color: d.status === 'Completed' ? C.green : C.gold }}>{d.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AttendanceReport({ isMobile, isTablet }) {
  const data = [
    { student: 'Ana Reyes', attended: 10, missed: 1, rescheduled: 1, rate: '91%' },
    { student: 'Marco Santos', attended: 8, missed: 2, rescheduled: 0, rate: '80%' },
    { student: 'Luis Tan', attended: 12, missed: 0, rescheduled: 1, rate: '100%' },
    { student: 'Pia Santos', attended: 9, missed: 1, rescheduled: 2, rate: '90%' },
    { student: 'Carla Cruz', attended: 6, missed: 3, rescheduled: 0, rate: '67%' },
  ]
  return (
    <div>
      <h3 style={{ fontFamily: C.display, fontSize: '1rem', fontWeight: 700, color: C.navy, marginBottom: 12 }}>Attendance Report</h3>
      <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: C.mist }}>
            {['Student', 'Attended', 'Missed', 'Rescheduled', 'Rate'].map(h => (
              <th key={h} style={{ padding: '10px 14px', fontSize: '0.68rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: '10px 14px', fontSize: '0.82rem', fontWeight: 600, color: C.navy }}>{d.student}</td>
                <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: C.green, fontWeight: 600 }}>{d.attended}</td>
                <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: C.coral, fontWeight: 600 }}>{d.missed}</td>
                <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: C.gold, fontWeight: 600 }}>{d.rescheduled}</td>
                <td style={{ padding: '10px 14px', fontSize: '0.8rem', fontWeight: 700, color: Number(d.rate.replace('%','')) >= 90 ? C.green : C.coral }}>{d.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function InstructorAssignmentReport({ isMobile, isTablet }) {
  const data = [
    { instructor: 'Mr. Cruz', students: 8, lessons: 4, hours: 20, load: 'Full' },
    { instructor: 'Ms. Tan', students: 12, lessons: 5, hours: 25, load: 'Full' },
    { instructor: 'Mr. Reyes', students: 6, lessons: 3, hours: 15, load: 'Partial' },
    { instructor: 'Ms. Gomez', students: 5, lessons: 3, hours: 12, load: 'Partial' },
    { instructor: 'Ms. Lim', students: 7, lessons: 4, hours: 18, load: 'Full' },
  ]
  return (
    <div>
      <h3 style={{ fontFamily: C.display, fontSize: '1rem', fontWeight: 700, color: C.navy, marginBottom: 12 }}>Instructor Assignment</h3>
      <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: C.mist }}>
            {['Instructor', 'Students', 'Lessons', 'Hours/Week', 'Load'].map(h => (
              <th key={h} style={{ padding: '10px 14px', fontSize: '0.68rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: '10px 14px', fontSize: '0.82rem', fontWeight: 600, color: C.navy }}>{d.instructor}</td>
                <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: C.text2 }}>{d.students}</td>
                <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: C.text2 }}>{d.lessons}</td>
                <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: C.text2 }}>{d.hours}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600,
                    background: d.load === 'Full' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                    color: d.load === 'Full' ? C.green : C.gold }}>{d.load}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StudioBookingReport({ isMobile, isTablet }) {
  const data = [
    { date: '2026-07-20', room: 'Studio A', time: '10:00-12:00', client: 'Ana Reyes', status: 'Confirmed' },
    { date: '2026-07-20', room: 'Studio B', time: '14:00-16:00', client: 'Luis Tan', status: 'Confirmed' },
    { date: '2026-07-21', room: 'Studio C', time: '09:00-11:00', client: 'Band Session', status: 'Pending' },
    { date: '2026-07-21', room: 'Studio A', time: '13:00-15:00', client: 'Pia Santos', status: 'Confirmed' },
  ]
  return (
    <div>
      <h3 style={{ fontFamily: C.display, fontSize: '1rem', fontWeight: 700, color: C.navy, marginBottom: 12 }}>Studio Booking Report</h3>
      <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: C.mist }}>
            {['Date', 'Room', 'Time', 'Client', 'Status'].map(h => (
              <th key={h} style={{ padding: '10px 14px', fontSize: '0.68rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: '10px 14px', fontSize: '0.78rem', color: C.text3 }}>{d.date}</td>
                <td style={{ padding: '10px 14px', fontSize: '0.82rem', fontWeight: 600, color: C.navy }}>{d.room}</td>
                <td style={{ padding: '10px 14px', fontSize: '0.78rem', color: C.text2 }}>{d.time}</td>
                <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: C.text2 }}>{d.client}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600,
                    background: d.status === 'Confirmed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                    color: d.status === 'Confirmed' ? C.green : C.gold }}>{d.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function InstrumentUsageReport({ isMobile, isTablet }) {
  const data = [
    { instrument: 'Guitar', total: 26, inUse: 8, available: 18, utilization: '31%' },
    { instrument: 'Piano', total: 18, inUse: 8, available: 10, utilization: '44%' },
    { instrument: 'Drums', total: 12, inUse: 3, available: 9, utilization: '25%' },
    { instrument: 'Violin', total: 8, inUse: 4, available: 4, utilization: '50%' },
    { instrument: 'Ukulele', total: 12, inUse: 7, available: 5, utilization: '58%' },
  ]
  return (
    <div>
      <h3 style={{ fontFamily: C.display, fontSize: '1rem', fontWeight: 700, color: C.navy, marginBottom: 12 }}>Instrument Usage Report</h3>
      <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: C.mist }}>
            {['Instrument', 'Total', 'In Use', 'Available', 'Utilization'].map(h => (
              <th key={h} style={{ padding: '10px 14px', fontSize: '0.68rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: '10px 14px', fontSize: '0.82rem', fontWeight: 600, color: C.navy }}>{d.instrument}</td>
                <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: C.text2 }}>{d.total}</td>
                <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: C.coral, fontWeight: 600 }}>{d.inUse}</td>
                <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: C.green, fontWeight: 600 }}>{d.available}</td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: C.mist, borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: d.utilization, borderRadius: 10, background: `linear-gradient(90deg, ${C.royal}, ${C.purple})` }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: C.text2 }}>{d.utilization}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const TABS = [
  { id: 'enrollment', label: 'Enrollment' },
  { id: 'billing', label: 'Billing' },
  { id: 'payment', label: 'Payments' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'instructors', label: 'Instructors' },
  { id: 'studio', label: 'Studio' },
  { id: 'instruments', label: 'Instruments' },
]

export default function Reports({ isMobile, isTablet }) {
  const [active, setActive] = useState('enrollment')

  const renderReport = () => {
    switch (active) {
      case 'enrollment': return <EnrollmentSummaryReport isMobile={isMobile} isTablet={isTablet} />
      case 'billing': return <BillingReport isMobile={isMobile} isTablet={isTablet} />
      case 'payment': return <PaymentReport isMobile={isMobile} isTablet={isTablet} />
      case 'attendance': return <AttendanceReport isMobile={isMobile} isTablet={isTablet} />
      case 'instructors': return <InstructorAssignmentReport isMobile={isMobile} isTablet={isTablet} />
      case 'studio': return <StudioBookingReport isMobile={isMobile} isTablet={isTablet} />
      case 'instruments': return <InstrumentUsageReport isMobile={isMobile} isTablet={isTablet} />
      default: return null
    }
  }

  return (
    <div style={{ fontFamily: C.font }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: C.display, fontSize: '1.3rem', fontWeight: 700, color: C.navy, margin: 0 }}>Reports</h2>
        <p style={{ fontSize: '0.8rem', color: C.text3, marginTop: 2 }}>View and analyze reports</p>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActive(tab.id)}
            style={{
              padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontFamily: C.font, fontSize: '0.8rem',
              border: active === tab.id ? `1.5px solid ${C.royal}` : `1.5px solid ${C.border2}`,
              background: active === tab.id ? 'rgba(37,99,235,0.08)' : 'transparent',
              color: active === tab.id ? C.royal : C.text2,
              fontWeight: active === tab.id ? 600 : 500,
              transition: 'all 0.15s ease',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {renderReport()}
    </div>
  )
}