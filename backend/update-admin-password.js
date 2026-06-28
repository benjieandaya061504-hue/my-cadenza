/**
 * Update Admin Password Script
 * This script updates the admin password in the database
 * Usage: node update-admin-password.js
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

async function updateAdminPassword() {
  try {
    const newPassword = 'admin123'
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    await pool.query(
      'UPDATE Staff SET password = ? WHERE staff_id = 1',
      [hashedPassword]
    )
    
    console.log('✅ Admin password updated successfully')
    console.log('   Email: juan.cruz@cadenza.com')
    console.log('   Password: admin123')
    
    await pool.end()
  } catch (error) {
    console.error('❌ Error updating password:', error.message)
    process.exit(1)
  }
}

updateAdminPassword()
