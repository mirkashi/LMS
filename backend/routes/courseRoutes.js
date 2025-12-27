const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth');

router.get('/', courseController.getAllCourses);
router.get('/:id', optionalAuthMiddleware, courseController.getCourseById);
router.get('/:courseId/reviews', courseController.getCourseReviews);
router.post('/:courseId/reviews', authMiddleware, courseController.postReview);
router.post('/:courseId/enroll', authMiddleware, courseController.requestEnrollment);
router.get('/enrolled/list', authMiddleware, courseController.getUserEnrolledCourses);

module.exports = router;
