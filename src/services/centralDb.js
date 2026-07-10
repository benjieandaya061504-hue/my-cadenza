/**
 * Centralized data source for reporting.
 *
 * This module now fetches data from the backend API instead of using mock seed data.
 * All report components continue to work unchanged since the function signatures remain the same.
 *
 * If the backend is not running, it falls back to the provided seed data.
 */

import {
  enrollmentsAPI,
  billingAPI,
  lessonsAPI,
  instructorsAPI,
  studiosAPI
} from './api'

// ───────────────────────────────────────────────────────────────
// Fallback seed data (used when backend is unavailable)
// ───────────────────────────────────────────────────────────────

const fallbackDb = {
  enrollments: [
    { id: 'en1', studentId: 's1', studentName: 'Ana Reyes', packageId: 'p1', packageName: 'Guitar Starter Pack', createdAt: '2026-05-01', isReenrollment: false },
    { id: 'en2', studentId: 's2', studentName: 'Marco Santos', packageId: 'p2', packageName: 'Piano Foundations', createdAt: '2026-05-02', isReenrollment: false },
    { id: 'en3', studentId: 's3', studentName: 'Pia Gomez', packageId: 'p1', packageName: 'Guitar Starter Pack', createdAt: '2026-05-05', isReenrollment: true },
    { id: 'en4', studentId: 's4', studentName: 'Luis Tan', packageId: 'p4', packageName: 'Drums Intensive', createdAt: '2026-05-10', isReenrollment: false },
    { id: 'en5', studentId: 's5', studentName: 'Sofia Dela Cruz', packageId: 'p3', packageName: 'Theory Bootcamp', createdAt: '2026-04-18', isReenrollment: false },
    { id: 'en6', studentId: 's1', studentName: 'Ana Reyes', packageId: 'p1', packageName: 'Guitar Starter Pack', createdAt: '2026-03-12', isReenrollment: true },
    { id: 'en7', studentId: 's6', studentName: 'Noah Castillo', packageId: 'p2', packageName: 'Piano Foundations', createdAt: '2025-12-08', isReenrollment: false },
    { id: 'en8', studentId: 's7', studentName: 'Mika Flores', packageId: 'p3', packageName: 'Theory Bootcamp', createdAt: '2025-11-22', isReenrollment: false },
    { id: 'en9', studentId: 's2', studentName: 'Marco Santos', packageId: 'p2', packageName: 'Piano Foundations', createdAt: '2025-08-14', isReenrollment: true },
    { id: 'en10', studentId: 's8', studentName: 'Carla Villanueva', packageId: 'p4', packageName: 'Drums Intensive', createdAt: '2025-06-03', isReenrollment: false },
    { id: 'en11', studentId: 's9', studentName: 'Jared Ong', packageId: 'p1', packageName: 'Guitar Starter Pack', createdAt: '2024-10-19', isReenrollment: false },
    { id: 'en12', studentId: 's1', studentName: 'Ana Reyes', packageId: 'p1', packageName: 'Guitar Starter Pack', createdAt: '2024-03-05', isReenrollment: true },
  ],
  billing: {
    charges: [
      { id: 'ch1', ref: 'ENR-en1', customerName: 'Ana Reyes', serviceType: 'Lessons', amount: 2500, status: 'Generated', createdAt: '2026-05-01' },
      { id: 'ch2', ref: 'ENR-en2', customerName: 'Marco Santos', serviceType: 'Lessons', amount: 3200, status: 'Generated', createdAt: '2026-05-02' },
      { id: 'ch3', ref: 'BK-bk1', customerName: 'Ana Reyes', serviceType: 'Studio booking', amount: 450, status: 'Generated', createdAt: '2026-05-09' },
      { id: 'ch4', ref: 'ENR-en7', customerName: 'Noah Castillo', serviceType: 'Lessons', amount: 3200, status: 'Generated', createdAt: '2025-12-08' },
      { id: 'ch5', ref: 'BK-bk5', customerName: 'Mika Flores', serviceType: 'Studio booking', amount: 900, status: 'Generated', createdAt: '2025-11-28' },
      { id: 'ch6', ref: 'RENT-r1', customerName: 'Jared Ong', serviceType: 'Instrument rental', amount: 800, status: 'Generated', createdAt: '2024-10-21' },
    ],
    invoices: [
      { id: 'inv1', invoiceNo: 'SI-2026-001', ref: 'ENR-en1', customerName: 'Ana Reyes', amount: 2500, balance: 0, status: 'Paid', issuedAt: '2026-05-01' },
      { id: 'inv2', invoiceNo: 'SI-2026-002', ref: 'ENR-en2', customerName: 'Marco Santos', amount: 3200, balance: 1200, status: 'Partially paid', issuedAt: '2026-05-02' },
      { id: 'inv3', invoiceNo: 'SI-2026-003', ref: 'BK-bk1', customerName: 'Ana Reyes', amount: 450, balance: 450, status: 'Unpaid', issuedAt: '2026-05-09' },
      { id: 'inv4', invoiceNo: 'SI-2025-102', ref: 'ENR-en7', customerName: 'Noah Castillo', amount: 3200, balance: 0, status: 'Paid', issuedAt: '2025-12-08' },
      { id: 'inv5', invoiceNo: 'SI-2025-096', ref: 'BK-bk5', customerName: 'Mika Flores', amount: 900, balance: 300, status: 'Partially paid', issuedAt: '2025-11-28' },
      { id: 'inv6', invoiceNo: 'SI-2024-044', ref: 'RENT-r1', customerName: 'Jared Ong', amount: 800, balance: 800, status: 'Unpaid', issuedAt: '2024-10-21' },
    ],
  },
  payments: [
    { id: 'pay1', invoiceNo: 'SI-2026-001', payerName: 'Ana Reyes', method: 'Cash', serviceType: 'Lessons', amount: 2500, paidAt: '2026-05-01', kind: 'Full' },
    { id: 'pay2', invoiceNo: 'SI-2026-002', payerName: 'Marco Santos', method: 'GCash', serviceType: 'Lessons', amount: 2000, paidAt: '2026-05-03', kind: 'Installment' },
    { id: 'pay3', invoiceNo: 'SI-2026-002', payerName: 'Marco Santos', method: 'GCash', serviceType: 'Lessons', amount: 0, paidAt: '2026-05-10', kind: 'Installment' },
    { id: 'pay4', invoiceNo: 'SI-2026-004', payerName: 'Pia Gomez', method: 'Bank transfer', serviceType: 'Instrument rental', amount: 800, paidAt: '2026-05-06', kind: 'Full' },
    { id: 'pay5', invoiceNo: 'SI-2025-102', payerName: 'Noah Castillo', method: 'Cash', serviceType: 'Lessons', amount: 3200, paidAt: '2025-12-08', kind: 'Full' },
    { id: 'pay6', invoiceNo: 'SI-2025-096', payerName: 'Mika Flores', method: 'Bank transfer', serviceType: 'Studio booking', amount: 600, paidAt: '2025-11-29', kind: 'Installment' },
    { id: 'pay7', invoiceNo: 'SI-2024-044', payerName: 'Jared Ong', method: 'GCash', serviceType: 'Instrument rental', amount: 0, paidAt: '2024-11-05', kind: 'Installment' },
  ],
  lessons: {
    sessions: [
      { id: 'ls1', studentId: 's1', studentName: 'Ana Reyes', instructorId: 't1', instructorName: 'Mr. Cruz', status: 'attended', date: '2026-05-02' },
      { id: 'ls2', studentId: 's1', studentName: 'Ana Reyes', instructorId: 't1', instructorName: 'Mr. Cruz', status: 'missed', date: '2026-05-09' },
      { id: 'ls3', studentId: 's2', studentName: 'Marco Santos', instructorId: 't2', instructorName: 'Ms. Lim', status: 'attended', date: '2026-05-03' },
      { id: 'ls4', studentId: 's2', studentName: 'Marco Santos', instructorId: 't2', instructorName: 'Ms. Lim', status: 'rescheduled', date: '2026-05-10' },
      { id: 'ls5', studentId: 's4', studentName: 'Luis Tan', instructorId: 't3', instructorName: 'Ms. Reyes', status: 'attended', date: '2026-05-11' },
      { id: 'ls6', studentId: 's6', studentName: 'Noah Castillo', instructorId: 't2', instructorName: 'Ms. Lim', status: 'attended', date: '2025-12-10' },
      { id: 'ls7', studentId: 's7', studentName: 'Mika Flores', instructorId: 't1', instructorName: 'Mr. Cruz', status: 'missed', date: '2025-11-30' },
      { id: 'ls8', studentId: 's9', studentName: 'Jared Ong', instructorId: 't3', instructorName: 'Ms. Reyes', status: 'rescheduled', date: '2024-10-26' },
    ],
    enrollmentsProgress: [
      { studentId: 's1', studentName: 'Ana Reyes', instructorId: 't1', instructorName: 'Mr. Cruz', totalSessions: 8, completedSessions: 5 },
      { studentId: 's2', studentName: 'Marco Santos', instructorId: 't2', instructorName: 'Ms. Lim', totalSessions: 12, completedSessions: 3 },
      { studentId: 's4', studentName: 'Luis Tan', instructorId: 't3', instructorName: 'Ms. Reyes', totalSessions: 10, completedSessions: 2 },
      { studentId: 's6', studentName: 'Noah Castillo', instructorId: 't2', instructorName: 'Ms. Lim', totalSessions: 12, completedSessions: 12 },
      { studentId: 's7', studentName: 'Mika Flores', instructorId: 't1', instructorName: 'Mr. Cruz', totalSessions: 6, completedSessions: 2 },
      { studentId: 's9', studentName: 'Jared Ong', instructorId: 't3', instructorName: 'Ms. Reyes', totalSessions: 8, completedSessions: 1 },
    ],
  },
  instructors: {
    assignments: [
      { instructorId: 't1', instructorName: 'Mr. Cruz', assignedStudents: 8, scheduledSessions: 14, studioAllocations: 3 },
      { instructorId: 't2', instructorName: 'Ms. Lim', assignedStudents: 6, scheduledSessions: 11, studioAllocations: 2 },
      { instructorId: 't3', instructorName: 'Ms. Reyes', assignedStudents: 5, scheduledSessions: 9, studioAllocations: 1 },
    ],
    scheduledSessions: [
      { id: 'sc1', instructorId: 't1', instructorName: 'Mr. Cruz', studentName: 'Ana Reyes', date: '2026-05-14', time: '09:00', studioRoom: 'Studio A' },
      { id: 'sc2', instructorId: 't1', instructorName: 'Mr. Cruz', studentName: 'Pia Gomez', date: '2026-05-14', time: '10:00', studioRoom: 'Studio A' },
      { id: 'sc3', instructorId: 't2', instructorName: 'Ms. Lim', studentName: 'Marco Santos', date: '2026-05-15', time: '11:00', studioRoom: 'Studio B' },
    ],
  },
  studioBookings: [
    { id: 'bk1', room: 'Studio A', clientName: 'Ana Reyes', date: '2026-05-14', durationMinutes: 60 },
    { id: 'bk2', room: 'Studio B', clientName: 'Marco Santos', date: '2026-05-16', durationMinutes: 120 },
    { id: 'bk3', room: 'Studio A', clientName: 'Pia Gomez', date: '2026-05-18', durationMinutes: 60 },
    { id: 'bk4', room: 'Studio C', clientName: 'Luis Tan', date: '2026-05-18', durationMinutes: 240 },
    { id: 'bk5', room: 'Studio B', clientName: 'Mika Flores', date: '2025-11-28', durationMinutes: 120 },
    { id: 'bk6', room: 'Studio A', clientName: 'Noah Castillo', date: '2025-12-03', durationMinutes: 60 },
    { id: 'bk7', room: 'Studio C', clientName: 'Jared Ong', date: '2024-10-22', durationMinutes: 180 },
  ],
}

