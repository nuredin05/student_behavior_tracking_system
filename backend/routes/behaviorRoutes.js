const express = require('express');
const router = express.Router();
const behaviorController = require('../controllers/behaviorController');

/**
 * @swagger
 * /api/behaviors/categories:
 *   get:
 *     summary: Retrieve active behavior categories
 *     description: Returns a list of all currently active behavior categories from the database.
 *     responses:
 *       200:
 *         description: A list of behavior categories.
 *       500:
 *         description: Internal Server Error.
 */
router.get('/categories', behaviorController.getBehaviorCategories);

module.exports = router;
