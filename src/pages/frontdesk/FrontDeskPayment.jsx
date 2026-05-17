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
  mono: "'Space Mono', monospace",
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

export default function FrontDeskPayment({ isMobile, isTablet }) {
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [amount, setAmount] = useState('')
  const [reference, setReference] = useState('')
  const [client, setClient] = useState('')
  const [recentPayments, setRecentPayments] = useState([
    { id: 1, client: 'Maria Santos', amount: '₱4,000', method: 'Cash', reference: 'N/A', date: 'Today, 10:30 AM', invoice: 'INV-2026-001' },
    { id: 2, client: 'John Reyes', amount: '₱6,000', method: 'GCash', reference: 'GCASH-12345', date: 'Today, 9:15 AM', invoice: 'INV-2026-002' },
    { id: 3, client: 'Pia Gomez', amount: '₱4,000', method: 'Cash', reference: 'N/A', date: 'Yesterday, 4:45 PM', invoice: 'INV-2026-005' },
    { id: 4, client: 'Luis Tan', amount: '₱2,500', method: 'Maya', reference: 'MAYA-67890', date: 'Yesterday, 2:20 PM', invoice: 'INV-2026-006' },
  ])

  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: '💵' },
    { id: 'gcash', label: 'GCash', icon: '📱' },
    { id: 'maya', label: 'Maya', icon: '💳' },
    { id: 'bank', label: 'Bank Transfer', icon: '🏦' },
    { id: 'cheque', label: 'Cheque', icon: '📄' },
  ]

  const handleRecordPayment = () => {
    if (!client || !amount) return alert('Please fill in client and amount')
    const newPayment = {
      id: Math.max(...recentPayments.map(p => p.id)) + 1,
      client,
      amount,
      method: paymentMethods.find(pm => pm.id === paymentMethod).label,
      reference: reference || 'N/A',
      date: 'Just now',
      invoice: `INV-2026-${String(Math.max(...recentPayments.map(p => p.id)) + 1).padStart(3, '0')}`
    }
    setRecentPayments([newPayment, ...recentPayments])
    setClient('')
    setAmount('')
    setReference('')
    alert('Payment recorded successfully!')
  }

  const handlePrintReceipt = (id) => {
    const payment = recentPayments.find(p => p.id === id)
    alert(`Printing receipt for ${payment.client} - ${payment.amount}\nInvoice: ${payment.invoice}\nMethod: ${payment.method}`)
  }

  return (
    <>
      <style>{css}</style>
      <div style={{ fontFamily: C.font }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: C.display, fontSize: isMobile ? '24px' : '30px', fontWeight: 800, color: C.text, letterSpacing: '-0.02em', marginBottom: '8px' }}>Payment Processing</h1>
          <p style={{ color: C.text3, fontSize: '13px' }}>Record payments via cash, e-wallets, or cheques and generate receipts</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 2fr', gap: '20px' }}>
          <div className="card" style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontFamily: C.display, fontSize: '15px', fontWeight: 700, color: C.text, marginBottom: '16px' }}>New Payment</div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: '8px' }}>Payment Method</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' }}>
                {paymentMethods.map(pm => (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className="btn"
                    style={{
                      padding: '12px', borderRadius: '10px', border: `1px solid ${paymentMethod === pm.id ? C.accent : C.border}`,
                      background: paymentMethod === pm.id ? 'rgba(124,106,247,0.15)' : C.bg4,
                      cursor: 'pointer', fontSize: '12px', fontFamily: C.font, fontWeight: 500,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{pm.icon}</span>
                    <span>{pm.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: '8px' }}>Client Name</label>
              <input
                type="text"
                placeholder="Client name"
                value={client}
                onChange={e => setClient(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '10px',
                  background: C.bg4, border: `1px solid ${C.border}`,
                  color: C.text, fontFamily: C.font, fontSize: '13px', outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: '8px' }}>Amount</label>
              <input
                type="text"
                placeholder="₱0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '10px',
                  background: C.bg4, border: `1px solid ${C.border}`,
                  color: C.text, fontFamily: C.mono, fontSize: '14px', outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: '8px' }}>Reference Number</label>
              <input
                type="text"
                placeholder="Reference number (optional)"
                value={reference}
                onChange={e => setReference(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '10px',
                  background: C.bg4, border: `1px solid ${C.border}`,
                  color: C.text, fontFamily: C.font, fontSize: '13px', outline: 'none',
                }}
              />
            </div>

            <button onClick={handleRecordPayment} className="btn" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: '#fff', cursor: 'pointer', fontSize: '13px', fontFamily: C.font, fontWeight: 600 }}>
              Record Payment
            </button>
          </div>

          <div className="card" style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontFamily: C.display, fontSize: '15px', fontWeight: 700, color: C.text, marginBottom: '16px' }}>Recent Payments</div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Client', 'Amount', 'Method', 'Reference', 'Date', 'Invoice', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '10px', fontWeight: 600, color: C.text3, fontFamily: C.font, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((p, i) => (
                    <tr key={p.id} className="row" style={{ borderBottom: i < recentPayments.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                      <td style={{ padding: '13px 12px', fontSize: '13px', fontFamily: C.font, color: C.text, fontWeight: 500 }}>{p.client}</td>
                      <td style={{ padding: '13px 12px', fontFamily: C.mono, fontSize: '13px', color: C.green, fontWeight: 700 }}>{p.amount}</td>
                      <td style={{ padding: '13px 12px', fontSize: '12px', fontFamily: C.font, color: C.text2 }}>{p.method}</td>
                      <td style={{ padding: '13px 12px', fontFamily: C.mono, fontSize: '12px', color: C.text2 }}>{p.reference}</td>
                      <td style={{ padding: '13px 12px', fontSize: '12px', fontFamily: C.font, color: C.text2 }}>{p.date}</td>
                      <td style={{ padding: '13px 12px', fontFamily: C.mono, fontSize: '11px', color: C.text3 }}>{p.invoice}</td>
                      <td style={{ padding: '13px 12px' }}>
                        <button onClick={() => handlePrintReceipt(p.id)} className="btn" style={{ padding: '4px 8px', borderRadius: '6px', border: `1px solid ${C.border}`, background: C.bg4, color: C.text2, cursor: 'pointer', fontSize: '11px', fontFamily: C.font }}>
                          Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

