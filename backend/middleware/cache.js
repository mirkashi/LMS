/**
 * Cache Middleware
 * Automatic caching middleware for API routes
 */

const cacheService = require('../services/cacheService');

/**
 * Cache middleware factory
 * @param {string} prefix - Cache key prefix
 * @param {number} ttl - Time to live in seconds (default 300 = 5 minutes)
 * @param {function} keyGenerator - Function to generate cache key from request
 */
const cacheMiddleware = (prefix, ttl = 300, keyGenerator = null) => {
  return async (req, res, next) => {
    // Skip cache for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip cache if explicitly disabled
    if (req.query.nocache === 'true' || req.headers['x-no-cache'] === 'true') {
      return next();
    }

    try {
      // Generate cache key
      let cacheKey;
      if (keyGenerator) {
        cacheKey = keyGenerator(req);
      } else {
        // Default key generation: prefix + route + query params
        const queryString = JSON.stringify(req.query);
        cacheKey = `${prefix}${req.path}:${queryString}`;
      }

      // Try to get from cache
      const cachedData = await cacheService.get(cacheKey);

      if (cachedData) {
        console.log(`✅ Cache HIT: ${cacheKey}`);
        return res.status(200).json({
          ...cachedData,
          _cached: true,
          _cacheKey: cacheKey,
        });
      }

      console.log(`❌ Cache MISS: ${cacheKey}`);

      // Store original res.json function
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = async (body) => {
        // Only cache successful responses
        if (res.statusCode === 200 && body.success !== false) {
          await cacheService.set(cacheKey, body, ttl);
          console.log(`💾 Cached: ${cacheKey} (TTL: ${ttl}s)`);
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      // Continue without caching on error
      next();
    }
  };
};

/**
 * Predefined cache middleware for common routes
 */
const cachePresets = {
  // Cache courses list for 5 minutes
  courses: cacheMiddleware('courses:', 300, (req) => {
    const { category, level, search, page } = req.query;
    return `courses:list:${category || 'all'}:${level || 'all'}:${search || ''}:${page || 1}`;
  }),

  // Cache course detail for 5 minutes
  courseDetail: cacheMiddleware('course:', 300, (req) => {
    return `course:${req.params.id || req.params.courseId}`;
  }),

  // Cache products list for 5 minutes
  products: cacheMiddleware('products:', 300, (req) => {
    const { category, sort, search, page } = req.query;
    return `products:list:${category || 'all'}:${sort || 'default'}:${search || ''}:${page || 1}`;
  }),

  // Cache product detail for 5 minutes
  productDetail: cacheMiddleware('product:', 300, (req) => {
    return `product:${req.params.id || req.params.productId}`;
  }),

  // Cache orders list for 2 minutes (more dynamic)
  orders: cacheMiddleware('orders:', 120, (req) => {
    const { status, page } = req.query;
    return `orders:list:${req.user.id}:${status || 'all'}:${page || 1}`;
  }),

  // Cache categories for 10 minutes (rarely changes)
  categories: cacheMiddleware('categories:', 600, () => {
    return 'categories:list';
  }),

  // Cache analytics for 5 minutes
  analytics: cacheMiddleware('analytics:', 300, (req) => {
    const { period, type } = req.query;
    return `analytics:${type || 'all'}:${period || 'week'}`;
  }),

  // Cache shop page for 5 minutes
  shop: cacheMiddleware('shop:', 300, (req) => {
    const { category, page, sort } = req.query;
    return `shop:${category || 'all'}:${page || 1}:${sort || 'default'}`;
  }),
};

/**
 * Invalidate cache after mutations
 */
const invalidateCache = (types) => {
  return async (req, res, next) => {
    // Store original response methods
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    // Create wrapper function
    const sendResponse = async (body) => {
      // Only invalidate on successful mutations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          if (Array.isArray(types)) {
            await cacheService.clearMultiple(types);
            console.log(`🗑️ Invalidated cache: ${types.join(', ')}`);
          } else {
            await cacheService.clearByType(types);
            console.log(`🗑️ Invalidated cache: ${types}`);
          }
        } catch (error) {
          console.error('Cache invalidation error:', error);
        }
      }
      return body;
    };

    // Override both json and send methods
    res.json = async (body) => {
      await sendResponse(body);
      return originalJson(body);
    };

    res.send = async (body) => {
      await sendResponse(body);
      return originalSend(body);
    };

    next();
  };
};

module.exports = {
  cacheMiddleware,
  cachePresets,
  invalidateCache,
};
