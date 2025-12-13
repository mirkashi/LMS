const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');

// Course management
router.post(
  '/courses',
  authMiddleware,
  adminMiddleware,
  uploadMiddleware.single('thumbnail'),
  adminController.createCourse
);

router.put(
  '/courses/:courseId',
  authMiddleware,
  adminMiddleware,
  uploadMiddleware.single('thumbnail'),
  adminController.updateCourse
);

router.delete(
  '/courses/:courseId',
  authMiddleware,
  adminMiddleware,
  adminController.deleteCourse
);

// Module management
router.post(
  '/courses/:courseId/modules',
  authMiddleware,
  adminMiddleware,
  adminController.addModule
);

// Lesson management
router.post(
  '/courses/:courseId/modules/:moduleIndex/lessons',
  authMiddleware,
  adminMiddleware,
  uploadMiddleware.fields([
    { name: 'video', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
  ]),
  adminController.addLesson
);

// Order management
router.get(
  '/orders',
  authMiddleware,
  adminMiddleware,
  adminController.getAllOrders
);

router.put(
  '/orders/:orderId',
  authMiddleware,
  adminMiddleware,
  adminController.updateOrderStatus
);

// Dashboard
router.get(
  '/dashboard/stats',
  authMiddleware,
  adminMiddleware,
  adminController.getDashboardStats
);

module.exports = router;
