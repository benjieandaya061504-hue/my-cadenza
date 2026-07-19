import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

console.log('=== ENV VALUES ===');
console.log(`DB_HOST=${process.env.DB_HOST}`);
console.log(`DB_PORT=${process.env.DB_PORT}`);
console.log(`DB_NAME=${process.env.DB_NAME}`);
console.log(`\nConfirms tokaido.proxy.rlwy.net:27711/cadenza_music_db: ${process.env.DB_HOST === 'tokaido.proxy.rlwy.net' && process.env.DB_PORT === '27711' && process.env.DB_NAME === 'cadenza_music_db' ? 'YES' : 'NO -- MISMATCH'}`);

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  // ================================================================
  // STAFF TABLE STRUCTURE ON TOKAIDO
  // ================================================================
  console.log('\n=== SHOW TABLES ON TOKAIDO ===');
  const [tables] = await pool.query('SHOW TABLES');
  const tableNames = tables.map(t => Object.values(t)[0]);
  console.log(`Total tables: ${tableNames.length}`);
  
  const checks = ['users', 'staff', 'role', 'Role'];
  for (const name of checks) {
    const found = tableNames.some(t => t.toLowerCase() === name.toLowerCase());
    const exact = tableNames.includes(name);
    console.log(`  ${name}: exists=${exact ? 'YES (exact)' : found ? 'YES (case-different)' : 'NO'}`);
  }

  console.log('\nAll tables:');
  tableNames.forEach(t => console.log(`  - ${t}`));

  // ================================================================
  // SHOW CREATE TABLE Staff
  // ================================================================
  console.log('\n=== SHOW CREATE TABLE Staff ===');
  let staffExists = tableNames.includes('Staff');
  if (staffExists) {
    const [createResult] = await pool.query('SHOW CREATE TABLE `Staff`');
    console.log(createResult[0]['Create Table']);
    
    const [staffCols] = await pool.query('SHOW COLUMNS FROM `Staff`');
    console.log('\nStaff columns summary:');
    const hasRoleId = staffCols.some(c => c.Field === 'role_id');
    const hasRoleEnum = staffCols.some(c => c.Field === 'role');
    console.log(`  role_id column: ${hasRoleId ? 'YES' : 'NO'}`);
    console.log(`  role ENUM column: ${hasRoleEnum ? 'YES' : 'NO'}`);
    
    if (hasRoleEnum) {
      const roleCol = staffCols.find(c => c.Field === 'role');
      console.log(`  role Type: ${roleCol.Type}`);
      console.log(`  role Null: ${roleCol.Null}`);
      console.log(`  role Default: ${roleCol.Default}`);
    }
    
    // Check Role table
    const roleExists = tableNames.includes('Role');
    console.log(`\n  Role table exists: ${roleExists}`);
    
    if (roleExists) {
      const [roleCreate] = await pool.query('SHOW CREATE TABLE `Role`');
      console.log('\n=== SHOW CREATE TABLE Role ===');
      console.log(roleCreate[0]['Create Table']);
      
      // Check if any FK from Staff references Role
      const [fkCheck] = await pool.query(
        "SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Staff' AND REFERENCED_TABLE_NAME IS NOT NULL"
      );
      console.log(`\nForeign keys on Staff referencing other tables: ${fkCheck.length > 0 ? fkCheck.map(f => `${f.COLUMN_NAME} -> ${f.REFERENCED_TABLE_NAME}.${f.REFERENCED_COLUMN_NAME}`).join(', ') : 'NONE'}`);
    }
  } else {
    console.log('Staff table does not exist on tokaido');
  }

  // ================================================================
  // CHECK staff (lowercase) table
  // ================================================================
  const staffLowerExists = tableNames.includes('staff');
  if (staffLowerExists) {
    console.log('\n=== SHOW CREATE TABLE staff (lowercase) ===');
    const [createLow] = await pool.query('SHOW CREATE TABLE `staff`');
    console.log(createLow[0]['Create Table']);
  }

  // ================================================================
  // Sample data from Staff_Auth
  // ================================================================
  const [authRows] = await pool.query('SELECT sa.staff_id, sa.email, s.role, s.f_name, s.l_name FROM Staff_Auth sa JOIN Staff s ON sa.staff_id = s.staff_id ORDER BY sa.staff_id');
  console.log('\n=== Staff_Auth + Staff JOIN (all records) ===');
  console.log(JSON.stringify(authRows, null, 2));

  await pool.end();
  console.log('\n=== INVESTIGATION COMPLETE ===');
}

run().catch(e => { console.error('ERROR:', e); process.exit(1); });