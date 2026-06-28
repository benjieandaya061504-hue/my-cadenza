import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ADMIN_LOGIN_PATH, FRONTDESK_LOGIN_PATH } from '../../constants/publicRoutes'
import { staffAuthAPI } from '../../services/api'

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
  coral: '#f87171',
  green: '#34d399',
  font: "'Outfit', sans-serif",
  display: "'Syne', sans-serif",
  mono: "'Space Mono', monospace",
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 16px rgba(124,106,247,0.22); }
    50%      { box-shadow: 0 0 30px rgba(124,106,247,0.42); }
  }
  .login-card { animation: fadeUp 0.45s ease both; }
  .glow-ring { animation: glowPulse 2.4s ease-in-out infinite; }
`

function OTPModal({ open, onClose, onVerified, isMobile }) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
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
    setDigits(['', '', '', '', '', ''])
  }

  if (!open) return null
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(5,6,10,0.72)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.bg2, border: `1px solid ${C.border2}`, borderRadius: '16px', padding: isMobile ? '20px' : '30px', width: '380px', maxWidth: '95vw', textAlign: 'center', boxShadow: '0 18px 44px rgba(0,0,0,0.45)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, fontFamily: C.font, color: C.text }}>Password Reset</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.text2, cursor: 'pointer', fontSize: '18px' }}>✕</button>
        </div>
        <div style={{ fontSize: '36px', marginBottom: '10px' }}>✉️</div>
        <p style={{ color: C.text2, fontSize: '13px', marginBottom: '6px', fontFamily: C.font }}>OTP sent to <strong style={{ color: C.text }}>admin@cadenza.edu</strong></p>
        <p style={{ color: C.text3, fontSize: '12px', fontFamily: C.font }}>Enter the 6-digit code below</p>
        <div style={{ display: 'flex', gap: isMobile ? '6px' : '10px', justifyContent: 'center', margin: '20px 0' }}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              value={d}
              maxLength={1}
              onChange={e => handleInput(e.target.value, i)}
              onKeyDown={e => handleKeyDown(e, i)}
              style={{ width: isMobile ? '40px' : '48px', height: isMobile ? '44px' : '52px', textAlign: 'center', fontSize: isMobile ? '18px' : '22px', fontFamily: C.mono, background: C.bg3, border: `1.5px solid ${C.border2}`, borderRadius: '10px', color: C.text, outline: 'none' }}
            />
          ))}
        </div>
        <button
          onClick={verify}
          style={{ width: '100%', padding: '12px', background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: C.font }}
        >
          Verify &amp; Continue
        </button>
        <p style={{ fontSize: '12px', color: C.text3, marginTop: '12px', fontFamily: C.font }}>
          Resend code in <span style={{ color: C.accentL }}>00:{String(timer).padStart(2, '0')}</span>
        </p>
        {showResend && (
          <button onClick={resend} style={{ width: '100%', padding: '10px', background: C.bg3, color: C.text2, border: `1px solid ${C.border2}`, borderRadius: '10px', fontSize: '13px', cursor: 'pointer', marginTop: '10px', fontFamily: C.font }}>
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
  const strengthColor = ['', C.coral, '#fbbf24', '#2dd4bf', C.green]
  const s = strength(newPwd)

  const submit = () => {
    if (!newPwd || newPwd.length < 8) return setError('Password must be at least 8 characters long.')
    if (newPwd !== confirmPwd) return setError('Passwords do not match.')
    setError('')
    onSuccess()
  }

  if (!open) return null
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(5,6,10,0.72)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.bg2, border: `1px solid ${C.border2}`, borderRadius: '16px', padding: isMobile ? '20px' : '30px', width: '400px', maxWidth: '95vw', boxShadow: '0 18px 44px rgba(0,0,0,0.45)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, fontFamily: C.font, color: C.text }}>Set New Password</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.text2, cursor: 'pointer', fontSize: '18px' }}>✕</button>
        </div>
        <div style={{ fontSize: '40px', marginBottom: '8px', textAlign: 'center' }}>🔐</div>
        <p style={{ color: C.text2, fontSize: '13px', marginBottom: '20px', fontFamily: C.font }}>Create a strong new password for your account. It must be at least 8 characters long.</p>

        {error && <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.32)', borderRadius: '10px', padding: '10px 12px', fontSize: '12px', color: C.coral, marginBottom: '12px', fontFamily: C.font }}>{error}</div>}

        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: C.text2, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '5px', fontFamily: C.font }}>New Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showNew ? 'text' : 'password'}
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              placeholder="Enter new password"
              style={{ width: '100%', background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: '10px', padding: '10px 40px 10px 14px', color: C.text, fontSize: '14px', outline: 'none', fontFamily: C.font, boxSizing: 'border-box' }}
            />
            <button onClick={() => setShowNew(v => !v)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.text3, fontSize: '14px' }}>👁</button>
          </div>
          {newPwd && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ height: '4px', background: C.bg4, borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(s / 4) * 100}%`, background: strengthColor[s], borderRadius: '4px', transition: 'all .3s' }} />
              </div>
              <div style={{ fontSize: '11px', color: C.text3, marginTop: '4px', fontFamily: C.font }}>{strengthLabel[s]}</div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: C.text2, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '5px', fontFamily: C.font }}>Confirm New Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)}
              placeholder="Re-enter new password"
              style={{ width: '100%', background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: '10px', padding: '10px 40px 10px 14px', color: C.text, fontSize: '14px', outline: 'none', fontFamily: C.font, boxSizing: 'border-box' }}
            />
            <button onClick={() => setShowConfirm(v => !v)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.text3, fontSize: '14px' }}>👁</button>
          </div>
          {confirmPwd && (
            <div style={{ fontSize: '11px', marginTop: '4px', color: newPwd === confirmPwd ? C.green : C.coral, fontFamily: C.font }}>
              {newPwd === confirmPwd ? '✓ Passwords match' : '✗ Passwords do not match'}
            </div>
          )}
        </div>

        <button onClick={submit} style={{ width: '100%', padding: '12px', background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: C.font }}>
          Save New Password →
        </button>
        <p style={{ fontSize: '11px', color: C.text3, marginTop: '12px', textAlign: 'center', fontFamily: C.font }}>Use a mix of letters, numbers, and symbols for a stronger password.</p>
      </div>
    </div>
  )
}

