const express = require('express');
const router = express.Router();
const courseAuditController = require('../controllers/courseAuditController');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiter for course audit log route to mitigate potential DoS via heavy DB access
const courseAuditRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs for this route
  standardHeaders: true,
  legacyHeaders: false,
});

// Get course audit log (admin)
router.get(
  '/:courseId/audit-log',
  courseAuditRateLimiter,
  authMiddleware,
  adminOnly,
  courseAuditController.getCourseAuditLog
);

// Get video validation status
router.post('/validate-video', courseAuditRateLimiter, courseAuditController.getVideoValidationStatus);

module.exports = router;
