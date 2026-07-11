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
  const [tables] = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() ORDER BY table_name");
  console.log('=== ALL TABLES ===');
  tables.forEach(t => console.log(t.TABLE_NAME));
  
  // Check for case-sensitive duplicates
  const [lower] = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'users'");
  const [upper] = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'Users'");
  console.log('\n=== CASE SENSITIVITY CHECK ===');
  console.log('users table exists:', lower.length > 0);
  console.log('Users table exists:', upper.length > 0);
  
  const [courseLower] = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'courses'");
  const [courseUpper] = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'Course'");
  console.log('courses table exists:', courseLower.length > 0);
  console.log('Course table exists:', courseUpper.length > 0);
  
  const [lessonLower] = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'lessons'");
  const [lessonUpper] = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'Lesson'");
  console.log('lessons table exists:', lessonLower.length > 0);
  console.log('Lesson table exists:', lessonUpper.length > 0);
  
  // Check Staff_Auth
  const [staffAuth] = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'Staff_Auth'");
  console.log('\nStaff_Auth table exists:', staffAuth.length > 0);
  
  // Check Staff and Role
  const [staff] = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'Staff'");
  const [role] = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'Role'");
  console.log('Staff table exists:', staff.length > 0);
  console.log('Role table exists:', role.length > 0);
  
  // Check Billing FK
  const [fk] = await pool.query("SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Billing' AND REFERENCED_TABLE_NAME IS NOT NULL");
  console.log('\n=== BILLING FOREIGN KEYS ===');
  fk.forEach(f => console.log(f.CONSTRAINT_NAME, ':', f.COLUMN_NAME, '->', f.REFERENCED_TABLE_NAME + '.' + f.REFERENCED_COLUMN_NAME));
  
  // Check Users table structure
  const [usersCols] = await pool.query("SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' ORDER BY ORDINAL_POSITION");
  console.log('\n=== users TABLE COLUMNS ===');
  usersCols.forEach(c => console.log(c.COLUMN_NAME, c.COLUMN_TYPE));
  
  // Check Staff table structure
  const [staffCols] = await pool.query("SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Staff' ORDER BY ORDINAL_POSITION");
  console.log('\n=== Staff TABLE COLUMNS ===');
  staffCols.forEach(c => console.log(c.COLUMN_NAME, c.COLUMN_TYPE));
  
  await pool.end();
}
check().catch(e => { console.error(e); process.exit(1); });