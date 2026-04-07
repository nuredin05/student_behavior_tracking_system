const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for student photo storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/students/');
  },
  filename: (req, file, cb) => {
    cb(null, `student-${Date.now()}${path.extname(file.originalname)}`);
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

// GET all students
router.get('/', authenticate, studentController.getAllStudents);

// GET full profile (must be defined BEFORE /:id to avoid shadowing)
router.get('/:id/full-profile', authenticate, studentController.getStudentFullProfile);

// GET single student by ID
router.get('/:id', authenticate, studentController.getStudentById);

// POST create student (Officer, Supervisor, Admin)
router.post('/', authenticate, authorize('officer', 'supervisor', 'admin'), upload.single('photo'), (req, res, next) => {
  if (req.file) {
    req.body.photo_url = `/uploads/students/${req.file.filename}`;
  }
  next();
}, studentController.createStudent);

// PUT update student (Admin, Supervisor)
router.put('/:id', authenticate, authorize('admin', 'supervisor'), studentController.updateStudent);

// DELETE student (Admin only)
router.delete('/:id', authenticate, authorize('admin'), studentController.deleteStudent);

module.exports = router;
