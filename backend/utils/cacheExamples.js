/**
 * Cache Usage Examples
 * Demonstrates how to integrate caching into existing routes
 */

const { cachePresets, invalidateCache } = require('../middleware/cache');

/**
 * Example 1: Add caching to course routes
 * File: backend/routes/courseRoutes.js
 * 
 * const { cachePresets, invalidateCache } = require('../middleware/cache');
 * 
 * // GET routes - apply caching
 * router.get('/', cachePresets.courses, courseController.getAllCourses);
 * router.get('/:id', cachePresets.courseDetail, courseController.getCourseById);
 * 
 * // POST/PUT/DELETE routes - invalidate cache after mutations
 * router.post('/', authMiddleware, adminMiddleware, invalidateCache('courses'), courseController.createCourse);
 * router.put('/:id', authMiddleware, adminMiddleware, invalidateCache('courses'), courseController.updateCourse);
 * router.delete('/:id', authMiddleware, adminMiddleware, invalidateCache('courses'), courseController.deleteCourse);
 */

/**
 * Example 2: Add caching to product routes
 * File: backend/routes/productRoutes.js
 * 
 * const { cachePresets, invalidateCache } = require('../middleware/cache');
 * 
 * // GET routes - apply caching
 * router.get('/', cachePresets.products, productController.getAllProducts);
 * router.get('/:id', cachePresets.productDetail, productController.getProductById);
 * 
 * // POST/PUT/DELETE routes - invalidate cache after mutations
 * router.post('/', authMiddleware, adminMiddleware, invalidateCache(['products', 'shop']), productController.createProduct);
 * router.put('/:id', authMiddleware, adminMiddleware, invalidateCache(['products', 'shop']), productController.updateProduct);
 * router.delete('/:id', authMiddleware, adminMiddleware, invalidateCache(['products', 'shop']), productController.deleteProduct);
 */

/**
 * Example 3: Manual cache usage in controller
 * File: backend/controllers/courseController.js
 * 
 * const cacheService = require('../services/cacheService');
 * 
 * exports.getAllCourses = async (req, res) => {
 *   try {
 *     // Try to get from cache first
 *     const cacheKey = 'courses:all';
 *     const cachedCourses = await cacheService.get(cacheKey);
 *     
 *     if (cachedCourses) {
 *       return res.json({
 *         success: true,
 *         data: cachedCourses,
 *         cached: true
 *       });
 *     }
 * 
 *     // Fetch from database
 *     const courses = await Course.find();
 *     
 *     // Store in cache (5 minutes)
 *     await cacheService.set(cacheKey, courses, 300);
 *     
 *     res.json({
 *       success: true,
 *       data: courses,
 *       cached: false
 *     });
 *   } catch (error) {
 *     res.status(500).json({ success: false, message: error.message });
 *   }
 * };
 */

/**
 * Example 4: Conditional caching
 * 
 * const cacheService = require('../services/cacheService');
 * 
 * exports.getAnalytics = async (req, res) => {
 *   try {
 *     const { refresh } = req.query;
 *     const cacheKey = 'analytics:dashboard';
 *     
 *     // Skip cache if refresh requested
 *     if (!refresh) {
 *       const cached = await cacheService.get(cacheKey);
 *       if (cached) {
 *         return res.json({ success: true, data: cached, cached: true });
 *       }
 *     }
 *     
 *     // Generate analytics
 *     const analytics = await generateAnalytics();
 *     
 *     // Cache for 5 minutes
 *     await cacheService.set(cacheKey, analytics, 300);
 *     
 *     res.json({ success: true, data: analytics, cached: false });
 *   } catch (error) {
 *     res.status(500).json({ success: false, message: error.message });
 *   }
 * };
 */

/**
 * Example 5: Custom cache key generation
 * 
 * const { cacheMiddleware } = require('../middleware/cache');
 * 
 * // Cache based on user and query parameters
 * const userSpecificCache = cacheMiddleware('user:', 300, (req) => {
 *   const userId = req.user.id;
 *   const filters = JSON.stringify(req.query);
 *   return `user:${userId}:data:${filters}`;
 * });
 * 
 * router.get('/my-data', authMiddleware, userSpecificCache, controller.getMyData);
 */

module.exports = {
  // Export example middleware configurations
  exampleCourseCache: cachePresets.courses,
  exampleProductCache: cachePresets.products,
};
