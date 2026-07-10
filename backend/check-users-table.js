import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

async function checkTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cadenza_music_db',
  })

  console.log('Checking if Users table exists...')
  const [tables] = await connection.query('SHOW TABLES LIKE "Users"')
  console.log('Users table exists:', tables.length > 0)

  if (tables.length > 0) {
    console.log('\nUsers table structure:')
    const [columns] = await connection.query('DESCRIBE Users')
    columns.forEach(col => console.log(`  ${col.Field} - ${col.Type}`))
    
    console.log('\nDropping Users table...')
    await connection.query('DROP TABLE Users')
    console.log('Users table dropped')
  }

  await connection.end()
}

checkTable()
