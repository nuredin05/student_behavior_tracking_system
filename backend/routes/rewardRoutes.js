const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Public/Initial access (Students should be able to see rewards too)
router.get('/', authenticate, rewardController.getRewards);

// Manager specific tasks
router.post('/', authenticate, authorize('manager', 'admin', 'supervisor'), rewardController.createReward);
router.put('/:id', authenticate, authorize('manager', 'admin', 'supervisor'), rewardController.updateReward);

// Redemption workflow
router.post('/redeem', authenticate, rewardController.redeemReward);
router.get('/redemptions', authenticate, authorize('manager', 'admin', 'supervisor'), rewardController.getRedemptions);
router.patch('/redemptions/:id', authenticate, authorize('manager', 'admin', 'supervisor'), rewardController.processRedemption);

module.exports = router;
