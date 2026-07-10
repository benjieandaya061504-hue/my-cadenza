/**
 * Test Registration and Immediate Login
 * Tests that a newly registered user can login immediately
 */

import http from 'http'

function registerUser(username, email, password, role = 'student') {
  const postData = JSON.stringify({
    username: username,
    email: email,
    contactNumber: '09123456789',
    address: 'Test Address',
    password: password,
    role: role
  })

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/users/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) })
        } catch (e) {
          resolve({ status: res.statusCode, data: data })
        }
      })
    })
    req.on('error', reject)
    req.write(postData)
    req.end()
  })
}

function loginUser(email, password) {
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

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) })
        } catch (e) {
          resolve({ status: res.statusCode, data: data })
        }
      })
    })
    req.on('error', reject)
    req.write(postData)
    req.end()
  })
}

async function testFlow() {
  console.log('╔════════════════════════════════════════════╗')
  console.log('║  Test Registration & Immediate Login       ║')
  console.log('╚════════════════════════════════════════════╝')
  console.log('')

  const testUser = {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'test123',
    role: 'student'
  }

  console.log('Step 1: Registering new user...')
  console.log(`   Username: ${testUser.username}`)
  console.log(`   Email: ${testUser.email}`)
  console.log(`   Role: ${testUser.role}`)
  console.log('')

  const registerResult = await registerUser(testUser.username, testUser.email, testUser.password, testUser.role)
  
  console.log(`Status: ${registerResult.status}`)
  console.log('Response:', JSON.stringify(registerResult.data, null, 2))
  console.log('')

  if (registerResult.status === 201) {
    console.log('✅ Registration successful!')
    console.log('   User ID:', registerResult.data.userId)
    console.log('')
    
    console.log('Step 2: Attempting immediate login...')
    console.log(`   Email: ${testUser.email}`)
    console.log(`   Password: ${testUser.password}`)
    console.log('')

    const loginResult = await loginUser(testUser.email, testUser.password)
    
    console.log(`Status: ${loginResult.status}`)
    console.log('Response:', JSON.stringify(loginResult.data, null, 2))
    console.log('')

    if (loginResult.status === 200) {
      console.log('✅ Login successful!')
      console.log('   User:', loginResult.data.user.username)
      console.log('   Email:', loginResult.data.user.email)
      console.log('   Role:', loginResult.data.user.role)
      console.log('   Status:', loginResult.data.user.status)
      console.log('')
      console.log('✅ New users can now login immediately after registration!')
    } else {
      console.log('❌ Login failed:', loginResult.data.error)
    }
  } else {
    console.log('❌ Registration failed:', registerResult.data.error)
  }
}

testFlow().catch(console.error)
