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
  const [result] = await pool.query("SHOW VARIABLES LIKE 'lower_case_table_names'");
  console.log('lower_case_table_names:', JSON.stringify(result));
  
  // Check if Staff and staff are actually different tables
  const [staffPascal] = await pool.query("SELECT COUNT(*) as cnt FROM Staff");
  const [staffLower] = await pool.query("SELECT COUNT(*) as cnt FROM staff");
  console.log('Staff count:', staffPascal[0].cnt);
  console.log('staff count:', staffLower[0].cnt);
  
  // Check the courses table structure
  const [coursesCols] = await pool.query("SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' ORDER BY ORDINAL_POSITION");
  console.log('\n=== courses TABLE COLUMNS ===');
  coursesCols.forEach(c => console.log(c.COLUMN_NAME, c.COLUMN_TYPE));
  
  // Check the lessons table structure
  const [lessonsCols] = await pool.query("SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'lessons' ORDER BY ORDINAL_POSITION");
  console.log('\n=== lessons TABLE COLUMNS ===');
  lessonsCols.forEach(c => console.log(c.COLUMN_NAME, c.COLUMN_TYPE));
  
  await pool.end();
}
check().catch(e => { console.error(e); process.exit(1); });