/**
 * Test Login with Newly Created User
 * Tests that a dynamically created user can login
 */

import http from 'http'

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

async function testNewUserLogin() {
  console.log('╔════════════════════════════════════════════╗')
  console.log('║  Test Login with Dynamically Created User  ║')
  console.log('╚════════════════════════════════════════════╝')
  console.log('')

  const testUser = {
    email: 'testadmin2@example.com',
    password: 'mypassword123'
  }

  console.log('Step 1: Login with CORRECT credentials...')
  console.log(`   Email: ${testUser.email}`)
  console.log(`   Password: ${testUser.password}`)
  console.log('')

  const loginCorrect = await loginUser(testUser.email, testUser.password)
  
  console.log(`Status: ${loginCorrect.status}`)
  console.log('Response:', JSON.stringify(loginCorrect.data, null, 2))
  console.log('')

  if (loginCorrect.status === 200) {
    console.log('✅ Login successful with correct credentials!')
    console.log('   User:', loginCorrect.data.user.username)
    console.log('   Email:', loginCorrect.data.user.email)
    console.log('   Role:', loginCorrect.data.user.role)
    console.log('   Status:', loginCorrect.data.user.status)
    console.log('')
  } else {
    console.log('❌ Login failed with correct credentials:', loginCorrect.data.error)
    return
  }

  console.log('Step 2: Login with WRONG password...')
  console.log(`   Email: ${testUser.email}`)
  console.log(`   Password: wrongpassword`)
  console.log('')

  const loginWrong = await loginUser(testUser.email, 'wrongpassword')
  
  console.log(`Status: ${loginWrong.status}`)
  console.log('Response:', JSON.stringify(loginWrong.data, null, 2))
  console.log('')

  if (loginWrong.status === 401) {
    console.log('✅ Correctly rejected wrong password')
    console.log('   Error:', loginWrong.data.error)
    console.log('')
    console.log('✅ Dynamic user login system working correctly!')
  } else {
    console.log('❌ Unexpected response for wrong password')
  }
}

testNewUserLogin().catch(console.error)
