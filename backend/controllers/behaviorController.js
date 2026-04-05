const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// ----- CATEGORY MANAGEMENT -----

// Get all active behavior categories
const getBehaviorCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM behavior_categories WHERE is_active = true ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Create a new behavior category
const createCategory = async (req, res) => {
  const { name, type, default_points, severity_level, description } = req.body;

  if (!name || !type || default_points === undefined) {
    return res.status(400).json({ error: 'name, type, and default_points are required' });
  }

  if (type !== 'positive' && type !== 'negative') {
    return res.status(400).json({ error: 'type must be either positive or negative' });
  }

  try {
    const categoryId = uuidv4();
    await db.query(`
      INSERT INTO behavior_categories (id, name, type, default_points, severity_level, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [categoryId, name, type, default_points, severity_level || 1, description || null]);

    res.status(201).json({
      message: 'Behavior category created successfully',
      category: { id: categoryId, name, type, default_points }
    });
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'A category with this name already exists' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update an existing behavior category
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, type, default_points, severity_level, description, is_active } = req.body;

  try {
    const [result] = await db.query(`
      UPDATE behavior_categories 
      SET name = COALESCE(?, name),
          type = COALESCE(?, type),
          default_points = COALESCE(?, default_points),
          severity_level = COALESCE(?, severity_level),
          description = COALESCE(?, description),
          is_active = COALESCE(?, is_active)
      WHERE id = ?
    `, [name, type, default_points, severity_level, description, is_active, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found or no changes made' });
    }

    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ----- BEHAVIOR LOGGING -----

// Record a behavior incident (positive or negative)
const logBehavior = async (req, res) => {
  const { student_id, category_id, points, comment, date, location } = req.body;
  const recorded_by = req.user.id; // Securely map from the verified Auth JWT Token

  if (!student_id || !category_id || points === undefined) {
    return res.status(400).json({ error: 'student_id, category_id, and points are required' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const recordId = uuidv4();
    const behaviorDate = date || new Date().toISOString().split('T')[0];
    
    // Insert behavior record
    await connection.query(`
      INSERT INTO behavior_records (id, student_id, category_id, recorded_by, points, comment, date, location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [recordId, student_id, category_id, recorded_by, points, comment || null, behaviorDate, location || null]);

    // Transactionally update the student point ledger
    await connection.query(`
      UPDATE students 
      SET points_balance = points_balance + ? 
      WHERE id = ?
    `, [points, student_id]);

    await connection.commit();
    res.status(201).json({ message: 'Behavior successfully logged and points calculated', id: recordId });
  } catch (error) {
    await connection.rollback();
    console.error('Error logging behavior:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    connection.release();
  }
};

module.exports = {
  getBehaviorCategories,
  createCategory,
  updateCategory,
  logBehavior
};
