import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
  multipleStatements: true
});

async function backup() {
  const connection = await pool.getConnection();
  
  try {
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
    const filename = `production_backup_URGENT_${dateStr}.sql`;
    const filepath = path.join(__dirname, '..', filename);
    
    let output = `-- Cadenza Music School - Database Backup\n`;
    output += `-- Host: ${process.env.DB_HOST}:${process.env.DB_PORT}\n`;
    output += `-- Database: ${process.env.DB_NAME}\n`;
    output += `-- Date: ${now.toISOString()}\n\n`;
    output += `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;\n`;
    output += `USE \`${process.env.DB_NAME}\`;\n\n`;
    
    // Get all tables
    const [tables] = await connection.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() ORDER BY table_name"
    );
    
    for (const t of tables) {
      const tableName = t.TABLE_NAME;
      console.log(`Backing up: ${tableName}`);
      
      // Get CREATE TABLE
      const [createResult] = await connection.query(`SHOW CREATE TABLE \`${tableName}\``);
      output += `\n-- Table: ${tableName}\n`;
      output += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
      output += `${createResult[0]['Create Table']};\n\n`;
      
      // Get data
      const [rows] = await connection.query(`SELECT * FROM \`${tableName}\``);
      if (rows.length > 0) {
        const columns = Object.keys(rows[0]);
        const colNames = columns.map(c => `\`${c}\``).join(', ');
        
        for (const row of rows) {
          const values = columns.map(col => {
            const val = row[col];
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'number') return val;
            if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
            return `'${String(val).replace(/'/g, "\\'")}'`;
          }).join(', ');
          
          output += `INSERT INTO \`${tableName}\` (${colNames}) VALUES (${values});\n`;
        }
        output += '\n';
      }
    }
    
    fs.writeFileSync(filepath, output, 'utf8');
    const stats = fs.statSync(filepath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`\n✅ Backup saved: ${filename}`);
    console.log(`   Path: ${filepath}`);
    console.log(`   Size: ${sizeKB} KB`);
    
  } finally {
    connection.release();
    await pool.end();
  }
}

backup().catch(e => { console.error('❌ Backup failed:', e); process.exit(1); });