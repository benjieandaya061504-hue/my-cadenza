import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

async function checkCredentials() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cadenza_music_db',
  })

  console.log('Staff accounts in users table:')
  const [users] = await connection.query(
    'SELECT id, username, email, role, staff_id, status FROM users WHERE role = "staff"'
  )
  
  if (users.length === 0) {
    console.log('No staff accounts found in users table')
  } else {
    console.log('\n| ID | Username/Email | Role | Staff ID | Status |')
    console.log('|----|----------------|------|----------|--------|')
    users.forEach(u => {
      console.log(`| ${u.id} | ${u.username} | ${u.role} | ${u.staff_id} | ${u.status} |`)
    })
  }

  console.log('\nStaff information:')
  const [staff] = await connection.query(
    'SELECT s.staff_id, s.f_name, s.l_name, r.role_name FROM Staff s JOIN Role r ON s.role_id = r.role_id'
  )
  
  if (staff.length === 0) {
    console.log('No staff information found')
  } else {
    console.log('\n| Staff ID | Name | Role |')
    console.log('|----------|------|------|')
    staff.forEach(s => {
      console.log(`| ${s.staff_id} | ${s.f_name} ${s.l_name} | ${s.role_name} |`)
    })
  }

  await connection.end()
}

checkCredentials()
