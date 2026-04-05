const express = require('express');
const router = express.Router();
const interventionController = require('../controllers/interventionController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Interventions
 *   description: Administrative follow-ups for behaviors
 */

/**
 * @swagger
 * /api/interventions:
 *   get:
 *     summary: Get all interventions
 *     tags: [Interventions]
 *     security:
 *       - bearerAuth: []
 *     description: Returns a joined view of interventions alongside the student and assigned user information.
 *     responses:
 *       200:
 *         description: List of interventions.
 */
router.get('/', authenticate, authorize('admin', 'supervisor', 'teacher'), interventionController.getInterventions);

/**
 * @swagger
 * /api/interventions:
 *   post:
 *     summary: Assign a new intervention plan
 *     tags: [Interventions]
 *     security:
 *       - bearerAuth: []
 *     description: Links an action plan to a specific behavior_record. Only Admins and Supervisors can do this.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - behavior_id
 *               - action_taken
 *             properties:
 *               behavior_id:
 *                 type: string
 *               action_taken:
 *                 type: string
 *                 example: Call parents, assign detention, schedule counseling
 *               assigned_to:
 *                 type: string
 *                 description: ID of a user, e.g., counselor.
 *               due_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Intervention plan created
 */
router.post('/', authenticate, authorize('admin', 'supervisor'), interventionController.createIntervention);

/**
 * @swagger
 * /api/interventions/{id}/status:
 *   put:
 *     summary: Update intervention status
 *     tags: [Interventions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status successfully updated.
 */
router.put('/:id/status', authenticate, authorize('admin', 'supervisor', 'teacher'), interventionController.updateInterventionStatus);

module.exports = router;
