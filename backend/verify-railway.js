/**
 * Verify Railway MySQL database is properly set up.
 * 
 * Usage: node verify-railway.js
 */

import mysql from 'mysql2/promise';

const conn = {
  host: 'hayabusa.proxy.rlwy.net',
  port: 45401,
  user: 'root',
  password: 'aoZnTskLznLSHXXkJQNJpLsfwhtHJusP',
  database: 'railway',
  ssl: { rejectUnauthorized: false }
};

async function verify() {
  const c = await mysql.createConnection(conn);
  console.log('✅ Connected to Railway MySQL\n');

  // Show tables
  const [tables] = await c.query('SHOW TABLES');
  console.log(`📋 Tables (${tables.length}):`);
  for (const t of tables) {
    const name = Object.values(t)[0];
    const [rows] = await c.query(`SELECT COUNT(*) as cnt FROM \`${name}\``);
    console.log(`   ${name}: ${rows[0].cnt} rows`);
  }

  // Show users table structure
  console.log('\n📊 users table:');
  const [cols] = await c.query('SHOW COLUMNS FROM users');
  cols.forEach(col => console.log(`   ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default !== null ? `default: ${col.Default}` : ''}`));

  // Show users
  const [users] = await c.query('SELECT id, username, email, role, status FROM users');
  console.log('\n👥 Users:');
  users.forEach(u => console.log(`   [${u.role}] ${u.email} - status: ${u.status}`));

  await c.end();
}

verify().catch(e => { console.error('❌', e.message); });