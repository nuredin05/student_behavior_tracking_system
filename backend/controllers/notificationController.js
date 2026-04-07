const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/**
 * Internal helper to create a system notification for any user.
 * @param {string} userId - Target user ID (Teacher, Parent, Supervisor)
 * @param {string} title - Alert title
 * @param {string} message - Alert content
 * @param {string} type - 'incident', 'report', 'system'
 * @param {string} relatedId - Optional ID linking to record/student/intervention
 */
const createNotification = async (userId, title, message, type = 'system', relatedId = null) => {
  try {
    const id = uuidv4();
    await db.query(`
      INSERT INTO notifications (id, user_id, title, message, type, related_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, userId, title, message, type, relatedId]);
    return id;
  } catch (error) {
    console.error('Error creating notification helper:', error);
  }
};

// --- API ACTIONS ---

// Get all notifications for the requester
const getUserNotifications = async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.query(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 20
    `, [userId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Mark a single notification as read
const markAsRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const [result] = await db.query(`
      UPDATE notifications 
      SET is_read = true 
      WHERE id = ? AND user_id = ?
    `, [id, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Mark all notifications as read for current user
const markAllAsRead = async (req, res) => {
  const userId = req.user.id;
  try {
    await db.query('UPDATE notifications SET is_read = true WHERE user_id = ?', [userId]);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead
};
