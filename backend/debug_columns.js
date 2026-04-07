const db = require('./config/db');

async function test() {
  try {
    const [columns] = await db.query('SHOW COLUMNS FROM behavior_records');
    console.log('Columns in behavior_records:');
    console.log(JSON.stringify(columns.map(c => c.Field), null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
