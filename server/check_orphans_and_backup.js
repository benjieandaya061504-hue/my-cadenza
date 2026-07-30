const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function checkOrphans() {
  console.log('=== Step 1: Checking for orphaned rows in instructor_schedule ===\n');

  // Check for instructor_schedule rows with invalid instructor_id
  const orphanInstructors = await prisma.$queryRawUnsafe(`
    SELECT COUNT(*) as count 
    FROM instructor_schedule isched
    LEFT JOIN instructors i ON isched.instructor_id = i.id
    WHERE i.id IS NULL
  `);

  // Check for instructor_schedule rows with invalid time_slot_id
  const orphanTimeSlots = await prisma.$queryRawUnsafe(`
    SELECT COUNT(*) as count 
    FROM instructor_schedule isched
    LEFT JOIN time_slots ts ON isched.time_slot_id = ts.id
    WHERE ts.id IS NULL
  `);

  // Get detailed list if any orphans found
  const orphanInstructorDetails = await prisma.$queryRawUnsafe(`
    SELECT isched.id, isched.instructor_id, isched.day_of_week, isched.time_slot_id
    FROM instructor_schedule isched
    LEFT JOIN instructors i ON isched.instructor_id = i.id
    WHERE i.id IS NULL
  `);

  const orphanTimeSlotDetails = await prisma.$queryRawUnsafe(`
    SELECT isched.id, isched.instructor_id, isched.day_of_week, isched.time_slot_id
    FROM instructor_schedule isched
    LEFT JOIN time_slots ts ON isched.time_slot_id = ts.id
    WHERE ts.id IS NULL
  `);

  console.log(`Orphaned instructor_id rows: ${String(orphanInstructors[0].count)}`);
  if (orphanInstructorDetails.length > 0) {
    console.log('Details:', JSON.stringify(orphanInstructorDetails, null, 2));
  }

  console.log(`Orphaned time_slot_id rows: ${String(orphanTimeSlots[0].count)}`);
  if (orphanTimeSlotDetails.length > 0) {
    console.log('Details:', JSON.stringify(orphanTimeSlotDetails, null, 2));
  }

  // Also show current row counts for reference
  const schedCount = await prisma.instructor_schedule.count();
  const instrCount = await prisma.instructors.count();
  const tsCount = await prisma.time_slots.count();
  const lessonCount = await prisma.lesson.count();
  
  console.log(`\nCurrent table row counts:`);
  console.log(`  instructor_schedule: ${schedCount}`);
  console.log(`  instructors: ${instrCount}`);
  console.log(`  time_slots: ${tsCount}`);
  console.log(`  lesson: ${lessonCount}`);

  const orphanCount = parseInt(orphanInstructors[0].count) + parseInt(orphanTimeSlots[0].count);
  return orphanCount === 0;
}

async function backupTables() {
  console.log('\n=== Step 2: Backing up database tables ===\n');

  // Get DATABASE_URL from env
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not set');
    return false;
  }

  // Parse the connection string
  const url = new URL(dbUrl);
  const host = url.hostname;
  const port = url.port;
  const database = url.pathname.replace('/', '');
  const username = url.username;
  const password = url.password;

  console.log(`Host: ${host}:${port}`);
  console.log(`Database: ${database}`);
  console.log(`User: ${username}`);
  console.log('');  

  const backupDir = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `pre-migration-backup-${timestamp}.sql`);

  const tables = ['lesson', 'instructor_schedule', 'instructors', 'users', 'instructor_specialties', 'specialties', 'time_slots', 'staff', 'role'];

  try {
    // Use mysqldump via cmd
    const mysqldumpCmd = `mysqldump -h ${host} -P ${port} -u ${username} -p${password} ${database} ${tables.join(' ')} --no-tablespaces --skip-add-drop-table --skip-comments`;
    console.log('Running mysqldump...');
    
    const output = execSync(mysqldumpCmd, { 
      encoding: 'utf-8',
      maxBuffer: 50 * 1024 * 1024 // 50MB
    });
    
    fs.writeFileSync(backupFile, output);
    const stats = fs.statSync(backupFile);
    console.log(`Backup saved to: ${backupFile}`);
    console.log(`Backup size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`Tables backed up: ${tables.join(', ')}`);
    return true;
  } catch (err) {
    console.error('mysqldump failed:', err.message);
    console.log('Falling back to Prisma-based data export...');
    
    // Fallback: export data as JSON
    const jsonBackup = {};
    for (const table of tables) {
      try {
        const data = await prisma.$queryRawUnsafe(`SELECT * FROM \`${table}\``);
        jsonBackup[table] = data;
        console.log(`  Exported ${table}: ${data.length} rows`);
      } catch (e) {
        console.log(`  Failed to export ${table}: ${e.message}`);
      }
    }
    
    const jsonBackupFile = path.join(backupDir, `pre-migration-backup-${timestamp}.json`);
    fs.writeFileSync(jsonBackupFile, JSON.stringify(jsonBackup, null, 2));
    const stats = fs.statSync(jsonBackupFile);
    console.log(`JSON backup saved to: ${jsonBackupFile}`);
    console.log(`Backup size: ${(stats.size / 1024).toFixed(2)} KB`);
    return true;
  }
}

async function main() {
  console.log('PRE-MIGRATION DATABASE CHECKS\n');
  
  const orphansOk = await checkOrphans();
  if (!orphansOk) {
    console.log('\n⚠️  Orphaned rows found! Migration may fail on FK constraints.');
    console.log('Please clean up orphans before proceeding.');
    await prisma.$disconnect();
    process.exit(1);
  }
  
  console.log('\n✅ No orphaned rows found. Ready for migration.\n');
  
  await backupTables();
  
  await prisma.$disconnect();
  console.log('\n=== All pre-migration checks complete ===');
}

main().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});