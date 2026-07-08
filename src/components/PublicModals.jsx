import { usePublicSite } from '../pages/public/PublicSiteContext'

export default function PublicModals() {
  const {
    signup,
    signupFields,
    setSignupFields,
    signupError,
    loginError,
    submitting,
    loginSubmitting,
    closeSignupGate,
    submitSignupGate,
    submitLogin,
    loginModal,
    successModal,
    closeSuccessModal,
    pendingApproval,
    closePendingApproval,
    switchToSignup,
    switchToLogin,
  } = usePublicSite()

  const signupMode = loginModal?.mode === 'signup'

  const toggleMode = () => {
    if (signupMode) {
      switchToLogin()
    } else {
      switchToSignup()
    }
  }

  const modeText = signupMode ? "Already have an account?" : "Don't have an account?"
  const modeLink = signupMode ? "Log In" : "Sign Up"
  const error = signupMode ? signupError : loginError

  return (
    <>
      <div className={`pub-signup-overlay${signup?.open ? ' open' : ''}`} role="presentation">
        <div
          className="pub-signup-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pub-signup-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ fontSize: 36, marginBottom: 8 }} aria-hidden>
            {signup?.icon}
          </div>
          <h2 id="pub-signup-title" style={{ marginBottom: 4 }}>
            {signupMode ? signup?.title : 'Welcome Back'}
          </h2>
          <p className="sg-sub">{signupMode ? signup?.subtitle : 'Please log in to continue.'}</p>

          {/* Toggle tabs */}
          <div style={{
            display: 'flex',
            background: 'var(--surface2)',
            borderRadius: 10,
            padding: 3,
            marginBottom: 16,
            border: '1px solid var(--border)',
          }}>
            <button
              type="button"
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 8,
                border: 'none',
                background: signupMode ? 'var(--accent)' : 'transparent',
                color: signupMode ? '#fff' : 'var(--text2)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
                transition: 'all 0.15s ease',
              }}
              onClick={() => {
                if (!signupMode) {
                  switchToSignup()
                }
              }}
            >
              Sign Up
            </button>
            <button
              type="button"
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 8,
                border: 'none',
                background: !signupMode ? 'var(--accent)' : 'transparent',
                color: !signupMode ? '#fff' : 'var(--text2)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
                transition: 'all 0.15s ease',
              }}
              onClick={() => {
                if (signupMode) {
                  switchToLogin()
                }
              }}
            >
              Log In
            </button>
          </div>

          <div className={`sg-error${error ? ' visible' : ''}`}>{error}</div>

          {signupMode ? (
            /* ─── Sign Up Form ─── */
            <>
              <div className="sg-row sg-row-3">
                <div className="sg-field">
                  <label htmlFor="sg-fname">First Name <span style={{color:'var(--gold)'}}>*</span></label>
                  <input
                    id="sg-fname"
                    value={signupFields?.fname || ''}
                    onChange={(e) => setSignupFields((f) => ({ ...f, fname: e.target.value }))}
                    placeholder="e.g. Maria"
                    autoComplete="given-name"
                  />
                </div>
                <div className="sg-field">
                  <label htmlFor="sg-mname">Middle Name</label>
                  <input
                    id="sg-mname"
                    value={signupFields?.mname || ''}
                    onChange={(e) => setSignupFields((f) => ({ ...f, mname: e.target.value }))}
                    placeholder="(optional)"
                    autoComplete="additional-name"
                  />
                </div>
                <div className="sg-field">
                  <label htmlFor="sg-lname">Last Name <span style={{color:'var(--gold)'}}>*</span></label>
                  <input
                    id="sg-lname"
                    value={signupFields?.lname || ''}
                    onChange={(e) => setSignupFields((f) => ({ ...f, lname: e.target.value }))}
                    placeholder="e.g. Santos"
                    autoComplete="family-name"
                  />
                </div>
              </div>
              <div className="sg-field">
                <label htmlFor="sg-suffix">Suffix</label>
                <input
                  id="sg-suffix"
                  value={signupFields?.suffix || ''}
                  onChange={(e) => setSignupFields((f) => ({ ...f, suffix: e.target.value }))}
                  placeholder="e.g. Jr., III (optional)"
                  autoComplete="honorific-suffix"
                />
              </div>
              <div className="sg-field">
                <label htmlFor="sg-email">Email Address <span style={{color:'var(--gold)'}}>*</span></label>
                <input
                  id="sg-email"
                  type="email"
                  value={signupFields?.email || ''}
                  onChange={(e) => setSignupFields((f) => ({ ...f, email: e.target.value }))}
                  placeholder="your@email.com"
                  autoComplete="email"
                />
              </div>
              <div className="sg-field">
                <label htmlFor="sg-phone">Contact Number <span style={{color:'var(--gold)'}}>*</span></label>
                <input
                  id="sg-phone"
                  type="tel"
                  value={signupFields?.phone || ''}
                  onChange={(e) => setSignupFields((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+63 9XX XXX XXXX"
                  autoComplete="tel"
                />
              </div>
              <div className="sg-row">
                <div className="sg-field">
                  <label htmlFor="sg-password">Password <span style={{color:'var(--gold)'}}>*</span></label>
                  <input
                    id="sg-password"
                    type="password"
                    value={signupFields?.password || ''}
                    onChange={(e) => setSignupFields((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                  />
                </div>
                <div className="sg-field">
                  <label htmlFor="sg-confirm">Confirm Password <span style={{color:'var(--gold)'}}>*</span></label>
                  <input
                    id="sg-confirm"
                    type="password"
                    value={signupFields?.confirm || ''}
                    onChange={(e) => setSignupFields((f) => ({ ...f, confirm: e.target.value }))}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div className="sg-actions">
                <button type="button" className="btn btn-secondary" onClick={closeSignupGate}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={submitSignupGate} disabled={submitting}>
                  {submitting ? 'Creating Account...' : 'Create Account →'}
                </button>
              </div>
            </>
          ) : (
            /* ─── Log In Form ─── */
            <>
              <div className="sg-field">
                <label htmlFor="lg-email">Email Address</label>
                <input
                  id="lg-email"
                  type="email"
                  value={signupFields?.email || ''}
                  onChange={(e) => setSignupFields((f) => ({ ...f, email: e.target.value }))}
                  placeholder="your@email.com"
                  autoComplete="email"
                />
              </div>
              <div className="sg-field">
                <label htmlFor="lg-password">Password</label>
                <input
                  id="lg-password"
                  type="password"
                  value={signupFields?.password || ''}
                  onChange={(e) => setSignupFields((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  onKeyDown={(e) => { if (e.key === 'Enter') submitLogin() }}
                />
              </div>
              <div className="sg-actions">
                <button type="button" className="btn btn-secondary" onClick={closeSignupGate}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={submitLogin} disabled={loginSubmitting}>
                  {loginSubmitting ? 'Logging in...' : 'Log In →'}
                </button>
              </div>
            </>
          )}

          <p className="sg-notice">
            <a
              href="#toggle-mode"
              onClick={(e) => {
                e.preventDefault()
                toggleMode()
              }}
              style={{ color: 'var(--accent)', textDecoration: 'none' }}
            >
              {modeText} <strong>{modeLink}</strong>
            </a>
          </p>
          {!signupMode && (
            <p className="sg-notice" style={{ marginTop: 0 }}>
              By logging in you agree to our <a href="#terms">Terms of Service</a> and{' '}
              <a href="#privacy">Privacy Policy</a>.
            </p>
          )}
        </div>
      </div>

      <div className={`modal-overlay${successModal?.open ? ' open' : ''}`} role="presentation">
        <div
          className="modal"
          style={{ width: 420, textAlign: 'center' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pub-success-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ fontSize: 52, marginBottom: 12 }} aria-hidden>
            ✅
          </div>
          <div id="pub-success-title" style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
            {successModal?.title}
          </div>
          <div style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
            {successModal?.message}
          </div>
          <div
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: 14,
              marginBottom: 16,
              textAlign: 'left',
            }}
          >
            <div className="flex-between mb12">
              <span className="text-muted text-sm">Reference Number</span>
              <span className="mono text-accent">{successModal?.ref}</span>
            </div>
            <div className="flex-between">
              <span className="text-muted text-sm">Status</span>
              <span className="badge badge-gold">Pending Review</span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={closeSuccessModal}
          >
            Done
          </button>
        </div>
      </div>

      {/* ---- Pending Approval Modal ---- */}
      <div className={`modal-overlay${pendingApproval?.open ? ' open' : ''}`} role="presentation">
        <div
          className="modal"
          style={{ width: 420, textAlign: 'center' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pub-pending-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ fontSize: 52, marginBottom: 12 }} aria-hidden>
            ⏳
          </div>
          <div id="pub-pending-title" style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
            {pendingApproval?.title}
          </div>
          <div style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
            Your account has been created and is awaiting verification by our front desk team. You will be notified once your account has been approved.
          </div>
          <div
            style={{
              background: 'rgba(240,180,41,0.08)',
              border: '1px solid rgba(240,180,41,0.25)',
              borderRadius: 10,
              padding: 14,
              marginBottom: 16,
              textAlign: 'left',
            }}
          >
            <div className="flex-between">
              <span className="text-muted text-sm">Status</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--gold)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                ⏳ Pending Approval
              </span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={closePendingApproval}
          >
            Continue →
          </button>
        </div>
      </div>
    </>
  )
}