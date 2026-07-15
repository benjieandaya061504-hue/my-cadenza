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
  connectionLimit: 3,
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

async function ensureColumn(connection, tableName, columnName, definition) {
  const [columns] = await connection.query(
    'SELECT COUNT(*) AS count FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?',
    [tableName, columnName]
  )

  if (columns[0].count > 0) return

  await connection.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${definition}`)
}

async function ensureRentalStatusColumn(connection) {
  const [statusColumns] = await connection.query(
    "SHOW COLUMNS FROM instrument_rentals LIKE 'status'"
  )

  if (statusColumns.length === 0) return

  const currentType = statusColumns[0].Type
  if (currentType.includes('pending') && currentType.includes('approved') && currentType.includes('rejected')) {
    return
  }

  await connection.query(
    "ALTER TABLE instrument_rentals MODIFY COLUMN status ENUM('pending','approved','rejected','active','returned','overdue') NOT NULL DEFAULT 'pending'"
  )
}

async function ensureInstrumentRentalsTable(connection) {
  const [rentalTables] = await connection.query(
    'SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ? ',
    ['instrument_rentals']
  )

  if (rentalTables.length === 0) {
    await connection.query(`
      CREATE TABLE instrument_rentals (
        id INT AUTO_INCREMENT,
        student_id INT NOT NULL,
        instrument_id VARCHAR(10) DEFAULT NULL,
        renter_name VARCHAR(100) NOT NULL,
        contact_number VARCHAR(15) DEFAULT NULL,
        email VARCHAR(100) DEFAULT NULL,
        address VARCHAR(255) DEFAULT NULL,
        rental_start_date DATE NOT NULL,
        rental_end_date DATE DEFAULT NULL,
        duration_months INT DEFAULT 1,
        monthly_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
        deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        payment_method VARCHAR(50) DEFAULT NULL,
        payment_reference VARCHAR(100) DEFAULT NULL,
        status ENUM('pending','approved','rejected','active','returned') NOT NULL DEFAULT 'pending',
        notes TEXT DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_rental_student (student_id),
        KEY idx_rental_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
  } else {
    await ensureColumn(connection, 'instrument_rentals', 'student_id', 'INT NOT NULL DEFAULT 0')
    await ensureColumn(connection, 'instrument_rentals', 'instrument_id', 'VARCHAR(10) DEFAULT NULL')
    await ensureColumn(connection, 'instrument_rentals', 'renter_name', 'VARCHAR(100) NOT NULL DEFAULT ""')
    await ensureColumn(connection, 'instrument_rentals', 'contact_number', 'VARCHAR(15) DEFAULT NULL')
    await ensureColumn(connection, 'instrument_rentals', 'email', 'VARCHAR(100) DEFAULT NULL')
    await ensureColumn(connection, 'instrument_rentals', 'address', 'VARCHAR(255) DEFAULT NULL')
    await ensureColumn(connection, 'instrument_rentals', 'rental_start_date', 'DATE NOT NULL')
    await ensureColumn(connection, 'instrument_rentals', 'rental_end_date', 'DATE DEFAULT NULL')
    await ensureColumn(connection, 'instrument_rentals', 'duration_months', 'INT DEFAULT 1')
    await ensureColumn(connection, 'instrument_rentals', 'monthly_rate', 'DECIMAL(10,2) NOT NULL DEFAULT 0')
    await ensureColumn(connection, 'instrument_rentals', 'deposit_amount', 'DECIMAL(10,2) NOT NULL DEFAULT 0')
    await ensureColumn(connection, 'instrument_rentals', 'total_amount', 'DECIMAL(10,2) NOT NULL DEFAULT 0')
    await ensureColumn(connection, 'instrument_rentals', 'payment_method', 'VARCHAR(50) DEFAULT NULL')
    await ensureColumn(connection, 'instrument_rentals', 'payment_reference', 'VARCHAR(100) DEFAULT NULL')
    await ensureColumn(connection, 'instrument_rentals', 'status', "ENUM('pending','approved','rejected','active','returned','overdue') NOT NULL DEFAULT 'pending'")
    await ensureColumn(connection, 'instrument_rentals', 'notes', 'TEXT DEFAULT NULL')
    await ensureColumn(connection, 'instrument_rentals', 'created_at', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP')
    await ensureColumn(connection, 'instrument_rentals', 'updated_at', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
  }

  await ensureRentalStatusColumn(connection)

  console.log('✅ instrument_rentals table created / verified')
}

export async function initializeDatabase() {
  const connection = await pool.getConnection()
  try {
    await ensureCoreSchema(connection)
    await ensureInstrumentRentalsTable(connection)

    // TODO: Replace this name-only text field with an instructor_id foreign key
    // once a real instructor management system is built. Currently stores the
    // instructor's name as plain text since there's no instructor accounts/IDs yet.
    await ensureColumn(connection, 'enrollments', 'instructor_requested', "VARCHAR(100) DEFAULT NULL")
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