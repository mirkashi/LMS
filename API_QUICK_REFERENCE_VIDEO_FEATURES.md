# 🔌 Quick API Reference - Video & Background Features

## 🎥 Lesson Release Date Management

### Update Lesson Release Date
Schedule when a lesson becomes available to enrolled students.

**Endpoint:**
```
PATCH /api/admin/courses/:courseId/modules/:moduleIndex/lessons/:lessonIndex/release-date
```

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "releaseDate": "2026-01-20T00:00:00.000Z",  // ISO 8601 date (optional)
  "isLocked": true                             // true to lock, false to unlock
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Lesson release date updated successfully",
  "data": {
    "title": "Introduction to eBay",
    "releaseDate": "2026-01-20T00:00:00.000Z",
    "isLocked": true
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Course not found / Lesson not found / Unauthorized"
}
```

---

## 📋 Examples

### Example 1: Lock lesson until specific date
```bash
curl -X PATCH \
  http://localhost:5000/api/admin/courses/678a1234567890abcdef1234/modules/0/lessons/0/release-date \
  -H 'Authorization: Bearer your_admin_token_here' \
  -H 'Content-Type: application/json' \
  -d '{
    "releaseDate": "2026-01-15T00:00:00.000Z",
    "isLocked": true
  }'
```

### Example 2: Unlock lesson immediately
```bash
curl -X PATCH \
  http://localhost:5000/api/admin/courses/678a1234567890abcdef1234/modules/0/lessons/0/release-date \
  -H 'Authorization: Bearer your_admin_token_here' \
  -H 'Content-Type: application/json' \
  -d '{
    "releaseDate": null,
    "isLocked": false
  }'
```

### Example 3: JavaScript/Fetch
```javascript
const updateReleaseDate = async (courseId, moduleIndex, lessonIndex, releaseDate, isLocked) => {
  const token = localStorage.getItem('adminToken');
  
  const response = await fetch(
    `${API_URL}/admin/courses/${courseId}/modules/${moduleIndex}/lessons/${lessonIndex}/release-date`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        releaseDate,
        isLocked
      })
    }
  );
  
  const data = await response.json();
  console.log(data);
};

// Usage:
updateReleaseDate(
  '678a1234567890abcdef1234',
  0,  // Module index
  0,  // Lesson index
  '2026-01-20T00:00:00.000Z',
  true
);
```

---

## 🎨 Page Background Management

### Get Page Background
**Endpoint:** `GET /api/page-backgrounds/:pageName`
**Public Access** - No authentication required

**Example:**
```bash
curl http://localhost:5000/api/page-backgrounds/course
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "pageName": "course",
    "imageUrl": "https://drive.google.com/uc?id=...",
    "alt": "Course page background",
    "createdAt": "2026-01-08T...",
    "updatedAt": "2026-01-08T..."
  }
}
```

### Upload Page Background (Admin Only)
**Endpoint:** `POST /api/page-backgrounds/upload/:pageName`

**Valid Page Names:**
- `course`
- `shop`
- `about`
- `contact`

**Example (cURL):**
```bash
curl -X POST \
  http://localhost:5000/api/page-backgrounds/upload/course \
  -H 'Authorization: Bearer your_admin_token' \
  -F 'image=@/path/to/background.jpg' \
  -F 'alt=Beautiful course page background' \
  -F 'description=Custom background for course page'
```

---

## 📊 Video Progress Tracking

### Update Video Progress (User)
**Endpoint:** `POST /api/video-progress/update`

```json
{
  "courseId": "678a1234567890abcdef1234",
  "videoLink": "https://youtube.com/watch?v=...",
  "duration": 600,
  "currentTime": 150,
  "isCompleted": false
}
```

### Get Course Video Progress (User)
**Endpoint:** `GET /api/video-progress/course/:courseId`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "videoLink": "https://youtube.com/watch?v=...",
      "duration": 600,
      "currentTime": 150,
      "percentageWatched": 25,
      "isCompleted": false,
      "lastWatchedAt": "2026-01-08T..."
    }
  ]
}
```

---

## 🛠️ Testing with Postman

### Setup:
1. Create new Collection: "LMS - Video Features"
2. Add Environment Variables:
   - `API_URL`: `http://localhost:5000/api`
   - `ADMIN_TOKEN`: Your admin token

### Request 1: Set Lesson Release Date
- Method: `PATCH`
- URL: `{{API_URL}}/admin/courses/YOUR_COURSE_ID/modules/0/lessons/0/release-date`
- Headers:
  - `Authorization`: `Bearer {{ADMIN_TOKEN}}`
  - `Content-Type`: `application/json`
- Body (JSON):
```json
{
  "releaseDate": "2026-01-20T00:00:00.000Z",
  "isLocked": true
}
```

### Request 2: Upload Background
- Method: `POST`
- URL: `{{API_URL}}/page-backgrounds/upload/course`
- Headers:
  - `Authorization`: `Bearer {{ADMIN_TOKEN}}`
- Body (form-data):
  - `image`: [Select File]
  - `alt`: "Course page background"
  - `description`: "Professional education background"

### Request 3: Get Background
- Method: `GET`
- URL: `{{API_URL}}/page-backgrounds/course`
- Headers: (none needed - public endpoint)

---

## ⚠️ Common Errors

### Error: "Course not found"
- **Cause**: Invalid courseId
- **Fix**: Verify course ID exists in database

### Error: "Lesson not found"
- **Cause**: Invalid module or lesson index
- **Fix**: Check indices (remember: 0-based!)

### Error: "Unauthorized"
- **Cause**: Missing or invalid admin token
- **Fix**: Get fresh token from login endpoint

### Error: "File too large"
- **Cause**: Image exceeds 5MB limit
- **Fix**: Compress image before upload

---

## 📝 Notes

- **Module/Lesson Indices**: Always 0-based (first module = 0, first lesson = 0)
- **Date Format**: Always use ISO 8601 format with timezone (e.g., `2026-01-20T00:00:00.000Z`)
- **File Uploads**: Use `multipart/form-data` encoding
- **Authentication**: Admin endpoints require valid admin JWT token
- **Rate Limiting**: No rate limits currently, but may be added in production

---

## 🔗 Related Documentation

- [Complete Features Guide](./VIDEO_AND_BACKGROUND_FEATURES_GUIDE.md)
- [API Reference](./API_REFERENCE.md)
- [Admin Guide](./ADMIN_PANEL_COMPLETE.md)

---

**Last Updated**: January 8, 2026
