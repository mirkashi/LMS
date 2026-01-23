const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const adminController = require('../controllers/adminController');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');
const RateLimit = require('express-rate-limit');

const enrollmentRateLimiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 enrollment requests per window
});

const reviewRateLimiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 review requests per window
});

const courseDetailRateLimiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 course detail requests per window
});

const courseListRateLimiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 course list requests per window
});

const todayVideoLinkRateLimiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 daily video link (today) requests per window
});

router.get('/', courseListRateLimiter, courseController.getAllCourses);
router.get('/:id', courseDetailRateLimiter, optionalAuthMiddleware, courseController.getCourseById);
router.get('/:courseId/reviews', courseController.getCourseReviews);
router.post('/:courseId/reviews', reviewRateLimiter, authMiddleware, courseController.postReview);
router.post(
  '/:courseId/enroll',
  enrollmentRateLimiter,
  authMiddleware,
  uploadMiddleware.single('paymentProof'),
  courseController.requestEnrollment
);
router.get('/enrolled/list', authMiddleware, courseController.getUserEnrolledCourses);

// Public access to daily video links for enrolled students
router.get('/:courseId/daily-video-links', authMiddleware, adminController.getDailyVideoLinks);
router.get(
  '/:courseId/daily-video-links/today',
  todayVideoLinkRateLimiter,
  authMiddleware,
  adminController.getTodayVideoLink
);

module.exports = router;
