const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const getAllStudents = async (req, res) => {
  try {
    const query = `
      SELECT s.*, c.grade_level, c.section 
      FROM students s 
      LEFT JOIN classes c ON s.class_id = c.id
      ORDER BY s.last_name, s.first_name
    `;
    const [students] = await db.query(query);
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getStudentById = async (req, res) => {
  const { id } = req.params;
  try {
    const [student] = await db.query(`
      SELECT s.*, c.grade_level, c.section 
      FROM students s 
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.id = ?
    `, [id]);
    
    if (student.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student[0]);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getStudentFullProfile = async (req, res) => {
  const { id } = req.params;
  console.log('Fetching full profile for student ID:', id);
  try {
    // 1. Get Student Info
    const [student] = await db.query(`
      SELECT s.*, c.grade_level, c.section 
      FROM students s 
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.id = ?
    `, [id]);

    console.log('Student query result rows:', student.length);

    if (student.length === 0) {
      console.warn('Student not found in DB for ID:', id);
      return res.status(404).json({ error: 'Student not found' });
    }

    // 2. Get Behavior History (Ordered by date)
    const [history] = await db.query(`
      SELECT b.*, bc.name as category_name, bc.type as category_type, 
             u.first_name as teacher_first_name, u.last_name as teacher_last_name 
      FROM behavior_records b
      JOIN behavior_categories bc ON b.category_id = bc.id
      JOIN users u ON b.recorded_by = u.id
      WHERE b.student_id = ? AND b.status = 'approved'
      ORDER BY b.incident_date DESC, b.created_at DESC
    `, [id]);

    // 3. Get Active Interventions
    const [interventions] = await db.query(`
      SELECT i.*, u.first_name as creator_first_name, u.last_name as creator_last_name
      FROM interventions i
      JOIN users u ON i.created_by = u.id
      JOIN behavior_records b ON i.behavior_id = b.id
      WHERE b.student_id = ?
      ORDER BY i.created_at DESC
    `, [id]);

    res.json({
      student: student[0],
      history,
      interventions
    });
  } catch (error) {
    console.error('Error fetching student full profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Create a new student (Officer task)
const createStudent = async (req, res) => {
  const { admission_number, first_name, last_name, date_of_birth, gender, class_id, photo_url } = req.body;
  const officerId = req.user.id; // From authMiddleware

  if (!admission_number || !first_name || !last_name || !photo_url) {
    return res.status(400).json({ error: 'admission_number, first_name, last_name, and photo_url are required' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM students WHERE admission_number = ?', [admission_number]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'A student with this admission number already exists' });
    }

    const studentId = uuidv4();
    await db.query(`
      INSERT INTO students (id, admission_number, first_name, last_name, date_of_birth, gender, class_id, photo_url, registered_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [studentId, admission_number, first_name, last_name, date_of_birth || null, gender || null, class_id || null, photo_url, officerId]);

    res.status(201).json({ 
      message: 'Student created successfully',
      student: { id: studentId, admission_number, first_name, last_name, photo_url }
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update an existing student
const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, date_of_birth, gender, class_id, status } = req.body;

  try {
    const [result] = await db.query(`
      UPDATE students 
      SET first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          date_of_birth = COALESCE(?, date_of_birth),
          gender = COALESCE(?, gender),
          class_id = ?,
          status = COALESCE(?, status)
      WHERE id = ?
    `, [first_name, last_name, date_of_birth, gender, class_id || null, status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found or no changes made' });
    }

    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete a student
const deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM students WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  getStudentFullProfile,
  createStudent,
  updateStudent,
  deleteStudent
};
