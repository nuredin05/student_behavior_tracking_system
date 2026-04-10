const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// ----- REWARD MANAGEMENT (Manager/Admin) -----

const getRewards = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM rewards ORDER BY point_cost ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const createReward = async (req, res) => {
  const { name, description, point_cost, stock } = req.body;

  if (!name || point_cost === undefined) {
    return res.status(400).json({ error: 'name and point_cost are required' });
  }

  try {
    const id = uuidv4();
    await db.query(`
      INSERT INTO rewards (id, name, description, point_cost, stock)
      VALUES (?, ?, ?, ?, ?)
    `, [id, name, description || null, point_cost, stock || -1]);

    res.status(201).json({ message: 'Reward created successfully', id });
  } catch (error) {
    console.error('Error creating reward:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateReward = async (req, res) => {
  const { id } = req.params;
  const { name, description, point_cost, stock, is_active } = req.body;

  try {
    await db.query(`
      UPDATE rewards 
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          point_cost = COALESCE(?, point_cost),
          stock = COALESCE(?, stock),
          is_active = COALESCE(?, is_active)
      WHERE id = ?
    `, [name, description, point_cost, stock, is_active, id]);

    res.json({ message: 'Reward updated successfully' });
  } catch (error) {
    console.error('Error updating reward:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ----- REDEMPTIONS (Student/Manager) -----

const redeemReward = async (req, res) => {
  const { reward_id, student_id } = req.body;

  try {
    // 1. Check if reward exists and is active
    const [rewards] = await db.query('SELECT * FROM rewards WHERE id = ? AND is_active = true', [reward_id]);
    if (rewards.length === 0) return res.status(404).json({ error: 'Reward not found' });
    const reward = rewards[0];

    // 2. Check if student has enough points
    const [students] = await db.query('SELECT current_points FROM students WHERE id = ?', [student_id]);
    if (students.length === 0) return res.status(404).json({ error: 'Student not found' });
    const student = students[0];

    if (student.current_points < reward.point_cost) {
      return res.status(400).json({ error: 'Insufficient points to redeem this reward' });
    }

    // 3. Create redemption record (starts as pending)
    const id = uuidv4();
    await db.query(`
      INSERT INTO reward_redemptions (id, reward_id, student_id, status)
      VALUES (?, ?, ?, 'pending')
    `, [id, reward_id, student_id]);

    res.status(201).json({ message: 'Redemption request submitted!', id });
  } catch (error) {
    console.error('Error redeeming reward:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getRedemptions = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT rr.*, r.name as reward_name, r.point_cost, 
             s.first_name, s.last_name, s.admission_number
      FROM reward_redemptions rr
      JOIN rewards r ON rr.reward_id = r.id
      JOIN students s ON rr.student_id = s.id
      ORDER BY rr.redeemed_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching redemptions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const processRedemption = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // approved, rejected, collected
  const processed_by = req.user.id;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Get redemption details
    const [redemptions] = await connection.query(`
      SELECT rr.*, r.point_cost 
      FROM reward_redemptions rr
      JOIN rewards r ON rr.reward_id = r.id
      WHERE rr.id = ?
    `, [id]);
    
    if (redemptions.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Redemption not found' });
    }
    const redemption = redemptions[0];

    // 2. If approving, deduct points from student
    if (status === 'approved' && redemption.status === 'pending') {
      await connection.query('UPDATE students SET current_points = current_points - ? WHERE id = ?', [redemption.point_cost, redemption.student_id]);
    }

    // 3. Update redemption status
    await connection.query('UPDATE reward_redemptions SET status = ?, processed_by = ? WHERE id = ?', [status, processed_by, id]);

    await connection.commit();
    res.json({ message: `Redemption ${status} successfully` });
  } catch (error) {
    await connection.rollback();
    console.error('Error processing redemption:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    connection.release();
  }
};

module.exports = {
  getRewards,
  createReward,
  updateReward,
  redeemReward,
  getRedemptions,
  processRedemption
};
