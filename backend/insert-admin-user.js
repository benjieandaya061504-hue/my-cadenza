/**
 * Insert User into users table
 * Creates a user with specified credentials
 * Usage: node insert-admin-user.js <email> <password> [username] [role] [status]
 * Example: node insert-admin-user.js admin@example.com admin123 admin admin approved
 */

import mysql from 'mysql2/promise'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()

async function insertUser() {
  const args = process.argv.slice(2)
  
  if (args.length < 2) {
    console.log('Usage: node insert-admin-user.js <email> <password> [username] [role] [status]')
    console.log('Example: node insert-admin-user.js admin@example.com admin123 admin admin approved')
    console.log('')
    console.log('Arguments:')
    console.log('  email    (required) - User email address')
    console.log('  password (required) - User password (will be hashed)')
    console.log('  username (optional) - Username (defaults to email prefix)')
    console.log('  role     (optional) - Role: student, admin, staff (defaults to student)')
    console.log('  status   (optional) - Status: pending, approved, rejected (defaults to approved)')
    process.exit(1)
  }

  const email = args[0]
  const password = args[1]
  const username = args[2] || email.split('@')[0]
  const role = args[3] || 'student'
  const status = args[4] || 'approved'

  console.log('')
  console.log('╔════════════════════════════════════════════╗')
  console.log('║     Insert User into Database              ║')
  console.log('╚════════════════════════════════════════════╝')
  console.log('')

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'cadenza_music_db'
    })

    console.log('✅ Connected to database')

    // Check if user already exists
    const [existing] = await connection.query(
      'SELECT id, email FROM users WHERE email = ?',
      [email]
    )

    const passwordHash = await bcrypt.hash(password, 10)

    if (existing.length > 0) {
      console.log('⚠️  User already exists with email:', existing[0].email)
      console.log('   Updating credentials...')
      
      await connection.query(
        'UPDATE users SET password = ?, role = ?, status = ?, username = ? WHERE email = ?',
        [passwordHash, role, status, username, email]
      )
      
      console.log('✅ User updated successfully')
    } else {
      console.log('📝 Creating new user...')
      
      const [result] = await connection.query(
        `INSERT INTO users (username, email, password, contact_number, address, role, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [username, email, passwordHash, null, null, role, status]
      )
      
      console.log('✅ User created successfully')
      console.log('   User ID:', result.insertId)
    }

    // Verify the insert/update
    const [user] = await connection.query(
      'SELECT id, username, email, role, status, created_at FROM users WHERE email = ?',
      [email]
    )

    console.log('')
    console.log('📊 User Details:')
    console.log('   ID:', user[0].id)
    console.log('   Username:', user[0].username)
    console.log('   Email:', user[0].email)
    console.log('   Role:', user[0].role)
    console.log('   Status:', user[0].status)
    console.log('   Created:', user[0].created_at)

    await connection.end()
    
    console.log('')
    console.log('✅ Setup complete!')
    console.log('   Login credentials:')
    console.log('   Email:', email)
    console.log('   Password:', password)
    
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

insertUser()
