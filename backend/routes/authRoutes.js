const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

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
 *     security:
 *       - bearerAuth: []
 *     description: Creates a new user. Restricted to Admins and Supervisors.
 */
router.post('/register', authenticate, authorize('admin', 'supervisor'), authController.register);

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: List all users
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.get('/users', authenticate, authorize('admin', 'supervisor'), authController.getAllUsers);

/**
 * @swagger
 * /api/auth/users/{id}:
 *   patch:
 *     summary: Update user profile or status
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/users/:id', authenticate, authorize('admin', 'supervisor'), authController.updateUser);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User Logout
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     description: Informs the backend of a logout. Under stateless JWT architectures, the client must simply drop the token.
 *     responses:
 *       200:
 *         description: Successfully logged out.
 */
router.post('/logout', authenticate, authController.logout);

module.exports = router;
