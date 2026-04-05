const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// --- CLASSES ---

const getClasses = async (req, res) => {
  try {
    const query = `
      SELECT c.*, u.first_name as supervisor_first_name, u.last_name as supervisor_last_name 
      FROM classes c 
      LEFT JOIN users u ON c.supervisor_id = u.id
      ORDER BY c.academic_year DESC, c.grade_level ASC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const createClass = async (req, res) => {
  const { name, grade_level, academic_year, supervisor_id } = req.body;

  if (!name || grade_level === undefined || !academic_year) {
    return res.status(400).json({ error: 'name, grade_level, and academic_year are required' });
  }

  try {
    const classId = uuidv4();
    await db.query(`
      INSERT INTO classes (id, name, grade_level, academic_year, supervisor_id)
      VALUES (?, ?, ?, ?, ?)
    `, [classId, name, grade_level, academic_year, supervisor_id || null]);

    res.status(201).json({ message: 'Class created successfully', id: classId });
  } catch (error) {
    console.error('Error creating class:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'This class name already exists for the given academic year' });
    }
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
  getParents
};
