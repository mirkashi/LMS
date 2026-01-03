const express = require('express');
const router = express.Router();
const videoProgressController = require('../controllers/videoProgressController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Update video progress
router.post(
  '/update',
  authMiddleware,
  videoProgressController.updateVideoProgress
);

// Get progress for a specific course
router.get(
  '/course/:courseId',
  authMiddleware,
  videoProgressController.getVideoProgress
);

// Get progress for a specific video in a course
router.get(
  '/course/:courseId/video/:videoLink',
  authMiddleware,
  videoProgressController.getVideoProgressByLink
);

// Get all video progress (admin only)
router.get(
  '/',
  authMiddleware,
  adminMiddleware,
  videoProgressController.getAllVideoProgress
);

// Get course video statistics (admin only)
router.get(
  '/statistics/:courseId',
  authMiddleware,
  adminMiddleware,
  videoProgressController.getCourseVideoStatistics
);

// Delete video progress (admin only)
router.delete(
  '/:progressId',
  authMiddleware,
  adminMiddleware,
  videoProgressController.deleteVideoProgress
);

module.exports = router;
