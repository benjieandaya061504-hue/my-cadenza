/**
 * Database connection pool module for Cadenza Music School Management System.
 * Provides a centralized MySQL connection pool using mysql2/promise.
 */

import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cadenza_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
})

/**
 * Test the database connection
 */
export async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log('✅ MySQL database connected successfully')
    console.log(`   Host: ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}`)
    console.log(`   Database: ${process.env.DB_NAME || 'cadenza_db'}`)
    connection.release()
    return true
  } catch (err) {
    console.error('❌ MySQL database connection failed:', err.message)
    return false
  }
}

export default pool