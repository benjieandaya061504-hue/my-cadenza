import { useState, useEffect, useRef, useCallback } from 'react'

const roleConfig = {
  admin: {
    title: 'Admin Login',
    sub: 'Sign in to manage schedules, staff, and studio operations.',
    eyebrow: 'Secure Access',
    badge: '🛡️',
    placeholder: 'e.g. admin@cadenzamusic.com'
  },
  frontdesk: {
    title: 'Frontdesk Login',
    sub: 'Sign in to check in students, manage bookings, and process registrations.',
    eyebrow: 'Staff Access',
    badge: '🎧',
    placeholder: 'e.g. frontdesk@cadenzamusic.com'
  }
}

function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [currentRole, setCurrentRole] = useState('admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passError, setPassError] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ text: '', type: '' })
  const [shake, setShake] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotError, setForgotError] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotStatus, setForgotStatus] = useState({ text: '', type: '' })
  const [forgotShake, setForgotShake] = useState(false)
  const [serverOnline, setServerOnline] = useState(false)
  const [serverChecking, setServerChecking] = useState(true)
  const forgotRef = useRef(null)
  const emailRef = useRef(null)

  useEffect(() => {
    if (modalOpen || forgotOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [modalOpen, forgotOpen])

  // Check backend server health on mount
  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    const checkServer = () => {
      fetch(`${API_BASE}/`, { method: 'GET', signal: AbortSignal.timeout(3000) })
        .then(res => {
          if (res.ok) {
            setServerOnline(true)
          } else {
            setServerOnline(false)
          }
        })
        .catch(() => {
          setServerOnline(false)
        })
        .finally(() => {
          setServerChecking(false)
        })
    }
    checkServer()
    // Re-check every 30 seconds
    const interval = setInterval(checkServer, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (forgotOpen) {
      setTimeout(() => forgotRef.current?.focus(), 350)
    }
  }, [forgotOpen])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        if (modalOpen) setModalOpen(false)
        if (forgotOpen) setForgotOpen(false)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [modalOpen, forgotOpen])

  function openLogin(role) {
    setCurrentRole(role)
    setEmail('')
    setPassword('')
    setRemember(false)
    setEmailError('')
    setPassError('')
    setStatus({ text: '', type: '' })
    setLoading(false)
    setModalOpen(true)
  }

  function closeLogin() {
    setModalOpen(false)
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) closeLogin()
  }

  function handleSubmit(e) {
    e.preventDefault()
    let valid = true

    // Validate email
    // Allow admin account to login with just "admin" (no @domain required)
    if (currentRole === 'admin' && email.trim().toLowerCase() === 'admin') {
      setEmailError('')
    } else if (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) {
      setEmailError('Please enter a valid email address.')
      valid = false
    } else {
      setEmailError('')
    }

    // Validate password
    if (!password || password.length < 6) {
      setPassError('Password must be at least 6 characters.')
      valid = false
    } else {
      setPassError('')
    }

    setStatus({ text: '', type: '' })

    if (!valid) {
      setShake(true)
      setTimeout(() => setShake(false), 400)
      return
    }

    setLoading(true)

    // Real API authentication - match backend auth route
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: email.trim(),
        password: password,
      }),
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false)
        if (data.success) {
          setStatus({
            text: data.message,
            type: 'success'
          })
          
          // Store token and user info in localStorage
          if (data.token) {
            localStorage.setItem('cadenza_token', data.token)
          }
          localStorage.setItem('cadenza_user', JSON.stringify(data.user))
          
          // Remember me option
          if (remember) {
            localStorage.setItem('cadenza_remember_email', email)
          }
          
          // Redirect based on role
          setTimeout(() => {
            closeLogin()
            const userRole = data.user.role
            if (userRole === 'admin') {
              window.location.href = '/admin'
            } else if (userRole === 'frontdesk') {
              window.location.href = '/frontdesk'
            } else if (userRole === 'instructor') {
              window.location.href = '/instructor'
            } else if (userRole === 'student') {
              window.location.href = '/student'
              } else if (userRole === 'frontdesk') {
              window.location.href = '/frontdesk'
            } else {
              window.location.href = '/'
            }
            
          }, 1400)
        } else {
          setStatus({
            text: data.message || 'Login failed. Please try again.',
            type: 'error'
          })
          setShake(true)
          setTimeout(() => setShake(false), 400)
        }
      })
      .catch(err => {
        setLoading(false)
        setStatus({
          text: 'Could not connect to server. Please make sure the server is running.',
          type: 'error'
        })
        setShake(true)
        setTimeout(() => setShake(false), 400)
        console.error('Login error:', err)
      })
  }

  function openForgot(e) {
    if (e) e.preventDefault()
    setForgotEmail('')
    setForgotError('')
    setForgotStatus({ text: '', type: '' })
    setForgotLoading(false)
    setForgotOpen(true)
  }

  function closeForgot() {
    setForgotOpen(false)
  }

  function handleForgotOverlay(e) {
    if (e.target === e.currentTarget) closeForgot()
  }

  function handleForgotSubmit(e) {
    e.preventDefault()
    let valid = true

    if (!forgotEmail.trim() || !/\S+@\S+\.\S+/.test(forgotEmail.trim())) {
      setForgotError('Please enter a valid email address.')
      valid = false
    } else {
      setForgotError('')
    }

    setForgotStatus({ text: '', type: '' })

    if (!valid) {
      setForgotShake(true)
      setTimeout(() => setForgotShake(false), 400)
      return
    }

    setForgotLoading(true)

    // Simulated password reset — replace with real fetch when ready
    setTimeout(() => {
      setForgotLoading(false)
      setForgotStatus({
        text: 'If this email is registered, you\'ll receive password reset instructions shortly.',
        type: 'success'
      })
    }, 1200)
  }

  const cfg = roleConfig[currentRole]

  return (
    <>
      <header>
        <div className="logo">
          <div className="logo-mark">
            <svg viewBox="0 0 24 24"><path d="M9 18V5l10-2v13" strokeLinecap="round" strokeLinejoin="round" /><circle cx="6" cy="18" r="3" /><circle cx="16" cy="16" r="3" /></svg>
          </div>
          <div className="logo-text">CADENZA<span>MUSIC CENTER</span></div>
        </div>
        <nav>
          <ul>
            <li><a href="#home" className="active">Home</a></li>
            <li><a href="#registration">Registration</a></li>
            <li><a href="#enroll">Enroll</a></li>
            <li><a href="#rental">Instrument Rental</a></li>
            <li><a href="#studio">Studio Booking</a></li>
            <li><a href="#app">Download App</a></li>
          </ul>
        </nav>
        <div className="header-actions">
          <div className={`server-status${serverOnline ? ' online' : serverChecking ? ' checking' : ' offline'}`} title={serverChecking ? 'Checking server...' : serverOnline ? 'Server is online' : 'Server is offline'}>
            <span className="status-dot"></span>
            <span className="status-text">{serverChecking ? 'Checking...' : serverOnline ? 'Online' : 'Offline'}</span>
          </div>
          <a href="#" className="btn-login" onClick={(e) => { e.preventDefault(); openLogin('frontdesk') }}>Frontdesk <span className="full">Login</span></a>
          <a href="#" className="btn-login admin" onClick={(e) => { e.preventDefault(); openLogin('admin') }}>Admin <span className="full">Login</span></a>
        </div>
        <button className="nav-toggle" aria-label="Menu">☰</button>
      </header>

      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-bg-shape"></div>
        <div className="hero-bg-shape two"></div>
        <svg className="staff-lines" width="100%" height="100%" preserveAspectRatio="none">
          <g stroke="#2563EB" strokeOpacity="0.12" strokeWidth="1">
            <line x1="45%" y1="8%" x2="105%" y2="18%" />
            <line x1="42%" y1="16%" x2="102%" y2="26%" />
            <line x1="40%" y1="24%" x2="100%" y2="34%" />
            <line x1="42%" y1="32%" x2="102%" y2="42%" />
            <line x1="45%" y1="40%" x2="105%" y2="50%" />
          </g>
        </svg>

        <div className="hero-content">
          <div className="eyebrow">Music & Performing Arts</div>
          <h1>Cadenza Music<br /><span className="accent">— by RAIN</span></h1>
          <p className="subtitle">"Lessons • Performances • Creativity for Every Age"</p>
          <p className="desc">Cadenza Music Center offers professional music education, individualized instrument training, ensemble programs, and performance opportunities for students of every age and level — guided by a faculty devoted to musicianship and craft.</p>
          <div className="hero-cta">
            <a href="#registration" className="btn-primary">Enroll Today</a>
            <a href="#enroll" className="btn-outline">View Classes</a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="stage-glow"></div>
          <span className="float-note n1">♪</span>
          <span className="float-note n2">♫</span>
          <span className="float-note n3">♬</span>
          <div className="visual-card">
            <div className="eq-bars">
              <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
            </div>
            <div className="visual-caption">
              <div className="num">12+</div>
              <div className="lbl">Instrument Programs</div>
            </div>
          </div>
        </div>
      </section>

      <div className="staff-divider">
        <svg viewBox="0 0 1200 64" preserveAspectRatio="none">
          <path d="M0,32 Q300,0 600,32 T1200,32" fill="none" stroke="#7C3AED" strokeOpacity="0.15" strokeWidth="1.5" />
          <path d="M0,44 Q300,12 600,44 T1200,44" fill="none" stroke="#2563EB" strokeOpacity="0.12" strokeWidth="1.5" />
        </svg>
      </div>

      {/* REGISTRATION */}
      <section className="process" id="registration">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">The Cadenza Process</div>
            <h2>From First Note to First Recital</h2>
            <p>Joining Cadenza follows a simple, guided path — designed so every student, from curious beginner to advancing performer, knows exactly what comes next.</p>
          </div>
          <div className="process-grid">
            <div className="process-step">
              <div className="step-num">01</div>
              <h3>Explore</h3>
              <p>Browse instrument tracks and ensemble programs, or book a free trial session to feel out the right fit.</p>
            </div>
            <div className="process-step">
              <div className="step-num">02</div>
              <h3>Register</h3>
              <p>Complete a short online registration with your student profile, availability, and program preference.</p>
            </div>
            <div className="process-step">
              <div className="step-num">03</div>
              <h3>Enroll & Match</h3>
              <p>We match you with a faculty instructor and confirm your class schedule, studio room, or ensemble seat.</p>
            </div>
            <div className="process-step">
              <div className="step-num">04</div>
              <h3>Begin Lessons</h3>
              <p>Start weekly sessions, track progress through the app, and work toward your first showcase performance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="programs" id="enroll">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Enroll</div>
            <h2>Programs for Every Instrument</h2>
            <p>Structured curricula for beginners through advanced performers, taught in private, small-group, or ensemble formats.</p>
          </div>
          <div className="programs-grid">
            <div className="program-card">
              <div className="program-icon">🎹</div>
              <h3>Piano & Keyboard</h3>
              <p>Classical foundations through contemporary improvisation, taught in private and duet formats.</p>
              <a href="#registration">Enroll now</a>
            </div>
            <div className="program-card">
              <div className="program-icon">🎸</div>
              <h3>Guitar & Bass</h3>
              <p>Acoustic, electric, and bass technique with rhythm, theory, and songwriting built in.</p>
              <a href="#registration">Enroll now</a>
            </div>
            <div className="program-card">
              <div className="program-icon">🎤</div>
              <h3>Voice & Performance</h3>
              <p>Vocal technique, breath control, and stage presence for solo and ensemble singers.</p>
              <a href="#registration">Enroll now</a>
            </div>
            <div className="program-card">
              <div className="program-icon">🎻</div>
              <h3>Strings</h3>
              <p>Violin, viola, and cello instruction from beginner posture to chamber ensemble repertoire.</p>
              <a href="#registration">Enroll now</a>
            </div>
            <div className="program-card">
              <div className="program-icon">🥁</div>
              <h3>Percussion</h3>
              <p>Drum kit, rudiments, and rhythm section training for band and ensemble players.</p>
              <a href="#registration">Enroll now</a>
            </div>
            <div className="program-card">
              <div className="program-icon">🎼</div>
              <h3>Ensemble & Theory</h3>
              <p>Group performance, music theory, and composition for students ready to play together.</p>
              <a href="#registration">Enroll now</a>
            </div>
          </div>
        </div>
      </section>

      {/* RENTAL & STUDIO */}
      <div className="split-band">
        <div className="split-panel rental" id="rental">
          <div className="panel-deco"></div>
          <div className="panel-deco two"></div>
          <div className="panel-eyebrow">Instrument Rental</div>
          <h2>Play Before You Own</h2>
          <p>Rent quality instruments month-to-month while you learn — with the option to apply rental credit toward a future purchase.</p>
          <ul>
            <li>Well-maintained pianos, strings, winds & percussion</li>
            <li>Flexible monthly plans, no long-term lock-in</li>
            <li>Free maintenance checks for active students</li>
          </ul>
          <a href="#" className="btn-outline light">Browse Rentals</a>
        </div>
        <div className="split-panel studio" id="studio">
          <div className="panel-deco"></div>
          <div className="panel-deco two"></div>
          <div className="panel-eyebrow">Studio Booking</div>
          <h2>Book Rehearsal Studios</h2>
          <p>Reserve soundproofed practice rooms and full-band studios by the hour — ideal for rehearsal, recording, or private practice.</p>
          <ul>
            <li>Solo practice rooms & full ensemble studios</li>
            <li>On-site recording equipment available</li>
            <li>Book online in under two minutes</li>
          </ul>
          <a href="#" className="btn-outline light">Book a Studio</a>
        </div>
      </div>

      {/* APP DOWNLOAD */}
      <section className="app-section" id="app">
        <div className="container app-grid">
          <div className="app-copy">
            <div className="eyebrow">Download App</div>
            <h2>Your Practice, In Your Pocket</h2>
            <p>Track lesson schedules, message instructors, book studio time, and follow your practice streak — all from the Cadenza app.</p>
            <div className="store-btns">
              <a href="#" className="store-btn"><span></span> App Store</a>
              <a href="#" className="store-btn"><span>▶</span> Google Play</a>
            </div>
          </div>
          <div className="app-visual">
            <div className="phone-mock">
              <div className="screen">
                <div className="mini-eq">
                  <span></span><span></span><span></span><span></span><span></span>
                </div>
                <p>Now Practicing</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo">
                <div className="logo-mark">
                  <svg viewBox="0 0 24 24"><path d="M9 18V5l10-2v13" strokeLinecap="round" strokeLinejoin="round" /><circle cx="6" cy="18" r="3" /><circle cx="16" cy="16" r="3" /></svg>
                </div>
                <div className="logo-text">CADENZA<span>MUSIC CENTER</span></div>
              </div>
              <p>Professional music education, instrument training, and performance programs for every age and level — by RAIN.</p>
            </div>
            <div>
              <h4>Explore</h4>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#registration">Registration</a></li>
                <li><a href="#enroll">Enroll</a></li>
              </ul>
            </div>
            <div>
              <h4>Services</h4>
              <ul>
                <li><a href="#rental">Instrument Rental</a></li>
                <li><a href="#studio">Studio Booking</a></li>
                <li><a href="#app">Download App</a></li>
              </ul>
            </div>
            <div>
              <h4>Contact</h4>
              <ul>
                <li><a href="#">hello@cadenzamusic.com</a></li>
                <li><a href="#">+1 (555) 040-2201</a></li>
                <li><a href="#">Visit the Studio</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Cadenza Music Center by RAIN. All rights reserved.</span>
            <span>Made with tone, tempo & care.</span>
          </div>
        </div>
      </footer>

      {/* LOGIN MODAL */}
      <div
        className={`modal-overlay${modalOpen ? ' active' : ''}`}
        onClick={handleOverlayClick}
        aria-hidden={!modalOpen}
      >
        <div className={`modal-box${shake ? ' modal-shake' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <button className="modal-close" type="button" onClick={closeLogin} aria-label="Close login">✕</button>

          <div className="modal-badge">{cfg.badge}</div>
          <div className="modal-eyebrow">{cfg.eyebrow}</div>
          <h2 id="modalTitle">{cfg.title}</h2>
          <p className="modal-sub">{cfg.sub}</p>

          <form className="modal-form" onSubmit={handleSubmit} noValidate>
            <div className="field-group">
              <label htmlFor="loginEmail">Email Address</label>
              <input
                ref={emailRef}
                type="email"
                id="loginEmail"
                name="email"
                autoComplete="email"
                placeholder={cfg.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className={`field-error${emailError ? ' show' : ''}`}>{emailError || 'Please enter a valid email address.'}</div>
            </div>

            <div className="field-group">
              <label htmlFor="loginPass">Password</label>
              <input
                type="password"
                id="loginPass"
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className={`field-error${passError ? ' show' : ''}`}>{passError || 'Password must be at least 6 characters.'}</div>
            </div>

            <div className="modal-row-between">
              <label className="modal-remember">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} style={{ width: 'auto' }} />
                Remember me
              </label>
              <a href="#" className="modal-forgot" onClick={openForgot}>Forgot password?</a>
            </div>

            <div className={`modal-server-offline${!serverChecking && !serverOnline ? ' show' : ''}`}>
              <span>⚠️</span> Server is offline. Please start the backend server.
            </div>

            <div className={`modal-status${status.text ? ' show' : ''}${status.type === 'error' ? ' error' : ''}${status.type === 'success' ? ' success' : ''}`}>
              {status.text}
            </div>

            <button type="submit" className={`modal-submit${loading ? ' loading' : ''}`} disabled={loading || (!serverChecking && !serverOnline)}>
              <span className="spinner"></span>
              <span className="btn-label">{!serverChecking && !serverOnline ? 'Server Offline' : 'Sign In'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      <div
        className={`modal-overlay${forgotOpen ? ' active' : ''}`}
        onClick={handleForgotOverlay}
        aria-hidden={!forgotOpen}
      >
        <div className={`modal-box${forgotShake ? ' modal-shake' : ''}`} role="dialog" aria-modal="true" aria-labelledby="forgotTitle">
          <button className="modal-close" type="button" onClick={closeForgot} aria-label="Close forgot password">✕</button>

          <div className="modal-badge">🔑</div>
          <div className="modal-eyebrow">Reset Access</div>
          <h2 id="forgotTitle">Forgot Password</h2>
          <p className="modal-sub">Enter your registered email address and we'll send you instructions to reset your password.</p>

          <form className="modal-form" onSubmit={handleForgotSubmit} noValidate>
            <div className="field-group">
              <label htmlFor="forgotEmail">Email Address</label>
              <input
                ref={forgotRef}
                type="email"
                id="forgotEmail"
                name="email"
                autoComplete="email"
                placeholder="e.g. you@cadenzamusic.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
              <div className={`field-error${forgotError ? ' show' : ''}`}>{forgotError || 'Please enter a valid email address.'}</div>
            </div>

            <div className={`modal-status${forgotStatus.text ? ' show' : ''}${forgotStatus.type === 'error' ? ' error' : ''}${forgotStatus.type === 'success' ? ' success' : ''}`}>
              {forgotStatus.text}
            </div>

            <button type="submit" className={`modal-submit${forgotLoading ? ' loading' : ''}`} disabled={forgotLoading}>
              <span className="spinner"></span>
              <span className="btn-label">Send Reset Link</span>
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.2rem', fontSize: '0.78rem', position: 'relative', zIndex: 1 }}>
              <span style={{ color: 'var(--text)', opacity: 0.7 }}>Remember your password? </span>
              <a href="#" className="modal-forgot" onClick={(e) => { e.preventDefault(); closeForgot(); }}>Back to Sign In</a>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        :root{
          --royal: #2563EB;
          --navy: #1E293B;
          --purple: #7C3AED;
          --sky: #60A5FA;
          --white: #FFFFFF;
          --text: #334155;
          --mist: #F4F7FE;
        }

        *{margin:0;padding:0;box-sizing:border-box;}
        html{scroll-behavior:smooth;}
        body{font-family:'Inter', sans-serif; color:var(--text); background:var(--white); overflow-x:hidden;}
        h1,h2,h3,.display{font-family:'Sora', sans-serif;}
        a{text-decoration:none; color:inherit;}
        ul{list-style:none;}
        button{font-family:inherit; cursor:pointer; border:none;}
        img,svg{display:block;}
        section{position:relative;}

        #root{width:100% !important;max-width:100% !important;margin:0 !important;text-align:left !important;border:none !important;min-height:auto !important;display:block !important;}

        .container{max-width:1180px; margin:0 auto; padding:0 6%;}

        /* ===== HEADER ===== */
        header{
          position:sticky; top:0; z-index:100;
          display:flex; align-items:center; justify-content:space-between;
          padding:22px 6%;
          background:rgba(255,255,255,0.85);
          backdrop-filter:blur(12px);
          border-bottom:1px solid rgba(30,41,59,0.06);
        }
        .logo{display:flex; align-items:center; gap:12px;}
        .logo-mark{
          width:42px; height:42px; border-radius:50%;
          background:linear-gradient(135deg, var(--royal), var(--purple));
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 6px 18px rgba(37,99,235,0.35);
        }
        .logo-mark svg{width:22px; height:22px; fill:none; stroke:#fff; stroke-width:1.6;}
        .logo-text{font-family:'Sora', sans-serif; font-weight:700; font-size:1.05rem; letter-spacing:0.5px; color:var(--navy); line-height:1;}
        .logo-text span{display:block; font-family:'Inter', sans-serif; font-weight:500; font-size:0.62rem; letter-spacing:2.5px; color:var(--purple); margin-top:3px;}

        nav ul{display:flex; gap:2.2rem;}
        nav a{font-size:0.72rem; letter-spacing:1.6px; text-transform:uppercase; font-weight:600; color:var(--navy); position:relative; padding-bottom:6px; transition:color 0.25s ease;}
        nav a::after{content:''; position:absolute; left:0; bottom:0; width:0%; height:2px; background:linear-gradient(90deg, var(--royal), var(--purple)); transition:width 0.25s ease;}
        nav a:hover{color:var(--royal);}
        nav a:hover::after{width:100%;}
        nav a.active{color:var(--royal);}
        nav a.active::after{width:100%;}
        .nav-toggle{display:none; font-size:1.4rem; color:var(--navy); background:none;}

        .server-status{
          display:flex; align-items:center; gap:6px;
          font-size:0.65rem; font-weight:600; letter-spacing:0.5px; text-transform:uppercase;
          padding:4px 10px; border-radius:999px;
          transition:all 0.3s ease;
        }
        .server-status.online{
          color:#059669; background:rgba(5,150,105,0.10);
        }
        .server-status.offline{
          color:#DC2626; background:rgba(220,38,38,0.08);
        }
        .server-status.checking{
          color:#D97706; background:rgba(217,119,6,0.08);
        }
        .status-dot{
          width:7px; height:7px; border-radius:50%;
          transition:background 0.3s ease;
        }
        .server-status.online .status-dot{background:#059669; box-shadow:0 0 6px rgba(5,150,105,0.5);}
        .server-status.offline .status-dot{background:#DC2626;}
        .server-status.checking .status-dot{background:#D97706; animation:pulseDot 1s ease-in-out infinite;}
        @keyframes pulseDot{0%,100%{opacity:1;} 50%{opacity:0.4;}}
        .server-status .status-text{white-space:nowrap;}
        @media (max-width: 600px){
          .server-status .status-text{display:none;}
        }

        .header-actions{display:flex; align-items:center; gap:0.7rem;}
        .btn-login{
          padding:0.55rem 1.2rem;
          border-radius:999px;
          font-size:0.68rem;
          font-weight:700;
          letter-spacing:1.1px;
          text-transform:uppercase;
          border:1.5px solid rgba(30,41,59,0.14);
          color:var(--navy);
          background:transparent;
          white-space:nowrap;
          transition:all 0.25s ease;
        }
        .btn-login:hover{
          border-color:var(--royal);
          color:var(--royal);
          background:rgba(37,99,235,0.06);
        }
        .btn-login.admin{
          background:linear-gradient(100deg, var(--royal), var(--purple));
          border-color:transparent;
          color:#fff;
          box-shadow:0 8px 18px rgba(37,99,235,0.25);
        }
        .btn-login.admin:hover{
          color:#fff;
          transform:translateY(-1px);
          box-shadow:0 10px 22px rgba(37,99,235,0.32);
        }
        @media (max-width: 980px){
          .header-actions{gap:0.5rem;}
          .btn-login{padding:0.5rem 0.9rem; font-size:0.62rem;}
        }
        @media (max-width: 560px){
          .btn-login span.full{display:none;}
        }

        /* ===== HERO ===== */
        .hero{display:grid; grid-template-columns:1.05fr 0.95fr; align-items:center; min-height:86vh; padding:4rem 6% 5rem; overflow:hidden;}
        .hero-bg-shape{position:absolute; right:-18%; bottom:-30%; width:75%; height:130%;
          background:radial-gradient(circle at 70% 30%, rgba(124,58,237,0.16), transparent 55%),
            linear-gradient(160deg, rgba(37,99,235,0.10), rgba(96,165,250,0.14) 45%, rgba(124,58,237,0.14));
          border-radius:52% 48% 60% 40% / 45% 55% 45% 55%; z-index:0;}
        .hero-bg-shape.two{right:-30%; bottom:-45%; width:60%; height:100%;
          background:linear-gradient(140deg, rgba(37,99,235,0.10), rgba(124,58,237,0.08));
          border-radius:60% 40% 45% 55% / 55% 45% 55% 45%;}
        .staff-lines{position:absolute; inset:0; z-index:0; opacity:0.5;}
        .hero-content{position:relative; z-index:2; max-width:560px;}
        .eyebrow{display:inline-flex; align-items:center; gap:8px; font-size:0.68rem; letter-spacing:2.2px; text-transform:uppercase; font-weight:600; color:var(--purple); margin-bottom:1.4rem;}
        .eyebrow::before{content:''; width:26px; height:1px; background:var(--purple);}
        .hero h1{font-size:clamp(2.6rem, 5vw, 4rem); line-height:1.04; font-weight:800; text-transform:uppercase; color:var(--navy); letter-spacing:0.5px;}
        .hero h1 .accent{background:linear-gradient(100deg, var(--royal), var(--purple) 70%); -webkit-background-clip:text; background-clip:text; color:transparent;}
        .hero .subtitle{font-family:'Sora', sans-serif; font-style:italic; font-weight:500; font-size:1.15rem; color:var(--royal); margin:1.1rem 0 1.4rem; letter-spacing:0.3px;}
        .hero p.desc{font-size:1.02rem; line-height:1.75; color:var(--text); max-width:480px; margin-bottom:2.3rem;}
        .hero-cta{display:flex; gap:1rem; flex-wrap:wrap;}

        .btn-primary{padding:0.95rem 2.1rem; border-radius:999px; background:linear-gradient(100deg, var(--royal), var(--purple)); color:#fff; font-weight:600; font-size:0.85rem; letter-spacing:0.6px; text-transform:uppercase; box-shadow:0 10px 24px rgba(37,99,235,0.28); transition:transform 0.25s ease, box-shadow 0.25s ease; display:inline-block;}
        .btn-primary:hover{transform:translateY(-2px); box-shadow:0 14px 30px rgba(37,99,235,0.36);}
        .btn-outline{padding:0.95rem 2.1rem; border-radius:999px; border:1.5px solid var(--navy); color:var(--navy); font-weight:600; font-size:0.85rem; letter-spacing:0.6px; text-transform:uppercase; background:transparent; transition:all 0.25s ease; display:inline-block;}
        .btn-outline:hover{border-color:var(--royal); color:var(--royal); background:rgba(37,99,235,0.05);}
        .btn-outline.light{border-color:rgba(255,255,255,0.6); color:#fff;}
        .btn-outline.light:hover{border-color:#fff; background:rgba(255,255,255,0.08); color:#fff;}

        /* ===== HERO VISUAL ===== */
        .hero-visual{position:relative; z-index:2; height:520px; display:flex; align-items:center; justify-content:center;}
        .stage-glow{position:absolute; width:340px; height:340px; border-radius:50%; background:radial-gradient(circle, rgba(96,165,250,0.35), rgba(124,58,237,0.12) 60%, transparent 75%); filter:blur(6px); animation:pulseGlow 5s ease-in-out infinite;}
        @keyframes pulseGlow{0%,100%{transform:scale(1); opacity:0.9;} 50%{transform:scale(1.12); opacity:1;}}
        .visual-card{position:relative; width:340px; height:420px; border-radius:28px; background:linear-gradient(160deg, rgba(255,255,255,0.9), rgba(255,255,255,0.55)); backdrop-filter:blur(18px); border:1px solid rgba(255,255,255,0.6); box-shadow:0 30px 60px -20px rgba(30,41,59,0.28); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2rem; padding:2rem;}
        .eq-bars{display:flex; align-items:flex-end; gap:7px; height:120px;}
        .eq-bars span{width:9px; border-radius:6px; background:linear-gradient(180deg, var(--sky), var(--royal) 55%, var(--purple)); animation:eq 1.2s ease-in-out infinite; transform-origin:bottom;}
        .eq-bars span:nth-child(1){height:30%; animation-delay:-0.1s;}
        .eq-bars span:nth-child(2){height:65%; animation-delay:-0.9s;}
        .eq-bars span:nth-child(3){height:45%; animation-delay:-0.4s;}
        .eq-bars span:nth-child(4){height:90%; animation-delay:-1.1s;}
        .eq-bars span:nth-child(5){height:55%; animation-delay:-0.6s;}
        .eq-bars span:nth-child(6){height:75%; animation-delay:-0.2s;}
        .eq-bars span:nth-child(7){height:40%; animation-delay:-0.8s;}
        .eq-bars span:nth-child(8){height:60%; animation-delay:-0.3s;}
        .eq-bars span:nth-child(9){height:25%; animation-delay:-1.0s;}
        @keyframes eq{0%,100%{transform:scaleY(0.35);} 50%{transform:scaleY(1);}}
        .visual-caption{text-align:center;}
        .visual-caption .num{font-family:'Sora', sans-serif; font-weight:800; font-size:2.1rem; color:var(--navy); line-height:1;}
        .visual-caption .lbl{font-size:0.68rem; letter-spacing:2px; text-transform:uppercase; color:var(--purple); font-weight:600; margin-top:6px;}
        .float-note{position:absolute; font-size:1.6rem; color:var(--royal); opacity:0.75; animation:floatNote 6s ease-in-out infinite;}
        .float-note.n1{top:6%; left:2%; animation-delay:0s; color:var(--purple);}
        .float-note.n2{top:70%; right:0%; animation-delay:1.8s; font-size:2rem;}
        .float-note.n3{bottom:4%; left:14%; animation-delay:3.2s; color:var(--sky); font-size:1.3rem;}
        @keyframes floatNote{0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(-18px) rotate(8deg);}}

        /* ===== SECTION HEADERS ===== */
        .section-head{max-width:640px; margin:0 auto 3.4rem; text-align:center;}
        .section-head .eyebrow{justify-content:center;}
        .section-head .eyebrow::before{display:none;}
        .section-head h2{font-size:clamp(1.9rem, 3vw, 2.6rem); font-weight:800; text-transform:uppercase; color:var(--navy); letter-spacing:0.4px; margin-bottom:0.9rem;}
        .section-head p{font-size:1rem; line-height:1.7; color:var(--text);}

        .staff-divider{position:relative; height:64px; overflow:hidden;}
        .staff-divider svg{width:100%; height:100%;}

        /* ===== PROCESS ===== */
        .process{padding:6rem 0 6.5rem; background:var(--mist);}
        .process-grid{display:grid; grid-template-columns:repeat(4, 1fr); gap:1.6rem;}
        .process-step{position:relative; background:#fff; border-radius:20px; padding:2.2rem 1.7rem; box-shadow:0 12px 30px -14px rgba(30,41,59,0.14); border:1px solid rgba(37,99,235,0.06);}
        .process-step .step-num{font-family:'Sora', sans-serif; font-weight:800; font-size:0.78rem; letter-spacing:1px; color:#fff; background:linear-gradient(135deg, var(--royal), var(--purple)); width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:1.3rem;}
        .process-step h3{font-size:1.05rem; font-weight:700; color:var(--navy); text-transform:uppercase; letter-spacing:0.4px; margin-bottom:0.6rem;}
        .process-step p{font-size:0.9rem; line-height:1.65; color:var(--text);}
        .process-step::after{content:''; position:absolute; top:44%; right:-1.1rem; width:1.5rem; height:1.5rem; border-top:2px solid var(--sky); border-right:2px solid var(--sky); transform:rotate(45deg); opacity:0.5;}
        .process-step:last-child::after{display:none;}

        /* ===== PROGRAMS ===== */
        .programs{padding:6.5rem 0;}
        .programs-grid{display:grid; grid-template-columns:repeat(3, 1fr); gap:1.8rem;}
        .program-card{border-radius:22px; padding:2.4rem 2rem; background:#fff; border:1px solid rgba(30,41,59,0.07); box-shadow:0 14px 34px -18px rgba(30,41,59,0.16); transition:transform 0.3s ease, box-shadow 0.3s ease;}
        .program-card:hover{transform:translateY(-6px); box-shadow:0 22px 44px -18px rgba(37,99,235,0.24);}
        .program-icon{width:52px; height:52px; border-radius:14px; background:linear-gradient(135deg, rgba(37,99,235,0.12), rgba(124,58,237,0.12)); display:flex; align-items:center; justify-content:center; margin-bottom:1.4rem; font-size:1.4rem; color:var(--royal);}
        .program-card h3{font-size:1.15rem; font-weight:700; color:var(--navy); margin-bottom:0.5rem; text-transform:uppercase; letter-spacing:0.3px;}
        .program-card p{font-size:0.9rem; line-height:1.65; color:var(--text); margin-bottom:1.3rem;}
        .program-card a{font-size:0.75rem; letter-spacing:1.2px; text-transform:uppercase; font-weight:700; color:var(--purple);}
        .program-card a::after{content:' →';}

        /* ===== RENTAL & STUDIO ===== */
        .split-band{display:grid; grid-template-columns:1fr 1fr;}
        .split-panel{padding:5.5rem 4rem; position:relative; overflow:hidden;}
        .split-panel.rental{background:var(--navy); color:#fff;}
        .split-panel.studio{background:linear-gradient(150deg, var(--royal), var(--purple)); color:#fff;}
        .split-panel .panel-eyebrow{font-size:0.68rem; letter-spacing:2.2px; text-transform:uppercase; font-weight:600; opacity:0.75; margin-bottom:1rem;}
        .split-panel h2{font-size:1.9rem; font-weight:800; text-transform:uppercase; margin-bottom:1rem; letter-spacing:0.3px;}
        .split-panel p{font-size:0.95rem; line-height:1.75; opacity:0.9; margin-bottom:1.8rem; max-width:400px;}
        .split-panel ul{margin-bottom:2rem;}
        .split-panel li{font-size:0.88rem; margin-bottom:0.6rem; display:flex; align-items:center; gap:0.6rem; opacity:0.92;}
        .split-panel li::before{content:'♪'; opacity:0.8;}
        .panel-deco{position:absolute; right:-30px; bottom:-30px; width:200px; height:200px; border-radius:50%; background:rgba(255,255,255,0.06);}
        .panel-deco.two{right:60px; bottom:80px; width:90px; height:90px; background:rgba(255,255,255,0.05);}

        /* ===== APP ===== */
        .app-section{padding:6.5rem 0; background:var(--mist); overflow:hidden;}
        .app-grid{display:grid; grid-template-columns:1fr 1fr; align-items:center; gap:3rem;}
        .app-copy .eyebrow{margin-bottom:1.2rem;}
        .app-copy h2{font-size:clamp(1.9rem, 3vw, 2.5rem); font-weight:800; text-transform:uppercase; color:var(--navy); margin-bottom:1rem; letter-spacing:0.3px;}
        .app-copy p{font-size:1rem; line-height:1.75; color:var(--text); margin-bottom:2rem; max-width:440px;}
        .store-btns{display:flex; gap:1rem; flex-wrap:wrap;}
        .store-btn{display:flex; align-items:center; gap:0.6rem; padding:0.8rem 1.4rem; border-radius:14px; background:var(--navy); color:#fff; font-size:0.85rem; font-weight:600;}
        .store-btn span{font-size:1.3rem;}
        .app-visual{position:relative; display:flex; justify-content:center;}
        .phone-mock{width:230px; height:460px; border-radius:38px; background:linear-gradient(160deg, var(--navy), #0f172a); box-shadow:0 40px 70px -30px rgba(30,41,59,0.5); padding:14px; position:relative;}
        .phone-mock .screen{width:100%; height:100%; border-radius:26px; background:linear-gradient(165deg, rgba(37,99,235,0.9), rgba(124,58,237,0.9)); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1.4rem; position:relative; overflow:hidden;}
        .phone-mock .screen .mini-eq{display:flex; gap:5px; align-items:flex-end; height:60px;}
        .phone-mock .screen .mini-eq span{width:6px; border-radius:4px; background:#fff; opacity:0.85; animation:eq 1s ease-in-out infinite;}
        .phone-mock .screen .mini-eq span:nth-child(1){height:40%; animation-delay:-0.1s;}
        .phone-mock .screen .mini-eq span:nth-child(2){height:80%; animation-delay:-0.6s;}
        .phone-mock .screen .mini-eq span:nth-child(3){height:55%; animation-delay:-0.3s;}
        .phone-mock .screen .mini-eq span:nth-child(4){height:95%; animation-delay:-0.9s;}
        .phone-mock .screen .mini-eq span:nth-child(5){height:35%; animation-delay:-0.4s;}
        .phone-mock .screen p{color:#fff; font-size:0.7rem; letter-spacing:1.5px; text-transform:uppercase; font-weight:600; opacity:0.9;}

        /* ===== FOOTER ===== */
        footer{background:var(--navy); color:#fff; padding:4.5rem 0 2rem;}
        .footer-grid{display:grid; grid-template-columns:1.4fr 1fr 1fr 1fr; gap:2.4rem; margin-bottom:3rem;}
        .footer-brand .logo-text{color:#fff;}
        .footer-brand p{font-size:0.88rem; line-height:1.7; opacity:0.7; margin-top:1.2rem; max-width:280px;}
        footer h4{font-size:0.75rem; letter-spacing:1.6px; text-transform:uppercase; color:var(--sky); margin-bottom:1.2rem; font-weight:700;}
        footer ul li{margin-bottom:0.7rem;}
        footer ul li a{font-size:0.88rem; opacity:0.78; transition:opacity 0.2s ease;}
        footer ul li a:hover{opacity:1; color:var(--sky);}
        .footer-bottom{border-top:1px solid rgba(255,255,255,0.1); padding-top:1.8rem; display:flex; justify-content:space-between; flex-wrap:wrap; gap:1rem; font-size:0.78rem; opacity:0.6;}

        @media (max-width: 980px){
          nav{display:none;}
          .nav-toggle{display:block;}
          .hero{grid-template-columns:1fr; text-align:center; padding-top:2.5rem;}
          .hero-content{margin:0 auto;}
          .hero-cta{justify-content:center;}
          .hero p.desc{margin-left:auto; margin-right:auto;}
          .hero-visual{margin-top:3rem; height:420px;}
          .eyebrow::before{display:none;}
          .process-grid{grid-template-columns:1fr 1fr;}
          .process-step::after{display:none;}
          .programs-grid{grid-template-columns:1fr 1fr;}
          .split-band{grid-template-columns:1fr;}
          .app-grid{grid-template-columns:1fr; text-align:center;}
          .app-copy p{margin-left:auto; margin-right:auto;}
          .store-btns{justify-content:center;}
          .footer-grid{grid-template-columns:1fr 1fr;}
        }
        @media (max-width: 620px){
          .process-grid{grid-template-columns:1fr;}
          .programs-grid{grid-template-columns:1fr;}
          .footer-grid{grid-template-columns:1fr;}
        }
        @media (prefers-reduced-motion: reduce){
          *{animation-duration:0.001s !important; animation-iteration-count:1 !important;}
        }

        /* ===== LOGIN MODAL ===== */
        .modal-overlay{
          position:fixed; inset:0; z-index:1000;
          background:rgba(15,23,42,0.55);
          backdrop-filter:blur(4px);
          display:flex; align-items:center; justify-content:center;
          padding:1.5rem;
          opacity:0;
          visibility:hidden;
          transition:opacity 0.3s ease, visibility 0.3s ease;
        }
        .modal-overlay.active{
          opacity:1;
          visibility:visible;
        }

        .modal-box{
          position:relative;
          width:100%;
          max-width:400px;
          background:var(--white);
          border-radius:28px;
          box-shadow:0 40px 80px -20px rgba(15,23,42,0.45);
          padding:2.6rem 2.2rem 2.2rem;
          transform:translateY(28px) scale(0.96);
          opacity:0;
          transition:transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.32s ease;
          overflow:hidden;
        }
        .modal-overlay.active .modal-box{
          transform:translateY(0) scale(1);
          opacity:1;
        }

        .modal-box::before{
          content:'';
          position:absolute;
          top:-60px; right:-60px;
          width:180px; height:180px;
          border-radius:50%;
          background:radial-gradient(circle, rgba(96,165,250,0.20), transparent 70%);
          z-index:0;
        }

        .modal-close{
          position:absolute;
          top:1.2rem; right:1.2rem;
          width:32px; height:32px;
          border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          color:var(--navy);
          font-size:1rem;
          background:rgba(30,41,59,0.06);
          transition:background 0.2s ease, transform 0.2s ease;
          z-index:2;
        }
        .modal-close:hover{
          background:rgba(37,99,235,0.12);
          color:var(--royal);
          transform:rotate(90deg);
        }

        .modal-badge{
          width:52px; height:52px;
          border-radius:16px;
          background:linear-gradient(135deg, var(--royal), var(--purple));
          display:flex; align-items:center; justify-content:center;
          font-size:1.4rem;
          margin-bottom:1.2rem;
          box-shadow:0 10px 22px rgba(37,99,235,0.3);
          position:relative; z-index:1;
          animation:badgePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
        }
        @keyframes badgePop{
          0%{transform:scale(0.4) rotate(-15deg); opacity:0;}
          100%{transform:scale(1) rotate(0deg); opacity:1;}
        }

        .modal-eyebrow{
          font-size:0.66rem;
          letter-spacing:2px;
          text-transform:uppercase;
          font-weight:700;
          color:var(--purple);
          margin-bottom:0.4rem;
          position:relative; z-index:1;
        }

        .modal-box h2{
          font-size:1.5rem;
          font-weight:800;
          text-transform:uppercase;
          color:var(--navy);
          letter-spacing:0.3px;
          margin-bottom:0.4rem;
          position:relative; z-index:1;
        }

        .modal-sub{
          font-size:0.86rem;
          color:var(--text);
          opacity:0.75;
          margin-bottom:1.8rem;
          position:relative; z-index:1;
        }

        .modal-form{
          display:flex; flex-direction:column; gap:1.1rem;
          position:relative; z-index:1;
        }

        .field-group{display:flex; flex-direction:column; gap:0.45rem;}
        .field-group label{
          font-size:0.68rem; font-weight:700; letter-spacing:1px;
          text-transform:uppercase; color:var(--navy);
        }
        .field-group input{
          padding:0.85rem 1rem;
          border-radius:12px;
          border:1.5px solid rgba(30,41,59,0.12);
          font-family:'Inter', sans-serif;
          font-size:0.9rem;
          color:var(--navy);
          background:#fbfcff;
          transition:border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .field-group input:focus{
          outline:none;
          border-color:var(--royal);
          background:#fff;
          box-shadow:0 0 0 4px rgba(37,99,235,0.12);
        }

        .field-error{
          font-size:0.72rem;
          color:#DC2626;
          min-height:0;
          max-height:0;
          opacity:0;
          overflow:hidden;
          transition:all 0.25s ease;
        }
        .field-error.show{
          max-height:30px;
          opacity:1;
          margin-top:-0.2rem;
        }

        .modal-row-between{
          display:flex; align-items:center; justify-content:space-between;
          font-size:0.78rem;
        }
        .modal-remember{display:flex; align-items:center; gap:0.5rem; color:var(--text);}
        .modal-forgot{color:var(--royal); font-weight:600;}
        .modal-forgot:hover{text-decoration:underline;}

        .modal-submit{
          margin-top:0.4rem;
          padding:0.95rem 1.4rem;
          border-radius:999px;
          background:linear-gradient(100deg, var(--royal), var(--purple));
          color:#fff;
          font-weight:700;
          font-size:0.82rem;
          letter-spacing:0.8px;
          text-transform:uppercase;
          box-shadow:0 10px 24px rgba(37,99,235,0.28);
          transition:transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
          display:flex; align-items:center; justify-content:center;
          gap:0.6rem;
        }
        .modal-submit:hover{
          transform:translateY(-2px);
          box-shadow:0 14px 30px rgba(37,99,235,0.36);
        }
        .modal-submit:disabled{
          opacity:0.75;
          cursor:not-allowed;
          transform:none;
        }

        .spinner{
          width:16px; height:16px;
          border-radius:50%;
          border:2px solid rgba(255,255,255,0.4);
          border-top-color:#fff;
          animation:spin 0.7s linear infinite;
          display:none;
        }
        .modal-submit.loading .spinner{display:inline-block;}
        .modal-submit.loading .btn-label{display:none;}
        @keyframes spin{to{transform:rotate(360deg);}}

        .modal-status{
          font-size:0.8rem;
          font-weight:600;
          text-align:center;
          padding:0.7rem;
          border-radius:10px;
          max-height:0;
          opacity:0;
          overflow:hidden;
          transition:all 0.3s ease;
        }
        .modal-status.show{
          max-height:60px;
          opacity:1;
          margin-top:0.2rem;
        }
        .modal-status.error{background:rgba(220,38,38,0.08); color:#DC2626;}
        .modal-status.success{background:rgba(16,185,129,0.10); color:#059669;}

        .modal-server-offline{
          font-size:0.78rem;
          font-weight:600;
          text-align:center;
          padding:0.65rem;
          border-radius:10px;
          background:rgba(220,38,38,0.08);
          color:#DC2626;
          max-height:0;
          opacity:0;
          overflow:hidden;
          transition:all 0.3s ease;
          display:flex; align-items:center; justify-content:center; gap:6px;
        }
        .modal-server-offline.show{
          max-height:60px;
          opacity:1;
        }

        .modal-shake{animation:shake 0.4s ease;}
        @keyframes shake{
          0%,100%{transform:translateX(0);}
          20%{transform:translateX(-8px);}
          40%{transform:translateX(7px);}
          60%{transform:translateX(-5px);}
          80%{transform:translateX(3px);}
        }
      `}</style>
    </>
  )
}

export default LandingPage