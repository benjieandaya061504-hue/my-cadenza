import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

/* Context + hook: hook is intentionally co-located with provider for this module. */
/* eslint-disable react-refresh/only-export-components */

const PublicSiteContext = createContext(null)

export function PublicSiteProvider({ children }) {
  const signupContinueRef = useRef(null)

  const [toast, setToast] = useState({ message: '', show: false })
  const toastTimer = useRef(null)

  const showToast = useCallback((message) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    setToast({ message, show: true })
    toastTimer.current = window.setTimeout(() => {
      setToast((t) => ({ ...t, show: false }))
    }, 2800)
  }, [])

  const [signup, setSignup] = useState({
    open: false,
    icon: '🎵',
    title: 'Create Your Account',
    subtitle: 'Please sign up to continue.',
  })
  const [signupFields, setSignupFields] = useState({
    fname: '',
    lname: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  })
  const [signupError, setSignupError] = useState('')

  const openSignupGate = useCallback(({ icon, title, subtitle, onContinue }) => {
    signupContinueRef.current = typeof onContinue === 'function' ? onContinue : null
    setSignupError('')
    setSignupFields({
      fname: '',
      lname: '',
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
  }, [])

  const closeSignupGate = useCallback(() => {
    signupContinueRef.current = null
    setSignup((s) => ({ ...s, open: false }))
  }, [])

  const submitSignupGate = useCallback(() => {
    const { fname, lname, email, phone, password, confirm } = signupFields
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
    const fn = signupContinueRef.current
    signupContinueRef.current = null
    closeSignupGate()
    if (typeof fn === 'function') fn()
  }, [signupFields, closeSignupGate])

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
      openSignupGate,
      closeSignupGate,
      submitSignupGate,
      signup,
      signupFields,
      setSignupFields,
      signupError,
      successModal,
      openSuccessModal,
      closeSuccessModal,
    }),
    [
      toast,
      showToast,
      openSignupGate,
      closeSignupGate,
      submitSignupGate,
      signup,
      signupFields,
      signupError,
      successModal,
      openSuccessModal,
      closeSuccessModal,
    ],
  )

  return <PublicSiteContext.Provider value={value}>{children}</PublicSiteContext.Provider>
}

export function usePublicSite() {
  const ctx = useContext(PublicSiteContext)
  if (!ctx) throw new Error('usePublicSite must be used within PublicSiteProvider')
  return ctx
}
