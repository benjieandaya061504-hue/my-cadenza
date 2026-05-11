import { useMemo } from 'react'
import { fetchBillingReport } from '../../services/centralDb'

const C = {
  bg3: '#1a1c24',
  bg4: '#1f2130',
  border: 'rgba(255,255,255,0.07)',
  text: '#f0eff4',
  text2: '#9b99a8',
  text3: '#5a5870',
  green: '#34d399',
  gold: '#fbbf24',
  coral: '#f87171',
  font: "'Outfit', sans-serif",
  display: "'Syne', sans-serif",
  mono: "'Space Mono', monospace",
}

function BillingReport({ isMobile = false, isTablet = false }) {
  const data = useMemo(() => fetchBillingReport(), [])
  const fmt = n => `₱${Number(n || 0).toLocaleString()}`

  const stats = useMemo(() => {
    const generatedCharges = data.charges.length
    const issuedInvoices = data.invoices.length
    const balances = data.invoices.reduce((s, inv) => s + (Number(inv.balance) || 0), 0)
    return { generatedCharges, issuedInvoices, balances }
  }, [data])

  return (
    <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: isMobile ? '14px' : '18px 20px' }}>
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontFamily: C.display, fontSize: '15px', fontWeight: 700, color: C.text }}>Billing report</div>
        <div style={{ fontSize: '12px', color: C.text3, marginTop: '2px' }}>
          Overview of generated charges, issued sales invoices, and corresponding balances.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
        {[
          { label: 'Generated charges', value: stats.generatedCharges },
          { label: 'Issued invoices', value: stats.issuedInvoices },
          { label: 'Total balances', value: fmt(stats.balances) },
        ].map(s => (
          <div key={s.label} style={{ background: C.bg4, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '12px 14px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em' }}>{s.label}</div>
            <div style={{ fontFamily: C.display, fontSize: '22px', fontWeight: 700, color: C.text, marginTop: '2px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '12px', fontWeight: 700, color: C.text, marginBottom: '10px' }}>Generated charges (detailed)</div>
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${C.border}`, marginBottom: '16px' }}>
        <table style={{ width: '100%', minWidth: isTablet ? '760px' : '880px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.bg4 }}>
              {['Date', 'Reference', 'Customer', 'Service type', 'Amount', 'Status'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '10px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: `1px solid ${C.border}` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.charges.map((c, idx) => (
              <tr key={c.id} style={{ borderBottom: idx < data.charges.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text2 }}>{c.createdAt}</td>
                <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text2 }}>{c.ref}</td>
                <td style={{ padding: '11px 12px', fontSize: '13px', fontWeight: 600, color: C.text }}>{c.customerName}</td>
                <td style={{ padding: '11px 12px', fontSize: '12px', color: C.text2 }}>{c.serviceType}</td>
                <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text }}>{fmt(c.amount)}</td>
                <td style={{ padding: '11px 12px', fontSize: '12px', color: C.text2, fontWeight: 600 }}>{c.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: '12px', fontWeight: 700, color: C.text, marginBottom: '10px' }}>Sales invoices & balances (detailed)</div>
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${C.border}` }}>
        <table style={{ width: '100%', minWidth: isTablet ? '760px' : '900px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.bg4 }}>
              {['Issued', 'Invoice', 'Reference', 'Customer', 'Amount', 'Balance', 'Status'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '10px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: `1px solid ${C.border}` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.invoices.map((inv, idx) => {
              const bal = Number(inv.balance) || 0
              const balColor = bal === 0 ? C.green : bal > 0 ? C.gold : C.text2
              return (
                <tr key={inv.id} style={{ borderBottom: idx < data.invoices.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text2 }}>{inv.issuedAt}</td>
                  <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text2, fontWeight: 700 }}>{inv.invoiceNo}</td>
                  <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text2 }}>{inv.ref}</td>
                  <td style={{ padding: '11px 12px', fontSize: '13px', fontWeight: 600, color: C.text }}>{inv.customerName}</td>
                  <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text }}>{fmt(inv.amount)}</td>
                  <td style={{ padding: '11px 12px', fontFamily: C.mono, fontSize: '12px', color: balColor, fontWeight: 700 }}>{fmt(inv.balance)}</td>
                  <td style={{ padding: '11px 12px', fontSize: '12px', color: inv.status === 'Unpaid' ? C.coral : C.text2, fontWeight: 600 }}>{inv.status}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default BillingReport

