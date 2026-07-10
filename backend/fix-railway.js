/**
 * One-time fix script: Fixes Railway MySQL database to match what the backend code expects.
 * Run AFTER push-to-railway.js completes.
 * 
 * Usage: node fix-railway.js
 */

import mysql from 'mysql2/promise';

const conn = {
  host: 'hayabusa.proxy.rlwy.net',
  port: 45401,
  user: 'root',
  password: 'aoZnTskLznLSHXXkJQNJpLsfwhtHJusP',
  database: 'railway',
  ssl: { rejectUnauthorized: false },
  multipleStatements: true
};

async function fix() {
  const c = await mysql.createConnection(conn);
  console.log('✅ Connected');

  // 1. Fix role ENUM to accept 'frontdesk' (without underscore) like the code uses
  console.log('\n🔧 Fixing role ENUM...');
  try {
    await c.query("ALTER TABLE users MODIFY COLUMN role ENUM('admin','frontdesk','front_desk','instructor','student') NOT NULL");
    console.log('   ✅ Modified role ENUM to include frontdesk');
  } catch (e) {
    console.log(`   ⚠️ ${e.message}`);
  }

  // 2. Update any existing users with 'front_desk' to 'frontdesk'
  await c.query("UPDATE users SET role = 'frontdesk' WHERE role = 'front_desk'");
  console.log('   ✅ Updated front_desk -> frontdesk');

  // 3. Remove front_desk from ENUM (clean up)
  try {
    await c.query("ALTER TABLE users MODIFY COLUMN role ENUM('admin','frontdesk','instructor','student') NOT NULL");
    console.log('   ✅ Cleaned up ENUM (removed front_desk)');
  } catch (e) {
    console.log(`   ⚠️ ${e.message}`);
  }

  // 4. Seed admin/frontdesk users from staff_auth
  console.log('\n👤 Seeding users...');
  const [staffRows] = await c.query(
    `SELECT s.staff_id, s.email, sa.password FROM staff s JOIN staff_auth sa ON s.staff_id = sa.staff_id`
  );
  for (const staff of staffRows) {
    let role;
    if (staff.staff_id === 1) role = 'admin';
    else if ([2, 4].includes(staff.staff_id)) role = 'frontdesk';
    else continue;
    const username = staff.email.split('@')[0];
    const [existing] = await c.query('SELECT id FROM users WHERE email = ?', [staff.email]);
    if (existing.length === 0) {
      await c.query(
        `INSERT INTO users (username, email, password, role, status, created_at) VALUES (?, ?, ?, ?, 'approved', NOW())`,
        [username, staff.email, staff.password, role]
      );
      console.log(`   ✅ ${role}: ${staff.email}`);
    } else {
      console.log(`   ⏭️ ${staff.email} (already exists)`);
    }
  }

  // 5. Verify
  const [users] = await c.query('SELECT id, username, email, role, status FROM users');
  console.log('\n📋 Final users:');
  users.forEach(u => console.log(`   [${u.role}] ${u.email} - ${u.status}`));

  await c.end();
  console.log('\n✅ All fixes applied!');
}

fix().catch(e => { console.error('❌', e.message); process.exit(1); });