function PwdSuccessModal({ open, onClose, isMobile }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(5,6,10,0.72)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.bg2, border: `1px solid ${C.border2}`, borderRadius: '16px', padding: isMobile ? '20px' : '30px', width: '380px', maxWidth: '95vw', textAlign: 'center', boxShadow: '0 18px 44px rgba(0,0,0,0.45)' }}>
        <div style={{ fontSize: '52px', marginBottom: '12px' }}>✅</div>
        <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px', fontFamily: C.font, color: C.text }}>Password Changed!</div>
        <div style={{ color: C.text2, fontSize: '13px', lineHeight: 1.7, marginBottom: '20px', fontFamily: C.font }}>Your password has been updated successfully. You can now log in with your new password.</div>
        <button onClick={onClose} style={{ width: '100%', padding: '12px', background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: C.font }}>
          Back to Login →
        </button>
      </div>
    </div>
  )
}

const ROLE_META = {
  admin: {
    label: 'Administrator',
    defaultUsername: 'juan.cruz@cadenza.com',
    dashboardPath: '/admin/dashboard',
    alternatePath: FRONTDESK_LOGIN_PATH,
    alternateLabel: 'Front desk login',
  },
  frontdesk: {
    label: 'Front Desk',
    subtitle: 'Front desk portal — enrollments, payments, and scheduling',
    defaultUsername: 'maria.santos@cadenza.com',
    dashboardPath: '/admin/dashboard',
    alternatePath: ADMIN_LOGIN_PATH,
    alternateLabel: 'Admin login',
  },
}

