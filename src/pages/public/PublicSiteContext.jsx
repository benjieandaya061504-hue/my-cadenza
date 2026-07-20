import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { studentAPI } from '../../services/api'

/* Context + hook: hook is intentionally co-located with provider for this module. */
/* eslint-disable react-refresh/only-export-components */

const PublicSiteContext = createContext(null)

const SESSION_KEY = 'cadenza_user_session'

export function PublicSiteProvider({ children }) {
  const signupContinueRef = useRef(null)

  const [toast, setToast] = useState({ message: '', show: false })
  const toastTimer = useRef(null)

  const showToast = useCallback((message) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    setToast({ message, show: true })
    toastTimer.current = window.setTimeout(() => {
      setToast({ message: '', show: false })
    }, 2800)
  }, [])

  // ─── Auth State ──────────────────────────────────────────────
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [loginModal, setLoginModal] = useState({ open: false, mode: 'signup' })
  const [signupOnly, setSignupOnly] = useState(false)

  // Restore session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Verify the session is still valid by calling the API
        if (parsed.id) {
          studentAPI.getMe(parsed.id)
            .then((res) => {
              const u = res.data.user
              setUser(u)
              localStorage.setItem(SESSION_KEY, JSON.stringify(u))
            })
            .catch(() => {
              // Session expired / user deleted
              localStorage.removeItem(SESSION_KEY)
              setUser(null)
            })
            .finally(() => setAuthLoading(false))
        } else {
          setAuthLoading(false)
        }
      } else {
        setAuthLoading(false)
      }
    } catch {
      localStorage.removeItem(SESSION_KEY)
      setAuthLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await studentAPI.login({ email, password })
    const u = res.data.user
    setUser(u)
    localStorage.setItem(SESSION_KEY, JSON.stringify(u))
    return u
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
    showToast('You have been logged out.')
  }, [showToast])

  const isLoggedIn = !!user

  // ─── Signup Gate ─────────────────────────────────────────────
  const [signup, setSignup] = useState({
    open: false,
    icon: '🎵',
    title: 'Create Your Account',
    subtitle: 'Please sign up to continue.',
  })
  const [signupFields, setSignupFields] = useState({
    fname: '',
    mname: '',
    lname: '',
    suffix: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  })
  const [signupError, setSignupError] = useState('')
  const [loginError, setLoginError] = useState('')

  const openSignupGate = useCallback(({ icon, title, subtitle, onContinue, signupOnly: onlySignup }) => {
    signupContinueRef.current = typeof onContinue === 'function' ? onContinue : null
    setSignupError('')
    setLoginError('')
    setSignupFields({
      fname: '',
      mname: '',
      lname: '',
      suffix: '',
      email: '',
      phone: '',
      password: '',
      confirm: '',
    })
    setSignup({
      open: true,
      icon: icon || '🎵',
      title: title || 'Create Your Account',
      subtitle: subtitle || 'Please sign up to continue.',
    })
    setSignupOnly(!!onlySignup)
    setLoginModal({ open: true, mode: 'signup' })
  }, [])

  const openLoginModal = useCallback(({ icon, title, subtitle, onContinue } = {}) => {
    signupContinueRef.current = typeof onContinue === 'function' ? onContinue : null
    setSignupError('')
    setLoginError('')
    setSignupFields({
      fname: '',
      mname: '',
      lname: '',
      suffix: '',
      email: '',
      phone: '',
      password: '',
      confirm: '',
    })
    setSignup({
      open: true,
      icon: icon || '🔐',
      title: title || 'Welcome Back',
      subtitle: subtitle || 'Please log in to continue.',
    })
    setLoginModal({ open: true, mode: 'login' })
  }, [])

  const switchToSignup = useCallback(() => {
    setSignupError('')
    setLoginError('')
    setSignupFields({
      fname: '',
      mname: '',
      lname: '',
      suffix: '',
      email: '',
      phone: '',
      password: '',
      confirm: '',
    })
    setSignup((s) => ({ ...s, open: true }))
    setLoginModal({ open: true, mode: 'signup' })
  }, [])

  const switchToLogin = useCallback(() => {
    setSignupError('')
    setLoginError('')
    setSignupFields({
      fname: '',
      mname: '',
      lname: '',
      suffix: '',
      email: '',
      phone: '',
      password: '',
      confirm: '',
    })
    setSignup((s) => ({ ...s, open: true }))
    setLoginModal({ open: true, mode: 'login' })
  }, [])

  const closeSignupGate = useCallback(() => {
    signupContinueRef.current = null
    setSignup((s) => ({ ...s, open: false }))
    setLoginModal((l) => ({ ...l, open: false }))
    setSignupOnly(false)
  }, [])

  const [submitting, setSubmitting] = useState(false)
  const [loginSubmitting, setLoginSubmitting] = useState(false)
  const [signedUpUser, setSignedUpUser] = useState(null)

  // ---- Pending approval state ----
  const [pendingApproval, setPendingApproval] = useState({
    open: false,
    icon: '⏳',
    title: 'Account Approval Pending',
    subtitle: 'Your account has been created and is awaiting verification.',
  })

  const closePendingApproval = useCallback(() => {
    setPendingApproval((p) => ({ ...p, open: false }))
    // After closing the pending approval, call the onContinue callback
    const fn = signupContinueRef.current
    signupContinueRef.current = null
    if (typeof fn === 'function') fn()
  }, [])

  const submitSignupGate = useCallback(async () => {
    const { fname, mname, lname, suffix, email, phone, password, confirm } = signupFields
    if (!fname.trim() || !lname.trim()) {
      setSignupError('Please enter your first and last name.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSignupError('Please enter a valid email address.')
      return
    }
    if (!phone.trim()) {
      setSignupError('Please enter your contact number.')
      return
    }
    if (password.length < 8) {
      setSignupError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setSignupError('Passwords do not match.')
      return
    }
    setSignupError('')
    setSubmitting(true)
    try {
      const payload = {
        first_name: fname.trim(),
        middle_name: mname.trim() || null,
        last_name: lname.trim(),
        suffix: suffix.trim() || null,
        email: email.trim(),
        password,
        contact_number: phone.trim()
      }
      const res = await studentAPI.signup(payload)
      setSubmitting(false)

      // Automatically log the user in after signup
      const u = res.data.user
      setUser(u)
      localStorage.setItem(SESSION_KEY, JSON.stringify(u))

      setSignedUpUser({
        userId: res.data.userId,
        email: email.trim(),
        firstName: fname.trim(),
        lastName: lname.trim()
      })
      // Save the onContinue callback before closing signup gate (which nullifies it)
      const savedCallback = signupContinueRef.current
      closeSignupGate()
      // Show pending approval instead of immediately proceeding
      // Restore the callback so it fires when user clicks "Continue" on the approval modal
      signupContinueRef.current = savedCallback
      setPendingApproval((p) => ({ ...p, open: true }))
    } catch (err) {
      setSubmitting(false)
      const msg =
        err.response?.data?.error ||
        err.message ||
        'Signup failed. Please try again later.'
      setSignupError(msg)
    }
  }, [signupFields, closeSignupGate])

  // ─── Login from modal ────────────────────────────────────────
  const submitLogin = useCallback(async () => {
    const { email, password } = signupFields
    if (!email.trim()) {
      setLoginError('Please enter your email address.')
      return
    }
    if (!password) {
      setLoginError('Please enter your password.')
      return
    }
    setLoginError('')
    setLoginSubmitting(true)
    try {
      const u = await login(email.trim(), password)
      setLoginSubmitting(false)

      // Set signed up user for backward compatibility with enrollment page
      setSignedUpUser({
        userId: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName
      })

      // Save callback before closing (which nullifies it)
      const savedCallback = signupContinueRef.current
      closeSignupGate()
      // Fire the callback after modal closes so user proceeds to the service
      if (typeof savedCallback === 'function') {
        setTimeout(() => savedCallback(), 50)
      }

      showToast(`Welcome back, ${u.firstName}!`)
    } catch (err) {
      setLoginSubmitting(false)
      const msg =
        err.response?.data?.error ||
        err.message ||
        'Login failed. Please try again.'
      setLoginError(msg)
    }
  }, [signupFields, login, closeSignupGate, showToast])

  const [successModal, setSuccessModal] = useState({
    open: false,
    title: '',
    message: '',
    ref: '',
  })

  const openSuccessModal = useCallback((payload) => {
    setSuccessModal({
      open: true,
      title: payload.title || 'Request Submitted!',
      message: payload.message || 'Our team will review and contact you.',
      ref: payload.ref || `REF-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    })
  }, [])

  const closeSuccessModal = useCallback(() => {
    setSuccessModal((s) => ({ ...s, open: false }))
  }, [])

  const value = useMemo(
    () => ({
      toast,
      showToast,
      user,
      authLoading,
      isLoggedIn,
      login,
      logout,
      loginModal,
      loginError,
      loginSubmitting,
      submitLogin,
      openSignupGate,
      openLoginModal,
      switchToSignup,
      switchToLogin,
      closeSignupGate,
      submitSignupGate,
      signup,
      signupOnly,
      signupFields,
      setSignupFields,
      signupError,
      successModal,
      openSuccessModal,
      closeSuccessModal,
      signedUpUser,
      pendingApproval,
      closePendingApproval,
    }),
    [
      toast,
      showToast,
      user,
      authLoading,
      isLoggedIn,
      login,
      logout,
      loginModal,
      loginError,
      loginSubmitting,
      submitLogin,
      openSignupGate,
      openLoginModal,
      switchToSignup,
      switchToLogin,
      closeSignupGate,
      submitSignupGate,
      signup,
      signupOnly,
      signupFields,
      signupError,
      successModal,
      openSuccessModal,
      closeSuccessModal,
      signedUpUser,
      pendingApproval,
    ],
  )

  return <PublicSiteContext.Provider value={value}>{children}</PublicSiteContext.Provider>
}

export function usePublicSite() {
  const ctx = useContext(PublicSiteContext)
  // Return empty object if used outside provider (e.g. LandingPage using PublicNav without PublicSiteProvider)
  if (!ctx) return {}
  return ctx
}
