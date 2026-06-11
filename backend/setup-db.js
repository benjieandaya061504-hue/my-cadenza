/**
 * Database Setup Script
 * Imports schema.sql to create the cadenza_db database and all tables.
 * 
 * Usage: node setup-db.js
 * Run this ONCE before starting the server.
 */

import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function setupDatabase() {
  console.log('')
  console.log('╔════════════════════════════════════════════╗')
  console.log('║     Cadenza Database Setup Script        ║')
  console.log('╚════════════════════════════════════════════╝')
  console.log('')

  const schemaPath = path.join(__dirname, 'schema.sql')
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ schema.sql not found at ${schemaPath}`)
    process.exit(1)
  }

  const sql = fs.readFileSync(schemaPath, 'utf8')
  console.log(`📄 Read schema.sql (${sql.length} characters)`)
  console.log('')

  // Execute entire SQL in one multi-statement query
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    })

    console.log('✅ Connected to MySQL server')
    
    // Drop database if it exists for a clean setup
    try {
      await connection.query('DROP DATABASE IF EXISTS cadenza_music_db')
      console.log('🧹 Cleaned up old database')
    } catch (err) {
      console.log('   (No old database to clean)')
    }
    
    console.log('🚀 Creating database and tables...')
    
    await connection.query(sql)
    
    console.log('✅ All tables created successfully!')
    console.log('')

    // List tables
    const [tables] = await connection.query('SHOW TABLES FROM cadenza_music_db')
    console.log('📊 Tables in cadenza_db:')
    tables.forEach((t, i) => {
      const tableName = Object.values(t)[0]
      console.log(`   ${i + 1}. ${tableName}`)
    })

    await connection.end()
    
    console.log('')
    console.log('✅ Setup complete!')
    console.log('   Start the server: npm --prefix backend run dev')
    
  } catch (err) {
    console.error('❌ Error:', err.message)
    if (err.message.includes('Access denied')) {
      console.log('   Check your MySQL credentials in backend/.env')
    }
    if (err.message.includes('connect')) {
      console.log('   Make sure WAMP MySQL is running')
    }
    process.exit(1)
  }
}

setupDatabase()