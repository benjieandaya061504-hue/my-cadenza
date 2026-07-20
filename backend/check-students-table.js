/**
 * Quick script to check the students table structure
 */
import pool from './db.js'

const [rows] = await pool.query('SHOW COLUMNS FROM students')
console.log('Students table columns:')
rows.forEach(r => console.log(`  ${r.Field} | ${r.Type} | Null: ${r.Null} | Default: ${r.Default}`))

const [rows2] = await pool.query('SELECT * FROM students LIMIT 3')
console.log('\nSample data:')
rows2.forEach(r => console.log(JSON.stringify(r, null, 2)))

await pool.end()