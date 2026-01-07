const express = require('express');
const router = express.Router();
const courseAuditController = require('../controllers/courseAuditController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Get course audit log (admin)
router.get('/:courseId/audit-log', authMiddleware, adminOnly, courseAuditController.getCourseAuditLog);

// Get video validation status
router.post('/validate-video', courseAuditController.getVideoValidationStatus);

module.exports = router;
