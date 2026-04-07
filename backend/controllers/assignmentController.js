const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Create a new teacher-subject-class assignment
const createAssignment = async (req, res) => {
  const { teacher_id, class_id, subject_name } = req.body;

  if (!teacher_id || !class_id || !subject_name) {
    return res.status(400).json({ error: 'teacher_id, class_id, and subject_name are required' });
  }

  try {
    const assignmentId = uuidv4();
    await db.query(`
      INSERT INTO teacher_assignments (id, teacher_id, class_id, subject_name)
      VALUES (?, ?, ?, ?)
    `, [assignmentId, teacher_id, class_id, subject_name]);

    res.status(201).json({ message: 'Teacher assignment created successfully', id: assignmentId });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get all assignments for a class
const getClassAssignments = async (req, res) => {
  const { class_id } = req.params;
  try {
    const [assignments] = await db.query(`
      SELECT ta.*, u.first_name, u.last_name, u.email
      FROM teacher_assignments ta
      JOIN users u ON ta.teacher_id = u.id
      WHERE ta.class_id = ?
    `, [class_id]);
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching class assignments:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get all assignments for a teacher
const getTeacherAssignments = async (req, res) => {
  const teacher_id = req.user.id;
  try {
    const [assignments] = await db.query(`
      SELECT ta.*, c.grade_level, c.section
      FROM teacher_assignments ta
      JOIN classes c ON ta.class_id = c.id
      WHERE ta.teacher_id = ?
    `, [teacher_id]);
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching teacher assignments:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete an assignment
const deleteAssignment = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM teacher_assignments WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createAssignment,
  getClassAssignments,
  getTeacherAssignments,
  deleteAssignment
};
