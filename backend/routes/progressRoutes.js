const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const adminProgressStatsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each admin client to 100 requests per windowMs for this endpoint
  standardHeaders: true,
  legacyHeaders: false,
});

const userProgressLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each authenticated user client to 100 requests per windowMs for progress endpoints
  standardHeaders: true,
  legacyHeaders: false,
});

// Get user's enrollment progress
router.get(
  '/enrollments/:enrollmentId/progress',
  userProgressLimiter,
  authMiddleware,
  progressController.getProgress
);

// Update lesson progress
router.put(
  '/enrollments/:enrollmentId/progress',
  userProgressLimiter,
  authMiddleware,
  progressController.updateLessonProgress
);

// Admin: Get enrollment progress stats
router.get(
  '/admin/enrollments/:enrollmentId/progress',
  adminProgressStatsLimiter,
  authMiddleware,
  adminMiddleware,
  progressController.getEnrollmentProgressStats
);

module.exports = router;
