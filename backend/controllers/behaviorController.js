const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { createNotification } = require('./notificationController');

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

    // Notify Supervisors
    const [supervisors] = await db.query("SELECT id FROM users WHERE role = 'supervisor' AND is_active = true");
    for (const sup of supervisors) {
      await createNotification(
        sup.id, 
        'New Incident Pending', 
        `A new behavior record has been logged and requires your review.`,
        'incident',
        recordId
      );
    }

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
             s.photo_url as student_photo, 
             c.grade_level, c.section,
             bc.name as category_name, bc.type as category_type,
             u.first_name as teacher_first_name, u.last_name as teacher_last_name
      FROM behavior_records br
      LEFT JOIN students s ON br.student_id = s.id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN behavior_categories bc ON br.category_id = bc.id
      LEFT JOIN users u ON br.recorded_by = u.id
      WHERE br.status = 'pending'
      ORDER BY br.created_at DESC
    `;
    const [rows] = await db.query(query);
    console.log('Pending records found:', rows.length); // Debug log
    if (rows.length > 0) {
      console.log('First record:', JSON.stringify(rows[0], null, 2)); // Debug first record
    }
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
    console.log('Reviewing record:', { id, status, record }); // Debug log
    
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
      console.log('Updating student points:', { student_id: record.student_id, points: record.points_applied }); // Debug log
      const [updateResult] = await connection.query(`
        UPDATE students 
        SET current_points = current_points + ? 
        WHERE id = ?
      `, [record.points_applied, record.student_id]);
      console.log('Points update result:', updateResult); // Debug log
    }

    // 4. Notify Teacher of the decision
    const [teacher] = await connection.query('SELECT recorded_by FROM behavior_records WHERE id = ?', [id]);
    if (teacher.length > 0) {
      await createNotification(
        teacher[0].recorded_by,
        `Incident ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        `Your behavior record submission has been ${status} by the supervisor.`,
        'incident',
        id
      );
    }

    // 5. Mark related notifications as read for THIS supervisor
    await connection.query(`
      UPDATE notifications 
      SET is_read = true 
      WHERE user_id = ? AND related_id = ? AND type = 'incident'
    `, [approved_by, id]);

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