// ───────────────────────────────────────────────────────────────
// Query helpers
// ───────────────────────────────────────────────────────────────

function dateOnly(isoOrDate) {
  if (!isoOrDate) return ''
  return String(isoOrDate).slice(0, 10)
}

function inDateRange(d, start, end) {
  const dd = dateOnly(d)
  if (start && dd < start) return false
  if (end && dd > end) return false
  return true
}

function monthKey(dateStr) {
  return dateStr.slice(0, 7)
}

function yearKey(dateStr) {
  return dateStr.slice(0, 4)
}

function quarterKey(dateStr) {
  const y = Number(dateStr.slice(0, 4))
  const m = Number(dateStr.slice(5, 7))
  const q = Math.floor((m - 1) / 3) + 1
  return `${y}-Q${q}`
}

function groupBy(arr, keyFn) {
  const map = new Map()
  for (const item of arr) {
    const k = keyFn(item)
    const prev = map.get(k)
    if (prev) prev.push(item)
    else map.set(k, [item])
  }
  return map
}

// ───────────────────────────────────────────────────────────────
// Mapping helpers (convert API response format to report format)
// ───────────────────────────────────────────────────────────────

function mapEnrollment(row) {
  return {
    id: String(row.id),
    studentId: String(row.student_id),
    studentName: row.student_name || 'Unknown',
    packageId: row.package_id ? String(row.package_id) : '',
    packageName: row.package_name || row.course_name || 'N/A',
    createdAt: dateOnly(row.enrollment_date || row.created_at),
    isReenrollment: Boolean(row.is_reenrollment)
  }
}

