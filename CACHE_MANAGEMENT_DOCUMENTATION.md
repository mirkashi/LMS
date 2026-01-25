# Cache Management System Documentation

## 🎯 Overview

The Cache Management System provides a comprehensive solution for managing cached data in your LMS application. It enables administrators to efficiently clear various types of cache through an intuitive admin panel interface, ensuring that users always see the most up-to-date content.

## ✨ Features

### Backend Features
- **Dual Cache Support**: Redis for production environments and in-memory caching as fallback
- **Granular Cache Control**: Clear specific cache types or all cache at once
- **Pattern-Based Clearing**: Delete cache keys matching specific patterns
- **Cache Statistics**: Real-time monitoring of cache hits, misses, and performance
- **Automatic Cache Middleware**: Easy-to-use middleware for caching API responses
- **Cache Invalidation**: Automatic cache invalidation after data mutations
- **Health Monitoring**: Built-in health check for cache system status
- **Security**: Protected routes with admin authentication and rate limiting

### Frontend Features
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- **Real-time Updates**: Socket.IO integration for live cache clear notifications
- **Visual Feedback**: Loading states, animations, and success/error messages
- **Cache Statistics Dashboard**: Visual representation of cache performance
- **Timestamp Tracking**: See when each cache type was last cleared
- **One-Click Actions**: Easy-to-use buttons for clearing different cache types

## 📁 File Structure

```
backend/
├── services/
│   └── cacheService.js          # Core cache service (Redis + memory)
├── controllers/
│   └── cacheController.js       # Cache management endpoints
├── routes/
│   └── cacheRoutes.js          # API routes for cache operations
├── middleware/
│   └── cache.js                # Cache middleware for automatic caching
└── utils/
    └── cacheExamples.js        # Usage examples and integration guide

admin-panel/
├── app/
│   └── cache-management/
│       └── page.tsx            # Cache management UI
└── hooks/
    └── useCacheSocket.ts       # Socket.IO hook for real-time updates
```

## 🚀 Quick Start

### 1. Install Dependencies

The `node-cache` package has been automatically installed. For Redis support (optional):

```bash
cd backend
npm install redis
```

### 2. Configure Environment Variables

Add to your `backend/.env` file:

```env
# Redis Configuration (Optional - uses in-memory cache if not configured)
REDIS_URL=redis://localhost:6379
# OR
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

### 3. Start the Application

```bash
# Backend
cd backend
npm run dev

# Admin Panel
cd admin-panel
npm run dev
```

### 4. Access Cache Management

Navigate to: `http://localhost:3001/cache-management`

## 📚 API Reference

### Cache Management Endpoints

All endpoints require authentication with admin privileges.

#### Clear Shop Cache
```http
POST /api/cache/clear/shop
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "message": "Shop cache cleared successfully",
  "results": [...],
  "timestamp": "2026-01-23T13:50:07.000Z"
}
```

#### Clear Course Cache
```http
POST /api/cache/clear/courses
Authorization: Bearer <admin_token>
```

#### Clear Order Cache
```http
POST /api/cache/clear/orders
Authorization: Bearer <admin_token>
```

#### Clear Payment Cache
```http
POST /api/cache/clear/payments
Authorization: Bearer <admin_token>
```

#### Clear Admin Panel Cache
```http
POST /api/cache/clear/admin
Authorization: Bearer <admin_token>
```

#### Clear All Cache
```http
POST /api/cache/clear/all
Authorization: Bearer <admin_token>
```

#### Clear Specific Cache Type
```http
POST /api/cache/clear/type/:type
Authorization: Bearer <admin_token>

Parameters:
- type: courses, products, orders, payments, users, enrollments, categories, analytics, shop
```

#### Clear Multiple Cache Types
```http
POST /api/cache/clear/multiple
Authorization: Bearer <admin_token>
Content-Type: application/json

Body:
{
  "types": ["courses", "products", "shop"]
}
```

#### Get Cache Statistics
```http
GET /api/cache/stats
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "data": {
    "provider": "redis",
    "connected": true,
    "stats": {
      "hits": 1250,
      "misses": 324,
      "sets": 892,
      "deletes": 45,
      "clears": 3,
      "keys": 127,
      "hitRate": "79.42%"
    },
    "memoryUsage": "N/A"
  },
  "timestamp": "2026-01-23T13:50:07.000Z"
}
```

#### Health Check
```http
GET /api/cache/health
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "data": {
    "healthy": true,
    "provider": "redis",
    "timestamp": "2026-01-23T13:50:07.000Z"
  }
}
```

## 🔧 Integration Guide

### Method 1: Using Cache Middleware (Recommended)

Add automatic caching to your routes:

```javascript
// routes/courseRoutes.js
const { cachePresets, invalidateCache } = require('../middleware/cache');

// Apply caching to GET routes
router.get('/', cachePresets.courses, courseController.getAllCourses);
router.get('/:id', cachePresets.courseDetail, courseController.getCourseById);

// Invalidate cache after mutations
router.post('/', 
  authMiddleware, 
  adminMiddleware, 
  invalidateCache('courses'), 
  courseController.createCourse
);

router.put('/:id', 
  authMiddleware, 
  adminMiddleware, 
  invalidateCache('courses'), 
  courseController.updateCourse
);

router.delete('/:id', 
  authMiddleware, 
  adminMiddleware, 
  invalidateCache('courses'), 
  courseController.deleteCourse
);
```

### Method 2: Manual Cache Management

Use the cache service directly in controllers:

