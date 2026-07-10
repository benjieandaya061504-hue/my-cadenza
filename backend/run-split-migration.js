/**
 * Migration Runner Script
 * Runs the migration SQL file to split Staff_Auth into Users table
 * Usage: node run-split-migration.js
 */

import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function runMigration() {
  console.log('')
  console.log('╔════════════════════════════════════════════╗')
  console.log('║   Split Auth to Users Migration Runner    ║')
  console.log('╚════════════════════════════════════════════╝')
  console.log('')

  const migrationPath = path.join(__dirname, 'migrations', 'split_auth_to_users.sql')
  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found at ${migrationPath}`)
    process.exit(1)
  }

  const sql = fs.readFileSync(migrationPath, 'utf8')
  console.log(`📄 Read migration file (${sql.length} characters)`)
  console.log('')

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'cadenza_music_db',
      multipleStatements: true
    })

    console.log('✅ Connected to database')
    console.log('')
    console.log('🚀 Running migration...')
    
    await connection.query(sql)
    
    console.log('✅ Migration completed successfully!')
    console.log('')

    // List tables
    const [tables] = await connection.query('SHOW TABLES')
    console.log('📊 Tables in database:')
    tables.forEach((t, i) => {
      const tableName = Object.values(t)[0]
      console.log(`   ${i + 1}. ${tableName}`)
    })

    await connection.end()
    
    console.log('')
    console.log('✅ Migration complete!')
    
  } catch (err) {
    console.error('❌ Migration error:', err.message)
    if (err.message.includes('Access denied')) {
      console.log('   Check your MySQL credentials in backend/.env')
    }
    if (err.message.includes('connect')) {
      console.log('   Make sure WAMP MySQL is running')
    }
    if (err.message.includes("Unknown database")) {
      console.log('   Database does not exist. Run: node setup-db.js')
    }
    process.exit(1)
  }
}

runMigration()
