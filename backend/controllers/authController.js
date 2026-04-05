const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const register = async (req, res) => {
  const { first_name, last_name, email, password, role, phone, profile_picture } = req.body;

  if (!first_name || !last_name || !email || !password || !role) {
    return res.status(400).json({ error: 'first_name, last_name, email, password, and role are required' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    await db.query(`
      INSERT INTO users (id, first_name, last_name, email, password_hash, role, phone, profile_picture)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, first_name, last_name, email, password_hash, role, phone || null, profile_picture || null]);

    const token = jwt.sign(
      { id: userId, email, role },
      process.env.JWT_SECRET || 'your_super_secret_key',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: userId, first_name, last_name, email, role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ? AND is_active = true', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate Role-Based JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_super_secret_key',
      { expiresIn: '1d' }
    );

    // Drop the password hash before sending user profile back
    const { password_hash, ...userProfile } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userProfile
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { login, register };
