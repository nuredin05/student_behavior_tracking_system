const db = require('../backend/config/db');

async function checkStudents() {
  try {
    const [rows] = await db.query('SELECT admission_number, parent_phone FROM students LIMIT 5');
    console.log('Sample Students:');
    console.table(rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkStudents();
