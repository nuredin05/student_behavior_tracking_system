const db = require('./config/db');

async function migrate() {
  try {
    console.log('Attempting to add teacher_id to classes table...');
    await db.query(`
      ALTER TABLE classes 
      ADD COLUMN teacher_id VARCHAR(36) AFTER supervisor_id
    `);
    console.log('Column teacher_id added.');
    
    await db.query(`
      ALTER TABLE classes 
      ADD FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
    `);
    console.log('Foreign key added.');
    
    console.log('Migration successful!');
    process.exit(0);
  } catch (err) {
    if (err.code === 'ER_DUP_COLUMN_NAME') {
      console.log('Column already exists, skipping.');
      process.exit(0);
    } else {
      console.error('Migration failed:', err);
      process.exit(1);
    }
  }
}

migrate();
