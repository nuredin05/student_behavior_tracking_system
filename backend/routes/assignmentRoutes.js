const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Get all assignments for a class
router.get('/class/:class_id', authenticate, authorize('admin', 'supervisor'), assignmentController.getClassAssignments);

// Get all assignments for the currently logged-in teacher
router.get('/my-assignments', authenticate, authorize('teacher'), assignmentController.getTeacherAssignments);

// Create a new teacher-subject-class assignment
router.post('/', authenticate, authorize('admin', 'supervisor'), assignmentController.createAssignment);

// Delete an assignment
router.delete('/:id', authenticate, authorize('admin', 'supervisor'), assignmentController.deleteAssignment);

module.exports = router;
