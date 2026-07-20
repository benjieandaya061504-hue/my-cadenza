import fs from 'fs'
import path from 'path'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const migrationFile = path.join(process.cwd(), 'migrations', 'update_role_enum.sql')

async function runMigration() {
  console.log('╔════════════════════════════════════════════╗')
  console.log('║   Role ENUM Migration Runner               ║')
  console.log('╚════════════════════════════════════════════╝')
  console.log('')

  try {
    const sql = fs.readFileSync(migrationFile, 'utf8')
    console.log(`📄 Read migration file (${sql.length} characters)`)

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'cadenza_music_db',
      multipleStatements: true,
    })

    console.log('✅ Connected to database')
    console.log('')
    console.log('🚀 Running migration...')

    await connection.query(sql)

    console.log('✅ Migration completed successfully!')
    console.log('')

    await connection.end()
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

runMigration()
