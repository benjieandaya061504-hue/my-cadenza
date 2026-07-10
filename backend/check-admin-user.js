/**
 * Check Admin User Script
 * Verifies the admin user data in the database
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

async function checkAdminUser() {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, role, status FROM users WHERE username = ?',
      ['admin']
    )
    
    if (rows.length === 0) {
      console.log('❌ No user found with username: admin')
      await pool.end()
      return
    }
    
    const user = rows[0]
    console.log('User found:')
    console.log('  ID:', user.id)
    console.log('  Username:', user.username)
    console.log('  Email:', user.email)
    console.log('  Role:', user.role)
    console.log('  Status:', user.status)
    
    // Test password
    const [rowsWithPassword] = await pool.query(
      'SELECT password FROM users WHERE username = ?',
      ['admin']
    )
    
    if (rowsWithPassword.length > 0) {
      const passwordHash = rowsWithPassword[0].password
      console.log('  Password hash exists:', !!passwordHash)
      
      const isValid = await bcrypt.compare('1234', passwordHash)
      console.log('  Password "1234" valid:', isValid)
    }
    
    await pool.end()
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkAdminUser()
