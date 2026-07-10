/**
 * Create User Script
 * Creates a new user in the database with specified credentials
 */

import mysql from 'mysql2/promise'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cadenza_music_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

async function createUser() {
  try {
    const username = 'admin'
    const password = '1234'
    const email = 'admin@cadenza.com'
    const contactNumber = '09123456789'
    const role = 'admin'
    const status = 'approved'

    // Check if user already exists
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    )
    
    if (existing.length > 0) {
      console.log('❌ User already exists with username:', username, 'or email:', email)
      await pool.end()
      return
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Insert the user
    const [result] = await pool.query(
      'INSERT INTO users (username, email, contact_number, address, password, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, email, contactNumber, null, hashedPassword, role, status]
    )
    
    console.log('✅ User created successfully!')
    console.log('   Username:', username)
    console.log('   Password:', password)
    console.log('   Email:', email)
    console.log('   Role:', role)
    console.log('   Status:', status)
    console.log('   User ID:', result.insertId)
    
    await pool.end()
  } catch (error) {
    console.error('❌ Error creating user:', error.message)
    process.exit(1)
  }
}

createUser()
