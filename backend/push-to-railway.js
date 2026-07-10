/**
 * Script to push the local schema.sql to the Railway MySQL database.
 * Handles case sensitivity and adds missing columns.
 * 
 * Usage: node push-to-railway.js
 */

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionConfig = {
  host: 'hayabusa.proxy.rlwy.net',
  port: 45401,
  user: 'root',
  password: 'aoZnTskLznLSHXXkJQNJpLsfwhtHJusP',
  database: 'railway',
  ssl: { rejectUnauthorized: false },
  multipleStatements: true,
  connectTimeout: 60000
};

const TABLE_MAPPING = {
  'Role': 'role', 'Staff': 'staff', 'Staff_Auth': 'staff_auth', 'Client': 'client',
  'Room': 'room', 'Duration_Unit': 'duration_unit', 'Categories': 'categories',
  'Equipment': 'equipment', 'Equipment_Rate': 'equipment_rate', 'Room_Rate': 'room_rate',
  'Booking': 'booking', 'Billing': 'billing', 'Payment': 'payment', 'Announcement': 'announcement',
  'Room_Schedule': 'room_schedule', 'Users': 'users', 'students': 'students', 'enrollments': 'enrollments'
};

const FIXES = `
  -- Fix users table: add missing columns that the backend code expects
  ALTER TABLE users CHANGE COLUMN user_id id INT AUTO_INCREMENT;
  ALTER TABLE users ADD COLUMN username VARCHAR(100) DEFAULT NULL AFTER id;
  ALTER TABLE users ADD COLUMN contact_number VARCHAR(15) DEFAULT NULL AFTER password;
  ALTER TABLE users ADD COLUMN address VARCHAR(255) DEFAULT NULL AFTER contact_number;
  ALTER TABLE users ADD COLUMN status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending' AFTER role;
  ALTER TABLE users ADD COLUMN staff_id INT DEFAULT NULL AFTER status;
  ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP AFTER created_at;
  ALTER TABLE users ADD UNIQUE INDEX uq_users_username (username);
  ALTER TABLE users DROP INDEX user_id;
`;

