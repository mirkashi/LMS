# Dual Database Configuration Guide

## Overview

Your LMS now uses **two databases** for optimal performance:

- **MongoDB**: Lightweight metadata (user profiles, course details, product info, reviews)
- **PostgreSQL**: Heavy/large media content (product images, course videos, resources)

## Database Architecture

```
┌─────────────────────────────────────┐
│          Client Application         │
└──────────┬──────────────────────────┘
           │
┌──────────┴──────────────────────────┐
│       Express.js Server             │
└──────────┬──────────────────────────┘
           │
      ┌────┴────┐
      │          │
  ┌───▼──────┐ ┌──▼───────────┐
  │ MongoDB  │ │ PostgreSQL   │
  ├──────────┤ ├──────────────┤
  │ Metadata │ │ Media Files  │
  │ • Users  │ │ • Images     │
  │ • Courses│ │ • Videos     │
  │ • Reviews│ │ • Resources  │
  │ • Orders │ │ • Documents  │
  └──────────┘ └──────────────┘
```

## Data Distribution

### MongoDB (Lightweight Data)
- User profiles and authentication
- Course metadata and structure
- Product information and reviews
- Order tracking
- Announcements and content
- Enrollments and progress tracking
- References to PostgreSQL media

### PostgreSQL (Heavy Media)
- Product images (multiple per product)
- Course videos (intro, lessons, modules)
- Course resources and attachments
- Documents and PDFs
- Generic media storage for any content type
- Access tracking and analytics

## Configuration

### .env File Settings

```bash
# Database Selection
DB_ENABLED=true                    # Enable PostgreSQL

# PostgreSQL Connection
DB_NAME=ebay lms                   # Database name
DB_USER=postgres                   # PostgreSQL user
DB_PASSWORD=Iphone_@11            # PostgreSQL password
DB_HOST=localhost                  # PostgreSQL host
DB_PORT=5432                       # PostgreSQL port
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_ENABLED` | Enable/disable PostgreSQL | `true` |
| `DB_NAME` | PostgreSQL database name | `ebay lms` |
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | (required) |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |

## PostgreSQL Models

### 1. ProductImage
Stores product image metadata and references.

```javascript
{
  mongoProductId,      // Reference to MongoDB Product
  imageUrl,           // Full URL or file path
  storageType,        // 'local', 'google-drive', 'cloud'
  fileSize,           // Size in bytes
  isMainImage,        // Flag for primary image
  uploadedBy          // User who uploaded
}
```

### 2. CourseVideo
Stores course video metadata for all video types.

```javascript
{
  mongoCourseId,      // Reference to MongoDB Course
  videoType,          // 'intro', 'lesson', 'module'
  videoUrl,           // Full video URL or path
  storageType,        // Storage location
  duration,           // Video duration in seconds
  processingStatus,   // 'pending', 'processing', 'completed'
  uploadedBy          // User who uploaded
}
```

### 3. CourseResource
Stores course resources like PDFs, documents, code files.

```javascript
{
  mongoCourseId,      // Reference to MongoDB Course
  mongoLessonId,      // Reference to lesson (if applicable)
  resourceUrl,        // Full resource URL or path
  resourceType,       // 'pdf', 'document', 'image', 'archive', 'code'
  fileSize,           // Size in bytes
  accessCount         // Track resource usage
}
```

### 4. MediaStorage
Generic media storage for any content type.

```javascript
{
  referenceId,        // MongoDB reference ID
  referenceType,      // 'product', 'course', 'user', 'page'
  mediaType,          // 'image', 'video', 'document', 'audio', 'archive'
  fileName,           // Original file name
  mediaUrl,           // Full URL or path
  fileSize,           // Size in bytes
  accessCount         // Track access frequency
}
```

## Usage Examples

### Saving Product Images

```javascript
const { saveProductImage } = require('../utils/postgresMediaUtils');

// After uploading product image
await saveProductImage(sequelize, {
  mongoProductId: product._id.toString(),
  imageUrl: 'https://storage.example.com/product-123.jpg',
  storageType: 'cloud',
  fileSize: 1024000,
  isMainImage: true,
  uploadedBy: userId
});
```

