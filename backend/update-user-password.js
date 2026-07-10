/**
 * Update User Password Script
 * Updates the password for an existing user
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

async function updateUserPassword() {
  try {
    const username = 'admin'
    const newPassword = '1234'

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    // Update the user's password
    const [result] = await pool.query(
      'UPDATE users SET password = ? WHERE username = ?',
      [hashedPassword, username]
    )
    
    if (result.affectedRows === 0) {
      console.log('❌ User not found with username:', username)
      await pool.end()
      return
    }
    
    console.log('✅ User password updated successfully!')
    console.log('   Username:', username)
    console.log('   New Password:', newPassword)
    
    await pool.end()
  } catch (error) {
    console.error('❌ Error updating password:', error.message)
    process.exit(1)
  }
}

updateUserPassword()
