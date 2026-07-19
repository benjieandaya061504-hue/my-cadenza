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

async function run() {
  const connection = await pool.getConnection();
  
  try {
    // ================================================================
    // STEP 2: Confirm the exact live login query
    // ================================================================
    console.log('=' .repeat(80));
    console.log('STEP 2: LIVE CODE ANALYSIS — What query does the running server use?');
    console.log('=' .repeat(80));
    
    console.log('\nThe running server uses the code from routes/users.js (commit 5a2bdc9).');
    console.log('The login endpoint (POST /api/users/login) at line 246-252 runs this EXACT query:');
    console.log(`
  const [rows] = await pool.query(
    \`SELECT sa.*, s.f_name, s.m_name, s.l_name, s.contact_no,
            s.address, s.profile, s.status AS staff_status, s.role
     FROM Staff_Auth sa
     JOIN Staff s ON sa.staff_id = s.staff_id
     WHERE sa.email = ?\`,
    [identifier]
  );
    `);
    
    console.log('Key observations:');
    console.log('  - Queries Staff (PascalCase) table');
    console.log('  - Uses s.role directly (ENUM column)');
    console.log('  - Does NOT join to Role table');
    console.log('  - Does NOT reference role_id');
    console.log('  - Role enforcement done via: if (staff.role !== expectedRole)');
    console.log('\nThe GET /api/users endpoint (line 17-21) also uses s.role directly:');
    console.log(`
  SELECT s.staff_id AS id, s.email, s.f_name AS first_name, ... s.role
  FROM Staff s
  ORDER BY s.staff_id DESC
    `);
    
    console.log('✅ Confirmed: Live code queries Staff.role ENUM directly, no Role JOIN, no role_id');
    console.log('=' .repeat(80));
    
    // ================================================================
    // STEP 3: Check ALL foreign keys on production
    // ================================================================
    console.log('\n' + '=' .repeat(80));
    console.log('STEP 3: PRODUCTION FK ANALYSIS — All foreign keys in the database');
    console.log('=' .repeat(80));
    
    // Get ALL foreign keys in the entire database
    const [allFKs] = await connection.query(`
      SELECT 
        kcu.TABLE_NAME,
        kcu.COLUMN_NAME,
        kcu.CONSTRAINT_NAME,
        kcu.REFERENCED_TABLE_NAME,
        kcu.REFERENCED_COLUMN_NAME,
        rc.UPDATE_RULE,
        rc.DELETE_RULE
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
      JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
        ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
        AND kcu.CONSTRAINT_SCHEMA = rc.CONSTRAINT_SCHEMA
      WHERE kcu.TABLE_SCHEMA = DATABASE()
        AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
      ORDER BY kcu.TABLE_NAME, kcu.CONSTRAINT_NAME
    `);
    
    console.log('\n=== ALL FOREIGN KEYS IN PRODUCTION ===');
    if (allFKs.length === 0) {
      console.log('  (none found)');
    } else {
      console.log(`${'TABLE_NAME'.padEnd(22)} ${'COLUMN'.padEnd(18)} ${'REFERENCES'.padEnd(25)} ${'ON DELETE'.padEnd(12)} ${'ON UPDATE'}`);
      console.log('-'.repeat(85));
      for (const fk of allFKs) {
        console.log(
          `${(fk.TABLE_NAME || '').padEnd(22)} ` +
          `${(fk.COLUMN_NAME || '').padEnd(18)} ` +
          `${(fk.REFERENCED_TABLE_NAME || '') + '.' + (fk.REFERENCED_COLUMN_NAME || '')}`.padEnd(25) +
          `${(fk.DELETE_RULE || '').padEnd(12)} ` +
          `${(fk.UPDATE_RULE || '')}`
        );
      }
    }
    
    // Specifically check for FKs referencing legacy tables
    const legacyTables = ['users', 'staff', 'role'];
    console.log('\n=== FKs REFERENCING LEGACY TABLES (users, staff, role lowercase) ===');
    let foundLegacyFK = false;
    for (const legacy of legacyTables) {
      const refs = allFKs.filter(fk => fk.REFERENCED_TABLE_NAME === legacy);
      if (refs.length > 0) {
        foundLegacyFK = true;
        console.log(`\n  Tables referencing "${legacy}":`);
        for (const r of refs) {
          console.log(`    ${r.TABLE_NAME}.${r.COLUMN_NAME} → ${r.REFERENCED_TABLE_NAME}.${r.REFERENCED_COLUMN_NAME}`);
          console.log(`      Constraint: ${r.CONSTRAINT_NAME}, On Delete: ${r.DELETE_RULE}, On Update: ${r.UPDATE_RULE}`);
        }
      }
    }
    if (!foundLegacyFK) {
      console.log('  No foreign keys reference users, staff (lowercase), or role (lowercase)');
    }
    
    // Also check what references the PascalCase Staff, Role tables
    console.log('\n=== FKs REFERENCING PASCALCASE TABLES (Staff, Role, Staff_Auth) ===');
    for (const pt of ['Staff', 'Role', 'Staff_Auth']) {
      const refs = allFKs.filter(fk => fk.REFERENCED_TABLE_NAME === pt);
      if (refs.length > 0) {
        console.log(`\n  Tables referencing "${pt}":`);
        for (const r of refs) {
          console.log(`    ${r.TABLE_NAME}.${r.COLUMN_NAME} → ${r.REFERENCED_TABLE_NAME}.${r.REFERENCED_COLUMN_NAME}`);
        }
      } else {
        console.log(`  No tables reference "${pt}"`);
      }
    }
    
    // Show current status of Staff table columns
    console.log('\n' + '=' .repeat(80));
    console.log('CURRENT Staff TABLE STATUS:');
    const [staffCols] = await connection.query('SHOW COLUMNS FROM `Staff`');
    for (const c of staffCols) {
      const flags = [];
      if (c.Key === 'PRI') flags.push('PK');
      if (c.Key === 'UNI') flags.push('UNIQUE');
      if (c.Key === 'MUL') flags.push('INDEX');
      console.log(`  ${c.Field.padEnd(18)} ${(c.Type + '').padEnd(35)} ${c.Null === 'NO' ? 'NOT NULL' : 'NULL'.padEnd(8)} ${flags.join(', ')}`);
    }
    
    const hasRoleIdCol = staffCols.some(c => c.Field === 'role_id');
    const hasRoleEnumCol = staffCols.some(c => c.Field === 'role');
    console.log(`\n  role_id column: ${hasRoleIdCol ? 'EXISTS' : 'NOT PRESENT'}`);
    console.log(`  role ENUM column: ${hasRoleEnumCol ? 'EXISTS' : 'NOT PRESENT'}`);
    
    // Show staff (lowercase) table info
    const [tables] = await connection.query("SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()");
    const tableNames = tables.map(t => t.TABLE_NAME);
    if (tableNames.includes('staff')) {
      console.log('\n' + '=' .repeat(80));
      console.log('CURRENT staff (lowercase) TABLE STATUS:');
      const [lowCols] = await connection.query('SHOW COLUMNS FROM `staff`');
      for (const c of lowCols) {
        const flags = [];
        if (c.Key === 'PRI') flags.push('PK');
        if (c.Key === 'MUL') flags.push('INDEX');
        console.log(`  ${c.Field.padEnd(18)} ${(c.Type + '').padEnd(35)} ${c.Null === 'NO' ? 'NOT NULL' : 'NULL'.padEnd(8)} ${flags.join(', ')}`);
      }
      
      // Check FK on staff table
      const [staffFKs] = await connection.query(`
        SELECT COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'staff' AND REFERENCED_TABLE_NAME IS NOT NULL
      `);
      if (staffFKs.length > 0) {
        console.log(`  FKs on staff table:`);
        for (const fk of staffFKs) {
          console.log(`    ${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME} (${fk.CONSTRAINT_NAME})`);
        }
      }
    }
    
    console.log('\n' + '=' .repeat(80));
    console.log('END OF STEP 3 REPORT — Awaiting your go-ahead before proceeding to cleanup.');
    console.log('=' .repeat(80));
    
  } finally {
    connection.release();
    await pool.end();
  }
}

run().catch(e => { console.error('ERROR:', e); process.exit(1); });