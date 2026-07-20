import PublicSectionNav from './PublicSectionNav'
import { usePublicSite } from './PublicSiteContext'

export default function RegistrationPublicPage() {
  const {
    isLoggedIn,
    signupFields,
    setSignupFields,
    signupError,
    submitting,
    submitSignupGate,
  } = usePublicSite()

  if (isLoggedIn) {
    return (
      <div id="page-registration" className="pub-section">
        <PublicSectionNav label="Registration" />
        <div className="pub-page-header">
          <h2>Registration</h2>
          <p>Onboarding new users into the system. Create your account to access all services.</p>
        </div>
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h3 style={{ marginBottom: 8 }}>You are already registered and logged in.</h3>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>
            You can proceed to enroll in lessons or explore other services.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div id="page-registration" className="pub-section">
      <PublicSectionNav label="Registration" />
      <div className="pub-page-header">
        <h2>Registration</h2>
        <p>Onboarding new users into the system. Create your account to access all services.</p>
      </div>
      <div className="card" style={{ maxWidth: '480px', margin: '0 auto' }}>
        <div style={{ fontSize: 36, marginBottom: 8, textAlign: 'center' }} aria-hidden>📝</div>
        <h2 style={{ marginBottom: 4, textAlign: 'center' }}>Create Your Account</h2>
        <p className="sg-sub" style={{ textAlign: 'center' }}>Create your account.</p>

        <div className={`sg-error${signupError ? ' visible' : ''}`}>{signupError}</div>

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
            onChange={(e) => setSignupFields((f) => ({ ...f, phone: e.target.value.replace(/[^0-9+]/g, '') }))}
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
        <div className="sg-actions" style={{ marginTop: 8 }}>
          <button type="button" className="btn btn-primary" onClick={submitSignupGate} disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
            {submitting ? 'Creating Account...' : 'Create Account →'}
          </button>
        </div>
      </div>
    </div>
  )
}