const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User Login
 *     tags: [Auth]
 *     description: Authenticates a user and returns a JSON Web Token along with user profile. Used for role-based access control.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@school.com
 *               password:
 *                 type: string
 *                 example: MySecurePassword123
 *     responses:
 *       200:
 *         description: Login successful. Returns JWT token and the user's role profile.
 *       400:
 *         description: Bad request (missing email/password).
 *       401:
 *         description: Unauthorized (Invalid credentials or inactive user).
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new User
 *     tags: [Auth]
 *     description: Creates a new user with a specified role.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, supervisor, teacher, parent]
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         description: Bad request or user already exists
 */
router.post('/register', authController.register);

module.exports = router;
