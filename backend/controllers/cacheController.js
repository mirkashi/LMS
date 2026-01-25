/**
 * Cache Controller
 * Handles all cache management operations for admin panel
 */

const cacheService = require('../services/cacheService');

/**
 * Clear shop cache
 */
exports.clearShopCache = async (req, res) => {
  try {
    const results = await cacheService.clearShopCache();
    
    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('cache:cleared', {
        type: 'shop',
        timestamp: new Date().toISOString(),
        admin: req.user.id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Shop cache cleared successfully',
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Clear shop cache error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear shop cache',
      error: error.message,
    });
  }
};

/**
 * Clear course cache
 */
exports.clearCourseCache = async (req, res) => {
  try {
    const results = await cacheService.clearCourseCache();
    
    const io = req.app.get('io');
    if (io) {
      io.emit('cache:cleared', {
        type: 'courses',
        timestamp: new Date().toISOString(),
        admin: req.user.id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course cache cleared successfully',
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Clear course cache error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear course cache',
      error: error.message,
    });
  }
};

/**
 * Clear order cache
 */
exports.clearOrderCache = async (req, res) => {
  try {
    const results = await cacheService.clearOrderCache();
    
    const io = req.app.get('io');
    if (io) {
      io.emit('cache:cleared', {
        type: 'orders',
        timestamp: new Date().toISOString(),
        admin: req.user.id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order cache cleared successfully',
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Clear order cache error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear order cache',
      error: error.message,
    });
  }
};

/**
 * Clear payment cache
 */
exports.clearPaymentCache = async (req, res) => {
  try {
    const results = await cacheService.clearPaymentCache();
    
    const io = req.app.get('io');
    if (io) {
      io.emit('cache:cleared', {
        type: 'payments',
        timestamp: new Date().toISOString(),
        admin: req.user.id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment cache cleared successfully',
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Clear payment cache error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear payment cache',
      error: error.message,
    });
  }
};

/**
 * Clear admin panel cache
 */
exports.clearAdminCache = async (req, res) => {
  try {
    const results = await cacheService.clearAdminCache();
    
    const io = req.app.get('io');
    if (io) {
      io.emit('cache:cleared', {
        type: 'admin',
        timestamp: new Date().toISOString(),
        admin: req.user.id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admin panel cache cleared successfully',
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Clear admin cache error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear admin panel cache',
      error: error.message,
    });
  }
};

/**
 * Clear all cache
 */
exports.clearAllCache = async (req, res) => {
  try {
    await cacheService.flushAll();
    
    const io = req.app.get('io');
    if (io) {
      io.emit('cache:cleared', {
        type: 'all',
        timestamp: new Date().toISOString(),
        admin: req.user.id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'All cache cleared successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Clear all cache error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear all cache',
      error: error.message,
    });
  }
};

/**
 * Clear specific cache by type
 */
exports.clearCacheByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    const result = await cacheService.clearByType(type);
    
    const io = req.app.get('io');
    if (io) {
      io.emit('cache:cleared', {
        type,
        timestamp: new Date().toISOString(),
        admin: req.user.id,
      });
    }

    res.status(200).json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Clear cache by type error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Clear multiple cache types
 */
exports.clearMultipleCache = async (req, res) => {
  try {
    const { types } = req.body;
    
    if (!Array.isArray(types) || types.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Types must be a non-empty array',
      });
    }

    const results = await cacheService.clearMultiple(types);
    
    const io = req.app.get('io');
    if (io) {
      io.emit('cache:cleared', {
        type: 'multiple',
        types,
        timestamp: new Date().toISOString(),
        admin: req.user.id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Multiple cache types cleared',
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Clear multiple cache error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear multiple cache types',
      error: error.message,
    });
  }
};

/**
 * Get cache statistics
 */
exports.getCacheStats = async (req, res) => {
  try {
    const stats = cacheService.getStats();
    
    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get cache stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cache statistics',
      error: error.message,
    });
  }
};

/**
 * Get cache health status
 */
exports.getCacheHealth = async (req, res) => {
  try {
    const health = await cacheService.healthCheck();
    
    res.status(health.healthy ? 200 : 503).json({
      success: health.healthy,
      data: health,
    });
  } catch (error) {
    console.error('Cache health check error:', error);
    res.status(503).json({
      success: false,
      message: 'Cache health check failed',
      error: error.message,
    });
  }
};

/**
 * Get all cache keys (debugging only)
 */
exports.getAllCacheKeys = async (req, res) => {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'This endpoint is only available in development mode',
      });
    }

    const keys = await cacheService.getAllKeys();
    
    res.status(200).json({
      success: true,
      count: keys.length,
      keys,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get all cache keys error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cache keys',
      error: error.message,
    });
  }
};

module.exports = exports;