### Saving Course Videos

```javascript
const { saveCourseVideo } = require('../utils/postgresMediaUtils');

// After uploading course video
await saveCourseVideo(sequelize, {
  mongoCourseId: course._id.toString(),
  videoType: 'lesson',
  mongoLessonId: lesson._id.toString(),
  videoUrl: 's3://bucket/course-123-lesson-1.mp4',
  storageType: 'cloud',
  duration: 3600,
  uploadedBy: instructorId
});
```

### Retrieving Product Images

```javascript
const { getProductImages } = require('../utils/postgresMediaUtils');

// Get all images for a product
const images = await getProductImages(sequelize, mongoProductId);
```

### Tracking Media Access

```javascript
const { updateMediaAccessCount } = require('../utils/postgresMediaUtils');

// Track when user accesses media
await updateMediaAccessCount(sequelize, mediaId);
```

## API Integration

### Product Routes
- **POST** `/api/products` - Create product (metadata in MongoDB)
- **POST** `/api/products/:id/images` - Upload product images (stored in PostgreSQL)
- **GET** `/api/products/:id/images` - Get all product images
- **DELETE** `/api/products/:id/images/:imageId` - Delete product image

### Course Routes
- **POST** `/api/courses` - Create course (metadata in MongoDB)
- **POST** `/api/courses/:id/videos` - Upload course video (stored in PostgreSQL)
- **GET** `/api/courses/:id/videos` - Get all course videos
- **POST** `/api/courses/:id/resources` - Upload course resource

## Database Synchronization

The system automatically syncs PostgreSQL models on startup:

1. Server starts
2. MongoDB connects
3. PostgreSQL connection initializes
4. Models are synced with `ALTER TABLE` (development mode)
5. Migrations are applied if needed

## Backup and Maintenance

### MongoDB Backup
```bash
mongodump --uri="mongodb://localhost:27017/9tangle" --out=./backup/mongodb
```

### PostgreSQL Backup
```bash
pg_dump -U postgres -h localhost ebay_lms > backup/ebay_lms.sql
```

### Database Verification

Check if both databases are connected:
```bash
# Check logs when server starts
npm run dev

# Expected output:
# ✅ MongoDB connected
# ✅ PostgreSQL connected successfully
# ✅ PostgreSQL models synchronized
```

## Performance Optimization

### Indexes
- PostgreSQL automatically creates indexes on:
  - `referenceId`, `referenceType` (media lookups)
  - `mongoProductId`, `mongoCourseId` (relationship queries)
  - `storageType` (filtering by storage location)
  - `createdAt` (sorting by date)
  - `fileSize` (sorting by size)

### Query Optimization
1. **Metadata Queries** (MongoDB): Fast, lightweight documents
2. **Media Queries** (PostgreSQL): Indexed for quick retrieval
3. **Cross-Database**: Reference MongoDB IDs in PostgreSQL for integrity

## Troubleshooting

### PostgreSQL Connection Error
```
PostgreSQL connection error: password authentication failed
```
**Solution**: Verify PostgreSQL credentials in `.env`
```bash
# Test connection manually
psql -U postgres -h localhost -d "ebay lms"
```

### Database Not Syncing
```
PostgreSQL models not synchronized
```
**Solution**: Check PostgreSQL is running and database exists
```bash
createdb -U postgres "ebay lms"
```

### Missing Models
```
Error: ProductImage model not initialized
```
**Solution**: Ensure `DB_ENABLED=true` in `.env` and PostgreSQL is accessible

## Disabling PostgreSQL

To temporarily disable PostgreSQL (development without PostgreSQL):
```bash
DB_ENABLED=false
```

The app will continue working with MongoDB only using mock data for media.

## Next Steps

1. ✅ PostgreSQL configured
2. ✅ Models created
3. ✅ Utilities provided
4. ⏳ Integrate with product routes
5. ⏳ Integrate with course routes
6. ⏳ Implement media upload endpoints
7. ⏳ Add media management in admin panel