// Detailed Analytics Summary
const getAnalyticsSummary = async (req, res) => {
  try {
    // 1. 30-Day Activity Trend
    const [activityTrend] = await db.query(`
      SELECT DATE(br.created_at) as date,
             SUM(CASE WHEN bc.type = 'positive' THEN 1 ELSE 0 END) as positive,
             SUM(CASE WHEN bc.type = 'negative' THEN 1 ELSE 0 END) as negative
      FROM behavior_records br
      JOIN behavior_categories bc ON br.category_id = bc.id
      WHERE br.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(br.created_at)
      ORDER BY date ASC
    `);

    // 2. Student Leaderboard (Top 10)
    const [topStudents] = await db.query(`
      SELECT id, first_name, last_name, admission_number, current_points, photo_url
      FROM students
      WHERE status = 'active'
      ORDER BY current_points DESC
      LIMIT 10
    `);

    // 3. At-Risk Students (Bottom 10)
    const [lowStudents] = await db.query(`
      SELECT id, first_name, last_name, admission_number, current_points, photo_url
      FROM students
      WHERE status = 'active'
      ORDER BY current_points ASC
      LIMIT 10
    `);

    // 4. Category Distribution (Pie Chart)
    const [categoryStats] = await db.query(`
      SELECT bc.name, bc.type, COUNT(br.id) as count
      FROM behavior_records br
      JOIN behavior_categories bc ON br.category_id = bc.id
      GROUP BY bc.id, bc.name, bc.type
      ORDER BY count DESC
    `);

    // 5. Grade Level Comparison
    const [gradeStats] = await db.query(`
      SELECT c.grade_level, 
             AVG(s.current_points) as avg_points,
             COUNT(br.id) as incident_count
      FROM classes c
      JOIN students s ON s.class_id = c.id
      LEFT JOIN behavior_records br ON br.student_id = s.id
      GROUP BY c.grade_level
      ORDER BY c.grade_level ASC
    `);

    // 6. Impact Overview
    const [impactOverview] = await db.query(`
      SELECT 
        SUM(CASE WHEN bc.type = 'positive' THEN 1 ELSE 0 END) as total_positive,
        SUM(CASE WHEN bc.type = 'negative' THEN 1 ELSE 0 END) as total_negative,
        COUNT(*) as total_logs
      FROM behavior_records br
      JOIN behavior_categories bc ON br.category_id = bc.id
    `);

    res.json({
      activityTrend,
      topStudents,
      lowStudents,
      categoryStats,
      gradeStats,
      impact: impactOverview[0]
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getTeacherHistory = async (req, res) => {
  const teacherId = req.user.id;
  try {
    const query = `
      SELECT br.*, 
             s.first_name as student_first_name, s.last_name as student_last_name, s.admission_number,
             bc.name as category_name, bc.type as category_type
      FROM behavior_records br
      JOIN students s ON br.student_id = s.id
      JOIN behavior_categories bc ON br.category_id = bc.id
      WHERE br.recorded_by = ?
      ORDER BY br.created_at DESC
      LIMIT 10
    `;
    const [rows] = await db.query(query, [teacherId]);

    const [todayCount] = await db.query(`
      SELECT COUNT(*) as count 
      FROM behavior_records 
      WHERE recorded_by = ? AND DATE(created_at) = CURDATE()
    `, [teacherId]);

    res.json({
      history: rows,
      todayCount: todayCount[0].count
    });
  } catch (error) {
    console.error('Error fetching teacher history:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getCertificateData = async (req, res) => {
  const { studentId } = req.params;
  try {
    const [students] = await db.query(`
      SELECT s.*, c.grade_level, c.section, u.first_name as teacher_first_name, u.last_name as teacher_last_name
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE s.id = ?
    `, [studentId]);

    if (students.length === 0) return res.status(404).json({ error: 'Student not found' });

    const student = students[0];

    const [behaviorSummary] = await db.query(`
      SELECT 
        SUM(CASE WHEN bc.type = 'positive' THEN br.points_applied ELSE 0 END) as total_positive,
        SUM(CASE WHEN bc.type = 'negative' THEN br.points_applied ELSE 0 END) as total_negative,
        COUNT(br.id) as total_incidents
      FROM behavior_records br
      JOIN behavior_categories bc ON br.category_id = bc.id
      WHERE br.student_id = ? AND br.status = 'approved'
    `, [studentId]);

    const stats = behaviorSummary[0];
    const netPoints = student.current_points;

    // Conduct Grade Logic
    let conductGrade = 'Good';
    if (netPoints >= 100) conductGrade = 'Outstanding';
    else if (netPoints >= 80) conductGrade = 'Excellent';
    else if (netPoints >= 60) conductGrade = 'Very Good';
    else if (netPoints >= 40) conductGrade = 'Good';
    else if (netPoints >= 20) conductGrade = 'Satisfactory';
    else conductGrade = 'Needs Improvement';

    res.json({
      student,
      stats,
      conductGrade,
      generatedAt: new Date().toISOString(),
      schoolName: 'Amana Model Secondary School',
      academicYear: '2023/2024'
    });
  } catch (error) {
    console.error('Error fetching certificate data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getPublicAnalytics = async (req, res) => {
  try {
    const [impactOverview] = await db.query(`
      SELECT 
        SUM(CASE WHEN bc.type = 'positive' THEN 1 ELSE 0 END) as total_positive,
        SUM(CASE WHEN bc.type = 'negative' THEN 1 ELSE 0 END) as total_negative,
        COUNT(*) as total_logs
      FROM behavior_records br
      JOIN behavior_categories bc ON br.category_id = bc.id
      WHERE br.status = 'approved'
    `);

    const [counts] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM students WHERE status = 'active') as student_count,
        (SELECT COUNT(*) FROM users WHERE is_active = true) as staff_count
      FROM DUAL
    `);

    res.json({
      impact: impactOverview[0],
      counts: counts[0]
    });
  } catch (error) {
    console.error('Error fetching public analytics:', error);
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
  getSupervisorStats,
  getAnalyticsSummary,
  getPublicAnalytics,
  getTeacherHistory,
  getCertificateData
};