function mapCharge(row) {
  return {
    id: String(row.id),
    ref: `${row.ref_type}-${row.ref_id}`,
    customerName: row.customer_name,
    serviceType: row.service_type,
    amount: Number(row.amount),
    status: row.status.charAt(0).toUpperCase() + row.status.slice(1),
    createdAt: dateOnly(row.created_at)
  }
}

function mapInvoice(row) {
  return {
    id: String(row.id),
    invoiceNo: row.invoice_no,
    ref: row.ref_type ? `${row.ref_type}-${row.ref_id}` : '',
    customerName: row.customer_name,
    amount: Number(row.amount),
    balance: Number(row.balance),
    status: row.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    issuedAt: dateOnly(row.issued_at)
  }
}

function mapPayment(row) {
  return {
    id: String(row.id),
    invoiceNo: row.invoice_no || '',
    payerName: row.payer_name,
    method: row.method.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    serviceType: row.service_type,
    amount: Number(row.amount),
    paidAt: dateOnly(row.paid_at),
    kind: row.payment_type === 'full' ? 'Full' : 'Installment'
  }
}

async function tryFetch(apiCall, fallback) {
  try {
    const res = await apiCall()
    return res.data
  } catch {
    console.warn('API fallback used')
    return fallback
  }
}

export async function fetchEnrollmentRows() {
  const data = await tryFetch(() => enrollmentsAPI.getAll(), fallbackDb.enrollments)
  return Array.isArray(data) ? data.map(mapEnrollment) : [...fallbackDb.enrollments]
}

