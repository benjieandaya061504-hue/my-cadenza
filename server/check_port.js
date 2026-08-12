const http = require('http')

// Try the test directly
const loginData = JSON.stringify({ email: 'admin@cadenzamusic.com', password: 'admin123' })
const req = http.request('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginData) }
}, (res) => {
  let body = ''
  res.on('data', c => body += c)
  res.on('end', () => {
    try {
      const parsed = JSON.parse(body)
      console.log('Login status:', res.statusCode)
      console.log('Login body:', JSON.stringify(parsed))
      if (parsed.token) {
        console.log('TOKEN FOUND:', parsed.token.substring(0, 30) + '...')
      } else if (parsed.data?.token) {
        console.log('TOKEN IN DATA:', parsed.data.token.substring(0, 30) + '...')
      } else {
        console.log('NO TOKEN in response')
      }
    } catch(e) {
      console.log('Parse error:', e.message, 'body:', body)
    }
  })
})
req.on('error', e => console.log('Connection error:', e.code))
req.write(loginData)
req.end()