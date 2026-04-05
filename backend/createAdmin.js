require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

async function setup() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'behavior_db',
      password: process.env.DB_PASSWORD || '123456',
      multipleStatements: true
    });

    console.log('Ensuring database exists...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'behavior_db'}\``);
    await connection.query(`USE \`${process.env.DB_NAME || 'behavior_db'}\``);

    console.log('Running database schema script...');
    const schemaSql = fs.readFileSync('./database.sql', 'utf8');
    
    // Execute schema statements individually if multipleStatements has issues, or all at once
    await connection.query(schemaSql);
    console.log('Database tables verified/created successfully.');

    console.log('Checking for existing admin...');
    const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', ['admin@school.com']);
    
    if (rows.length > 0) {
      console.log('Admin user already exists!');
      console.log('Email: admin@school.com');
    } else {
      console.log('Creating admin user...');
      const passwordHash = await bcrypt.hash('admin123', 10);
      const uuid = uuidv4();
      
      await connection.query(`
        INSERT INTO users (id, first_name, last_name, email, password_hash, role, phone, profile_picture)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [uuid, 'Super', 'Admin', 'admin@school.com', passwordHash, 'admin', '1234567890', null]);
      
      console.log('Admin user created successfully!');
      console.log('Email: admin@school.com');
      console.log('Password: admin123');
    }
  } catch (error) {
    console.error('Error during setup:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setup();