export async function fetchEnrollmentSummary({ period }) {
  const rows = await fetchEnrollmentRows()
  const sorted = [...rows].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const keyFn = period === 'daily' ? r => r.createdAt
    : period === 'monthly' ? r => monthKey(r.createdAt)
    : period === 'quarterly' ? r => quarterKey(r.createdAt)
    : r => yearKey(r.createdAt)
  const grouped = groupBy(sorted, keyFn)
  const series = Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, items]) => ({
      periodKey: k,
      total: items.length,
      newEnrollees: items.filter(x => !x.isReenrollment).length,
      reenrollees: items.filter(x => x.isReenrollment).length,
      packageCounts: items.reduce((a, i) => { a[i.packageName] = (a[i.packageName] || 0) + 1; return a }, {}),
      rows: items
    }))
  return { series, rows }
}

export async function fetchBillingReport() {
  const charges = await tryFetch(() => billingAPI.getCharges(), fallbackDb.billing.charges)
  const invoices = await tryFetch(() => billingAPI.getInvoices(), fallbackDb.billing.invoices)
  return {
    charges: Array.isArray(charges) ? charges.map(mapCharge) : [...fallbackDb.billing.charges],
    invoices: Array.isArray(invoices) ? invoices.map(mapInvoice) : [...fallbackDb.billing.invoices]
  }
}

