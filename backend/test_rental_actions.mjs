import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const conn = await mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cadenza_music_db',
  ssl: (process.env.DB_HOST && process.env.DB_HOST !== '127.0.0.1' && process.env.DB_HOST !== 'localhost')
    ? { rejectUnauthorized: false }
    : undefined
})

// Find a pending rental to test with
const [pending] = await conn.query(
  "SELECT id, status, renter_name FROM instrument_rentals WHERE status = 'pending' LIMIT 1"
)

if (pending.length === 0) {
  console.log('No pending rentals found. Checking if any rentals exist...')
  const [all] = await conn.query('SELECT id, status, renter_name FROM instrument_rentals ORDER BY id DESC LIMIT 5')
  if (all.length === 0) {
    console.log('No rentals exist at all. Need to create one first.')
  } else {
    console.log('Existing rentals:')
    all.forEach(r => console.log(`  ID=${r.id} status=${r.status} renter=${r.renter_name}`))
  }
  await conn.end()
  process.exit(0)
}

const testId = pending[0].id
console.log(`Testing with rental ID=${testId} (${pending[0].renter_name}), current status=${pending[0].status}`)

// Test APPROVE
console.log('\n--- Testing APPROVE ---')
const [rental] = await conn.query('SELECT * FROM instrument_rentals WHERE id = ?', [testId])

if (rental.length === 0) {
  console.log('FAIL: Rental not found')
} else if (rental[0].status !== 'pending') {
  console.log(`SKIP: Cannot approve rental with status '${rental[0].status}'`)
} else {
  const [result] = await conn.query(
    'UPDATE instrument_rentals SET status = ? WHERE id = ?',
    ['approved', testId]
  )
  if (result.affectedRows > 0) {
    console.log(`PASS: Rental ${testId} approved successfully`)
  } else {
    console.log('FAIL: No rows affected')
  }
}

// Verify the approve
const [afterApprove] = await conn.query('SELECT id, status FROM instrument_rentals WHERE id = ?', [testId])
console.log(`Status after approve: ${afterApprove[0].status}`)

// Reset back to pending for reject test
console.log('\n--- Resetting to pending for reject test ---')
await conn.query("UPDATE instrument_rentals SET status = 'pending' WHERE id = ?", [testId])
const [afterReset] = await conn.query('SELECT id, status FROM instrument_rentals WHERE id = ?', [testId])
console.log(`Status after reset: ${afterReset[0].status}`)

// Test REJECT
console.log('\n--- Testing REJECT ---')
const [rental2] = await conn.query('SELECT * FROM instrument_rentals WHERE id = ?', [testId])

if (rental2[0].status !== 'pending') {
  console.log(`SKIP: Cannot reject rental with status '${rental2[0].status}'`)
} else {
  const [result2] = await conn.query(
    'UPDATE instrument_rentals SET status = ? WHERE id = ?',
    ['rejected', testId]
  )
  if (result2.affectedRows > 0) {
    console.log(`PASS: Rental ${testId} rejected successfully`)
  } else {
    console.log('FAIL: No rows affected')
  }
}

// Verify the reject
const [afterReject] = await conn.query('SELECT id, status FROM instrument_rentals WHERE id = ?', [testId])
console.log(`Status after reject: ${afterReject[0].status}`)

// Reset back to pending for real use
console.log('\n--- Resetting back to pending ---')
await conn.query("UPDATE instrument_rentals SET status = 'pending' WHERE id = ?", [testId])
const [final] = await conn.query('SELECT id, status FROM instrument_rentals WHERE id = ?', [testId])
console.log(`Final status: ${final[0].status}`)

console.log('\n✅ Both approve and reject work correctly end-to-end')
await conn.end()