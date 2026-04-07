const db = require('./config/db');

async function test() {
  try {
    const [rows] = await db.query('SELECT id, first_name, last_name, admission_number FROM students LIMIT 5');
    console.log('Students in DB:');
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
