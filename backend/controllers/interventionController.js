const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Create a new intervention plan linked to a behavior record
const createIntervention = async (req, res) => {
  const { behavior_id, action_taken, assigned_to, due_date } = req.body;
  const created_by = req.user.id;

  if (!behavior_id || !action_taken) {
    return res.status(400).json({ error: 'behavior_id and action_taken are required' });
  }

  try {
    const interventionId = uuidv4();
    await db.query(`
      INSERT INTO interventions (id, behavior_id, action_taken, assigned_to, due_date, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [interventionId, behavior_id, action_taken, assigned_to || null, due_date || null, created_by]);

    res.status(201).json({ message: 'Intervention plan created successfully', id: interventionId });
  } catch (error) {
    console.error('Error creating intervention:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get all interventions, optionally joining behavior/student info
const getInterventions = async (req, res) => {
  try {
    const query = `
      SELECT i.*, 
             u1.first_name as assigned_to_name, 
             u2.first_name as created_by_name,
             b.student_id,
             b.points,
             s.first_name as student_first_name,
             s.last_name as student_last_name
      FROM interventions i
      LEFT JOIN users u1 ON i.assigned_to = u1.id
      LEFT JOIN users u2 ON i.created_by = u2.id
      LEFT JOIN behavior_records b ON i.behavior_id = b.id
      LEFT JOIN students s ON b.student_id = s.id
      ORDER BY i.created_at DESC
    `;
    const [interventions] = await db.query(query);
    res.json(interventions);
  } catch (error) {
    console.error('Error fetching interventions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update intervention status / complete it
const updateInterventionStatus = async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  try {
    const completedAt = status === 'completed' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null;

    const [result] = await db.query(`
      UPDATE interventions 
      SET status = COALESCE(?, status),
          notes = COALESCE(?, notes),
          completed_at = IF(? = 'completed', ?, completed_at)
      WHERE id = ?
    `, [status, notes, status, completedAt, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Intervention not found' });
    }

    res.json({ message: 'Intervention updated successfully' });
  } catch (error) {
    console.error('Error updating intervention:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createIntervention,
  getInterventions,
  updateInterventionStatus
};
