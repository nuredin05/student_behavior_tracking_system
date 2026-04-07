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

const multer = require('multer');
const path = require('path');

// Configure multer for behavior evidence photo storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/evidence/');
  },
  filename: (req, file, cb) => {
    cb(null, `evidence-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Images only (jpeg, jpg, png)!'));
  }
});

/**
 * @swagger
 * /api/behaviors/records/pending:
 *   get:
 *     summary: Get all pending behavior records (Supervisor only)
 *     tags: [Behaviors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending records
 */
router.get('/records/pending', authenticate, authorize('supervisor', 'admin'), behaviorController.getPendingRecords);

/**
 * @swagger
 * /api/behaviors/stats:
 *   get:
 *     summary: Get supervisor overview stats
 *     tags: [Behaviors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats for supervisor overview
 */
router.get('/stats', authenticate, authorize('supervisor', 'admin'), behaviorController.getSupervisorStats);

/**
 * @swagger
 * /api/behaviors/analytics:
 *   get:
 *     summary: Get detailed behavior analytics
 *     tags: [Behaviors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytical data for charts and leaderboards
 */
router.get('/analytics', authenticate, authorize('supervisor', 'admin'), behaviorController.getAnalyticsSummary);

/**
 * @swagger
 * /api/behaviors/records:
 *   post:
 *     summary: Log a student behavior (Teacher task)
 *     tags: [Behaviors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - student_id
 *               - category_id
 *               - points_applied
 *             properties:
 *               student_id:
 *                 type: string
 *               category_id:
 *                 type: string
 *               points_applied:
 *                 type: integer
 *               comment:
 *                 type: string
 *               incident_date:
 *                 type: string
 *                 format: date
 *               evidence:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Behavior logged successfully. Pending review.
 */
router.post('/records', authenticate, authorize('teacher', 'supervisor', 'admin'), upload.single('evidence'), (req, res, next) => {
  if (req.file) {
    req.body.evidence_url = `/uploads/evidence/${req.file.filename}`;
  }
  next();
}, behaviorController.logBehavior);

/**
 * @swagger
 * /api/behaviors/records/{id}/review:
 *   patch:
 *     summary: Review and approve/reject behavior (Supervisor task)
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected, escalated]
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Behavior record reviewed successfully.
 */
router.patch('/records/:id/review', authenticate, authorize('supervisor', 'admin'), behaviorController.reviewBehavior);

module.exports = router;
