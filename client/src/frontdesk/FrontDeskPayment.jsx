import { useState } from 'react'
import C from '../admin/theme.js'

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
      amount: amount.startsWith('₱') ? amount : `₱${amount}`,
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
    <div style={{ fontFamily: C.font }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: C.display, fontSize: '1.3rem', fontWeight: 700, color: C.navy, margin: '0 0 4px' }}>Payment Processing</h2>
        <p style={{ fontSize: '0.8rem', color: C.text3, margin: 0 }}>Record payments via cash, e-wallets, or cheques and generate receipts</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 2fr', gap: 20 }}>
        <div style={{
          background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`,
          padding: '1.3rem', boxShadow: '0 4px 12px rgba(30,41,59,0.04)',
        }}>
          <div style={{ fontFamily: C.display, fontSize: '0.9rem', fontWeight: 700, color: C.navy, marginBottom: 16 }}>New Payment</div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: 8 }}>Payment Method</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
              {paymentMethods.map(pm => (
                <button
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id)}
                  style={{
                    padding: '12px', borderRadius: 10, border: `1px solid ${paymentMethod === pm.id ? C.royal : C.border2}`,
                    background: paymentMethod === pm.id ? 'rgba(37,99,235,0.08)' : '#fff',
                    cursor: 'pointer', fontSize: '0.75rem', fontFamily: C.font, fontWeight: 500,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '1.3rem' }}>{pm.icon}</span>
                  <span>{pm.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: 8 }}>Client Name</label>
            <input
              type="text" placeholder="Client name" value={client}
              onChange={e => setClient(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: C.mist, border: `1px solid ${C.border2}`, color: C.text, fontFamily: C.font, fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: 8 }}>Amount</label>
            <input
              type="text" placeholder="₱0.00" value={amount}
              onChange={e => setAmount(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: C.mist, border: `1px solid ${C.border2}`, color: C.text, fontFamily: C.font, fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.7rem', color: C.text3, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: C.font, fontWeight: 500, display: 'block', marginBottom: 8 }}>Reference Number</label>
            <input
              type="text" placeholder="Reference number (optional)" value={reference}
              onChange={e => setReference(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: C.mist, border: `1px solid ${C.border2}`, color: C.text, fontFamily: C.font, fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <button onClick={handleRecordPayment} style={{
            width: '100%', padding: '12px', borderRadius: 10, border: 'none',
            background: `linear-gradient(135deg, ${C.royal}, ${C.purple})`, color: '#fff',
            cursor: 'pointer', fontSize: '0.82rem', fontFamily: C.font, fontWeight: 600,
          }}>Record Payment</button>
        </div>

        <div style={{
          background: '#fff', borderRadius: 18, border: `1px solid ${C.border}`,
          padding: '1.3rem', boxShadow: '0 4px 12px rgba(30,41,59,0.04)',
        }}>
          <div style={{ fontFamily: C.display, fontSize: '0.9rem', fontWeight: 700, color: C.navy, marginBottom: 16 }}>Recent Payments</div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 500, borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Client', 'Amount', 'Method', 'Reference', 'Date', 'Invoice', 'Actions'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '10px 12px', fontSize: '0.65rem', fontWeight: 600,
                      color: C.text3, fontFamily: C.font, textTransform: 'uppercase',
                      letterSpacing: '.1em', borderBottom: `1px solid ${C.border}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: i < recentPayments.length - 1 ? `1px solid ${C.border}` : 'none', transition: 'background 0.15s ease' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '13px 12px', fontSize: '0.82rem', fontFamily: C.font, color: C.text, fontWeight: 500 }}>{p.client}</td>
                    <td style={{ padding: '13px 12px', fontSize: '0.82rem', color: C.green, fontWeight: 700 }}>{p.amount}</td>
                    <td style={{ padding: '13px 12px', fontSize: '0.75rem', fontFamily: C.font, color: C.text2 }}>{p.method}</td>
                    <td style={{ padding: '13px 12px', fontSize: '0.75rem', color: C.text2 }}>{p.reference}</td>
                    <td style={{ padding: '13px 12px', fontSize: '0.75rem', fontFamily: C.font, color: C.text2 }}>{p.date}</td>
                    <td style={{ padding: '13px 12px', fontSize: '0.7rem', color: C.text3 }}>{p.invoice}</td>
                    <td style={{ padding: '13px 12px' }}>
                      <button onClick={() => handlePrintReceipt(p.id)} style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${C.border2}`, background: '#fff', color: C.text2, cursor: 'pointer', fontSize: '0.7rem', fontFamily: C.font }}>Receipt</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}