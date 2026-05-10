import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// ── CSS variables mapped to JS constants ─────────────────────
const C = {
  bg:      '#f7f6f3',
  surface: '#ffffff',
  border:  '#e8e5df',
  text:    '#1a1814',
  text2:   '#6b6560',
  text3:   '#a09b93',
  accent:  '#2c6e49',
  coral:   '#ff6b6b',
  font:    "'Jost', sans-serif",
  display: "'Cormorant Garamond', serif",
  mono:    "'DM Mono', monospace",
}

// ── OTP Modal ─────────────────────────────────────────────────
function OTPModal({ open, onClose, onVerified, isMobile }) {
  const [digits, setDigits] = useState(['','','','','',''])
  const [timer, setTimer] = useState(59)
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()]
  const showResend = timer <= 0

  useEffect(() => {
    if (!open) return
    if (timer <= 0) return
    const t = setTimeout(() => setTimer(t => t - 1), 1000)
    return () => clearTimeout(t)
  }, [open, timer])

  const handleInput = (val, i) => {
    if (!/^\d?$/.test(val)) return
    const next = [...digits]; next[i] = val; setDigits(next)
    if (val && i < 5) refs[i + 1].current?.focus()
  }

  const handleKeyDown = (e, i) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs[i - 1].current?.focus()
  }

  const verify = () => {
    if (digits.join('').length === 6) onVerified()
  }

  const resend = () => {
    setTimer(59)
    setDigits(['','','','','',''])
  }

  if (!open) return null
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(26,24,20,.45)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(2px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:'16px', padding:isMobile ? '20px' : '30px', width:'380px', maxWidth:'95vw', textAlign:'center', boxShadow:'0 8px 40px rgba(0,0,0,.10)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
          <span style={{ fontSize:'16px', fontWeight:600, fontFamily:C.font }}>Password Reset</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:C.text2, cursor:'pointer', fontSize:'18px' }}>✕</button>
        </div>
        <div style={{ fontSize:'36px', marginBottom:'10px' }}>✉️</div>
        <p style={{ color:C.text2, fontSize:'13px', marginBottom:'6px', fontFamily:C.font }}>OTP sent to <strong style={{ color:C.text }}>admin@cadenza.edu</strong></p>
        <p style={{ color:C.text3, fontSize:'12px', fontFamily:C.font }}>Enter the 6-digit code below</p>
        <div style={{ display:'flex', gap:isMobile ? '6px' : '10px', justifyContent:'center', margin:'20px 0' }}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              value={d}
              maxLength={1}
              onChange={e => handleInput(e.target.value, i)}
              onKeyDown={e => handleKeyDown(e, i)}
              style={{ width:isMobile ? '40px' : '48px', height:isMobile ? '44px' : '52px', textAlign:'center', fontSize:isMobile ? '18px' : '22px', fontFamily:C.mono, background:'#f0ede8', border:`1.5px solid ${C.border}`, borderRadius:'10px', color:C.text, outline:'none' }}
            />
          ))}
        </div>
        <button
          onClick={verify}
          style={{ width:'100%', padding:'12px', background:C.accent, color:'#fff', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:500, cursor:'pointer', fontFamily:C.font }}
        >
          Verify &amp; Continue
        </button>
        <p style={{ fontSize:'12px', color:C.text3, marginTop:'12px', fontFamily:C.font }}>
          Resend code in <span style={{ color:C.accent }}>00:{String(timer).padStart(2,'0')}</span>
        </p>
        {showResend && (
          <button onClick={resend} style={{ width:'100%', padding:'10px', background:C.surface, color:C.text2, border:`1px solid ${C.border}`, borderRadius:'8px', fontSize:'13px', cursor:'pointer', marginTop:'10px', fontFamily:C.font }}>
            Resend OTP
          </button>
        )}
      </div>
    </div>
  )
}

