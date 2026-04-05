const express = require('express');
const router = express.Router();
const behaviorController = require('../controllers/behaviorController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Behaviors
 *   description: Behavior categories and records management
 */

/**
 * @swagger
 * /api/behaviors/categories:
 *   get:
 *     summary: Retrieve active behavior categories
 *     tags: [Behaviors]
 *     security:
 *       - bearerAuth: []
 *     description: Returns a list of all currently active behavior categories from the database.
 *     responses:
 *       200:
 *         description: A list of behavior categories.
 */
router.get('/categories', authenticate, behaviorController.getBehaviorCategories);

/**
 * @swagger
 * /api/behaviors/categories:
 *   post:
 *     summary: Create a new behavior category
 *     tags: [Behaviors]
 *     security:
 *       - bearerAuth: []
 *     description: Creates a new behavior type (e.g. Disruption, Helping Classmate)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - default_points
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [positive, negative]
 *               default_points:
 *                 type: integer
 *               severity_level:
 *                 type: integer
 *                 default: 1
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created successfully.
 */
router.post('/categories', authenticate, authorize('admin', 'supervisor'), behaviorController.createCategory);

/**
 * @swagger
 * /api/behaviors/categories/{id}:
 *   put:
 *     summary: Update an existing behavior category
 *     tags: [Behaviors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [positive, negative]
 *               default_points:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Category updated successfully.
 */
router.put('/categories/:id', authenticate, authorize('admin', 'supervisor'), behaviorController.updateCategory);

/**
 * @swagger
 * /api/behaviors/records:
 *   post:
 *     summary: Log a student behavior
 *     tags: [Behaviors]
 *     security:
 *       - bearerAuth: []
 *     description: Records a behavior and calculates the point addition/subtraction dynamically into the student's profile ledger.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - student_id
 *               - category_id
 *               - points
 *             properties:
 *               student_id:
 *                 type: string
 *               category_id:
 *                 type: string
 *               points:
 *                 type: integer
 *                 description: Explicit integer denoting points.
 *               comment:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Behavior successfully logged and points calculated.
 */
router.post('/records', authenticate, authorize('admin', 'supervisor', 'teacher'), behaviorController.logBehavior);

module.exports = router;
