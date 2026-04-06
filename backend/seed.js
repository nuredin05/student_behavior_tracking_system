const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root', // Use root to ensure we can create DB if needed
  password: process.env.DB_PASSWORD || '',
};

const DATABASE_NAME = process.env.DB_NAME || 'behavior_db';

async function seed() {
  let connection;
  try {
    // Connect to MySQL server
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL server...');

    // 0. Ensure Database exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME}`);
    await connection.query(`USE ${DATABASE_NAME}`);
    console.log(`✔ Database "${DATABASE_NAME}" is ready.`);

    // 1. Initialise Tables (Run schema here to ensure they exist)
    const fs = require('fs');
    const path = require('path');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');
    
    // Split by semicolon and run each statement
    const statements = schemaSql.split(';').filter(stmt => stmt.trim() !== '');
    for (const stmt of statements) {
      await connection.query(stmt);
    }
    console.log('✔ Database schema applied.');

    // Helper to create users
    const createUser = async (phone, password, role, first, last) => {
      const id = uuidv4();
      const hash = await bcrypt.hash(password, 10);
      await connection.query(`
        INSERT IGNORE INTO users (id, phone, password_hash, role, first_name, last_name)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [id, phone, hash, role, first, last]);
      return id;
    };

    // 2. Create Sample Users
    console.log('\nCreating sample users...');
    const supervisorId = await createUser('0900000000', 'admin123', 'supervisor', 'Admin', 'Supervisor');
    const officerId = await createUser('0911111111', 'officer123', 'officer', 'School', 'Officer');
    const teacherId = await createUser('0922222222', 'teacher123', 'teacher', 'Abebe', 'Kebede');
    const parentId = await createUser('0933333333', 'parent123', 'parent', 'Lensa', 'Tola');

    console.log('✔ Supervisor: 0900000000 / admin123');
    console.log('✔ Officer:    0911111111 / officer123');
    console.log('✔ Teacher:    0922222222 / teacher123');
    console.log('✔ Parent:     0933333333 / parent123');

    // 3. Create Sample Class
    const classId = uuidv4();
    await connection.query(`
      INSERT IGNORE INTO classes (id, grade_level, section, academic_year, supervisor_id)
      VALUES (?, ?, ?, ?, ?)
    `, [classId, 9, 'A', '2026-2027', supervisorId]);
    console.log('✔ Class created: Grade 9-A');

    // 4. Create Sample Student
    const studentId = uuidv4();
    await connection.query(`
      INSERT IGNORE INTO students (id, admission_number, first_name, last_name, gender, class_id, photo_url, registered_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [studentId, 'ST-001', 'Samuel', 'Tola', 'male', classId, 'https://placehold.co/400x400?text=Samuel', officerId]);
    console.log('✔ Student created: Samuel Tola (ID: ST-001)');

    // 5. Link Parent to Student
    await connection.query(`
      INSERT IGNORE INTO student_parents (student_id, parent_id, relationship, is_primary)
      VALUES (?, ?, ?, ?)
    `, [studentId, parentId, 'Father', true]);
    console.log('✔ Parent linked to student');

    // 6. Create Behavior Categories
    const categories = [
      { name: 'Helping Peers', type: 'positive', pts: 10, sev: 'low' },
      { name: 'Leadership', type: 'positive', pts: 20, sev: 'medium' },
      { name: 'Disruption', type: 'negative', pts: -5, sev: 'low' },
      { name: 'Fighting', type: 'negative', pts: -30, sev: 'high' },
      { name: 'Bullying', type: 'negative', pts: -50, sev: 'urgent' },
    ];

    for (const cat of categories) {
      await connection.query(`
        INSERT IGNORE INTO behavior_categories (id, name, type, default_points, severity_level)
        VALUES (?, ?, ?, ?, ?)
      `, [uuidv4(), cat.name, cat.type, cat.pts, cat.sev]);
    }
    console.log('✔ behavior categories created.');

    console.log('\n🚀 ALL DONE! You can now log in.');
  } catch (error) {
    console.error('❌ SEEDING ERROR:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

seed();
