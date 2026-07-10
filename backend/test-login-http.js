/**
 * Test Staff Login using http module (Node.js built-in)
 */

import http from 'http'

const postData = JSON.stringify({
  email: 'juan.cruz@cadenza.com',
  password: 'admin123'
})

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/staff-auth/login',
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
        console.log('User:', parsed.user.first_name, parsed.user.last_name)
        console.log('Role:', parsed.user.role)
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
