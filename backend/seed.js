const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'behavior_db',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'behavior_db',
};

async function seed() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL for seeding...');

    // 1. Create Default Supervisor (YOU)
    const supervisorId = uuidv4();
    const supervisorPhone = '0900000000';
    const supervisorPass = await bcrypt.hash('admin123', 10);
    
    await connection.query(`
      INSERT IGNORE INTO users (id, phone, password_hash, role, first_name, last_name)
      VALUES (?, ?, ?, 'supervisor', 'Admin', 'Supervisor')
    `, [supervisorId, supervisorPhone, supervisorPass]);
    console.log('✔ Default Supervisor created: 0900000000 / admin123');

    // 2. Create Default Officer
    const officerId = uuidv4();
    const officerPhone = '0911111111';
    const officerPass = await bcrypt.hash('officer123', 10);
    await connection.query(`
      INSERT IGNORE INTO users (id, phone, password_hash, role, first_name, last_name)
      VALUES (?, ?, ?, 'officer', 'School', 'Officer')
    `, [officerId, officerPhone, officerPass]);
    console.log('✔ Default Officer created: 0911111111 / officer123');

    // 3. Create Default Behavior Categories
    const categories = [
      { name: 'Fighting', type: 'negative', points: -10, severity: 'high' },
      { name: 'Helping Others', type: 'positive', points: 5, severity: 'low' },
      { name: 'Leadership', type: 'positive', points: 15, severity: 'medium' },
      { name: 'Cheating', type: 'negative', points: -20, severity: 'urgent' },
      { name: 'Tardiness', type: 'negative', points: -2, severity: 'low' },
    ];

    for (const cat of categories) {
      await connection.query(`
        INSERT IGNORE INTO behavior_categories (id, name, type, default_points, severity_level)
        VALUES (?, ?, ?, ?, ?)
      `, [uuidv4(), cat.name, cat.type, cat.points, cat.severity]);
    }
    console.log('✔ Default Behavior Categories created');

    console.log('\n🚀 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

seed();
