/**
 * Test Admin Login Script
 * Tests login with username 'admin' and password '1234'
 */

import fetch from 'node-fetch'

async function testLogin() {
  try {
    console.log('Testing login with username: admin, password: 1234...')
    const response = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: '1234'
      })
    })
    
    const data = await response.json()
    console.log('Response status:', response.status)
    console.log('Response data:', JSON.stringify(data, null, 2))
    
    if (response.status === 200) {
      console.log('✅ Login successful!')
    } else {
      console.log('❌ Login failed')
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
}

testLogin()
