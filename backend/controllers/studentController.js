const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Fetch all students (with class name included)
const getAllStudents = async (req, res) => {
  try {
    const query = `
      SELECT s.*, c.name as class_name 
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

// Fetch a single student by ID
const getStudentById = async (req, res) => {
  const { id } = req.params;
  try {
    const [student] = await db.query(`
      SELECT s.*, c.name as class_name 
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

// Create a new student
const createStudent = async (req, res) => {
  const { admission_number, first_name, last_name, date_of_birth, gender, class_id, enrollment_date } = req.body;

  if (!admission_number || !first_name || !last_name) {
    return res.status(400).json({ error: 'admission_number, first_name, and last_name are required' });
  }

  try {
    // Check if admission number is unique
    const [existing] = await db.query('SELECT id FROM students WHERE admission_number = ?', [admission_number]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'A student with this admission number already exists' });
    }

    const studentId = uuidv4();
    await db.query(`
      INSERT INTO students (id, admission_number, first_name, last_name, date_of_birth, gender, class_id, enrollment_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [studentId, admission_number, first_name, last_name, date_of_birth || null, gender || null, class_id || null, enrollment_date || null]);

    res.status(201).json({ 
      message: 'Student created successfully',
      student: { id: studentId, admission_number, first_name, last_name }
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
  createStudent,
  updateStudent,
  deleteStudent
};