```javascript
// controllers/courseController.js
const cacheService = require('../services/cacheService');

exports.getAllCourses = async (req, res) => {
  try {
    const cacheKey = 'courses:all';
    
    // Try to get from cache
    const cachedCourses = await cacheService.get(cacheKey);
    if (cachedCourses) {
      return res.json({
        success: true,
        data: cachedCourses,
        cached: true
      });
    }

    // Fetch from database
    const courses = await Course.find();
    
    // Store in cache (300 seconds = 5 minutes)
    await cacheService.set(cacheKey, courses, 300);
    
    res.json({
      success: true,
      data: courses,
      cached: false
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
```

### Method 3: Custom Cache Middleware

Create custom caching logic:

```javascript
const { cacheMiddleware } = require('../middleware/cache');

// User-specific caching
const userCache = cacheMiddleware('user:', 300, (req) => {
  return `user:${req.user.id}:enrollments`;
});

router.get('/my-enrollments', authMiddleware, userCache, controller.getMyEnrollments);
```

## 🎨 Cache Types Reference

| Type | Prefix | Description | TTL |
|------|--------|-------------|-----|
| **courses** | `courses:` | Course listings and filters | 300s |
| **courseDetail** | `course:` | Individual course details | 300s |
| **products** | `products:` | Product listings and filters | 300s |
| **productDetail** | `product:` | Individual product details | 300s |
| **orders** | `orders:` | Order listings | 120s |
| **orderDetail** | `order:` | Individual order details | 120s |
| **payments** | `payments:` | Payment transaction data | 120s |
| **users** | `users:` | User data and profiles | 300s |
| **enrollments** | `enrollments:` | Enrollment records | 300s |
| **categories** | `categories:` | Course/product categories | 600s |
| **analytics** | `analytics:` | Dashboard analytics | 300s |
| **shop** | `shop:` | Shop page data | 300s |

## 🔒 Security Features

1. **Authentication Required**: All cache endpoints require valid admin authentication
2. **Rate Limiting**: 30 requests per minute per IP to prevent abuse
3. **Admin-Only Access**: Only users with admin privileges can manage cache
4. **Secure Socket.IO**: Real-time updates use secure WebSocket connections
5. **Debug Endpoints**: Key listing only available in development mode

## 📊 Monitoring & Statistics

The cache management system provides comprehensive statistics:

- **Hit Rate**: Percentage of cache hits vs misses
- **Total Hits**: Number of successful cache retrievals
- **Total Misses**: Number of cache misses
- **Cache Provider**: Redis or in-memory
- **Connection Status**: Real-time connection health
- **Key Count**: Number of cached items
- **Operations Count**: Sets, deletes, and clears

## 🎯 Best Practices

### 1. Cache Invalidation Strategy

```javascript
// After creating/updating a course
router.post('/courses', 
  authMiddleware,
  adminMiddleware,
  invalidateCache(['courses', 'courseDetail', 'categories']),
  courseController.createCourse
);
```

### 2. Appropriate TTL Settings

- **Static data** (categories): 600s (10 minutes)
- **Semi-static data** (courses, products): 300s (5 minutes)
- **Dynamic data** (orders, payments): 120s (2 minutes)
- **Real-time data**: Don't cache or use very short TTL (30s)

### 3. Skip Cache When Needed

```javascript
// User explicitly requests fresh data
GET /api/courses?nocache=true

// Or in headers
X-No-Cache: true
```

### 4. Monitoring

Regularly check cache statistics to:
- Monitor hit rates (aim for >70%)
- Identify frequently missed cache keys
- Optimize TTL values based on usage patterns

## 🐛 Troubleshooting

### Cache Not Working

1. **Check Redis Connection**:
   ```bash
   # Test Redis connection
   redis-cli ping
   # Should return: PONG
   ```

2. **Verify Configuration**:
   - Check `.env` file for correct Redis settings
   - Confirm backend server has access to Redis

3. **Check Logs**:
   - Look for "✅ Redis Cache Connected" in backend logs
   - If Redis fails, system falls back to in-memory cache

### Cache Not Clearing

1. **Authentication Issues**:
   - Verify admin token is valid
   - Check user has admin privileges

2. **Rate Limiting**:
   - Wait 1 minute if rate limit is exceeded
   - Check rate limit headers in response

3. **Check Backend Logs**:
   - Look for error messages
   - Verify route is being called

### Socket.IO Not Connecting

1. **CORS Configuration**:
   - Ensure Socket.IO CORS settings allow admin panel origin
   - Check firewall rules

2. **Network Issues**:
   - Verify backend is running
   - Test WebSocket connectivity

## 🔄 Real-time Updates

The system uses Socket.IO for real-time notifications:

```typescript
// Automatic in cache management page
import { useCacheSocket } from '@/hooks/useCacheSocket';

const { isConnected, lastEvent } = useCacheSocket();

// lastEvent contains:
{
  type: 'courses',
  timestamp: '2026-01-23T13:50:07.000Z',
  admin: 'admin_user_id'
}
```

## 📈 Performance Tips

1. **Use Redis in Production**: Much faster than in-memory cache for distributed systems
2. **Monitor Hit Rates**: Aim for >70% cache hit rate
3. **Optimize TTL**: Balance freshness vs performance
4. **Clear Selectively**: Don't clear all cache unless necessary
5. **Use Pattern Clearing**: Clear related caches together

## 🔮 Future Enhancements

Potential improvements for future versions:

- [ ] Cache warming strategies
- [ ] Scheduled cache clearing
- [ ] Cache size limits and eviction policies
- [ ] Multi-level caching (L1/L2)
- [ ] Cache compression
- [ ] Advanced analytics and reporting
- [ ] Cache versioning
- [ ] A/B testing support

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend logs for errors
3. Verify all dependencies are installed
4. Ensure environment variables are set correctly

## 📄 License

This cache management system is part of the LMS application and follows the same license.

---

**Last Updated**: January 23, 2026  
**Version**: 1.0.0  
**Compatible with**: Node.js 18+, Redis 6+
