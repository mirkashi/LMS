# Dual Database Implementation Guide

## ✅ Completed Setup

Your LMS is now configured with a dual-database system:

### 1. **PostgreSQL Connected** ✅
- Database: `ebay lms`
- Host: `localhost:5432`
- Status: Running and synchronized

### 2. **Models Created** ✅
- `ProductImage` - Product image metadata
- `CourseVideo` - Course video metadata
- `CourseResource` - Course resources (PDF, documents)
- `MediaStorage` - Generic media storage

### 3. **Utilities Available** ✅
- All media utilities in `backend/utils/postgresMediaUtils.js`
- Functions for saving, retrieving, and managing media

---

## 📋 What to Do Next

### Step 1: Integrate with Product Routes

In `backend/routes/productRoutes.js`, add image handling:

```javascript
// At the top of the file
const postgresMediaUtils = require('../utils/postgresMediaUtils');

// When creating a product with images
router.post('/', authMiddleware, async (req, res) => {
  try {
    const product = new Product({...req.body});
    const savedProduct = await product.save();

    // Save images to PostgreSQL
    const sequelize = req.app.get('sequelize');
    if (sequelize && req.body.images) {
      for (const imageUrl of req.body.images) {
        await postgresMediaUtils.saveProductImage(sequelize, {
          mongoProductId: savedProduct._id.toString(),
          imageUrl,
          storageType: 'local',
          uploadedBy: req.user.userId,
        });
      }
    }

    res.status(201).json({success: true, data: savedProduct});
  } catch (error) {
    res.status(500).json({success: false, error: error.message});
  }
});

// Get product with images
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    const sequelize = req.app.get('sequelize');
    let images = [];

    if (sequelize) {
      images = await postgresMediaUtils.getProductImages(
        sequelize, 
        req.params.id
      );
    }

    res.status(200).json({
      success: true,
      data: {product, images}
    });
  } catch (error) {
    res.status(500).json({success: false, error: error.message});
  }
});
```

### Step 2: Integrate with Course Routes

In `backend/routes/courseRoutes.js`, add video handling:

```javascript
// At the top
const postgresMediaUtils = require('../utils/postgresMediaUtils');

// Upload course intro video
router.post('/:id/intro-video', authMiddleware, async (req, res) => {
  try {
    const {videoUrl, duration} = req.body;
    const sequelize = req.app.get('sequelize');

    if (!sequelize) {
      return res.status(503).json({
        success: false, 
        message: 'PostgreSQL not available'
      });
    }

    const video = await postgresMediaUtils.saveCourseVideo(sequelize, {
      mongoCourseId: req.params.id,
      videoType: 'intro',
      videoUrl,
      duration,
      uploadedBy: req.user.userId,
    });

    res.status(201).json({success: true, data: video});
  } catch (error) {
    res.status(500).json({success: false, error: error.message});
  }
});

// Get all course videos
router.get('/:id/videos', async (req, res) => {
  try {
    const sequelize = req.app.get('sequelize');
    
    if (!sequelize) {
      return res.status(200).json({success: true, data: []});
    }

    const videos = await postgresMediaUtils.getCourseVideos(
      sequelize, 
      req.params.id
    );

    res.status(200).json({success: true, count: videos.length, data: videos});
  } catch (error) {
    res.status(500).json({success: false, error: error.message});
  }
});
```

### Step 3: Test the Integration

Run the server and test with curl:

```bash
# Start the server
npm run dev

# Test: Create a product
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Laptop",
    "price": 1200,
    "category": "Electronics",
    "images": ["https://example.com/image1.jpg"]
  }'

# Test: Get product with images
curl http://localhost:5000/api/products/PRODUCT_ID
```

### Step 4: Update Admin Routes (Optional)

Add media management to admin routes for managing images/videos:

