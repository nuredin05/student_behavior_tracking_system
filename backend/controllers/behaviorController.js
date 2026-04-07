const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// ----- CATEGORY MANAGEMENT -----

// Get all active behavior categories
const getBehaviorCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM behavior_categories WHERE is_active = true ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
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

// Record a behavior incident (Teacher task)
const logBehavior = async (req, res) => {
  const { student_id, category_id, points_applied, comment, incident_date, evidence_url } = req.body;
  const recorded_by = req.user.id;

  if (!student_id || !category_id || points_applied === undefined) {
    return res.status(400).json({ error: 'student_id, category_id, and points_applied are required' });
  }

  try {
    const recordId = uuidv4();
    const date = incident_date || new Date().toISOString().split('T')[0];
    
    // Insert behavior record (Initial status is 'pending')
    await db.query(`
      INSERT INTO behavior_records (id, student_id, category_id, recorded_by, points_applied, comment, incident_date, evidence_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [recordId, student_id, category_id, recorded_by, points_applied, comment || null, date, evidence_url || null]);

    res.status(201).json({ message: 'Behavior logged successfully. Pending supervisor review.', id: recordId });
  } catch (error) {
    console.error('Error logging behavior:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Review and Approve/Reject Behavior (Supervisor task)
const getPendingRecords = async (req, res) => {
  try {
    const query = `
      SELECT br.*, 
             s.first_name as student_first_name, s.last_name as student_last_name, s.admission_number,
             bc.name as category_name, bc.type as category_type,
             u.first_name as teacher_first_name, u.last_name as teacher_last_name
      FROM behavior_records br
      JOIN students s ON br.student_id = s.id
      JOIN behavior_categories bc ON br.category_id = bc.id
      JOIN users u ON br.recorded_by = u.id
      WHERE br.status = 'pending'
      ORDER BY br.created_at DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching pending records:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const reviewBehavior = async (req, res) => {
  const { id } = req.params;
  const { status, comment } = req.body;
  const approved_by = req.user.id;

  if (!['approved', 'rejected', 'escalated'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be approved, rejected, or escalated.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Get the record details
    const [records] = await connection.query('SELECT student_id, points_applied, status FROM behavior_records WHERE id = ?', [id]);
    if (records.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Behavior record not found' });
    }

    const record = records[0];
    if (record.status !== 'pending' && record.status !== 'escalated') {
      await connection.rollback();
      return res.status(400).json({ error: 'Record has already been processed' });
    }

    // 2. Update record status
    await connection.query(`
      UPDATE behavior_records 
      SET status = ?, approved_by = ?, comment = COALESCE(?, comment)
      WHERE id = ?
    `, [status, approved_by, comment, id]);

    // 3. If approved, update student points balance
    if (status === 'approved') {
      await connection.query(`
        UPDATE students 
        SET current_points = current_points + ? 
        WHERE id = ?
      `, [record.points_applied, record.student_id]);
    }

    await connection.commit();
    res.json({ message: `Behavior record ${status} successfully` });
  } catch (error) {
    await connection.rollback();
    console.error('Error reviewing behavior:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    connection.release();
  }
};

// Supervisor overview stats
const getSupervisorStats = async (req, res) => {
  try {
    // Count records grouped by status
    const [statusCounts] = await db.query(`
      SELECT status, COUNT(*) as count
      FROM behavior_records
      GROUP BY status
    `);

    // 7-day incident trend
    const [recentActivity] = await db.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM behavior_records
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // Top 5 behavior categories by usage
    const [topCategories] = await db.query(`
      SELECT bc.name, bc.type, COUNT(br.id) as count
      FROM behavior_records br
      JOIN behavior_categories bc ON br.category_id = bc.id
      GROUP BY bc.id, bc.name, bc.type
      ORDER BY count DESC
      LIMIT 5
    `);

    // Totals
    const [totals] = await db.query(`
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM behavior_records
    `);

    res.json({
      totals: totals[0],
      statusCounts: statusCounts.reduce((acc, row) => { acc[row.status] = Number(row.count); return acc; }, {}),
      recentActivity,
      topCategories
    });
  } catch (error) {
    console.error('Error fetching supervisor stats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getBehaviorCategories,
  createCategory,
  updateCategory,
  logBehavior,
  reviewBehavior,
  getPendingRecords,
  getSupervisorStats
};
