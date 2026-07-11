/**
 * Database connection pool module for Cadenza Music School Management System.
 * Provides a centralized MySQL connection pool using mysql2/promise.
 */

import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cadenza_music_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Enable SSL for cloud database connections (Railway, Aiven, etc.)
  ssl: (process.env.DB_HOST && process.env.DB_HOST !== '127.0.0.1' && process.env.DB_HOST !== 'localhost')
    ? { rejectUnauthorized: false }
    : undefined
})

async function ensureCoreSchema(connection) {
  const [roleTables] = await connection.query(
    'SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ? ',
    ['Role']
  )
  const roleExists = roleTables.length > 0

  if (!roleExists) {
    await connection.query(`
      CREATE TABLE Role (
        role_id INT AUTO_INCREMENT,
        role_name VARCHAR(50) NOT NULL,
        PRIMARY KEY (role_id),
        UNIQUE KEY uq_role_name (role_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
  }

  await connection.query(`
    INSERT IGNORE INTO Role (role_id, role_name) VALUES
      (1, 'Admin'),
      (2, 'Front Desk'),
      (3, 'Instructor')
  `)

  const [staffTables] = await connection.query(
    'SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ? ',
    ['Staff']
  )

  if (staffTables.length === 0) {
    await connection.query(`
      CREATE TABLE Staff (
        staff_id INT AUTO_INCREMENT,
        f_name VARCHAR(50) NOT NULL,
        m_name VARCHAR(50) DEFAULT NULL,
        l_name VARCHAR(50) NOT NULL,
        suffix VARCHAR(10) DEFAULT NULL,
        address VARCHAR(255) NOT NULL,
        age INT NOT NULL,
        gender ENUM('Male', 'Female', 'Other') NOT NULL,
        contact_no VARCHAR(15) NOT NULL,
        email VARCHAR(100) NOT NULL,
        profile TEXT DEFAULT NULL,
        status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
        role_id INT NOT NULL,
        PRIMARY KEY (staff_id),
        UNIQUE KEY uq_staff_email (email),
        KEY fk_staff_role_idx (role_id),
        FOREIGN KEY (role_id) REFERENCES Role(role_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
  }

  const [authTables] = await connection.query(
    'SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ? ',
    ['Staff_Auth']
  )

  if (authTables.length === 0) {
    await connection.query(`
      CREATE TABLE Staff_Auth (
        auth_id INT AUTO_INCREMENT,
        staff_id INT NOT NULL,
        email VARCHAR(100) NOT NULL,
        password VARCHAR(255) NOT NULL,
        last_login DATETIME DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (auth_id),
        UNIQUE KEY uq_staff_auth_staff_id (staff_id),
        UNIQUE KEY uq_staff_auth_email (email),
        FOREIGN KEY (staff_id) REFERENCES Staff(staff_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
  }

  await connection.query(`
    INSERT IGNORE INTO Staff (
      staff_id, f_name, m_name, l_name, suffix, address, age, gender, contact_no, email, profile, status, role_id
    ) VALUES
      (1, 'Juan', 'Dela', 'Cruz', NULL, '123 Rizal St., Manila', 35, 'Male', '09171234567', 'juan.cruz@cadenza.com', NULL, 'active', 1),
      (2, 'Maria', 'Luna', 'Santos', NULL, '456 Mabini Ave., Quezon City', 28, 'Female', '09182345678', 'maria.santos@cadenza.com', NULL, 'active', 2),
      (3, 'Pedro', NULL, 'Gonzales', NULL, '789 Bonifacio St., Makati', 42, 'Male', '09193456789', 'pedro.gonzales@cadenza.com', 'Senior instructor for piano', 'active', 3),
      (4, 'Ana', 'Reyes', 'Villanueva', NULL, '321 Katipunan Rd., Pasig', 26, 'Female', '09204567890', 'ana.villanueva@cadenza.com', NULL, 'active', 2),
      (5, 'Carlos', 'M.', 'Fernandez', NULL, '654 Taft Ave., Manila', 38, 'Male', '09215678901', 'carlos.fernandez@cadenza.com', 'Guitar and voice instructor', 'active', 3)
  `)

  await connection.query(`
    INSERT IGNORE INTO Staff_Auth (auth_id, staff_id, email, password, last_login) VALUES
      (1, 1, 'juan.cruz@cadenza.com', '$2b$10$/o3hoK3AS0qy4y2rhZ5hwO04Ru13T3PeL0TrrJFFF9vXsaTj4koKa', NULL),
      (2, 2, 'maria.santos@cadenza.com', '$2b$10$2efVqJRikxd75Lyx.iBwPuvc2JvQOqVybhewV.jDl.A8Yno18huzG', NULL),
      (3, 3, 'pedro.gonzales@cadenza.com', '$2b$10$SHY18FkFgOqZ28K6ydIrwexRnQWFbGGuuovoC.iHHxHMWErMjiSv.', NULL),
      (4, 4, 'ana.villanueva@cadenza.com', '$2b$10$hhahFjWEbIwqLkLLqryCd.pXz03iFTlNWGjvYP/iZankvjqvWKsFG', NULL),
      (5, 5, 'carlos.fernandez@cadenza.com', '$2b$10$c42CHuIet2zaeHz0YSUG7OjfI6IhcZkQx9N4dsBWMYbVlnfQjoS3m', NULL)
  `)
}

export async function initializeDatabase() {
  const connection = await pool.getConnection()
  try {
    await ensureCoreSchema(connection)
  } finally {
    connection.release()
  }
}

/**
 * Test the database connection
 */
export async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log('✅ MySQL database connected successfully')
    console.log(`   Host: ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}`)
    console.log(`   Database: ${process.env.DB_NAME || 'cadenza_music_db'}`)
    await ensureCoreSchema(connection)
    connection.release()
    return true
  } catch (err) {
    console.error('❌ MySQL database connection failed:', err.message)
    return false
  }
}

export default pool