```javascript
// Admin: Get all product images
router.get('/admin/products/:id/images', adminMiddleware, async (req, res) => {
  try {
    const sequelize = req.app.get('sequelize');
    const images = await postgresMediaUtils.getProductImages(
      sequelize, 
      req.params.id
    );
    res.status(200).json({success: true, data: images});
  } catch (error) {
    res.status(500).json({success: false, error: error.message});
  }
});

// Admin: Delete image
router.delete('/admin/images/:id', adminMiddleware, async (req, res) => {
  try {
    const sequelize = req.app.get('sequelize');
    await postgresMediaUtils.deleteMedia(sequelize, req.params.id);
    res.status(200).json({success: true, message: 'Image deleted'});
  } catch (error) {
    res.status(500).json({success: false, error: error.message});
  }
});
```

---

## 🗄️ Database Distribution Reference

### MongoDB (Lightweight Metadata)
```javascript
Product {
  name: String,
  description: String,
  price: Number,
  category: String,
  stock: Number,
  rating: Number,
  createdBy: ObjectId,
  images: [String] // URLs only, not heavy files
}

Course {
  title: String,
  description: String,
  price: Number,
  category: String,
  instructor: ObjectId,
  students: [ObjectId],
  modules: [Object],
  level: String,
  duration: Number
  // Video content stored in PostgreSQL
}
```

### PostgreSQL (Heavy Media Files)
```sql
-- Product Images
product_images {
  id SERIAL PRIMARY KEY,
  mongoProductId VARCHAR(255),  -- Reference to MongoDB
  imageUrl TEXT,                -- Full image URL/path
  storageType ENUM,             -- local|google-drive|cloud
  fileSize BIGINT,              -- In bytes
  mimeType VARCHAR,             -- image/jpeg, etc
  isMainImage BOOLEAN,
  uploadedBy VARCHAR
}

-- Course Videos
course_videos {
  id SERIAL PRIMARY KEY,
  mongoCourseId VARCHAR(255),   -- Reference to MongoDB
  videoType ENUM,               -- intro|lesson|module
  videoUrl TEXT,
  duration INTEGER,             -- In seconds
  storageType ENUM,
  processingStatus ENUM,        -- pending|processing|completed
  uploadedBy VARCHAR
}

-- Course Resources
course_resources {
  id SERIAL PRIMARY KEY,
  mongoCourseId VARCHAR(255),
  mongoLessonId VARCHAR(255),
  resourceUrl TEXT,
  resourceType ENUM,            -- pdf|document|image|archive|code
  fileSize BIGINT,
  accessCount INTEGER
}

-- Generic Media Storage
media_storage {
  id SERIAL PRIMARY KEY,
  referenceId VARCHAR(255),     -- MongoDB reference
  referenceType ENUM,           -- product|course|user|page
  mediaType ENUM,               -- image|video|document|audio
  mediaUrl TEXT,
  fileSize BIGINT,
  accessCount INTEGER,
  lastAccessedAt TIMESTAMP
}
```

---

## 🔌 Available Utility Functions

```javascript
// Product Images
saveProductImage(sequelize, imageData)      // Save image metadata
getProductImages(sequelize, mongoProductId)  // Get all product images

// Course Videos
saveCourseVideo(sequelize, videoData)        // Save video metadata
getCourseVideos(sequelize, mongoCourseId)    // Get all course videos

// Course Resources
saveCourseResource(sequelize, resourceData)  // Save resource
getCourseResources(sequelize, mongoCourseId, mongoLessonId)

// Generic Media
saveMediaStorage(sequelize, mediaData)       // Save any media
getMediaByReference(sequelize, refId, refType, mediaType)
updateMediaAccessCount(sequelize, mediaId)   // Track access
deleteMedia(sequelize, mediaId)               // Delete media
```

---

## 📊 Performance Tips

### 1. **Indexing**
All PostgreSQL tables are automatically indexed on:
- `mongoProductId` / `mongoCourseId` (for quick lookups)
- `storageType` (for filtering)
- `createdAt` (for sorting)
- `fileSize` (for analytics)

### 2. **Query Optimization**
```javascript
// ✅ Good: Fetch only needed fields
const images = await postgresMediaUtils.getProductImages(sequelize, productId);

// ✅ Good: Use filters
WHERE referenceType = 'product' AND mediaType = 'image'

// ❌ Avoid: Unnecessary JOINs
// Both DBs are designed to minimize cross-DB queries
```

