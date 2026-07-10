# Cadenza Backend Database Setup Guide

This guide will help you set up the database connection and authentication system for the Cadenza Music School Management System.

## Overview

The system uses **MySQL** database with the following structure:
- **Unified Authentication**: Uses `users` table for all accounts (staff, students, admins)
- **Staff Information**: Uses `Staff` table for basic staff information (name, position, contact info, etc.)
- **Linking**: `users.staff_id` foreign key links to `Staff` table for staff accounts
- **Single Endpoint**: All authentication goes through `/api/users/login`

## Prerequisites

1. **WAMP Server** (or any MySQL server) must be running
2. **Node.js** and **npm** installed
3. Backend dependencies installed: `npm install`

## Step-by-Step Setup

### 1. Configure Environment Variables

The `.env` file should already exist. If not, run:
```bash
node setup-env.js
```

**Current .env configuration:**
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=cadenza_music_db
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

**Update these values if needed:**
- `DB_PASSWORD`: Your MySQL root password (leave empty if no password)
- `DB_HOST`: Your MySQL server address (default: 127.0.0.1)
- `DB_PORT`: Your MySQL port (default: 3306)

### 2. Create Database and Tables (First Time Only)

Run the schema setup script to create the database and all tables:
```bash
node setup-db.js
```

This will:
- Create the `cadenza_music_db` database
- Create all core tables (Staff, Client, Room, Equipment, etc.)
- Insert sample data including staff information

### 3. Run Migration for User Tables

After the main schema is created, run the migration to add the user authentication tables:
```bash
node run-migration.js
```

This will add:
- `users` table (for all accounts - staff, students, admins)
- `students` table (linked to users)
- `instructors` table (linked to users)
- `courses`, `enrollments`, `lessons` tables
- Other supporting tables

### 4. Run Staff Auth Migration

After user tables are created, run the staff auth migration to migrate staff accounts to the unified users table:
```bash
node run-split-migration.js
```

This will:
- Add `staff_id` foreign key to users table
- Migrate existing staff accounts from Staff_Auth to users table
- Remove email column from Staff table
- Drop Staff_Auth table

### 5. Test Database Connection

Verify the database connection works:
```bash
node test-connection.js
```

### 6. Start the Server

Start the backend server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Staff Login Credentials

After running the migrations, the following staff accounts are available in the users table:

| Role | Username/Email | Password |
|------|----------------|----------|
| Admin | juan.cruz@cadenza.com | admin123 |
| Front Desk | maria.santos@cadenza.com | front123 |
| Front Desk | ana.villanueva@cadenza.com | front456 |
| Instructor | pedro.gonzales@cadenza.com | inst123 |
| Instructor | carlos.fernandez@cadenza.com | inst456 |

**⚠️ IMPORTANT:** Change these passwords in production!

## API Endpoints

### Unified Authentication
- **POST** `/api/users/login` - Login for all users (staff, students, admins)
  ```json
  {
    "username": "juan.cruz@cadenza.com",
    "password": "admin123"
  }
  ```
  or
  ```json
  {
    "email": "juan.cruz@cadenza.com",
    "password": "admin123"
  }
  ```
- **POST** `/api/users/register` - Register new user
- **GET** `/api/users` - Get all users
- **GET** `/api/users/:id` - Get user by ID
- **PUT** `/api/users/:id` - Update user profile
- **PUT** `/api/users/:id/status` - Update user status (approve/reject)

### Other Endpoints
- `/api/students` - Student CRUD operations
- `/api/instructors` - Instructor CRUD operations
- `/api/courses` - Course management
- `/api/enrollments` - Enrollment management
- `/api/lessons` - Lesson scheduling
- `/api/billing` - Billing and payments
- `/api/studios` - Studio/room management
- `/api/instruments` - Equipment management

## Database Schema

### Core Tables (from schema.sql)
- **Role**: Staff roles (Admin, Front Desk, Instructor)
- **Staff**: Staff information (name, position, contact info, etc.)
- **Client**: Client information
- **Room**: Studio rooms
- **Equipment**: Musical instruments and equipment
- And more...

### User Tables (from migration)
- **users**: Unified user accounts (staff, students, admins) with staff_id FK for staff accounts
- **students**: Student profiles (linked to users)
- **instructors**: Instructor profiles (linked to users)
- **courses**: Course catalog
- **enrollments**: Student enrollments
- **lessons**: Scheduled lessons
- And more...

## Troubleshooting

### Database Connection Failed
1. Ensure WAMP MySQL is running
2. Check `.env` credentials are correct
3. Verify MySQL is listening on port 3306
4. Try connecting with MySQL Workbench to verify credentials

### Migration Errors
1. Ensure the main database exists (run `setup-db.js` first)
2. Check for table name conflicts
3. Review the migration SQL file for syntax errors

### Login Not Working
1. Verify the email exists in the database
2. Check the password matches the generated hashes
3. Ensure the staff status is 'active'
4. Check browser console for API errors

## Security Notes

1. **Change default passwords** before deploying to production
2. **Never commit `.env` file** to version control (it's already in .gitignore)
3. **Use strong passwords** for all accounts
4. **Enable HTTPS** in production
5. **Implement rate limiting** on login endpoints
6. **Add JWT or session management** for persistent authentication

## File Structure

```
backend/
├── .env                    # Environment variables (not in git)
├── .env.example           # Example environment variables
├── db.js                  # Database connection pool
├── server.js              # Express server
├── setup-db.js            # Initial database setup
├── setup-env.js           # Environment setup
├── test-connection.js     # Connection test
├── run-migration.js       # Migration runner
├── generate-passwords.js  # Password hash generator
├── schema.sql             # Main database schema
├── migrations/
│   └── add_users_tables.sql  # User tables migration
└── routes/
    ├── users.js           # User authentication routes
    ├── staff-auth.js      # Staff authentication routes
    ├── students.js        # Student CRUD
    ├── instructors.js     # Instructor CRUD
    └── ...                # Other route files
```

## Next Steps

1. Run `node setup-db.js` to create the database
2. Run `node run-migration.js` to add user tables
3. Run `node test-connection.js` to verify connection
4. Run `npm run dev` to start the server
5. Test staff login with the credentials above
6. Update the frontend to use the new `/api/staff-auth/login` endpoint

## Support

If you encounter issues:
1. Check the console output for error messages
2. Verify MySQL is running
3. Check the `.env` file configuration
4. Review the database tables in MySQL Workbench
