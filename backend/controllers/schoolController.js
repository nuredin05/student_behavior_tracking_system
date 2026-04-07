const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// --- CLASSES ---

const getClasses = async (req, res) => {
  try {
    const query = `
      SELECT c.*, 
             u1.first_name as supervisor_first_name, u1.last_name as supervisor_last_name,
             u2.first_name as teacher_first_name, u2.last_name as teacher_last_name
      FROM classes c 
      LEFT JOIN users u1 ON c.supervisor_id = u1.id
      LEFT JOIN users u2 ON c.teacher_id = u2.id
      ORDER BY c.academic_year DESC, c.grade_level ASC, c.section ASC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const createClass = async (req, res) => {
  const { grade_level, section, academic_year, supervisor_id, teacher_id } = req.body;

  if (grade_level === undefined || !section || !academic_year) {
    return res.status(400).json({ error: 'grade_level, section, and academic_year are required' });
  }

  try {
    const classId = uuidv4();
    await db.query(`
      INSERT INTO classes (id, grade_level, section, academic_year, supervisor_id, teacher_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [classId, grade_level, section, academic_year, supervisor_id || null, teacher_id || null]);

    res.status(201).json({ message: 'Class created successfully', id: classId });
  } catch (error) {
    console.error('Error creating class:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'This class already exists for the given academic year' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateClass = async (req, res) => {
  const { id } = req.params;
  const { grade_level, section, academic_year, supervisor_id, teacher_id } = req.body;

  try {
    const [result] = await db.query(`
      UPDATE classes 
      SET grade_level = COALESCE(?, grade_level),
          section = COALESCE(?, section),
          academic_year = COALESCE(?, academic_year),
          supervisor_id = ?,
          teacher_id = ?
      WHERE id = ?
    `, [grade_level, section, academic_year, supervisor_id || null, teacher_id || null, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json({ message: 'Class updated successfully' });
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteClass = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if class has students
    const [students] = await db.query('SELECT id FROM students WHERE class_id = ? LIMIT 1', [id]);
    if (students.length > 0) {
      return res.status(400).json({ error: 'Cannot delete class that contains students' });
    }

    const [result] = await db.query('DELETE FROM classes WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// --- ACADEMIC PERIODS ---

const getAcademicPeriods = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM academic_periods ORDER BY start_date DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching academic periods:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const createAcademicPeriod = async (req, res) => {
  const { name, start_date, end_date, academic_year, is_active } = req.body;

  if (!name || !start_date || !end_date || !academic_year) {
    return res.status(400).json({ error: 'name, start_date, end_date, and academic_year are required' });
  }

  try {
    const periodId = uuidv4();
    await db.query(`
      INSERT INTO academic_periods (id, name, start_date, end_date, academic_year, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [periodId, name, start_date, end_date, academic_year, is_active || false]);

    res.status(201).json({ message: 'Academic period created successfully', id: periodId });
  } catch (error) {
    console.error('Error creating academic period:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// --- PARENTS OVERVIEW ---

const getParents = async (req, res) => {
  try {
    const query = `
      SELECT p.id, p.emergency_contact, p.address, u.first_name, u.last_name, u.email, u.phone
      FROM parents p
      JOIN users u ON p.user_id = u.id
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching parents:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getClasses,
  createClass,
  getAcademicPeriods,
  createAcademicPeriod,
  getParents,
  updateClass,
  deleteClass
};
