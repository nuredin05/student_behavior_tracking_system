require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'behavior_db',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'behavior_db',
    multipleStatements: true
  });

  try {
    console.log('Seeding Database...');
    console.log('Temporarily disabling active foreign key checks...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Clear out existing tables to prevent duplication overlaps
    const tables = ['users', 'classes', 'students', 'parents', 'student_parents', 'behavior_categories', 'behavior_records', 'interventions', 'academic_periods', 'notifications', 'audit_logs'];
    for (let table of tables) {
      await connection.query(`TRUNCATE TABLE \`${table}\``);
    }
    
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Tables neatly truncated.');

    // --- Create Mock Users ---
    const pwd = await bcrypt.hash('password123', 10);
    const adminId = uuidv4();
    const superId = uuidv4();
    const t1Id = uuidv4();
    const t2Id = uuidv4();
    const p1Id = uuidv4();

    await connection.query(`INSERT INTO users (id, first_name, last_name, email, password_hash, role) VALUES 
      (?, 'Alice', 'Admin', 'admin@test.com', ?, 'admin'),
      (?, 'Bob', 'Supervisor', 'supervisor@test.com', ?, 'supervisor'),
      (?, 'Charles', 'Teacher', 'teacher1@test.com', ?, 'teacher'),
      (?, 'Diane', 'Teacher', 'teacher2@test.com', ?, 'teacher'),
      (?, 'Evan', 'Parent', 'parent1@test.com', ?, 'parent')
    `, [adminId, pwd, superId, pwd, t1Id, pwd, t2Id, pwd, p1Id, pwd]);

    // --- Create Mock Classes ---
    const c1Id = uuidv4();
    const c2Id = uuidv4();
    await connection.query(`INSERT INTO classes (id, name, grade_level, academic_year, supervisor_id) VALUES 
      (?, '10A', 10, '2026-2027', ?),
      (?, '10B', 10, '2026-2027', ?)
    `, [c1Id, t1Id, c2Id, t2Id]);

    // --- Create Mock Students ---
    const s1Id = uuidv4();
    const s2Id = uuidv4();
    const s3Id = uuidv4();
    const s4Id = uuidv4();
    await connection.query(`INSERT INTO students (id, admission_number, first_name, last_name, class_id, points_balance, enrollment_date) VALUES 
      (?, 'STU001', 'John', 'Doe', ?, 15, '2025-09-01'),
      (?, 'STU002', 'Jane', 'Smith', ?, 5, '2025-09-01'),
      (?, 'STU003', 'Mike', 'Johnson', ?, -10, '2025-09-01'),
      (?, 'STU004', 'Emily', 'Davis', ?, 0, '2025-09-01')
    `, [s1Id, c1Id, s2Id, c1Id, s3Id, c2Id, s4Id, c2Id]);

    // --- Link the Parent ---
    const parentRecordId = uuidv4();
    await connection.query(`INSERT INTO parents (id, user_id, emergency_contact, address) VALUES (?, ?, '555-0199', '123 Main St')`, [parentRecordId, p1Id]);
    await connection.query(`INSERT INTO student_parents (student_id, parent_id, relationship, is_primary) VALUES (?, ?, 'Father', true)`, [s1Id, parentRecordId]);

    // --- Behavior Categories ---
    const catPositive = uuidv4();
    const catNegative = uuidv4();
    await connection.query(`INSERT INTO behavior_categories (id, name, type, default_points, severity_level, description) VALUES 
      (?, 'Helping Classmate', 'positive', 5, 1, 'Assisting a peer with work'),
      (?, 'Disrupting Class', 'negative', -5, 2, 'Loud or constant talking blocking others')
    `, [catPositive, catNegative]);

    // --- Mock Behavior Log Records ---
    const b1Id = uuidv4();
    const b2Id = uuidv4();
    await connection.query(`INSERT INTO behavior_records (id, student_id, category_id, recorded_by, points, comment, date, location) VALUES 
      (?, ?, ?, ?, 5, 'Helped passing out papers for me.', '2026-04-01', 'Room 101'),
      (?, ?, ?, ?, -5, 'Talking aggressively during lecture.', '2026-04-02', 'Room 102')
    `, [b1Id, s1Id, catPositive, t1Id, b2Id, s3Id, catNegative, t2Id]);

    // --- Mock Intervention Record ---
    const i1Id = uuidv4();
    await connection.query(`INSERT INTO interventions (id, behavior_id, action_taken, assigned_to, created_by, status, due_date) VALUES 
      (?, ?, 'Schedule parent meeting regarding disruption', ?, ?, 'pending', '2026-04-10')
    `, [i1Id, b2Id, superId, t2Id]);

    // --- Mock Academic Period ---
    const apId = uuidv4();
    await connection.query(`INSERT INTO academic_periods (id, name, start_date, end_date, academic_year, is_active) VALUES 
      (?, 'Spring 2026', '2026-01-01', '2026-06-01', '2025-2026', true)
    `, [apId]);

    console.log('✅ Successfully seeded sample database with robust linked data!');
    console.log('------------------------------------------------');
    console.log('Try logging into Swagger using these accounts:');
    console.log('   admin@test.com / password123 (Role: Admin)');
    console.log('   supervisor@test.com / password123 (Role: Supervisor)');
    console.log('   teacher1@test.com / password123 (Role: Teacher / 10A Supervisor)');
    console.log('   parent1@test.com / password123 (Role: Parent / John Doe)');
    console.log('------------------------------------------------');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await connection.end();
  }
}

seed();
