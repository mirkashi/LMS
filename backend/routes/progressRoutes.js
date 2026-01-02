const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Get user's enrollment progress
router.get(
  '/enrollments/:enrollmentId/progress',
  authMiddleware,
  progressController.getProgress
);

// Update lesson progress
router.put(
  '/enrollments/:enrollmentId/progress',
  authMiddleware,
  progressController.updateLessonProgress
);

// Admin: Get enrollment progress stats
router.get(
  '/admin/enrollments/:enrollmentId/progress',
  authMiddleware,
  adminMiddleware,
  progressController.getEnrollmentProgressStats
);

module.exports = router;
