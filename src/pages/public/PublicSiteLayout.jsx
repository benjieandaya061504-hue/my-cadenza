import { Outlet } from 'react-router-dom'
import { PublicSiteProvider, usePublicSite } from './PublicSiteContext'
import PublicNav from '../../components/PublicNav'
import '../../styles/publicSiteTheme.css'
import './publicSiteLight.css'
import './publicSiteModules.css'

function PublicModals() {
  const {
    signup,
    signupFields,
    setSignupFields,
    signupError,
    closeSignupGate,
    submitSignupGate,
    successModal,
    closeSuccessModal,
  } = usePublicSite()

  return (
    <>
      <div className={`pub-signup-overlay${signup.open ? ' open' : ''}`} role="presentation">
        <div
          className="pub-signup-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pub-signup-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }} aria-hidden>
            {signup.icon}
          </div>
          <h2 id="pub-signup-title">{signup.title}</h2>
          <p className="sg-sub">{signup.subtitle}</p>
          <div className={`sg-error${signupError ? ' visible' : ''}`}>{signupError}</div>
          <div className="sg-row">
            <div className="sg-field">
              <label htmlFor="sg-fname">First Name</label>
              <input
                id="sg-fname"
                value={signupFields.fname}
                onChange={(e) => setSignupFields((f) => ({ ...f, fname: e.target.value }))}
                placeholder="e.g. Maria"
                autoComplete="given-name"
              />
            </div>
            <div className="sg-field">
              <label htmlFor="sg-lname">Last Name</label>
              <input
                id="sg-lname"
                value={signupFields.lname}
                onChange={(e) => setSignupFields((f) => ({ ...f, lname: e.target.value }))}
                placeholder="e.g. Santos"
                autoComplete="family-name"
              />
            </div>
          </div>
          <div className="sg-field">
            <label htmlFor="sg-email">Email Address</label>
            <input
              id="sg-email"
              type="email"
              value={signupFields.email}
              onChange={(e) => setSignupFields((f) => ({ ...f, email: e.target.value }))}
              placeholder="your@email.com"
              autoComplete="email"
            />
          </div>
          <div className="sg-field">
            <label htmlFor="sg-phone">Contact Number</label>
            <input
              id="sg-phone"
              type="tel"
              value={signupFields.phone}
              onChange={(e) => setSignupFields((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+63 9XX XXX XXXX"
              autoComplete="tel"
            />
          </div>
          <div className="sg-row">
            <div className="sg-field">
              <label htmlFor="sg-password">Password</label>
              <input
                id="sg-password"
                type="password"
                value={signupFields.password}
                onChange={(e) => setSignupFields((f) => ({ ...f, password: e.target.value }))}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
              />
            </div>
            <div className="sg-field">
              <label htmlFor="sg-confirm">Confirm Password</label>
              <input
                id="sg-confirm"
                type="password"
                value={signupFields.confirm}
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
            <button type="button" className="btn btn-primary" onClick={submitSignupGate}>
              Create Account →
            </button>
          </div>
          <p className="sg-notice">
            By signing up you agree to our <a href="#terms">Terms of Service</a> and{' '}
            <a href="#privacy">Privacy Policy</a>.
          </p>
        </div>
      </div>

      <div className={`modal-overlay${successModal.open ? ' open' : ''}`} role="presentation">
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
            {successModal.title}
          </div>
          <div style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
            {successModal.message}
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
              <span className="mono text-accent">{successModal.ref}</span>
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
    </>
  )
}

function PublicShell() {
  const { toast } = usePublicSite()

  return (
    <div id="pub-site-light">
      <PublicNav />
      <Outlet />
      <PublicModals />
      <div className={`pub-toast${toast.show ? ' show' : ''}`} role="status">
        {toast.message}
      </div>
    </div>
  )
}

export default function PublicSiteLayout() {
  return (
    <PublicSiteProvider>
      <PublicShell />
    </PublicSiteProvider>
  )
}
