# 🚀 Cache Management Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies ✅

The required `node-cache` package has already been installed. You're ready to go!

**Optional**: For production Redis support:
```bash
cd backend
npm install redis
```

### Step 2: Configure (Optional) ⚙️

If using Redis, add to `backend/.env`:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD=your_password (if needed)
```

**Note**: If Redis is not configured, the system automatically uses in-memory caching.

### Step 3: Start the Application 🚀

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Admin Panel
cd admin-panel
npm run dev
```

### Step 4: Access Cache Management 🎯

Open your browser and navigate to:
```
http://localhost:3001/cache-management
```

**Login Credentials**: Use your admin credentials

## 🎮 How to Use

### Clear Cache via UI

1. **Navigate** to Cache Management page
2. **Click** the cache type you want to clear:
   - 🛍️ **Shop Cache** - Product listings and shop data
   - 📚 **Course Cache** - Course content and enrollments
   - 📦 **Order Cache** - Order information
   - 💳 **Payment Cache** - Payment transactions
   - ⚙️ **Admin Panel Cache** - Dashboard analytics
   - 🗑️ **Clear All** - Complete cache flush

3. **Monitor** real-time statistics in the dashboard

### Clear Cache via API

```bash
# Replace YOUR_ADMIN_TOKEN with actual token

# Clear shop cache
curl -X POST http://localhost:5000/api/cache/clear/shop \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Clear course cache
curl -X POST http://localhost:5000/api/cache/clear/courses \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Clear all cache
curl -X POST http://localhost:5000/api/cache/clear/all \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get cache statistics
curl http://localhost:5000/api/cache/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 🔧 Integration Examples

### Example 1: Add Caching to Course Routes

**File**: `backend/routes/courseRoutes.js`

```javascript
const { cachePresets, invalidateCache } = require('../middleware/cache');

// Add caching to GET routes
router.get('/', cachePresets.courses, courseController.getAllCourses);
router.get('/:id', cachePresets.courseDetail, courseController.getCourseById);

// Invalidate cache on mutations
router.post('/', 
  authMiddleware, 
  adminMiddleware, 
  invalidateCache('courses'),  // ← Add this line
  courseController.createCourse
);

router.put('/:id', 
  authMiddleware, 
  adminMiddleware, 
  invalidateCache('courses'),  // ← Add this line
  courseController.updateCourse
);
```

### Example 2: Add Caching to Product Routes

**File**: `backend/routes/productRoutes.js`

```javascript
const { cachePresets, invalidateCache } = require('../middleware/cache');

// Cache product listings
router.get('/', cachePresets.products, productController.getAllProducts);
router.get('/:id', cachePresets.productDetail, productController.getProductById);

// Invalidate multiple caches
router.post('/', 
  authMiddleware, 
  adminMiddleware, 
  invalidateCache(['products', 'shop']),  // ← Clear both
  productController.createProduct
);
```

### Example 3: Manual Cache in Controller

**File**: `backend/controllers/courseController.js`

```javascript
const cacheService = require('../services/cacheService');

