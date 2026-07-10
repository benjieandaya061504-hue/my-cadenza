/**
 * Test Staff Login Script
 * Tests the staff login endpoint
 */

import fetch from 'node-fetch'

async function testLogin() {
  try {
    const response = await fetch('http://localhost:5000/api/staff-auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'juan.cruz@cadenza.com',
        password: 'admin123'
      })
    })
    
    const data = await response.json()
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error:', error.message)
  }
}

testLogin()
