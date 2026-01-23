const express = require('express');
const router = express.Router();
const videoProgressController = require('../controllers/videoProgressController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const deleteVideoProgressLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 delete requests per windowMs
});

const videoProgressLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 video progress requests per windowMs
});

// Update video progress
router.post(
  '/update',
  authMiddleware,
  videoProgressLimiter,
  videoProgressController.updateVideoProgress
);

// Get progress for a specific course
router.get(
  '/course/:courseId',
  videoProgressLimiter,
  authMiddleware,
  videoProgressController.getVideoProgress
);

// Get progress for a specific video in a course
router.get(
  '/course/:courseId/video/:videoLink',
  authMiddleware,
  videoProgressLimiter,
  videoProgressController.getVideoProgressByLink
);

// Get all video progress (admin only)
router.get(
  '/',
  videoProgressLimiter,
  authMiddleware,
  adminMiddleware,
  videoProgressController.getAllVideoProgress
);

// Get course video statistics (admin only)
router.get(
  '/statistics/:courseId',
  videoProgressLimiter,
  authMiddleware,
  adminMiddleware,
  videoProgressController.getCourseVideoStatistics
);

// Delete video progress (admin only)
router.delete(
  '/:progressId',
  authMiddleware,
  deleteVideoProgressLimiter,
  adminMiddleware,
  videoProgressController.deleteVideoProgress
);

module.exports = router;
