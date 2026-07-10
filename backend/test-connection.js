/**
 * Database Connection Test Script
 * Tests the MySQL database connection
 * Usage: node test-connection.js
 */

import { testConnection } from './db.js'

async function runTest() {
  console.log('')
  console.log('╔════════════════════════════════════════════╗')
  console.log('║     Database Connection Test               ║')
  console.log('╚════════════════════════════════════════════╝')
  console.log('')

  const connected = await testConnection()

  if (connected) {
    console.log('')
    console.log('✅ Database connection successful!')
    console.log('   You can now run the migration and start the server.')
  } else {
    console.log('')
    console.log('❌ Database connection failed!')
    console.log('')
    console.log('Troubleshooting:')
    console.log('1. Make sure WAMP MySQL is running')
    console.log('2. Check your .env file credentials')
    console.log('3. Verify MySQL is listening on the specified port')
    console.log('4. Run: node setup-db.js to create the database')
  }
}

runTest()
