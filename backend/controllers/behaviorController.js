const db = require('../config/db');

// Example endpoint to get behavior categories using raw MySQL
const getBehaviorCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM behavior_categories WHERE is_active = true');
    res.json(rows);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getBehaviorCategories
};
