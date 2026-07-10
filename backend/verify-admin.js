/**
 * Verify Admin Credentials Script
 * Checks if admin credentials exist in database
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

async function verifyAdmin() {
  try {
    const [rows] = await pool.query(
      'SELECT staff_id, email, password, status, role_id FROM Staff WHERE staff_id = 1'
    )
    
    if (rows.length === 0) {
      console.log('❌ Admin user not found')
      return
    }
    
    const admin = rows[0]
    console.log('Admin user found:')
    console.log('  Email:', admin.email)
    console.log('  Status:', admin.status)
    console.log('  Role ID:', admin.role_id)
    console.log('  Password hash exists:', !!admin.password)
    
    if (admin.password) {
      const isValid = await bcrypt.compare('admin123', admin.password)
      console.log('  Password "admin123" valid:', isValid)
    }
    
    await pool.end()
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

verifyAdmin()