// ── Change Password Modal ─────────────────────────────────────
function ChangePasswordModal({ open, onClose, onSuccess, isMobile }) {
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')

  const strength = (pwd) => {
    let s = 0
    if (pwd.length >= 8) s++
    if (/[A-Z]/.test(pwd)) s++
    if (/[0-9]/.test(pwd)) s++
    if (/[^A-Za-z0-9]/.test(pwd)) s++
    return s
  }

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColor = ['', C.coral, '#f0b429', '#0fd4b4', '#22c55e']
  const s = strength(newPwd)

  const submit = () => {
    if (!newPwd || newPwd.length < 8) return setError('Password must be at least 8 characters long.')
    if (newPwd !== confirmPwd) return setError('Passwords do not match.')
    setError('')
    onSuccess()
  }

  if (!open) return null
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(26,24,20,.45)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(2px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:'16px', padding:isMobile ? '20px' : '30px', width:'400px', maxWidth:'95vw', boxShadow:'0 8px 40px rgba(0,0,0,.10)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
          <span style={{ fontSize:'16px', fontWeight:600, fontFamily:C.font }}>Set New Password</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:C.text2, cursor:'pointer', fontSize:'18px' }}>✕</button>
        </div>
        <div style={{ fontSize:'40px', marginBottom:'8px', textAlign:'center' }}>🔐</div>
        <p style={{ color:C.text2, fontSize:'13px', marginBottom:'20px', fontFamily:C.font }}>Create a strong new password for your account. It must be at least 8 characters long.</p>

        {error && <div style={{ background:'rgba(255,107,107,.1)', border:'1px solid rgba(255,107,107,.25)', borderRadius:'8px', padding:'10px 12px', fontSize:'12px', color:C.coral, marginBottom:'12px', fontFamily:C.font }}>{error}</div>}

        <div style={{ marginBottom:'14px' }}>
          <label style={{ display:'block', fontSize:'11px', fontWeight:600, color:C.text2, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:'5px', fontFamily:C.font }}>New Password</label>
          <div style={{ position:'relative' }}>
            <input
              type={showNew ? 'text' : 'password'}
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              placeholder="Enter new password"
              style={{ width:'100%', background:'#f7f6f3', border:`1px solid ${C.border}`, borderRadius:'8px', padding:'10px 40px 10px 14px', color:C.text, fontSize:'14px', outline:'none', fontFamily:C.font, boxSizing:'border-box' }}
            />
            <button onClick={() => setShowNew(v => !v)} style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:C.text3, fontSize:'14px' }}>👁</button>
          </div>
          {newPwd && (
            <div style={{ marginTop:'8px' }}>
              <div style={{ height:'4px', background:'#f0ede8', borderRadius:'4px', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${(s/4)*100}%`, background:strengthColor[s], borderRadius:'4px', transition:'all .3s' }} />
              </div>
              <div style={{ fontSize:'11px', color:C.text3, marginTop:'4px', fontFamily:C.font }}>{strengthLabel[s]}</div>
            </div>
          )}
        </div>

        <div style={{ marginBottom:'14px' }}>
          <label style={{ display:'block', fontSize:'11px', fontWeight:600, color:C.text2, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:'5px', fontFamily:C.font }}>Confirm New Password</label>
          <div style={{ position:'relative' }}>
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)}
              placeholder="Re-enter new password"
              style={{ width:'100%', background:'#f7f6f3', border:`1px solid ${C.border}`, borderRadius:'8px', padding:'10px 40px 10px 14px', color:C.text, fontSize:'14px', outline:'none', fontFamily:C.font, boxSizing:'border-box' }}
            />
            <button onClick={() => setShowConfirm(v => !v)} style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:C.text3, fontSize:'14px' }}>👁</button>
          </div>
          {confirmPwd && (
            <div style={{ fontSize:'11px', marginTop:'4px', color: newPwd === confirmPwd ? '#22c55e' : C.coral, fontFamily:C.font }}>
              {newPwd === confirmPwd ? '✓ Passwords match' : '✗ Passwords do not match'}
            </div>
          )}
        </div>

        <button onClick={submit} style={{ width:'100%', padding:'12px', background:C.text, color:'#fff', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:500, cursor:'pointer', fontFamily:C.font }}>
          Save New Password →
        </button>
        <p style={{ fontSize:'11px', color:C.text3, marginTop:'12px', textAlign:'center', fontFamily:C.font }}>Use a mix of letters, numbers, and symbols for a stronger password.</p>
      </div>
    </div>
  )
}

// ── Password Changed Success Modal ────────────────────────────
function PwdSuccessModal({ open, onClose, isMobile }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(26,24,20,.45)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(2px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:'16px', padding:isMobile ? '20px' : '30px', width:'380px', maxWidth:'95vw', textAlign:'center', boxShadow:'0 8px 40px rgba(0,0,0,.10)' }}>
        <div style={{ fontSize:'52px', marginBottom:'12px' }}>✅</div>
        <div style={{ fontWeight:700, fontSize:'18px', marginBottom:'8px', fontFamily:C.font }}>Password Changed!</div>
        <div style={{ color:C.text2, fontSize:'13px', lineHeight:1.7, marginBottom:'20px', fontFamily:C.font }}>Your password has been updated successfully. You can now log in with your new password.</div>
        <button onClick={onClose} style={{ width:'100%', padding:'12px', background:C.accent, color:'#fff', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:500, cursor:'pointer', fontFamily:C.font }}>
          Back to Login →
        </button>
      </div>
    </div>
  )
}

// ── Main Login Component ──────────────────────────────────────
function Login() {
  const navigate = useNavigate()
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth)
  const [role, setRole] = useState('admin')
  const [username, setUsername] = useState('admin@Cadenza MUsic Center')
  const [password, setPassword] = useState('••••••••')
  const [showOTP, setShowOTP] = useState(false)
  const [otpSession, setOtpSession] = useState(0)
  const [showChangePwd, setShowChangePwd] = useState(false)
  const [showPwdSuccess, setShowPwdSuccess] = useState(false)
  const [error, setError] = useState('')
  const isMobile = viewportWidth < 600

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const doLogin = () => {
    if (!username.trim()) return setError('Please enter your username.')
    if (!password.trim()) return setError('Please enter your password.')
    setError('')
    navigate('/admin/dashboard')
  }

  const handleOTPVerified = () => {
    setShowOTP(false)
    setShowChangePwd(true)
  }

  const handlePwdSuccess = () => {
    setShowChangePwd(false)
    setShowPwdSuccess(true)
  }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&family=DM+Mono:wght@300;400&display=swap" rel="stylesheet" />

      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'100vw', minHeight:'100vh', background:C.bg, flexDirection:'column', padding:isMobile ? '14px' : '20px' }}>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:'16px', padding:isMobile ? '24px 16px' : '44px', width:'100%', maxWidth:'400px', boxShadow:'0 4px 24px rgba(0,0,0,.06)' }}>

          {/* Logo */}
          <div style={{ textAlign:'center', marginBottom:'28px' }}>
            <div style={{ width:'52px', height:'52px', borderRadius:'16px', margin:'0 auto 10px', background:C.text, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px' }}>🎵</div>
            <h1 style={{ fontFamily:C.display, fontSize:isMobile ? '24px' : '28px', fontWeight:400, letterSpacing:'0.02em', color:C.text, margin:0 }}>Cadenza Music Center</h1>
            <p style={{ fontSize:'12px', color:C.text3, marginTop:'3px', fontFamily:C.font }}>Music School Management System</p>
          </div>

          {/* Role Tabs */}
          <div style={{ display:'flex', gap:'2px', background:'#f0ede8', padding:'3px', borderRadius:'8px', marginBottom:'22px', flexWrap:isMobile ? 'wrap' : 'nowrap' }}>
            {[['admin','Administrator'],['frontdesk','Front Desk']].map(([key, label]) => (
              <div
                key={key}
                onClick={() => setRole(key)}
                style={{ flex:1, minWidth:isMobile ? '100%' : 0, padding:'7px 4px', textAlign:'center', borderRadius:'6px', cursor:'pointer', fontSize:'11px', fontWeight:500, color: role === key ? C.text : C.text2, background: role === key ? C.surface : 'transparent', boxShadow: role === key ? '0 1px 3px rgba(0,0,0,.08)' : 'none', transition:'all .15s', fontFamily:C.font, whiteSpace:'nowrap' }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{ background:'rgba(255,107,107,.1)', border:'1px solid rgba(255,107,107,.25)', borderRadius:'8px', padding:'8px 12px', fontSize:'13px', color:C.coral, marginBottom:'12px', fontFamily:C.font }}>
              ⚠ {error}
            </div>
          )}

          {/* Username */}
          <div style={{ marginBottom:'14px' }}>
            <label style={{ display:'block', fontSize:'11px', fontWeight:600, color:C.text2, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:'5px', fontFamily:C.font }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username"
              onFocus={e => e.target.style.borderColor = C.accent}
              onBlur={e => e.target.style.borderColor = C.border}
              style={{ width:'100%', background:'#f7f6f3', border:`1px solid ${C.border}`, borderRadius:'8px', padding:'10px 14px', color:C.text, fontSize:'14px', outline:'none', fontFamily:C.font, boxSizing:'border-box', transition:'border .15s' }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom:'14px' }}>
            <label style={{ display:'block', fontSize:'11px', fontWeight:600, color:C.text2, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:'5px', fontFamily:C.font }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onFocus={e => e.target.style.borderColor = C.accent}
              onBlur={e => e.target.style.borderColor = C.border}
              onKeyDown={e => e.key === 'Enter' && doLogin()}
              style={{ width:'100%', background:'#f7f6f3', border:`1px solid ${C.border}`, borderRadius:'8px', padding:'10px 14px', color:C.text, fontSize:'14px', outline:'none', fontFamily:C.font, boxSizing:'border-box', transition:'border .15s' }}
            />
          </div>

          {/* Login Button */}
          <button
            onClick={doLogin}
            onMouseEnter={e => e.currentTarget.style.background = '#2a2520'}
            onMouseLeave={e => e.currentTarget.style.background = C.text}
            style={{ width:'100%', padding:'12px', background:C.text, color:'#fff', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:500, letterSpacing:'0.04em', cursor:'pointer', marginTop:'4px', fontFamily:C.font, transition:'background .15s' }}
          >
            Login
          </button>

          {/* Forgot Password */}
          <div
            onClick={() => {
              setOtpSession(s => s + 1)
              setShowOTP(true)
            }}
            onMouseEnter={e => e.currentTarget.style.color = C.accent}
            onMouseLeave={e => e.currentTarget.style.color = C.text3}
            style={{ textAlign:'center', marginTop:'14px', fontSize:'12px', color:C.text3, cursor:'pointer', fontFamily:C.font, transition:'color .15s' }}
          >
            Forgot Password?
          </div>

        </div>
      </div>

      {/* OTP Modal */}
      <OTPModal key={otpSession} open={showOTP} onClose={() => setShowOTP(false)} onVerified={handleOTPVerified} isMobile={isMobile} />

      {/* Change Password Modal */}
      <ChangePasswordModal open={showChangePwd} onClose={() => setShowChangePwd(false)} onSuccess={handlePwdSuccess} isMobile={isMobile} />

      {/* Password Changed Success Modal */}
      <PwdSuccessModal open={showPwdSuccess} onClose={() => setShowPwdSuccess(false)} isMobile={isMobile} />
    </>
  )
}

export default Login