function Login({ role = 'admin' }) {
  const navigate = useNavigate()
  const meta = ROLE_META[role] ?? ROLE_META.admin
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth)
  const [username, setUsername] = useState(meta.defaultUsername)
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

  const doLogin = async () => {
    if (!username.trim()) return setError('Please enter your username.')
    if (!password.trim()) return setError('Please enter your password.')
    setError('')
    try {
      await staffAuthAPI.login({ email: username.trim(), password })
      navigate(meta.dashboardPath)
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please check your credentials.'
      setError(msg)
    }
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
      <style>{css}</style>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100vw',
        minHeight: '100vh',
        background: `radial-gradient(circle at top right, rgba(124,106,247,0.15), transparent 40%), ${C.bg}`,
        flexDirection: 'column',
        padding: isMobile ? '14px' : '20px',
        fontFamily: C.font,
      }}>
        <div className="login-card" style={{ background: C.bg2, border: `1px solid ${C.border2}`, borderRadius: '18px', padding: isMobile ? '24px 16px' : '44px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 44px rgba(0,0,0,0.45)' }}>

          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div className="glow-ring" style={{ width: '52px', height: '52px', borderRadius: '14px', margin: '0 auto 10px', background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>♬</div>
            <h1 style={{ fontFamily: C.display, fontSize: isMobile ? '24px' : '28px', fontWeight: 700, letterSpacing: '0.01em', color: C.text, margin: 0 }}>Cadenza Music Center</h1>
            <p style={{ fontSize: '12px', color: C.text3, marginTop: '3px', fontFamily: C.font }}>Music School Management System</p>
            <p style={{ fontSize: '11px', color: C.accentL, marginTop: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: C.font }}>
              {meta.label}
            </p>
            <p style={{ fontSize: '12px', color: C.text2, marginTop: '6px', lineHeight: 1.5, fontFamily: C.font }}>{meta.subtitle}</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.32)', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', color: C.coral, marginBottom: '12px', fontFamily: C.font }}>
              ⚠ {error}
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: C.text2, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '5px', fontFamily: C.font }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username"
              onFocus={e => { e.target.style.borderColor = 'rgba(124,106,247,0.45)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,106,247,0.12)' }}
              onBlur={e => { e.target.style.borderColor = C.border2; e.target.style.boxShadow = 'none' }}
              style={{ width: '100%', background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: '10px', padding: '11px 14px', color: C.text, fontSize: '14px', outline: 'none', fontFamily: C.font, boxSizing: 'border-box', transition: 'all .15s' }}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: C.text2, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '5px', fontFamily: C.font }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onFocus={e => { e.target.style.borderColor = 'rgba(124,106,247,0.45)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,106,247,0.12)' }}
              onBlur={e => { e.target.style.borderColor = C.border2; e.target.style.boxShadow = 'none' }}
              onKeyDown={e => e.key === 'Enter' && doLogin()}
              style={{ width: '100%', background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: '10px', padding: '11px 14px', color: C.text, fontSize: '14px', outline: 'none', fontFamily: C.font, boxSizing: 'border-box', transition: 'all .15s' }}
            />
          </div>

          <button
            onClick={() => {
              console.log('Button clicked!');
              doLogin();
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.07)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'none' }}
            style={{ width: '100%', padding: '12px', background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, letterSpacing: '0.03em', cursor: 'pointer', marginTop: '4px', fontFamily: C.font, transition: 'all .15s' }}
          >
            Login
          </button>

          <div
            onClick={() => {
              setOtpSession(s => s + 1)
              setShowOTP(true)
            }}
            onMouseEnter={e => e.currentTarget.style.color = C.accentL}
            onMouseLeave={e => e.currentTarget.style.color = C.text3}
            style={{ textAlign: 'center', marginTop: '14px', fontSize: '12px', color: C.text3, cursor: 'pointer', fontFamily: C.font, transition: 'color .15s' }}
          >
            Forgot Password?
          </div>
          <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', fontFamily: C.font }}>
            <Link
              to={meta.alternatePath}
              style={{ color: C.text3, textDecoration: 'none', transition: 'color .15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = C.accentL }}
              onMouseLeave={e => { e.currentTarget.style.color = C.text3 }}
            >
              {meta.alternateLabel} →
            </Link>
          </p>
        </div>
      </div>

      <OTPModal key={otpSession} open={showOTP} onClose={() => setShowOTP(false)} onVerified={handleOTPVerified} isMobile={isMobile} />
      <ChangePasswordModal open={showChangePwd} onClose={() => setShowChangePwd(false)} onSuccess={handlePwdSuccess} isMobile={isMobile} />
      <PwdSuccessModal open={showPwdSuccess} onClose={() => setShowPwdSuccess(false)} isMobile={isMobile} />
    </>
  )
}

export default Login