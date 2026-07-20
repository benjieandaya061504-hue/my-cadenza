/**
 * Migration Runner Script for Staff Table Merge
 * Runs the migration SQL file to merge Staff and Staff_Auth tables
 * Usage: node run-merge-migration.js
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
  console.log('║   Staff Table Merge Migration Runner       ║')
  console.log('╚════════════════════════════════════════════╝')
  console.log('')

  const migrationPath = path.join(__dirname, 'migrations', 'merge_staff_tables.sql')
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
    console.log('🚀 Running migration to merge Staff and Staff_Auth tables...')
    
    await connection.query(sql)
    
    console.log('✅ Migration completed successfully!')
    console.log('')

    // Show Staff table structure
    const [columns] = await connection.query('DESCRIBE Staff')
    console.log('📊 Staff table structure:')
    columns.forEach((col, i) => {
      console.log(`   ${i + 1}. ${col.Field} - ${col.Type}`)
    })

    console.log('')

    // Show sample data
    const [staff] = await connection.query('SELECT staff_id, f_name, l_name, email, role_id FROM Staff LIMIT 5')
    console.log('👥 Sample staff data:')
    staff.forEach((s, i) => {
      console.log(`   ${i + 1}. ID: ${s.staff_id}, Name: ${s.f_name} ${s.l_name}, Email: ${s.email}`)
    })

    await connection.end()
    
    console.log('')
    console.log('✅ Staff and Staff_Auth tables have been merged!')
    console.log('   Staff_Auth table has been dropped.')
    console.log('   Email and password are now in the Staff table.')
    console.log('')
    console.log('   Start the server: npm run dev')
    
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
