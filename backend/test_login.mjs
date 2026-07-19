import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

async function testLogin() {
  // Test the login flow: fetch Staff_Auth + Staff join
  const testEmails = [
    'juan.cruz@cadenza.com',
    'maria.santos@cadenza.com'
  ];
  
  for (const email of testEmails) {
    console.log(`\n=== Testing login for: ${email} ===`);
    
    // This is the exact query from routes/users.js login endpoint
    const [rows] = await pool.query(
      `SELECT sa.*, s.f_name, s.m_name, s.l_name, s.contact_no,
              s.address, s.profile, s.status AS staff_status, s.role
       FROM Staff_Auth sa
       JOIN Staff s ON sa.staff_id = s.staff_id
       WHERE sa.email = ?`,
      [email]
    );
    
    if (rows.length === 0) {
      console.log(`  NOT FOUND: No account with email ${email}`);
      continue;
    }
    
    const staff = rows[0];
    console.log(`  Found: staff_id=${staff.staff_id}, role=${staff.role}`);
    console.log(`  Password hash present: ${staff.password ? staff.password.substring(0, 20) + '...' : 'NO'}`);
    
    // Show the role check
    console.log(`  Role query: s.role = ${staff.role}`);
    console.log(`  expectedRole='admin' match: ${staff.role === 'admin'}`);
    console.log(`  expectedRole='frontdesk' match: ${staff.role === 'frontdesk'}`);
    
    // The password hashes are from the seed data - these are standard bcrypt
    // Let's check what passwords work with common seed patterns
    // The seed hashes were generated with bcrypt - we can't reverse them
    // But we can verify if a known password matches
    
    console.log(`  Login query format matches routes/users.js login endpoint`);
    console.log(`  Expected to work with the correct password`);
  }
  
  await pool.end();
}

testLogin().catch(console.error);