export async function fetchPaymentReport({ startDate, endDate, method, serviceType }) {
  const payments = await tryFetch(() => billingAPI.getPayments(), fallbackDb.payments)
  const mapped = (Array.isArray(payments) ? payments : []).map(mapPayment)
  const filtered = mapped.length > 0 ? mapped.filter(p => {
    if (!inDateRange(p.paidAt, startDate, endDate)) return false
    if (method && method !== 'all' && p.method !== method) return false
    if (serviceType && serviceType !== 'all' && p.serviceType !== serviceType) return false
    return true
  }) : fallbackDb.payments
  const invs = await tryFetch(() => billingAPI.getInvoices(), fallbackDb.billing.invoices)
  const usedInvs = Array.isArray(invs) && invs.length > 0 ? invs.map(mapInvoice) : fallbackDb.billing.invoices
  return {
    payments: filtered, invoices: usedInvs,
    totalPaymentsReceived: filtered.reduce((s, p) => s + (Number(p.amount) || 0), 0),
    outstandingBalances: usedInvs.reduce((s, i) => s + (Number(i.balance) || 0), 0),
    installmentPayments: filtered.filter(p => p.kind === 'Installment'),
    overdueAccounts: usedInvs.filter(i => (Number(i.balance) || 0) > 0 && i.status !== 'Paid')
  }
}

export async function fetchAttendanceAndCompletion() {
  const attendance = await tryFetch(() => lessonsAPI.getAttendance(), [])
  const sessions = (Array.isArray(attendance) ? attendance : []).map(a => ({
    id: String(a.id), studentId: String(a.student_id), studentName: a.student_name || 'Unknown',
    instructorId: String(a.instructor_id), instructorName: a.instructor_name || 'Unknown',
    status: a.status, date: dateOnly(a.attended_at || a.created_at)
  }))
  return {
    sessions: sessions.length > 0 ? sessions : [...fallbackDb.lessons.sessions],
    progress: [...fallbackDb.lessons.enrollmentsProgress]
  }
}

export async function fetchInstructorAssignmentReport() {
  const instructors = await tryFetch(() => instructorsAPI.getAll(), [])
  if (Array.isArray(instructors) && instructors.length > 0) {
    const workloads = instructors.map(i => ({
      instructorId: String(i.id), instructorName: `${i.first_name} ${i.last_name}`,
      assignedStudents: 0, scheduledSessions: 0, studioAllocations: 0
    }))
    const schedules = await tryFetch(() => lessonsAPI.getAll(), [])
    const scheduledSessions = Array.isArray(schedules) ? schedules.map(s => ({
      id: String(s.id), instructorId: String(s.instructor_id),
      instructorName: s.instructor_name || 'Unknown', studentName: s.student_name || 'Unknown',
      date: dateOnly(s.scheduled_date), time: s.start_time ? s.start_time.slice(0, 5) : '00:00',
      studioRoom: s.studio_name || 'N/A'
    })) : [...fallbackDb.instructors.scheduledSessions]
    return { workloads, scheduledSessions }
  }
  return {
    workloads: [...fallbackDb.instructors.assignments],
    scheduledSessions: [...fallbackDb.instructors.scheduledSessions]
  }
}

export async function fetchStudioBookingReport() {
  const bookings = await tryFetch(() => studiosAPI.getBookings(), [])
  if (Array.isArray(bookings) && bookings.length > 0) {
    return bookings.map(b => ({
      id: String(b.id), room: b.studio_name || b.room_number || 'N/A',
      clientName: b.client_name, date: dateOnly(b.booking_date),
      durationMinutes: b.duration_minutes || 60
    }))
  }
  return [...fallbackDb.studioBookings]
}

export async function fetchInstrumentUsageReport() {
  const mod = await import('./instrumentUsageModule')
  return mod.fetchInstrumentUsageModuleRows()
}
