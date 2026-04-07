const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: School Management
 *   description: Core settings including Classes, Periods, and Parents
 */

// --- Classes Routes ---

/**
 * @swagger
 * /api/school/classes:
 *   get:
 *     summary: Get all classes
 *     tags: [School Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of classes
 */
router.get('/classes', authenticate, schoolController.getClasses);

/**
 * @swagger
 * /api/school/classes:
 *   post:
 *     summary: Create a class
 *     tags: [School Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - grade_level
 *               - academic_year
 *             properties:
 *               name:
 *                 type: string
 *                 example: "10A"
 *               grade_level:
 *                 type: integer
 *                 example: 10
 *               academic_year:
 *                 type: string
 *                 example: "2026-2027"
 *               supervisor_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Class successfully created.
 */
router.post('/classes', authenticate, authorize('admin', 'supervisor'), schoolController.createClass);
router.patch('/classes/:id', authenticate, authorize('admin', 'supervisor'), schoolController.updateClass);
router.delete('/classes/:id', authenticate, authorize('admin', 'supervisor'), schoolController.deleteClass);


// --- Academic Period Routes ---

/**
 * @swagger
 * /api/school/periods:
 *   get:
 *     summary: Get all academic periods
 *     tags: [School Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of academic periods
 */
router.get('/periods', authenticate, schoolController.getAcademicPeriods);

/**
 * @swagger
 * /api/school/periods:
 *   post:
 *     summary: Create an academic period
 *     tags: [School Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, start_date, end_date, academic_year]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Fall Semester"
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               academic_year:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Academic period successfully created.
 */
router.post('/periods', authenticate, authorize('admin'), schoolController.createAcademicPeriod);

// --- Parents Routes ---

/**
 * @swagger
 * /api/school/parents:
 *   get:
 *     summary: Get all parent profiles
 *     tags: [School Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of parents joined with base user attributes
 */
router.get('/parents', authenticate, authorize('admin', 'supervisor', 'teacher'), schoolController.getParents);

module.exports = router;
