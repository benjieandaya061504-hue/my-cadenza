/**
 * Test Approval Flow
 * Tests that pending users cannot login until approved by admin
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

function updateUserStatus(userId, status) {
  const postData = JSON.stringify({ status: status })

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/users/${userId}/status`,
    method: 'PUT',
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
  console.log('║  Test Admin Approval Flow                  ║')
  console.log('╚════════════════════════════════════════════╝')
  console.log('')

  const testUser = {
    username: 'pendinguser',
    email: 'pendinguser@example.com',
    password: 'test123',
    role: 'student'
  }

  console.log('Step 1: Registering new user...')
  console.log(`   Username: ${testUser.username}`)
  console.log(`   Email: ${testUser.email}`)
  console.log('')

  const registerResult = await registerUser(testUser.username, testUser.email, testUser.password, testUser.role)
  
  console.log(`Status: ${registerResult.status}`)
  console.log('Response:', JSON.stringify(registerResult.data, null, 2))
  console.log('')

  const userId = registerResult.data.userId

  if (registerResult.status === 201) {
    console.log('✅ Registration successful!')
    console.log('   User ID:', userId)
    console.log('')
    
    console.log('Step 2: Attempting login while PENDING...')
    console.log(`   Email: ${testUser.email}`)
    console.log(`   Password: ${testUser.password}`)
    console.log('')

    const loginPending = await loginUser(testUser.email, testUser.password)
    
    console.log(`Status: ${loginPending.status}`)
    console.log('Response:', JSON.stringify(loginPending.data, null, 2))
    console.log('')

    if (loginPending.status === 403) {
      console.log('✅ Correctly blocked - pending user cannot login')
      console.log('   Error:', loginPending.data.error)
      console.log('')
    } else {
      console.log('❌ Unexpected - pending user was able to login')
      return
    }

    console.log('Step 3: Admin approves the user...')
    console.log(`   User ID: ${userId}`)
    console.log(`   New Status: approved`)
    console.log('')

    const approveResult = await updateUserStatus(userId, 'approved')
    
    console.log(`Status: ${approveResult.status}`)
    console.log('Response:', JSON.stringify(approveResult.data, null, 2))
    console.log('')

    if (approveResult.status === 200) {
      console.log('✅ User approved successfully')
      console.log('')
      
      console.log('Step 4: Attempting login after APPROVAL...')
      console.log(`   Email: ${testUser.email}`)
      console.log(`   Password: ${testUser.password}`)
      console.log('')

      const loginApproved = await loginUser(testUser.email, testUser.password)
      
      console.log(`Status: ${loginApproved.status}`)
      console.log('Response:', JSON.stringify(loginApproved.data, null, 2))
      console.log('')

      if (loginApproved.status === 200) {
        console.log('✅ Login successful after approval!')
        console.log('   User:', loginApproved.data.user.username)
        console.log('   Email:', loginApproved.data.user.email)
        console.log('   Role:', loginApproved.data.user.role)
        console.log('   Status:', loginApproved.data.user.status)
        console.log('')
        console.log('✅ Approval flow working correctly!')
      } else {
        console.log('❌ Login failed after approval:', loginApproved.data.error)
      }
    } else {
      console.log('❌ Approval failed:', approveResult.data.error)
    }
  } else {
    console.log('❌ Registration failed:', registerResult.data.error)
  }
}

testFlow().catch(console.error)
