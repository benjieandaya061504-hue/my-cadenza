/**
 * Test User Login (for users table)
 * Tests the user authentication endpoint
 */

import http from 'http'

function testUserLogin(email, password) {
  const postData = JSON.stringify({
    email: email,
    password: password
  })

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/users/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }

  const req = http.request(options, (res) => {
    let data = ''

    res.on('data', (chunk) => {
      data += chunk
    })

    res.on('end', () => {
      console.log('Status:', res.statusCode)
      console.log('Response:', data)
      
      try {
        const parsed = JSON.parse(data)
        if (res.statusCode === 200) {
          console.log('\n✅ Login successful!')
          console.log('User:', parsed.user.username)
          console.log('Email:', parsed.user.email)
          console.log('Role:', parsed.user.role)
          console.log('Status:', parsed.user.status)
        } else {
          console.log('\n❌ Login failed:', parsed.error)
        }
      } catch (e) {
        console.log('Parse error:', e.message)
      }
    })
  })

  req.on('error', (error) => {
    console.error('Request error:', error.message)
  })

  req.write(postData)
  req.end()
}

console.log('Testing login with CORRECT credentials...')
testUserLogin('admin@example.com', 'admin123')

setTimeout(() => {
  console.log('\n' + '='.repeat(50))
  console.log('Testing login with WRONG password...')
  testUserLogin('admin@example.com', 'wrongpassword')
}, 2000)
