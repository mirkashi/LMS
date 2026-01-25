/**
 * Cache Service for LMS Application
 * Supports both Redis and in-memory caching with fallback
 * Provides comprehensive cache management for different data types
 */

const NodeCache = require('node-cache');

class CacheService {
  constructor() {
    // In-memory cache as fallback (always available)
    this.memoryCache = new NodeCache({
      stdTTL: 300, // 5 minutes default
      checkperiod: 60, // Check for expired keys every 60 seconds
      useClones: false, // Performance optimization
    });

    this.redisClient = null;
    this.useRedis = false;

    // Cache statistics
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      clears: 0,
    };

    // Cache key prefixes for different data types
    this.prefixes = {
      courses: 'courses:',
      courseDetail: 'course:',
      products: 'products:',
      productDetail: 'product:',
      orders: 'orders:',
      orderDetail: 'order:',
      payments: 'payments:',
      users: 'users:',
      enrollments: 'enrollments:',
      categories: 'categories:',
      analytics: 'analytics:',
      shop: 'shop:',
    };

    this.initializeRedis();
  }

  /**
   * Initialize Redis connection (optional)
   */
  async initializeRedis() {
    try {
      // Only attempt Redis if configured
      if (process.env.REDIS_URL || process.env.REDIS_HOST) {
        const redis = require('redis');
        
        const redisConfig = process.env.REDIS_URL 
          ? { url: process.env.REDIS_URL }
          : {
              host: process.env.REDIS_HOST || 'localhost',
              port: parseInt(process.env.REDIS_PORT || '6379'),
              password: process.env.REDIS_PASSWORD,
            };

        this.redisClient = redis.createClient(redisConfig);

        this.redisClient.on('error', (err) => {
          console.warn('⚠️ Redis Client Error:', err.message);
          this.useRedis = false;
        });

        this.redisClient.on('connect', () => {
          console.log('✅ Redis Cache Connected');
          this.useRedis = true;
        });

        await this.redisClient.connect();
      } else {
        console.log('ℹ️ Redis not configured, using in-memory cache');
      }
    } catch (error) {
      console.warn('⚠️ Redis initialization failed, using in-memory cache:', error.message);
      this.useRedis = false;
    }
  }

  /**
   * Get value from cache
   */
  async get(key) {
    try {
      let value = null;

      if (this.useRedis && this.redisClient) {
        value = await this.redisClient.get(key);
        if (value) {
          value = JSON.parse(value);
        }
      } else {
        value = this.memoryCache.get(key);
      }

      if (value) {
        this.stats.hits++;
        return value;
      }

      this.stats.misses++;
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key, value, ttl = 300) {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.setEx(key, ttl, JSON.stringify(value));
      } else {
        this.memoryCache.set(key, value, ttl);
      }
      this.stats.sets++;
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete specific key from cache
   */
  async del(key) {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.del(key);
      } else {
        this.memoryCache.del(key);
      }
      this.stats.deletes++;
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Delete all keys matching a pattern
   */
  async deletePattern(pattern) {
    try {
      let deletedCount = 0;

      if (this.useRedis && this.redisClient) {
        // Redis pattern matching
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(keys);
          deletedCount = keys.length;
        }
      } else {
        // Memory cache pattern matching
        const allKeys = this.memoryCache.keys();
        const matchingKeys = allKeys.filter(key => {
          const regex = new RegExp(pattern.replace('*', '.*'));
          return regex.test(key);
        });
        matchingKeys.forEach(key => this.memoryCache.del(key));
        deletedCount = matchingKeys.length;
      }

      this.stats.deletes += deletedCount;
      return deletedCount;
    } catch (error) {
      console.error('Cache deletePattern error:', error);
      return 0;
    }
  }

  /**
   * Clear all cache
   */
  async flushAll() {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.flushAll();
      } else {
        this.memoryCache.flushAll();
      }
      this.stats.clears++;
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  }

  /**
   * Clear cache by type
   */
  async clearByType(type) {
    const prefix = this.prefixes[type];
    if (!prefix) {
      throw new Error(`Invalid cache type: ${type}`);
    }

    const pattern = `${prefix}*`;
    const deletedCount = await this.deletePattern(pattern);
    
    return {
      success: true,
      type,
      deletedCount,
      message: `Cleared ${deletedCount} ${type} cache entries`,
    };
  }

  /**
   * Clear multiple cache types
   */
  async clearMultiple(types) {
    const results = [];
    
    for (const type of types) {
      try {
        const result = await this.clearByType(type);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          type,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Clear shop-related cache
   */
  async clearShopCache() {
    return this.clearMultiple(['products', 'productDetail', 'shop', 'categories']);
  }

  /**
   * Clear course-related cache
   */
  async clearCourseCache() {
    return this.clearMultiple(['courses', 'courseDetail', 'enrollments', 'categories']);
  }

  /**
   * Clear order-related cache
   */
  async clearOrderCache() {
    return this.clearMultiple(['orders', 'orderDetail']);
  }

  /**
   * Clear payment-related cache
   */
  async clearPaymentCache() {
    return this.clearMultiple(['payments', 'orders']);
  }

  /**
   * Clear admin panel cache
   */
  async clearAdminCache() {
    return this.clearMultiple(['analytics', 'users', 'enrollments']);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const memoryStats = this.memoryCache.getStats();
    
    return {
      provider: this.useRedis ? 'redis' : 'memory',
      connected: this.useRedis ? true : 'N/A',
      stats: {
        ...this.stats,
        keys: this.useRedis ? 'N/A' : memoryStats.keys,
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: this.stats.hits + this.stats.misses > 0 
          ? ((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100).toFixed(2) + '%'
          : '0%',
      },
      memoryUsage: this.useRedis ? 'N/A' : `${memoryStats.ksize} keys`,
    };
  }

  /**
   * Get all cache keys (for debugging)
   */
  async getAllKeys() {
    try {
      if (this.useRedis && this.redisClient) {
        return await this.redisClient.keys('*');
      } else {
        return this.memoryCache.keys();
      }
    } catch (error) {
      console.error('Get all keys error:', error);
      return [];
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const testKey = 'health:check';
      const testValue = { timestamp: Date.now() };
      
      await this.set(testKey, testValue, 10);
      const retrieved = await this.get(testKey);
      await this.del(testKey);

      return {
        healthy: retrieved !== null,
        provider: this.useRedis ? 'redis' : 'memory',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        healthy: false,
        provider: this.useRedis ? 'redis' : 'memory',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Singleton instance
const cacheService = new CacheService();

module.exports = cacheService;
