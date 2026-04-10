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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|csv|xlsx|xls/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) return cb(null, true);
    cb(new Error('Invalid file type! Allowed: jpeg, jpg, png, csv, xlsx, xls'));
  }
});

// Multer requires (req, res, next) — wrap in a Promise to use async/await
const uploadAsync = (fieldName) => async (req, res, next) => {
  try {
    await new Promise((resolve, reject) => {
      upload.single(fieldName)(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    next();
  } catch (err) {
    next(err);
  }
};

// GET top students (Public - for landing page)
router.get('/top', studentController.getTopStudents);

// POST public profile (Public - for parents)
router.post('/public-profile', studentController.getPublicStudentProfile);

// GET all students
router.get('/', authenticate, studentController.getAllStudents);

// GET next available Admission ID
router.get('/next-admission-id', authenticate, studentController.getNextAdmissionNumber);

// GET student enrollment Excel template (public - sample data only)
router.get('/download-template', studentController.downloadStudentTemplate);

// GET template with filename in URL (public - sample data only)
router.get('/download/:filename', studentController.downloadStudentTemplate);

// GET full profile
router.get('/:id/full-profile', authenticate, studentController.getStudentFullProfile);

// GET single student by ID
router.get('/:id', authenticate, studentController.getStudentById);

// POST bulk import student Excel (Officer, Supervisor, Admin)
router.post('/bulk', authenticate, authorize('officer', 'supervisor', 'admin'), uploadAsync('excel_file'), studentController.bulkImportStudents);

// POST create student (Officer, Supervisor, Admin)
router.post('/', authenticate, authorize('officer', 'supervisor', 'admin'), uploadAsync('photo'), (req, res, next) => {
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
