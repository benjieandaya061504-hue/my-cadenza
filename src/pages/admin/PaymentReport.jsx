import { useMemo, useState } from 'react'
import { fetchPaymentReport } from '../../services/centralDb'

const C = {
  bg3: '#1a1c24',
  bg4: '#1f2130',
  border: 'rgba(255,255,255,0.07)',
  text: '#f0eff4',
  text2: '#9b99a8',
  text3: '#5a5870',
  teal: '#2dd4bf',
  coral: '#f87171',
  gold: '#fbbf24',
  green: '#34d399',
  font: "'Outfit', sans-serif",
  display: "'Syne', sans-serif",
  mono: "'Space Mono', monospace",
}

const PAYMENT_METHODS = ['Cash', 'GCash', 'Bank transfer']
const SERVICE_TYPES = ['Lessons', 'Studio booking', 'Instrument rental']

function PaymentReport({ isMobile = false, isTablet = false }) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [method, setMethod] = useState('all')
  const [serviceType, setServiceType] = useState('all')

  const data = useMemo(
    () => fetchPaymentReport({ startDate, endDate, method, serviceType }),
    [startDate, endDate, method, serviceType],
  )

  const fmt = n => `₱${Number(n || 0).toLocaleString()}`

  const selectBase = {
    background: C.bg4,
    border: `1px solid ${C.border}`,
    borderRadius: '10px',
    padding: '8px 10px',
    color: C.text,
    fontFamily: C.font,
    fontSize: '13px',
    cursor: 'pointer',
    outline: 'none',
  }

  return (
    <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: isMobile ? '14px' : '18px 20px' }}>
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontFamily: C.display, fontSize: '15px', fontWeight: 700, color: C.text }}>Payment report</div>
        <div style={{ fontSize: '12px', color: C.text3, marginTop: '2px' }}>
          Payments received, outstanding balances, installment payments, and overdue accounts (filterable).
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: isMobile ? 'stretch' : 'flex-end', marginBottom: '16px' }}>
        <div style={{ flex: '1 1 160px' }}>
          <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px', fontFamily: C.font }}>
            Start date
          </label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ ...selectBase, width: '100%' }} />
        </div>
        <div style={{ flex: '1 1 160px' }}>
          <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px', fontFamily: C.font }}>
            End date
          </label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ ...selectBase, width: '100%' }} />
        </div>
        <div style={{ flex: '1 1 170px' }}>
          <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px', fontFamily: C.font }}>
            Payment method
          </label>
          <select value={method} onChange={e => setMethod(e.target.value)} style={{ ...selectBase, width: '100%' }}>
            <option value="all">All</option>
            {PAYMENT_METHODS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: '1 1 190px' }}>
          <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px', fontFamily: C.font }}>
            Service type
          </label>
          <select value={serviceType} onChange={e => setServiceType(e.target.value)} style={{ ...selectBase, width: '100%' }}>
            <option value="all">All</option>
            {SERVICE_TYPES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: '0 0 auto', marginLeft: isMobile ? 0 : 'auto' }}>
          <button
            type="button"
            onClick={() => { setStartDate(''); setEndDate(''); setMethod('all'); setServiceType('all') }}
            style={{ padding: '9px 14px', borderRadius: '10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontFamily: C.font, fontSize: '13px', fontWeight: 600 }}
          >
            Clear filters
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
        {[
          { label: 'Total payments received', value: fmt(data.totalPaymentsReceived), color: C.teal },
          { label: 'Outstanding balances', value: fmt(data.outstandingBalances), color: C.gold },
          { label: 'Installment payments', value: data.installmentPayments.length, color: C.text2 },
          { label: 'Overdue accounts', value: data.overdueAccounts.length, color: C.coral },
        ].map(s => (
          <div key={s.label} style={{ background: C.bg4, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '12px 14px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em' }}>{s.label}</div>
            <div style={{ fontFamily: C.display, fontSize: '22px', fontWeight: 700, color: s.color || C.text, marginTop: '2px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '12px', fontWeight: 700, color: C.text, marginBottom: '10px' }}>Payments received (detailed)</div>
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${C.border}`, marginBottom: '16px' }}>
        <table style={{ width: '100%', minWidth: isTablet ? '760px' : '920px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.bg4 }}>
              {['Paid at', 'Payer', 'Invoice', 'Method', 'Service type', 'Amount', 'Installment'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '10px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: `1px solid ${C.border}` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.payments.map((p, idx) => (
              <tr key={p.id} style={{ borderBottom: idx < data.payments.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text2 }}>{p.paidAt}</td>
                <td style={{ padding: '11px 12px', fontSize: '13px', fontWeight: 600, color: C.text }}>{p.payerName}</td>
                <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text2, fontWeight: 700 }}>{p.invoiceNo}</td>
                <td style={{ padding: '11px 12px', fontSize: '12px', color: C.text2 }}>{p.method}</td>
                <td style={{ padding: '11px 12px', fontSize: '12px', color: C.text2 }}>{p.serviceType}</td>
                <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text }}>{fmt(p.amount)}</td>
                <td style={{ padding: '11px 12px', fontSize: '12px', color: p.kind === 'Installment' ? C.gold : C.text3, fontWeight: 700 }}>
                  {p.kind === 'Installment' ? 'Yes' : 'No'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: '12px', fontWeight: 700, color: C.text, marginBottom: '10px' }}>Overdue accounts (detailed)</div>
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${C.border}` }}>
        <table style={{ width: '100%', minWidth: isTablet ? '700px' : '880px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.bg4 }}>
              {['Invoice', 'Customer', 'Amount', 'Balance', 'Status'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '10px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: `1px solid ${C.border}` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.overdueAccounts.map((inv, idx) => (
              <tr key={inv.id} style={{ borderBottom: idx < data.overdueAccounts.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text2, fontWeight: 700 }}>{inv.invoiceNo}</td>
                <td style={{ padding: '11px 12px', fontSize: '13px', fontWeight: 600, color: C.text }}>{inv.customerName}</td>
                <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text2 }}>{fmt(inv.amount)}</td>
                <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.coral, fontWeight: 700 }}>{fmt(inv.balance)}</td>
                <td style={{ padding: '11px 12px', fontSize: '12px', color: C.text2, fontWeight: 700 }}>{inv.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PaymentReport

