/**
 * Script to seed the users table with admin/frontdesk accounts from staff data.
 * Run AFTER pushing schema to Railway.
 * 
 * Usage: node seed-users.js
 */

import mysql from 'mysql2/promise';

const connectionConfig = {
  host: 'hayabusa.proxy.rlwy.net',
  port: 45401,
  user: 'root',
  password: 'aoZnTskLznLSHXXkJQNJpLsfwhtHJusP',
  database: 'railway',
  ssl: {
    rejectUnauthorized: false
  },
  multipleStatements: true,
  connectTimeout: 60000
};

async function seedUsers() {
  let connection;
  try {
    connection = await mysql.createConnection(connectionConfig);
    console.log('✅ Connected to Railway MySQL');

    // Check existing users
    const [existingUsers] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log(`📊 Current users in table: ${existingUsers[0].count}`);

    if (existingUsers[0].count > 0) {
      console.log('⚠️ Users already exist. Skipping seed.');
      await connection.end();
      return;
    }

    // Get staff and staff_auth data (only keep what we need)
    const [staffRows] = await connection.query(
      `SELECT s.staff_id, s.f_name, s.l_name, s.email as staff_email, 
              sa.email as auth_email, sa.password
       FROM staff s 
       JOIN staff_auth sa ON s.staff_id = sa.staff_id`
    );

    console.log(`👥 Found ${staffRows.length} staff members with auth records`);

    for (const staff of staffRows) {
      const email = staff.staff_email || staff.auth_email;
      
      // Determine role
      let role;
      if (staff.staff_id === 1) {
        role = 'admin';   // Juan Cruz
      } else if (staff.staff_id === 2 || staff.staff_id === 4) {
        role = 'frontdesk'; // Maria Santos, Ana Villanueva
      } else {
        role = 'instructor'; // Pedro Gonzales, Carlos Fernandez
      }

      // Generate a username from email
      const username = email.split('@')[0];

      console.log(`   Creating ${role} account: ${username} (${email})`);

      await connection.query(
        `INSERT INTO users (username, email, password, role, status, created_at)
         VALUES (?, ?, ?, ?, 'approved', NOW())`,
        [username, email, staff.password, role]
      );
    }

    console.log('\n✅ Seed complete! Created user accounts for staff members.');
    console.log('\n📋 Login credentials:');
    console.log('   Admin:     juan.cruz@cadenza.com (password from staff_auth)');
    console.log('   Frontdesk: maria.santos@cadenza.com');
    console.log('   Frontdesk: ana.villanueva@cadenza.com');
    console.log('   Instructor: pedro.gonzales@cadenza.com');
    console.log('   Instructor: carlos.fernandez@cadenza.com');

    // Show the staff_auth passwords for reference
    console.log('\n🔑 All accounts use bcrypt hashed passwords from the staff_auth table.');
    console.log('   If you need to reset passwords, use the forgot password flow.');

  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  } finally {
    if (connection) {
      try { await connection.end(); } catch {}
      console.log('🔌 Connection closed.');
    }
  }
}

seedUsers();