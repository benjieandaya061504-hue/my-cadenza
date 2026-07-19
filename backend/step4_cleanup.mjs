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

async function showTables(label) {
  const [tables] = await pool.query('SHOW TABLES');
  const names = tables.map(t => Object.values(t)[0]).sort();
  console.log(`\n--- ${label} ---`);
  console.log(`Tables (${names.length}): ${names.join(', ')}`);
  return names;
}

async function run() {
  console.log('='.repeat(80));
  console.log('STEP 4: PRODUCTION CLEANUP — Executing drops incrementally');
  console.log('='.repeat(80));

  // Initial state
  await showTables('INITIAL STATE');

  // 1. Drop FK fk_billing_staff
  console.log('\n--- Step 1: Drop FK fk_billing_staff on billing.staff_id ---');
  try {
    await pool.query('ALTER TABLE billing DROP FOREIGN KEY fk_billing_staff');
    console.log('✅ Dropped fk_billing_staff');
  } catch (e) {
    console.log(`⚠️  ${e.message}`);
  }
  await showTables('After dropping fk_billing_staff');

  // 2. Drop FK fk_users_staff
  console.log('\n--- Step 2: Drop FK fk_users_staff on users.staff_id ---');
  try {
    await pool.query('ALTER TABLE users DROP FOREIGN KEY fk_users_staff');
    console.log('✅ Dropped fk_users_staff');
  } catch (e) {
    console.log(`⚠️  ${e.message}`);
  }
  await showTables('After dropping fk_users_staff');

  // 3. Drop FK fk_instructors_user
  console.log('\n--- Step 3: Drop FK fk_instructors_user on instructors.user_id ---');
  try {
    await pool.query('ALTER TABLE instructors DROP FOREIGN KEY fk_instructors_user');
    console.log('✅ Dropped fk_instructors_user');
  } catch (e) {
    console.log(`⚠️  ${e.message}`);
  }
  await showTables('After dropping fk_instructors_user');

  // 4. Drop FK fk_students_user
  console.log('\n--- Step 4: Drop FK fk_students_user on students.user_id ---');
  try {
    await pool.query('ALTER TABLE students DROP FOREIGN KEY fk_students_user');
    console.log('✅ Dropped fk_students_user');
  } catch (e) {
    console.log(`⚠️  ${e.message}`);
  }
  await showTables('After dropping fk_students_user');

  // 5. Drop FK fk_staff_role
  console.log('\n--- Step 5: Drop FK fk_staff_role on staff.role_id ---');
  try {
    await pool.query('ALTER TABLE staff DROP FOREIGN KEY fk_staff_role');
    console.log('✅ Dropped fk_staff_role');
  } catch (e) {
    console.log(`⚠️  ${e.message}`);
  }
  await showTables('After dropping fk_staff_role');

  // 6. Drop users table
  console.log('\n--- Step 6: Drop users table ---');
  try {
    await pool.query('DROP TABLE IF EXISTS users');
    console.log('✅ Dropped users table');
  } catch (e) {
    console.log(`⚠️  ${e.message}`);
  }
  await showTables('After dropping users');

  // 7. Drop staff (lowercase) table
  console.log('\n--- Step 7: Drop staff (lowercase) table ---');
  try {
    await pool.query('DROP TABLE IF EXISTS staff');
    console.log('✅ Dropped staff (lowercase) table');
  } catch (e) {
    console.log(`⚠️  ${e.message}`);
  }
  await showTables('After dropping staff (lowercase)');

  // 8. Drop role (lowercase) table
  console.log('\n--- Step 8: Drop role (lowercase) table ---');
  try {
    await pool.query('DROP TABLE IF EXISTS role');
    console.log('✅ Dropped role (lowercase) table');
  } catch (e) {
    console.log(`⚠️  ${e.message}`);
  }
  await showTables('After dropping role (lowercase)');

  // 9. Drop Role (PascalCase) table
  console.log('\n--- Step 9: Drop Role (PascalCase) table ---');
  try {
    await pool.query('DROP TABLE IF EXISTS Role');
    console.log('✅ Dropped Role (PascalCase) table');
  } catch (e) {
    console.log(`⚠️  ${e.message}`);
  }
  await showTables('After dropping Role (PascalCase) — FINAL STATE');

  // ================================================================
  // VERIFICATION
  // ================================================================
  console.log('\n' + '='.repeat(80));
  console.log('VERIFICATION: SHOW CREATE TABLE Staff');
  console.log('='.repeat(80));
  const [staffCreate] = await pool.query('SHOW CREATE TABLE Staff');
  console.log(staffCreate[0]['Create Table']);

  console.log('\n' + '='.repeat(80));
  console.log('VERIFICATION: SHOW CREATE TABLE Staff_Auth');
  console.log('='.repeat(80));
  const [authCreate] = await pool.query('SHOW CREATE TABLE Staff_Auth');
  console.log(authCreate[0]['Create Table']);

  // Verify no legacy tables remain
  const finalTables = await showTables('FINAL TABLE LIST');
  const forbidden = ['users', 'staff', 'role', 'Role'];
  let allClean = true;
  for (const f of forbidden) {
    if (finalTables.includes(f)) {
      console.log(`❌ LEGACY TABLE STILL EXISTS: ${f}`);
      allClean = false;
    }
  }
  if (allClean) {
    console.log('\n✅ All legacy tables (users, staff lowercase, role lowercase, Role PascalCase) successfully removed.');
  }

  await pool.end();
  console.log('\n=== STEP 4 CLEANUP COMPLETE ===');
}

run().catch(e => { console.error('FATAL:', e); process.exit(1); });