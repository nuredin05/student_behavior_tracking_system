const db = require('./config/db');

async function test() {
  const studentId = '02ceab15-80e7-4a8e-a87f-b09685005f53';
  
  try {
    // Test 1: Student query
    console.log('=== Test 1: Student Info ===');
    const [student] = await db.query(`
      SELECT s.*, c.grade_level, c.section 
      FROM students s 
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.id = ?
    `, [studentId]);
    console.log('Found:', student.length, 'rows');
    if (student.length > 0) console.log('Student:', student[0].first_name, student[0].last_name);

    // Test 2: Behavior history
    console.log('\n=== Test 2: Behavior History ===');
    const [history] = await db.query(`
      SELECT b.*, bc.name as category_name, bc.type as category_type, 
             u.first_name as teacher_first_name, u.last_name as teacher_last_name 
      FROM behavior_records b
      JOIN behavior_categories bc ON b.category_id = bc.id
      JOIN users u ON b.recorded_by = u.id
      WHERE b.student_id = ? AND b.status = 'approved'
      ORDER BY b.incident_date DESC, b.created_at DESC
    `, [studentId]);
    console.log('History rows:', history.length);

    // Test 3: Interventions table exists?
    console.log('\n=== Test 3: Interventions ===');
    try {
      const [interventions] = await db.query(`
        SELECT i.*, u.first_name as creator_first_name, u.last_name as creator_last_name
        FROM interventions i
        JOIN users u ON i.created_by = u.id
        JOIN behavior_records b ON i.behavior_id = b.id
        WHERE b.student_id = ?
        ORDER BY i.created_at DESC
      `, [studentId]);
      console.log('Interventions rows:', interventions.length);
    } catch (err) {
      console.error('Interventions query FAILED:', err.message);
    }

    console.log('\n=== FULL PROFILE WOULD SUCCEED ===');
    process.exit(0);
  } catch (err) {
    console.error('QUERY FAILED:', err.message);
    process.exit(1);
  }
}

test();
