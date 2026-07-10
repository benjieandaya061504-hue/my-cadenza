/**
 * Database connection pool module for Cadenza Music School Management System.
 * Provides a centralized MySQL connection pool using mysql2/promise.
 */

import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import { URL } from 'url'

dotenv.config()

// Parse Railway's MYSQL_PUBLIC_URL or MYSQL_URL into individual params
// This allows the user to simply copy the Railway connection URL
const dbUrl = process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL
let dbConfig = {}

if (dbUrl) {
  try {
    const parsed = new URL(dbUrl)
    dbConfig = {
      host: parsed.hostname,
      port: parseInt(parsed.port, 10) || 3306,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, ''),
    }
  } catch (e) {
    console.warn('⚠️  Failed to parse MYSQL_URL, falling back to individual env vars')
  }
}

const pool = mysql.createPool({
  host: dbConfig.host || process.env.DB_HOST || '127.0.0.1',
  port: dbConfig.port || parseInt(process.env.DB_PORT, 10) || 3306,
  user: dbConfig.user || process.env.DB_USER || 'root',
  password: dbConfig.password || process.env.DB_PASSWORD || '',
  database: dbConfig.database || process.env.DB_NAME || 'cadenza_music_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 15000,
  acquireTimeout: 15000,
  // Enable SSL for cloud-hosted databases (Railway, Aiven, etc.)
  ssl: (process.env.DB_SSL === 'true' || dbConfig.host?.includes('railway') || dbConfig.host?.includes('rlwy') || process.env.DB_HOST?.includes('railway') || process.env.DB_HOST?.includes('rlwy'))
    ? { rejectUnauthorized: false }
    : undefined
})

// Handle connection errors to prevent crashes when MySQL drops idle connections
pool.on('connection', (connection) => {
  connection.on('error', (err) => {
    console.error('❌ MySQL connection error:', err.message)
  })
})

/**
 * Test the database connection
 */
export async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log('✅ MySQL database connected successfully')
    console.log(`   Host: ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}`)
    console.log(`   Database: ${process.env.DB_NAME || 'cadenza_music_db'}`)
    connection.release()
    return true
  } catch (err) {
    console.error('❌ MySQL database connection failed:', err.message)
    return false
  }
}

export default pool