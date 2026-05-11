import { useState } from 'react'
import EnrollmentSummaryReport from './EnrollmentSummaryReport'
import BillingReport from './BillingReport'
import PaymentReport from './PaymentReport'
import AttendanceReport from './AttendanceReport'
import InstructorAssignmentReport from './InstructorAssignmentReport'
import StudioBookingReport from './StudioBookingReport'
import InstrumentUsageReport from './InstrumentUsageReport'

const C = {
  bg: '#0e0f13',
  bg2: '#13141a',
  bg3: '#1a1c24',
  bg4: '#1f2130',
  border: 'rgba(255,255,255,0.07)',
  text: '#f0eff4',
  text2: '#9b99a8',
  text3: '#5a5870',
  accentL: '#a99cf9',
  font: "'Outfit', sans-serif",
  display: "'Syne', sans-serif",
}

function Reports({ isMobile = false, isTablet = false }) {
  const [active, setActive] = useState('enrollment')

  const tabBtn = (id, label) => {
    const on = active === id
    return (
      <button
        type="button"
        onClick={() => setActive(id)}
        style={{
          padding: '8px 16px',
          borderRadius: '10px',
          border: on ? `1px solid rgba(124,106,247,0.4)` : `1px solid ${C.border}`,
          background: on ? 'rgba(124,106,247,0.14)' : 'transparent',
          color: on ? C.accentL : C.text2,
          cursor: 'pointer',
          fontFamily: C.font,
          fontSize: '13px',
          fontWeight: on ? 600 : 500,
        }}
      >
        {label}
      </button>
    )
  }

  return (
    <div style={{ fontFamily: C.font, color: C.text }}>
      <div style={{ marginBottom: '18px' }}>
        <h1 style={{ fontFamily: C.display, fontSize: isMobile ? '22px' : '26px', fontWeight: 800, color: C.text, letterSpacing: '-0.02em' }}>
          Reports
        </h1>
        <p style={{ marginTop: '4px', fontSize: '13px', color: C.text3 }}>
          Comprehensive system reports for operations, finances, instructional activities, and asset management.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        {tabBtn('enrollment', 'Enrollment summary')}
        {tabBtn('billing', 'Billing')}
        {tabBtn('payments', 'Payments')}
        {tabBtn('attendance', 'Attendance & completion')}
        {tabBtn('instructors', 'Instructor assignment')}
        {tabBtn('studio', 'Studio bookings')}
        {tabBtn('assets', 'Instrument usage')}
      </div>

      {active === 'enrollment' && <EnrollmentSummaryReport isMobile={isMobile} isTablet={isTablet} />}
      {active === 'billing' && <BillingReport isMobile={isMobile} isTablet={isTablet} />}
      {active === 'payments' && <PaymentReport isMobile={isMobile} isTablet={isTablet} />}
      {active === 'attendance' && <AttendanceReport isMobile={isMobile} isTablet={isTablet} />}
      {active === 'instructors' && <InstructorAssignmentReport isMobile={isMobile} isTablet={isTablet} />}
      {active === 'studio' && <StudioBookingReport isMobile={isMobile} isTablet={isTablet} />}
      {active === 'assets' && <InstrumentUsageReport isMobile={isMobile} isTablet={isTablet} />}
    </div>
  )
}

export default Reports

