/**
 * Cache Management Routes
 * Protected routes for admin cache management
 */

const express = require('express');
const router = express.Router();
const cacheController = require('../controllers/cacheController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for cache operations (prevent abuse)
const cacheLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per minute
  message: 'Too many cache operations, please try again later',
});

// Apply rate limiting, authentication and admin middleware to all routes
router.use(cacheLimiter);
router.use(authMiddleware);
router.use(adminMiddleware);

// Clear cache by category
router.post('/clear/shop', cacheController.clearShopCache);
router.post('/clear/courses', cacheController.clearCourseCache);
router.post('/clear/orders', cacheController.clearOrderCache);
router.post('/clear/payments', cacheController.clearPaymentCache);
router.post('/clear/admin', cacheController.clearAdminCache);
router.post('/clear/all', cacheController.clearAllCache);

// Clear cache by specific type
router.post('/clear/type/:type', cacheController.clearCacheByType);

// Clear multiple cache types at once
router.post('/clear/multiple', cacheController.clearMultipleCache);

// Cache statistics and monitoring
router.get('/stats', cacheController.getCacheStats);
router.get('/health', cacheController.getCacheHealth);

// Debug endpoint (development only)
router.get('/keys', cacheController.getAllCacheKeys);

module.exports = router;