exports.getAllCourses = async (req, res) => {
  try {
    const cacheKey = 'courses:all';
    
    // Try cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    // Fetch from database
    const courses = await Course.find();
    
    // Store in cache (5 minutes)
    await cacheService.set(cacheKey, courses, 300);
    
    res.json({ success: true, data: courses, cached: false });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

## 🧪 Testing

Run the automated test suite:

```bash
cd backend
node tests/cache.test.js
```

Expected output:
```
🧪 Cache System Tests
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Should set and get cache value
✓ Should return null for non-existent key
✓ Should delete cache key
...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Test Results
Passed: 16
Failed: 0
Success Rate: 100%
```

## 📊 Monitoring

### View Cache Statistics

The admin panel shows real-time statistics:
- **Hit Rate**: Cache efficiency (aim for >70%)
- **Total Hits**: Successful cache retrievals
- **Provider**: Redis or in-memory
- **Cached Keys**: Number of items in cache

### Check Health

```bash
curl http://localhost:5000/api/cache/health \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "healthy": true,
    "provider": "memory",
    "timestamp": "2026-01-23T13:50:07.000Z"
  }
}
```

## 🎯 Common Use Cases

### Use Case 1: After Updating Course Content

1. Admin updates course in admin panel
2. Click "Course Cache" → "Clear Cache"
3. Students immediately see updated content

### Use Case 2: After Adding New Products

1. Admin adds products to shop
2. Click "Shop Cache" → "Clear Cache"
3. New products appear on shop page instantly

### Use Case 3: After Order Status Change

1. Order status updated in database
2. Click "Order Cache" → "Clear Cache"
3. Customers see accurate order status

### Use Case 4: Troubleshooting Stale Data

1. User reports seeing old data
2. Click "Clear All Cache"
3. All data refreshes from database

## ⚡ Performance Tips

1. **Monitor Hit Rate**: Check cache statistics regularly
2. **Clear Selectively**: Don't clear all cache unnecessarily
3. **Use Redis in Production**: Much faster for distributed systems
4. **Adjust TTL Values**: Based on data update frequency
5. **Real-time Updates**: Socket.IO keeps all admins synchronized

## 🔒 Security Notes

- ✅ All cache endpoints require admin authentication
- ✅ Rate limiting prevents abuse (30 requests/minute)
- ✅ Only admins can manage cache
- ✅ Real-time updates via secure WebSocket

## 🐛 Troubleshooting

### Issue: Cache not clearing

**Solution**:
1. Check admin authentication token
2. Verify user has admin role
3. Check browser console for errors

### Issue: Statistics not showing

**Solution**:
1. Refresh the page
2. Check backend is running
3. Verify API endpoint is accessible

### Issue: Socket.IO not connecting

**Solution**:
1. Check backend server is running
2. Verify CORS settings
3. Look for connection status badge (should be green)

## 📚 Available Cache Types

| Type | What It Clears |
|------|----------------|
| `shop` | Products, categories, shop page data |
| `courses` | Course listings, details, enrollments |
| `orders` | Order listings and details |
| `payments` | Payment transactions |
| `admin` | Analytics, user data, dashboard stats |
| `all` | Everything |

## 🎨 API Endpoints Quick Reference

```
POST   /api/cache/clear/shop          Clear shop cache
POST   /api/cache/clear/courses       Clear course cache
POST   /api/cache/clear/orders        Clear order cache
POST   /api/cache/clear/payments      Clear payment cache
POST   /api/cache/clear/admin         Clear admin cache
POST   /api/cache/clear/all           Clear all cache
GET    /api/cache/stats               Get statistics
GET    /api/cache/health              Health check
```

**All require**: `Authorization: Bearer <admin_token>`

## ✅ Verification Checklist

- [ ] Backend server running on port 5000
- [ ] Admin panel running on port 3001
- [ ] Can access cache management page
- [ ] Can view cache statistics
- [ ] Can clear cache successfully
- [ ] Real-time updates working (green badge)
- [ ] No errors in browser console

## 🎉 Next Steps

1. ✅ **You're all set!** The cache system is ready to use
2. 📖 Read full documentation: `CACHE_MANAGEMENT_DOCUMENTATION.md`
3. 🔧 Integrate caching into your routes (see examples above)
4. 📊 Monitor cache performance regularly
5. 🚀 Consider Redis for production deployment

## 📞 Need Help?

- Check logs: `backend` console for detailed error messages
- Test API: Use curl or Postman to test endpoints
- Run tests: `node backend/tests/cache.test.js`
- Review docs: `CACHE_MANAGEMENT_DOCUMENTATION.md`

---

**Setup Time**: ~5 minutes  
**Difficulty**: Easy  
**Ready to use**: ✅ Yes!