### 3. **Caching Strategy**
```javascript
// Cache product metadata (MongoDB)
const cacheKey = `product:${id}`;
const cached = cache.get(cacheKey);

// Images from PostgreSQL can be cached separately
const imageCacheKey = `images:${id}`;
```

---

## 🐛 Troubleshooting

### Issue: "PostgreSQL not available"
```
Error: PostgreSQL not available
```
**Solution**: Check that `DB_ENABLED=true` in `.env` and PostgreSQL is running
```bash
# Restart PostgreSQL
services.msc  # Windows
# or
systemctl start postgresql  # Linux
```

### Issue: "ProductImage model not initialized"
```
Error: ProductImage model not initialized
```
**Solution**: Ensure PostgreSQL connection completed before using models
```javascript
// Wait for initialization
const {sequelize} = require('./models/postgres');
if (sequelize) {
  // Safe to use models
}
```

### Issue: Foreign Key Error
```
ERROR: insert or update on table violates foreign key constraint
```
**Solution**: MongoDB references must exist before saving to PostgreSQL
```javascript
// ✅ Correct: Verify MongoDB object exists
const product = await Product.findById(mongoProductId);
if (product) {
  await saveProductImage(...);
}
```

---

## 📈 Monitoring & Analytics

### Check Storage Usage
```sql
-- Total image storage in PostgreSQL
SELECT SUM(fileSize) as total_size FROM product_images;

-- Videos by storage type
SELECT storageType, COUNT(*), SUM(fileSize) 
FROM course_videos 
GROUP BY storageType;

-- Most accessed resources
SELECT resourceName, accessCount 
FROM course_resources 
ORDER BY accessCount DESC 
LIMIT 10;
```

### Monitor Database Health
```bash
# Check PostgreSQL connection
psql -U postgres -h localhost -d "ebay lms" -c "SELECT 1;"

# Check MongoDB
mongosh --eval "db.adminCommand('ping')"
```

---

## 🔐 Security Considerations

### 1. **Access Control**
Always authenticate before modifying media:
```javascript
router.post('/:id/images', authMiddleware, async (req, res) => {
  // Verify user owns the product
  const product = await Product.findById(req.params.id);
  if (product.createdBy.toString() !== req.user.userId) {
    return res.status(403).json({error: 'Unauthorized'});
  }
  // Safe to proceed
});
```

### 2. **File Validation**
```javascript
// Validate file type and size
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

if (!ALLOWED_TYPES.includes(mimeType) || fileSize > MAX_IMAGE_SIZE) {
  return res.status(400).json({error: 'Invalid file'});
}
```

### 3. **Data Integrity**
```javascript
// Use checksums for file integrity
const crypto = require('crypto');
const checksum = crypto.createHash('sha256')
  .update(fileContent)
  .digest('hex');

// Store with file metadata
await saveMediaStorage(sequelize, {
  ...mediaData,
  checksum: checksum
});
```

---

## 📚 Example Files Reference

- **Integration Examples**
  - `backend/routes/productRoutesWithDualDB.EXAMPLE.js`
  - `backend/routes/courseRoutesWithDualDB.EXAMPLE.js`

- **Configuration**
  - `backend/.env` - Database credentials
  - `backend/server.js` - Database initialization

- **Models**
  - `backend/models/postgres/ProductImage.js`
  - `backend/models/postgres/CourseVideo.js`
  - `backend/models/postgres/CourseResource.js`
  - `backend/models/postgres/MediaStorage.js`

- **Utilities**
  - `backend/utils/postgresMediaUtils.js`

---

## ✨ Summary

Your system is now ready for:
1. ✅ Storing product/course metadata in MongoDB
2. ✅ Storing heavy media (images, videos) in PostgreSQL
3. ✅ Fast queries on both databases
4. ✅ Automatic indexing and optimization
5. ✅ Access tracking and analytics

**Next Steps:**
- Integrate with existing product/course routes
- Implement file upload endpoints
- Add media management to admin panel
- Monitor database performance

For questions, refer to the example files provided!
