# API Reference - New Endpoints

## Page Background API

### Base URL
```
/api/page-backgrounds
```

---

### 1. Get Page Background
Get the background image for a specific page

```
GET /api/page-backgrounds/:pageName
```

**Parameters:**
- `pageName` (path param): 'course' | 'shop' | 'contact'

**Headers:**
- None required (public endpoint)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "pageName": "course",
    "imageUrl": "https://drive.google.com/uc?id=...",
    "alt": "Course page header background",
    "description": "Gradient background for course listing",
    "fileName": "course-bg.jpg",
    "fileSize": 2048576,
    "mimeType": "image/jpeg",
    "uploadedBy": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Response (Not Found - 404):**
```json
{
  "success": false,
  "message": "No background image found for course page"
}
```

---

### 2. Get All Page Backgrounds
Get all uploaded page backgrounds (admin only)

```
GET /api/page-backgrounds
Authorization: Bearer {token}
```

**Headers:**
- `Authorization` (required): Bearer token

**Response (200):**
```json
{
  "success": true,
  "data": [
    { /* PageBackground object for course */ },
    { /* PageBackground object for shop */ },
    { /* PageBackground object for contact */ }
  ],
  "total": 3
}
```

---

### 3. Upload Page Background
Upload or update a page background (admin only)

```
POST /api/page-backgrounds/upload/:pageName
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Parameters:**
- `pageName` (path param): 'course' | 'shop' | 'contact'

**Form Data:**
- `image` (file, required): Image file (JPG, PNG, WebP)
- `alt` (string, optional): Alt text for accessibility
- `description` (string, optional): Description

**Constraints:**
- Max file size: 5MB
- Allowed types: image/jpeg, image/png, image/webp

**Response (200):**
```json
{
  "success": true,
  "message": "Course page background uploaded successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "pageName": "course",
    "imageUrl": "https://drive.google.com/uc?id=...",
    "storageType": "google-drive",
    "uploadedBy": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Admin User",
      "email": "admin@example.com"
    }
  }
}
```

**Response (400 - Validation Error):**
```json
{
  "success": false,
  "message": "Only JPG, PNG, and WebP images are supported"
}
```

---

### 4. Delete Page Background
Delete a page background (admin only)

```
DELETE /api/page-backgrounds/:pageName
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "course page background deleted successfully",
  "data": { /* Deleted PageBackground object */ }
}
```

---

## Video Progress API

### Base URL
```
/api/video-progress
```

---

### 1. Update Video Progress
Record or update user's video watching progress

```
POST /api/video-progress/update
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "courseId": "507f1f77bcf86cd799439011",
  "videoLink": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "duration": 600,
  "currentTime": 300,
  "isCompleted": false
}
```

**Fields:**
- `courseId` (string, required): MongoDB ObjectId of course
- `videoLink` (string, required): URL of video
- `duration` (number, optional): Total video duration in seconds
- `currentTime` (number, required): Current playback position in seconds
- `isCompleted` (boolean, optional): Override completion status

**Response (200):**
```json
{
  "success": true,
  "message": "Video progress updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "user": "507f1f77bcf86cd799439014",
    "course": "507f1f77bcf86cd799439011",
    "videoLink": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "duration": 600,
    "currentTime": 300,
    "percentageWatched": 50,
    "isCompleted": false,
    "totalTimeSpent": 0,
    "lastWatchedAt": "2024-01-15T10:35:00Z",
    "watchStartedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 2. Get Video Progress for Course
Get all video progress records for a user in a specific course

```
GET /api/video-progress/course/:courseId
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "user": "507f1f77bcf86cd799439014",
      "course": "507f1f77bcf86cd799439011",
      "videoLink": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "percentageWatched": 85,
      "isCompleted": false,
      "lastWatchedAt": "2024-01-15T10:35:00Z"
    }
  ]
}
```

---

### 3. Get Progress for Specific Video
Get progress for a specific video in a course

```
GET /api/video-progress/course/:courseId/video/:videoLink
Authorization: Bearer {token}
```

**Parameters:**
- `courseId` (path): MongoDB ObjectId
- `videoLink` (path): URL-encoded video link

**Example:**
```
GET /api/video-progress/course/507f1f77bcf86cd799439011/video/https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DdQw4w9WgXcQ
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "user": "507f1f77bcf86cd799439014",
    "course": "507f1f77bcf86cd799439011",
    "videoLink": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "duration": 600,
    "currentTime": 510,
    "percentageWatched": 85,
    "isCompleted": false,
    "totalTimeSpent": 510,
    "lastWatchedAt": "2024-01-15T10:35:00Z"
  }
}
```

---

### 4. Get All Video Progress (Admin)
Get all video progress records (admin only)

```
GET /api/video-progress?courseId={courseId}
Authorization: Bearer {token}
```

**Query Parameters:**
- `courseId` (optional): Filter by course

**Response (200):**
```json
{
  "success": true,
  "data": [
    { /* VideoProgress objects */ }
  ],
  "total": 45
}
```

---

### 5. Get Course Video Statistics (Admin)
Get statistics for video watching in a course (admin only)

```
GET /api/video-progress/statistics/:courseId
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "courseId": "507f1f77bcf86cd799439011",
    "courseTitle": "eBay Mastery 101",
    "totalWatchers": 45,
    "completedCount": 38,
    "completionRate": "84.44",
    "averagePercentageWatched": 87,
    "details": [
      {
        "userId": "507f1f77bcf86cd799439014",
        "userName": "John Doe",
        "userEmail": "john@example.com",
        "videoLink": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "percentageWatched": 100,
        "isCompleted": true,
        "totalTimeSpent": 600,
        "lastWatchedAt": "2024-01-15T10:35:00Z"
      },
      {
        "userId": "507f1f77bcf86cd799439015",
        "userName": "Jane Smith",
        "userEmail": "jane@example.com",
        "videoLink": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "percentageWatched": 45,
        "isCompleted": false,
        "totalTimeSpent": 270,
        "lastWatchedAt": "2024-01-15T08:20:00Z"
      }
    ]
  }
}
```

---

### 6. Delete Video Progress (Admin)
Delete a video progress record (admin only)

```
DELETE /api/video-progress/:progressId
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Video progress deleted successfully",
  "data": { /* Deleted VideoProgress object */ }
}
```

---

## Course API - Updated

### Create Course - Added Field

```
POST /api/admin/courses
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**New Form Data Field:**
- `introVideoLink` (string, optional): Video URL for course intro

```json
{
  "title": "eBay Mastery 101",
  "description": "Learn to master eBay selling...",
  "category": "business",
  "price": "99.99",
  "duration": "12",
  "level": "beginner",
  "introVideoLink": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  ...other fields
}
```

---

### Update Course - Added Field

```
PUT /api/admin/courses/:courseId
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**New Form Data Field:**
- `introVideoLink` (string, optional): Video URL for course intro

---

## Error Responses

### Common Error Codes

#### 400 - Bad Request
```json
{
  "success": false,
  "message": "Only JPG, PNG, and WebP images are supported"
}
```

#### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Authorization token required"
}
```

#### 403 - Forbidden
```json
{
  "success": false,
  "message": "Admin access required"
}
```

#### 404 - Not Found
```json
{
  "success": false,
  "message": "Course not found"
}
```

#### 500 - Server Error
```json
{
  "success": false,
  "message": "Failed to upload file",
  "error": "Error details"
}
```

---

## Rate Limits

Currently no rate limiting. Consider implementing in production:
- Background uploads: 10 per minute per admin
- Progress updates: 30 per minute per user
- Queries: 100 per minute per user

---

## Authentication

All endpoints except public ones require:

```
Authorization: Bearer {JWT_TOKEN}
```

Token obtained from:
```
POST /api/auth/login
```

---

## Examples

### JavaScript/Fetch

**Upload Background:**
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);
formData.append('alt', 'Course page background');

const response = await fetch(
  `${API_URL}/page-backgrounds/upload/course`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  }
);
```

