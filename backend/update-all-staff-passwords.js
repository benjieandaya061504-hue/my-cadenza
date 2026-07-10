/**
 * Update All Staff Passwords Script
 * This script updates all staff passwords in the database
 * Usage: node update-all-staff-passwords.js
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

async function updateAllPasswords() {
  try {
    const staffPasswords = [
      { staff_id: 1, email: 'juan.cruz@cadenza.com', password: 'admin123' },
      { staff_id: 2, email: 'maria.santos@cadenza.com', password: 'frontdesk123' },
      { staff_id: 3, email: 'pedro.gonzales@cadenza.com', password: 'instructor123' },
      { staff_id: 4, email: 'ana.villanueva@cadenza.com', password: 'frontdesk123' },
      { staff_id: 5, email: 'carlos.fernandez@cadenza.com', password: 'instructor123' }
    ]
    
    for (const staff of staffPasswords) {
      const hashedPassword = await bcrypt.hash(staff.password, 10)
      await pool.query(
        'UPDATE Staff SET password = ? WHERE staff_id = ?',
        [hashedPassword, staff.staff_id]
      )
      console.log(`✅ Updated password for ${staff.email}: ${staff.password}`)
    }
    
    console.log('\nAll staff passwords updated successfully!')
    await pool.end()
  } catch (error) {
    console.error('❌ Error updating passwords:', error.message)
    process.exit(1)
  }
}

updateAllPasswords()
