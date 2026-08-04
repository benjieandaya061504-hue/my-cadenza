const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// ── Configuration ──────────────────────────────────────────────────────────
const DB_CONFIG = {
  host: 'sakura.proxy.rlwy.net',
  port: 58694,
  user: 'root',
  password: 'hTmpyobcmqGALqOvpXSjRyYVdBLHZwpc',
  database: 'railway',
};

// ── Helpers ────────────────────────────────────────────────────────────────

/** Escape a single value for use in an INSERT INTO VALUES list. */
function escapeValue(val) {
  if (val === null || val === undefined) {
    return 'NULL';
  }
  if (typeof val === 'number') {
    return String(val);
  }
  if (val instanceof Date) {
    // Format as MySQL datetime string: 'YYYY-MM-DD HH:MM:SS'
    const pad = (n) => String(n).padStart(2, '0');
    return `'${val.getFullYear()}-${pad(val.getMonth() + 1)}-${pad(val.getDate())} ${pad(val.getHours())}:${pad(val.getMinutes())}:${pad(val.getSeconds())}'`;
  }
  // String / everything else — escape single quotes, backslashes, etc.
  const str = String(val);
  // mysql2's escape is available on the connection, but we do it manually
  // to keep it simple and avoid needing a live connection for escaping.
  const escaped = str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\x00/g, '\\0')
    .replace(/\x1a/g, '\\Z');
  return `'${escaped}'`;
}

/** Build a single INSERT INTO statement for a batch of rows. */
function buildInsertStatement(tableName, columns, rows) {
  if (rows.length === 0) return '';
  const colList = columns.map((c) => `\`${c}\``).join(', ');
  const valueStrings = rows.map((row) => {
    const vals = columns.map((col) => escapeValue(row[col]));
    return `(${vals.join(', ')})`;
  });
  return `INSERT INTO \`${tableName}\` (${colList}) VALUES\n${valueStrings.join(',\n')};\n\n`;
}

/** Format a Date to MySQL date string (YYYY-MM-DD). */
function formatDate(d) {
  if (!d) return null;
  const date = new Date(d);
  if (isNaN(date.getTime())) return null;
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('Connecting to Railway MySQL database...');
  const connection = await mysql.createConnection(DB_CONFIG);
  console.log(`Connected to ${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}\n`);

  // 1. Get all tables
  const [tables] = await connection.query('SHOW TABLES;');
  const tableNames = tables.map((row) => Object.values(row)[0]);
  console.log(`Found ${tableNames.length} tables:\n  ${tableNames.join('\n  ')}\n`);

  // 2. Build export content
  const lines = [];
  lines.push(`-- Cadenza Database Export`);
  lines.push(`-- Host: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
  lines.push(`-- Database: ${DB_CONFIG.database}`);
  lines.push(`-- Exported: ${new Date().toISOString()}`);
  lines.push(`-- Tables: ${tableNames.join(', ')}`);
  lines.push(`--\n`);

  const rowCounts = {};

  for (const tableName of tableNames) {
    console.log(`Exporting table: ${tableName}`);

    // 2a. Schema
    const [[createResult]] = await connection.query(`SHOW CREATE TABLE \`${tableName}\`;`);
    const createStmt = createResult['Create Table'];
    lines.push(`--\n-- Table structure for \`${tableName}\`\n--\n`);
    lines.push(`${createStmt};\n\n`);

    // 2b. Row count
    const [[{ count }]] = await connection.query(`SELECT COUNT(*) AS count FROM \`${tableName}\`;`);
    rowCounts[tableName] = count;

    if (count === 0) {
      lines.push(`-- Data for \`${tableName}\` (0 rows)\n\n`);
      console.log(`  -> 0 rows (no data to export)`);
      continue;
    }

    // 2c. Data
    const [rows] = await connection.query(`SELECT * FROM \`${tableName}\`;`);
    const columns = Object.keys(rows[0]);

    lines.push(`--\n-- Data for \`${tableName}\` (${count} rows)\n--\n`);

    // Batch INSERTs in groups of 200 rows to keep line length manageable
    const BATCH_SIZE = 200;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const insertSql = buildInsertStatement(tableName, columns, batch);
      lines.push(insertSql);
    }

    console.log(`  -> ${count} rows exported`);
  }

  // 3. Write file
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const timestamp =
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T` +
    `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  const filename = `cadenza_export_${timestamp}.sql`;
  const filepath = path.join(__dirname, '..', filename);

  const content = lines.join('');
  fs.writeFileSync(filepath, content, 'utf-8');

  // 4. Report
  const stats = fs.statSync(filepath);
  const fileSizeKB = (stats.size / 1024).toFixed(2);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log('\n═══════════════════════════════════════════');
  console.log('  EXPORT COMPLETE');
  console.log('═══════════════════════════════════════════');
  console.log(`  File:        ${filename}`);
  console.log(`  Path:        ${filepath}`);
  console.log(`  Size:        ${fileSizeKB} KB (${fileSizeMB} MB)`);
  console.log(`  Tables:      ${tableNames.length}`);
  console.log('───────────────────────────────────────────');
  console.log('  Table                          Rows');
  console.log('  ───────────────────────────────────────');
  for (const name of tableNames) {
    console.log(`  ${name.padEnd(30)} ${String(rowCounts[name]).padStart(8)}`);
  }
  console.log('═══════════════════════════════════════════\n');

  await connection.end();
  console.log('Connection closed. Export finished successfully.');
}

main().catch((err) => {
  console.error('\n❌ Export failed:');
  console.error(err);
  process.exit(1);
});