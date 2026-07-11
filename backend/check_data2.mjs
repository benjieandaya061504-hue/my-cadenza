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
  // Check lowercase staff table
  const [staffLower] = await pool.query("SELECT * FROM staff");
  console.log('=== staff (lowercase) TABLE DATA ===');
  console.log(JSON.stringify(staffLower, null, 2));
  
  // Check lowercase role table
  const [roleLower] = await pool.query("SELECT * FROM role");
  console.log('\n=== role (lowercase) TABLE DATA ===');
  console.log(JSON.stringify(roleLower, null, 2));
  
  // Check billing (lowercase) table structure
  const [billingCols] = await pool.query("SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'billing' ORDER BY ORDINAL_POSITION");
  console.log('\n=== billing TABLE COLUMNS ===');
  billingCols.forEach(c => console.log(c.COLUMN_NAME, c.COLUMN_TYPE));
  
  // Check billing foreign keys
  const [billingFK] = await pool.query("SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'billing' AND REFERENCED_TABLE_NAME IS NOT NULL");
  console.log('\n=== billing FOREIGN KEYS ===');
  billingFK.forEach(f => console.log(f.CONSTRAINT_NAME, ':', f.COLUMN_NAME, '->', f.REFERENCED_TABLE_NAME + '.' + f.REFERENCED_COLUMN_NAME));
  
  // Check if staff_id column in users has values
  const [usersWithStaff] = await pool.query("SELECT id, username, email, staff_id, role FROM users WHERE staff_id IS NOT NULL");
  console.log('\n=== users WITH staff_id ===');
  console.log(JSON.stringify(usersWithStaff, null, 2));
  
  await pool.end();
}
check().catch(e => { console.error(e); process.exit(1); });