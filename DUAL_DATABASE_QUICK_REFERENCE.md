# 🚀 Dual Database Quick Reference

## ✅ What's Been Done

```
✅ PostgreSQL configured and running
✅ 4 Sequelize models created:
   - ProductImage (for product images)
   - CourseVideo (for course videos)
   - CourseResource (for PDFs, documents)
   - MediaStorage (for generic media)
✅ Utility functions ready in postgresMediaUtils.js
✅ Server tested and working
✅ Both databases connected and synchronized
```

---

## 📊 Database Map

### MongoDB → Lightweight Metadata
```javascript
Products:    { name, price, description, category, rating }
Courses:     { title, price, instructor, level, duration }
Users:       { name, email, role, enrolledCourses }
Reviews:     { rating, comment, product, user }
Orders:      { items, total, status, user }
```

### PostgreSQL ← Heavy Media
```javascript
ProductImage:  { imageUrl, fileSize, storageType, mongoProductId }
CourseVideo:   { videoUrl, duration, storageType, mongoCourseId }
CourseResource:{ resourceUrl, fileSize, resourceType, mongoCourseId }
MediaStorage:  { mediaUrl, mediaType, accessCount, referenceId }
```

---

## 🔧 Quick Code Examples

### Save Product with Images
```javascript
const product = await Product.create({
  name: "Laptop",
  price: 1200,
  category: "Electronics"
});

const sequelize = req.app.get('sequelize');
await postgresMediaUtils.saveProductImage(sequelize, {
  mongoProductId: product._id.toString(),
  imageUrl: "https://example.com/image.jpg",
  uploadedBy: req.user.userId
});
```

### Get Product with Images
```javascript
const product = await Product.findById(productId);
const images = await postgresMediaUtils.getProductImages(
  sequelize,
  productId
);

res.json({ product, images });
```

### Save Course Video
```javascript
await postgresMediaUtils.saveCourseVideo(sequelize, {
  mongoCourseId: courseId,
  videoType: "intro",
  videoUrl: "s3://bucket/video.mp4",
  duration: 300,
  uploadedBy: instructorId
});
```

### Get Course Videos
```javascript
const videos = await postgresMediaUtils.getCourseVideos(
  sequelize,
  courseId
);
```

---

## 📁 File Structure

```
backend/
├── models/
│   ├── postgres/
│   │   ├── ProductImage.js      ← Image metadata model
│   │   ├── CourseVideo.js        ← Video metadata model
│   │   ├── CourseResource.js     ← Resource metadata model
│   │   ├── MediaStorage.js       ← Generic media model
│   │   └── index.js              ← Database initialization
│   ├── Product.js                ← MongoDB (unchanged)
│   ├── Course.js                 ← MongoDB (unchanged)
│   └── User.js                   ← MongoDB (unchanged)
│
├── routes/
│   ├── productRoutes.js          ← Update with PostgreSQL calls
│   ├── courseRoutes.js           ← Update with PostgreSQL calls
│   ├── productRoutesWithDualDB.EXAMPLE.js  ← Reference implementation
│   └── courseRoutesWithDualDB.EXAMPLE.js   ← Reference implementation
│
├── utils/
│   └── postgresMediaUtils.js     ← All utility functions
│
├── server.js                     ← Both DBs initialized
└── .env                          ← PostgreSQL credentials

documentation/
├── DUAL_DATABASE_SETUP.md        ← Architecture overview
├── DUAL_DATABASE_IMPLEMENTATION.md ← Detailed implementation guide
└── DUAL_DATABASE_QUICK_REFERENCE.md ← This file
```

---

## 🔌 Available Functions

```javascript
// Import utilities
const {
  saveProductImage,
  getProductImages,
  saveCourseVideo,
  getCourseVideos,
  saveCourseResource,
  getCourseResources,
  saveMediaStorage,
  getMediaByReference,
  updateMediaAccessCount,
  deleteMedia
} = require('../utils/postgresMediaUtils');

// Use with sequelize instance
const sequelize = req.app.get('sequelize');
if (sequelize) {
  const images = await getProductImages(sequelize, productId);
}
```

---

## 🌍 Environment Variables

```bash
# In .env file:
DB_ENABLED=true              # Enable PostgreSQL
DB_NAME=ebay lms             # Database name
DB_USER=postgres             # Username
DB_PASSWORD=Iphone_@11      # Password
DB_HOST=localhost            # Host
DB_PORT=5432                 # Port
```

---

## ✨ Benefits

| Aspect | Benefit |
|--------|---------|
| **Query Speed** | Metadata queries are fast (MongoDB), large files handled efficiently (PostgreSQL) |
| **Storage** | No massive BLOBs in MongoDB, images/videos in optimized PostgreSQL |
| **Scaling** | Scale MongoDB and PostgreSQL independently |
| **Backup** | Each database can be backed up separately |
| **Analytics** | Access tracking on PostgreSQL for popularity metrics |
| **Flexibility** | Easy to switch storage providers (local, Google Drive, S3) |

---

## 🚦 Server Status

```
When you run: npm run dev

Expected output:
✅ MongoDB connected
✅ PostgreSQL connected successfully
✅ PostgreSQL models synchronized

If either fails:
⚠️ Check .env credentials
⚠️ Ensure databases are running
⚠️ Check logs for error details
```

---

## 📝 Implementation Checklist

- [ ] Review example routes: `productRoutesWithDualDB.EXAMPLE.js`
- [ ] Review example routes: `courseRoutesWithDualDB.EXAMPLE.js`
- [ ] Update `productRoutes.js` with PostgreSQL calls
- [ ] Update `courseRoutes.js` with PostgreSQL calls
- [ ] Test POST product with images
- [ ] Test GET product with images
- [ ] Test POST course video
- [ ] Test GET course videos
- [ ] Deploy to production
- [ ] Monitor database performance

---

## 🆘 Common Issues & Solutions

### Issue: "PostgreSQL not available"
```
Solution: Check DB_ENABLED=true in .env
          Restart server: npm run dev
```

### Issue: Models not syncing
```
Solution: Check PostgreSQL is running
          Verify DB_NAME and credentials
          Check server logs for details
```

### Issue: "Cannot read property 'sequelize' of undefined"
```
Solution: Wrap in try-catch:
          const seq = req.app.get('sequelize');
          if (!seq) return; // PostgreSQL disabled
```

### Issue: Missing MongoDB reference
```
Solution: Always verify MongoDB object exists first:
          const product = await Product.findById(id);
          if (!product) throw error;
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `DUAL_DATABASE_SETUP.md` | Architecture & configuration overview |
| `DUAL_DATABASE_IMPLEMENTATION.md` | Step-by-step integration guide |
| `DUAL_DATABASE_QUICK_REFERENCE.md` | This file - quick lookup |
| Example Routes | See `productRoutesWithDualDB.EXAMPLE.js` |

---

## 🎯 What To Do Next

1. **Read the examples**: Check the `.EXAMPLE.js` route files
2. **Implement in routes**: Copy patterns to your actual route files
3. **Test**: Use curl or Postman to test endpoints
4. **Monitor**: Watch server logs during uploads
5. **Optimize**: Add caching, compression as needed

---

## 🏁 You're All Set!

Your system now has:
- ✅ MongoDB for metadata (fast, flexible)
- ✅ PostgreSQL for media (optimized, scalable)
- ✅ Automatic synchronization
- ✅ Utilities for all common operations
- ✅ Example implementations
- ✅ Complete documentation

**Happy coding! 🚀**
