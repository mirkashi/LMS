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

router.delete(
  '/users/:userId',
  authMiddleware,
  adminMiddleware,
  adminController.deleteUser
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
router.get(
  '/courses',
  authMiddleware,
  adminMiddleware,
  adminController.getAllCourses
);

router.get(
  '/courses/:courseId',
  authMiddleware,
  adminMiddleware,
  adminController.getCourseById
);

router.post(
  '/courses',
  authMiddleware,
  adminMiddleware,
  uploadMiddleware.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
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
    { name: 'video', maxCount: 1 },
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

// Update lesson release date
router.patch(
  '/courses/:courseId/modules/:moduleIndex/lessons/:lessonIndex/release-date',
  authMiddleware,
  adminMiddleware,
  adminController.updateLessonReleaseDate
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
  uploadMiddleware.array('images', 10),
  adminController.createProduct
);

router.get(
  '/products',
  authMiddleware,
  adminMiddleware,
  adminController.getAllProducts
);

router.get(
  '/products/:productId',
  authMiddleware,
  adminMiddleware,
  adminController.getProductById
);

router.put(
  '/products/:productId',
  authMiddleware,
  adminMiddleware,
  uploadMiddleware.array('images', 10),
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

// Enrollment management
router.get(
  '/enrollments',
  authMiddleware,
  adminMiddleware,
  adminController.getAllEnrollments
);

router.get(
  '/enrollments/:enrollmentId',
  authMiddleware,
  adminMiddleware,
  adminController.getEnrollmentById
);

router.put(
  '/enrollments/:enrollmentId/approve',
  authMiddleware,
  adminMiddleware,
  adminController.approveEnrollment
);

router.put(
  '/enrollments/:enrollmentId/reject',
  authMiddleware,
  adminMiddleware,
  adminController.rejectEnrollment
);

// Category management
router.get(
  '/categories',
  authMiddleware,
  adminMiddleware,
  adminController.getAllCategories
);

router.get(
  '/categories/:id',
  authMiddleware,
  adminMiddleware,
  adminController.getCategory
);

router.post(
  '/categories',
  authMiddleware,
  adminMiddleware,
  adminController.createCategory
);

router.put(
  '/categories/:id',
  authMiddleware,
  adminMiddleware,
  adminController.updateCategory
);

router.delete(
  '/categories/:id',
  authMiddleware,
  adminMiddleware,
  adminController.deleteCategory
);

router.post(
  '/categories/update-counts',
  authMiddleware,
  adminMiddleware,
  adminController.updateCategoryCounts
);

module.exports = router;

