const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const orderController = require('../controllers/orderController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');

// User management
router.get(
  '/users',
  authMiddleware,
  adminMiddleware,
  adminController.getAllUsers
);

// Admin Profile
router.get(
  '/profile',
  authMiddleware,
  adminMiddleware,
  adminController.getProfile
);

router.put(
  '/profile',
  authMiddleware,
  adminMiddleware,
  adminController.updateProfile
);

router.post(
  '/verify-email-change',
  authMiddleware,
  adminMiddleware,
  adminController.verifyEmailChange
);

// Course management
router.post(
  '/courses',
  authMiddleware,
  adminMiddleware,
  uploadMiddleware.fields([
    { name: 'image', maxCount: 1 },
    { name: 'pdfFiles', maxCount: 10 }
  ]),
  adminController.createCourse
);

router.put(
  '/courses/:courseId',
  authMiddleware,
  adminMiddleware,
  uploadMiddleware.fields([
    { name: 'image', maxCount: 1 },
    { name: 'pdfFiles', maxCount: 10 }
  ]),
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

router.post(
  '/orders/bulk-update',
  authMiddleware,
  adminMiddleware,
  orderController.bulkUpdateOrderStatus
);

// Product management
router.post(
  '/products',
  authMiddleware,
  adminMiddleware,
  uploadMiddleware.single('image'),
  adminController.createProduct
);

router.get(
  '/products',
  authMiddleware,
  adminMiddleware,
  adminController.getAllProducts
);

router.put(
  '/products/:productId',
  authMiddleware,
  adminMiddleware,
  uploadMiddleware.single('image'),
  adminController.updateProduct
);

router.delete(
  '/products/:productId',
  authMiddleware,
  adminMiddleware,
  adminController.deleteProduct
);

// Dashboard
router.get(
  '/dashboard/stats',
  authMiddleware,
  adminMiddleware,
  adminController.getDashboardStats
);

module.exports = router;
