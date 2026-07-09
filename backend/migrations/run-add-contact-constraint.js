import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const runMigration = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'cadenza_music_db'
    })

    console.log('Connected to database')

    const sqlPath = path.join(__dirname, 'add_contact_no_constraint.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      if (statement.includes('SELECT')) {
        const [rows] = await connection.query(statement)
        if (rows.length > 0) {
          console.log(rows[0][Object.keys(rows[0])[0]])
        }
      } else {
        await connection.query(statement)
      }
    }

    console.log('Migration completed successfully')
    await connection.end()
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
