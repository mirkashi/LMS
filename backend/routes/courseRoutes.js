const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.get('/:courseId/reviews', courseController.getCourseReviews);
router.post('/:courseId/reviews', authMiddleware, courseController.postReview);
router.post('/:courseId/enroll', authMiddleware, courseController.enrollCourse);
router.get('/enrolled/list', authMiddleware, courseController.getUserEnrolledCourses);

module.exports = router;