async function pushToRailway() {
  const sqlFilePath = path.join(__dirname, 'schema.sql');
  
  console.log('📂 Reading schema.sql...');
  let sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  console.log(`✅ Read ${sqlContent.length} bytes from schema.sql`);

  // Replace database name
  sqlContent = sqlContent.replace(/cadenza_music_db/g, 'railway');
  sqlContent = sqlContent.replace(/`/g, '');

  let connection;
  try {
    console.log('🔌 Connecting to Railway MySQL...');
    connection = await mysql.createConnection(connectionConfig);
    console.log('✅ Connected!');

    // Drop all existing tables
    console.log('\n🗑️ Dropping existing tables...');
    const [tables] = await connection.query(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'railway'"
    );
    const tableNames = tables.map(t => Object.values(t)[0]);
    if (tableNames.length > 0) {
      await connection.query(`SET FOREIGN_KEY_CHECKS = 0; ${tableNames.map(n => `DROP TABLE IF EXISTS \`${n}\``).join('; ')}; SET FOREIGN_KEY_CHECKS = 1;`);
      console.log('   ✅ Dropped all');
    }

    // Execute schema (will create PascalCase tables on case-insensitive Windows, but we'll rename)
    console.log('\n🚀 Executing schema...');
    await connection.query(`SET FOREIGN_KEY_CHECKS = 0; ${sqlContent}; SET FOREIGN_KEY_CHECKS = 1;`);
    console.log('   ✅ Schema done');

    // Rename tables to lowercase
    console.log('\n🔤 Renaming tables to lowercase...');
    const [created] = await connection.query('SHOW TABLES');
    for (const t of created) {
      const name = Object.values(t)[0];
      const lower = name.toLowerCase();
      if (name !== lower) {
        try {
          await connection.query(`RENAME TABLE \`${name}\` TO \`${lower}\``);
          console.log(`   ${name} -> ${lower}`);
        } catch (e) {
          console.log(`   ⚠️ ${name}: ${e.message}`);
        }
      }
    }

    // Apply fixes to users table
    console.log('\n🔧 Applying fixes to users table...');
    const [userTables] = await connection.query(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'railway' AND TABLE_NAME = 'users'"
    );
    if (userTables.length > 0) {
      // Check if id column exists already
      const [columns] = await connection.query("SHOW COLUMNS FROM users");
      const colNames = columns.map(c => c.Field);
      
      if (colNames.includes('user_id') && !colNames.includes('id')) {
        await connection.query('ALTER TABLE users CHANGE COLUMN user_id id INT AUTO_INCREMENT');
        console.log('   ✅ Renamed user_id -> id');
      }
      if (!colNames.includes('username')) {
        await connection.query('ALTER TABLE users ADD COLUMN username VARCHAR(100) DEFAULT NULL AFTER id');
        console.log('   ✅ Added username');
      }
      if (!colNames.includes('contact_number')) {
        await connection.query('ALTER TABLE users ADD COLUMN contact_number VARCHAR(15) DEFAULT NULL AFTER password');
        console.log('   ✅ Added contact_number');
      }
      if (!colNames.includes('address')) {
        await connection.query('ALTER TABLE users ADD COLUMN address VARCHAR(255) DEFAULT NULL AFTER contact_number');
        console.log('   ✅ Added address');
      }
      if (!colNames.includes('status')) {
        await connection.query("ALTER TABLE users ADD COLUMN status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending' AFTER role");
        console.log('   ✅ Added status');
      }
      if (!colNames.includes('staff_id')) {
        await connection.query('ALTER TABLE users ADD COLUMN staff_id INT DEFAULT NULL AFTER status');
        console.log('   ✅ Added staff_id');
      }
      if (!colNames.includes('updated_at')) {
        await connection.query('ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP AFTER created_at');
        console.log('   ✅ Added updated_at');
      }
      if (!colNames.includes('username')) {
        // Add unique index on username
        try { await connection.query('ALTER TABLE users ADD UNIQUE INDEX uq_users_username (username)'); } catch {}
      }
    }

    // Drop the foreign key from students if it exists (since it references user_id which is now id)
    try {
      await connection.query('ALTER TABLE students DROP FOREIGN KEY fk_students_user');
    } catch {}

    // Seed admin/frontdesk users from staff_auth
    console.log('\n👤 Seeding users...');
    const [staffRows] = await connection.query(
      `SELECT s.staff_id, s.email, sa.password FROM staff s JOIN staff_auth sa ON s.staff_id = sa.staff_id`
    );
    for (const staff of staffRows) {
      let role;
      if (staff.staff_id === 1) role = 'admin';
      else if ([2, 4].includes(staff.staff_id)) role = 'frontdesk';
      else continue;
      const username = staff.email.split('@')[0];
      // Check if user already exists
      const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [staff.email]);
      if (existing.length === 0) {
        await connection.query(
          `INSERT INTO users (username, email, password, role, status, created_at) VALUES (?, ?, ?, ?, 'approved', NOW())`,
          [username, staff.email, staff.password, role]
        );
        console.log(`   ✅ ${role}: ${staff.email}`);
      } else {
        console.log(`   ⏭️ ${role}: ${staff.email} (already exists)`);
      }
    }

    // Final verification
    console.log('\n🎉 Complete!');
    const [finalTables] = await connection.query('SHOW TABLES');
    finalTables.forEach((t, i) => console.log(`   ${i+1}. ${Object.values(t)[0]}`));

    const [users] = await connection.query('SELECT id, username, email, role, status FROM users');
    console.log('\n👥 Users:');
    users.forEach(u => console.log(`   [${u.role}] ${u.email} - ${u.status}`));

  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  } finally {
    if (connection) try { await connection.end(); } catch {}
  }
}

pushToRailway();