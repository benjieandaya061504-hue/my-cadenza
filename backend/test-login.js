/**
 * Test Staff Login
 * Tests the staff authentication endpoint
 */

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
    
    if (response.ok) {
      console.log('\n✅ Login successful!')
      console.log('User:', data.user.first_name, data.user.last_name)
      console.log('Role:', data.user.role)
    } else {
      console.log('\n❌ Login failed:', data.error)
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
}

testLogin()