**Update Video Progress:**
```javascript
const response = await fetch(
  `${API_URL}/video-progress/update`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      courseId: '507f1f77bcf86cd799439011',
      videoLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      duration: 600,
      currentTime: 300
    })
  }
);
```

### cURL

**Get Background:**
```bash
curl https://api.example.com/api/page-backgrounds/course
```

**Upload Background:**
```bash
curl -X POST https://api.example.com/api/page-backgrounds/upload/course \
  -H "Authorization: Bearer {token}" \
  -F "image=@background.jpg" \
  -F "alt=Course Background"
```

---

## Webhooks (Future)

Consider implementing webhooks for:
- Video completion
- Background updates
- Progress milestones

---

## Database Schema

### PageBackground Collection

```javascript
{
  _id: ObjectId,
  pageName: String,        // 'course' | 'shop' | 'contact'
  imageUrl: String,
  imageDriveFileId: String,
  storageType: String,     // 'local' | 'google-drive'
  fileName: String,
  fileSize: Number,
  mimeType: String,
  uploadedBy: ObjectId,    // Reference to User
  alt: String,
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

### VideoProgress Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId,          // Reference to User
  course: ObjectId,        // Reference to Course
  videoLink: String,
  duration: Number,        // seconds
  currentTime: Number,     // seconds
  percentageWatched: Number, // 0-100
  isCompleted: Boolean,
  lastWatchedAt: Date,
  watchStartedAt: Date,
  totalTimeSpent: Number,  // seconds
  createdAt: Date,
  updatedAt: Date
}
```

### Course Collection (Updated)

```javascript
{
  // ... existing fields ...
  introVideoLink: String,  // New field
  // ... rest of fields ...
}
```

---

## Testing

### Test with Postman

1. Create environment variables:
   - `base_url`: http://localhost:3001
   - `token`: Your JWT token

2. Request examples available in Postman collection

### Test with Jest

```javascript
describe('Page Backgrounds API', () => {
  it('should upload background image', async () => {
    // Test implementation
  });
});

describe('Video Progress API', () => {
  it('should update video progress', async () => {
    // Test implementation
  });
});
```

---

## Support

For API questions or issues:
1. Check responses for error messages
2. Review browser console (F12) for details
3. Check server logs
4. Ensure token is valid and not expired
5. Verify MongoDB connection
6. Check file permissions for uploads

---

Last Updated: January 2024
API Version: 1.0
