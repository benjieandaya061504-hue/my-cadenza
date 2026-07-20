/**
 * Test Admin Login Script
 * Tests login with admin@example.com
 */

import fetch from 'node-fetch'

async function testLogin() {
  try {
    console.log('Testing login with admin@example.com and password admin123...')
    const response = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    })
    
    const data = await response.json()
    console.log('Response status:', response.status)
    console.log('Response data:', JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error:', error.message)
  }
}

testLogin()
