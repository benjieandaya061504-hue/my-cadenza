const http = require('http')

const loginData = JSON.stringify({ email: 'admin@cadenzamusic.com', password: 'admin123' })
const loginReq = http.request('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let body = ''
  res.on('data', c => body += c)
  res.on('end', () => {
    const parsed = JSON.parse(body)
    console.log('Login response:', JSON.stringify(parsed))
    const token = parsed.token || parsed.data?.token
    console.log('Got token:', token ? token.slice(0,20)+'...' : 'NONE')

    // Now submit the same request that crashed before
    const rentalData = JSON.stringify({
      client_id: 9,
      band_room_id: 3,
      rental_date: null,
      start_time: '10:08',
      end_time: '22:08',
      total_amount: 1200,
      status: 'Confirmed'
    })

    const rentalReq = http.request('http://localhost:5000/api/admin/band-room-rentals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, (res2) => {
      let body2 = ''
      res2.on('data', c => body2 += c)
      res2.on('end', () => {
        console.log('Rental response status:', res2.statusCode)
        console.log('Rental response body:', body2)
      })
    })
    rentalReq.write(rentalData)
    rentalReq.end()
  })
})
loginReq.write(loginData)
loginReq.end()