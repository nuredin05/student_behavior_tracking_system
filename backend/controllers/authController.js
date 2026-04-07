const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const register = async (req, res) => {
  const { phone, password, role, first_name, last_name, email, profile_picture } = req.body;

  if (!phone || !password || !role || !first_name || !last_name) {
    return res.status(400).json({ error: 'phone, password, role, first_name, and last_name are required' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE phone = ?', [phone]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User with this phone number already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    await db.query(`
      INSERT INTO users (id, phone, email, password_hash, role, first_name, last_name, profile_picture)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, phone, email || null, password_hash, role, first_name, last_name, profile_picture || null]);

    const token = jwt.sign(
      { id: userId, phone, role },
      process.env.JWT_SECRET || 'your_super_secret_key',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: userId, phone, first_name, last_name, role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Fetch all users for management (Admin/Supervisor only)
const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT id, phone, email, role, first_name, last_name, profile_picture, is_active, last_login, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update user details (Role, Status, etc.)
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { role, is_active, first_name, last_name, email } = req.body;

  try {
    const [result] = await db.query(`
      UPDATE users 
      SET role = COALESCE(?, role),
          is_active = COALESCE(?, is_active),
          first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          email = COALESCE(?, email)
      WHERE id = ?
    `, [role, is_active, first_name, last_name, email, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const login = async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: 'Phone and password are required' });
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE phone = ? AND is_active = true', [phone]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid phone or password' });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid phone or password' });
    }

    // Generate Role-Based JWT
    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
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

const logout = async (req, res) => {
  // For stateless JWT, logouts happen client-side by deleting the token.
  // However, providing a dedicated REST endpoint is best practice for audits, 
  // or if cookies/redis-blacklisting is introduced later.
  res.json({ message: 'Logged out successfully' });
};

module.exports = { login, register, logout, getAllUsers, updateUser };
