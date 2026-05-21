import { useState } from 'react'
import PublicSectionNav from './PublicSectionNav'
import { usePublicSite } from './PublicSiteContext'
import axios from 'axios'

export default function RegistrationPublicPage() {
  const { showToast } = usePublicSite()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    contactNumber: '',
    address: '',
    password: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (e.target.name === 'password' || e.target.name === 'confirmPassword') {
      setPasswordError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.username || !formData.email || !formData.contactNumber || !formData.password || !formData.confirmPassword) {
      showToast('Please fill in all required fields.')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Incorrect Password')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await axios.post('http://localhost:5000/api/register', {
        username: formData.username,
        email: formData.email,
        contactNumber: formData.contactNumber,
        address: formData.address,
        password: formData.password,
      })

      if (response.status === 201) {
        showToast('Registration successful! Your application will be routed to the Student Approval Module for verification.')
        setFormData({
          username: '',
          email: '',
          contactNumber: '',
          address: '',
          password: '',
          confirmPassword: '',
        })
        setPasswordError('')
      }
    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.'
      showToast(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      username: '',
      email: '',
      contactNumber: '',
      address: '',
      password: '',
      confirmPassword: '',
    })
    setPasswordError('')
  }

  return (
    <div id="page-registration" className="pub-section">
      <PublicSectionNav label="Registration" />
      <div className="pub-page-header">
        <h2>Registration</h2>
        <p>Onboarding new users into the system. Create your account to access all services.</p>
      </div>
      <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div>
              <label htmlFor="username">User name</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label htmlFor="contactNumber">Contact Number</label>
              <input
                id="contactNumber"
                name="contactNumber"
                type="tel"
                placeholder="Enter your contact number"
                value={formData.contactNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label htmlFor="address">Address</label>
              <input
                id="address"
                name="address"
                type="text"
                placeholder="Enter your address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {passwordError && (
                <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>
                  {passwordError}
                </div>
              )}
            </div>
          </div>
          <div className="form-row" style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary"
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '12px 24px',
                borderRadius: '8px',
                border: '2px solid white',
                background: 'transparent',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn"
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: '#1e3a8a',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
