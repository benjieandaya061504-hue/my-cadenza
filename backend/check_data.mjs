import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  // Check users table data
  const [users] = await pool.query("SELECT * FROM users");
  console.log('=== users TABLE DATA ===');
  console.log(JSON.stringify(users, null, 2));
  
  // Check Staff table data
  const [staff] = await pool.query("SELECT * FROM Staff");
  console.log('\n=== Staff TABLE DATA ===');
  console.log(JSON.stringify(staff, null, 2));
  
  // Check Role table data
  const [roles] = await pool.query("SELECT * FROM Role");
  console.log('\n=== Role TABLE DATA ===');
  console.log(JSON.stringify(roles, null, 2));
  
  // Check Staff_Auth data
  const [staffAuth] = await pool.query("SELECT * FROM Staff_Auth");
  console.log('\n=== Staff_Auth TABLE DATA ===');
  console.log(JSON.stringify(staffAuth, null, 2));
  
  // Check if Billing has any staff_id references
  const [billing] = await pool.query("SELECT billing_id, staff_id FROM Billing LIMIT 10");
  console.log('\n=== Billing staff_id references ===');
  console.log(JSON.stringify(billing, null, 2));
  
  await pool.end();
}
check().catch(e => { console.error(e); process.exit(1); });