# 🎥 Video & Background Management - Complete Guide

This guide explains all the new features implemented for video management and page background customization.

---

## ✅ Problems Solved

### Problem 1: Video Links Not Visible After Enrollment ✓ FIXED
**Solution**: Videos are now immediately visible and playable for enrolled users with clear visual indicators.

### Problem 2: Videos Not Playing on Course Page ✓ FIXED
**Solution**: Implemented professional VideoPlayer component that supports YouTube, Vimeo, Google Drive, and direct video uploads with progress tracking.

### Problem 3: Course Video Update System ✓ FIXED
**Solution**: Added daily release scheduling system for lessons - videos can be released on specific dates.

### Problem 4: Header Background Management ✓ FIXED
**Solution**: Admins can now upload and manage header background images for all pages (course, shop, about, contact) through the admin panel.

---

## 📚 Feature 1: Enhanced Video Display

### For Users (Frontend)

#### What You'll See:
1. **Intro Videos**: Displayed prominently at the top of course detail pages for all users
2. **Module Videos**: Available to enrolled students with clear "Click to Play" indicators
3. **Video Player**: Professional player with:
   - Progress tracking
   - Completion status
   - Time tracking (current/total)
   - Auto-save progress every 10 seconds
   - Support for YouTube, Vimeo, MP4, WebM, OGG formats

#### How to Watch Videos:
1. Navigate to a course detail page
2. **Intro Video**: Automatically displayed at the top
3. **Module Videos**: 
   - Enroll in the course first
   - Click on any lesson marked with 🎥
   - Video appears in the "Now Playing" section
   - Your progress is automatically tracked

### For Admins

#### How to Add Videos to Courses:

**Option 1: Add Intro Video (Link)**
1. Go to Admin Panel → Courses → Create New or Edit Course
2. In Step 3 (Advanced Settings), find "Intro Video Link"
3. Paste video URL:
   - YouTube: `https://www.youtube.com/watch?v=VIDEO_ID`
   - Vimeo: `https://vimeo.com/VIDEO_ID`
   - Direct: `https://example.com/video.mp4`
4. Save course

**Option 2: Upload Intro Video (File)**
1. Go to Admin Panel → Courses → Create New or Edit Course
2. In Step 2 (Media Upload), use "Upload Video" section
3. Choose video file (MP4, MOV, AVI - max 1GB)
4. Video will be uploaded to Google Drive or local storage
5. Save course

**Option 3: Add Lesson Videos**
1. Use the API endpoint to add lessons with videos (see API section below)

---

## 📅 Feature 2: Daily Video Release System

### Overview
Schedule when specific lessons become available to students. Perfect for:
- Drip-feed course content
- Weekly releases
- Building anticipation
- Preventing content overwhelm

### How It Works

#### For Students:
- **Locked Lessons**: Show with 🔒 icon and release date
- **Available Lessons**: Show with ✓ and are clickable
- **Message**: "This lesson will be available on [DATE]"

#### For Admins:

Use the API to set release dates for lessons:

```bash
PATCH /api/admin/courses/:courseId/modules/:moduleIndex/lessons/:lessonIndex/release-date
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "releaseDate": "2026-01-15T00:00:00Z",
  "isLocked": true
}
```

**Parameters:**
- `courseId`: The ID of the course
- `moduleIndex`: Index of the module (0-based)
- `lessonIndex`: Index of the lesson within the module (0-based)
- `releaseDate`: ISO 8601 date when lesson becomes available
- `isLocked`: Boolean (true to lock until releaseDate, false to unlock immediately)

**Example Using Postman:**
1. Set Method: PATCH
2. URL: `http://localhost:5000/api/admin/courses/ABC123/modules/0/lessons/0/release-date`
3. Headers: 
   - `Authorization: Bearer YOUR_ADMIN_TOKEN`
   - `Content-Type: application/json`
4. Body (JSON):
```json
{
  "releaseDate": "2026-01-20T00:00:00.000Z",
  "isLocked": true
}
```

**Example Using cURL:**
```bash
curl -X PATCH \
  http://localhost:5000/api/admin/courses/YOUR_COURSE_ID/modules/0/lessons/0/release-date \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "releaseDate": "2026-01-20T00:00:00.000Z",
    "isLocked": true
  }'
```

### Release Schedule Examples

**Example 1: Weekly Release**
```javascript
// Week 1 - Available immediately
{
  "releaseDate": null,
  "isLocked": false
}

// Week 2 - Release on Jan 15
{
  "releaseDate": "2026-01-15T00:00:00Z",
  "isLocked": true
}

// Week 3 - Release on Jan 22
{
  "releaseDate": "2026-01-22T00:00:00Z",
  "isLocked": true
}
```

**Example 2: Unlock All Content**
```javascript
{
  "releaseDate": null,
  "isLocked": false
}
```

---

## 🎨 Feature 3: Page Background Management

### Overview
Admins can upload custom background images for header sections on:
- Course Page (`/courses`)
- Shop Page (`/shop`)
- About Page (`/about`)
- Contact Page (`/contact`)

### How to Upload Background Images

1. **Login to Admin Panel**
2. **Navigate to**: Page Backgrounds (in sidebar)
3. **Select Page**: Choose which page to update (course/shop/about/contact)
4. **Upload Image**:
   - Click upload area or drag & drop
   - Supported formats: JPG, PNG, WebP
   - Max size: 5MB
   - Recommended: 1920x400px (landscape)
5. **Optional**: Add alt text and description
6. **Click "Upload Background"**

### Features:
- ✅ Instant preview before upload
- ✅ Automatic validation (file type & size)
- ✅ One background per page (uploading new one replaces old)
- ✅ Fallback to default images if no custom background
- ✅ Responsive design - looks great on all devices

### Current Defaults (if no custom background):
- **Course Page**: Professional education-themed image
- **Shop Page**: E-commerce themed image  
- **About Page**: Clean gradient background
- **Contact Page**: Modern gradient background

---

## 🔧 Technical Details

### Database Schema Changes

#### Course Model - Added Fields:
```javascript
{
  // Lesson level
  releaseDate: Date,           // When lesson becomes available
  isLocked: Boolean,           // Lock status
  
  // Course level  
  introVideoLink: String,      // External video URL
  introVideoUrl: String,       // Uploaded video URL
  introVideoStorageType: String // 'local' or 'google-drive'
}
```

#### PageBackground Model:
```javascript
{
  pageName: String,           // 'course', 'shop', 'about', 'contact'
  imageUrl: String,          // Background image URL
  storageType: String,       // 'local' or 'google-drive'
  uploadedBy: ObjectId,      // Admin who uploaded
  createdAt: Date,
  updatedAt: Date
}
```

### API Endpoints

#### Video Progress
```
POST   /api/video-progress/update
GET    /api/video-progress/course/:courseId
GET    /api/video-progress/course/:courseId/video/:videoLink
```

#### Lesson Release Dates (Admin Only)
```
PATCH  /api/admin/courses/:courseId/modules/:moduleIndex/lessons/:lessonIndex/release-date
```

#### Page Backgrounds
```
GET    /api/page-backgrounds/:pageName              (Public)
GET    /api/page-backgrounds                        (Admin)
POST   /api/page-backgrounds/upload/:pageName       (Admin)
DELETE /api/page-backgrounds/:pageName              (Admin)
```

### Frontend Components

#### VideoPlayer Component
**Location**: `frontend/components/VideoPlayer.tsx`

**Features**:
- Supports YouTube, Vimeo, direct URLs
- Progress tracking & saving
- Completion detection (90%+)
- Responsive design
- Error handling

**Usage**:
```tsx
<VideoPlayer
  courseId={courseId}
  videoLink={videoUrl}
  autoSaveProgress={true}
/>
```

---

## 🎯 Quick Start Examples

### Example 1: Upload Course with Intro Video
1. Admin Panel → Courses → Create New
2. Fill course details (title, description, etc.)
3. Step 3: Paste YouTube link in "Intro Video Link"
4. Save course
5. **Result**: Video visible on course detail page for all visitors

### Example 2: Schedule Weekly Lesson Releases
```bash
# Lesson 1 - Available now
PATCH /api/admin/courses/ABC123/modules/0/lessons/0/release-date
{ "isLocked": false }

# Lesson 2 - Available next Monday
PATCH /api/admin/courses/ABC123/modules/0/lessons/1/release-date
{ "releaseDate": "2026-01-13T00:00:00Z", "isLocked": true }

# Lesson 3 - Available in 2 weeks
PATCH /api/admin/courses/ABC123/modules/0/lessons/2/release-date
{ "releaseDate": "2026-01-20T00:00:00Z", "isLocked": true }
```

### Example 3: Update Course Page Background
1. Admin Panel → Page Backgrounds
2. Select "Course Page"
3. Upload your custom image (1920x400px recommended)
4. **Result**: New background visible immediately on /courses

---

## 🧪 Testing Guide

### Test Video Display:
1. ✅ Visit a course detail page
2. ✅ Verify intro video plays
3. ✅ Enroll in course
4. ✅ Click module lesson with video
5. ✅ Verify "Now Playing" section appears
6. ✅ Check progress bar updates
7. ✅ Verify progress saves (refresh page, progress persists)

### Test Release Dates:
1. ✅ Set future release date for a lesson
2. ✅ Enroll in course
3. ✅ Verify lesson shows 🔒 icon
4. ✅ Verify click does nothing
5. ✅ Verify message shows release date
6. ✅ Set release date to past
7. ✅ Verify lesson now accessible

### Test Background Upload:
1. ✅ Go to Admin → Page Backgrounds
2. ✅ Upload image for each page
3. ✅ Verify preview shows before upload
4. ✅ Verify success message after upload
5. ✅ Visit each page (/courses, /shop, /about, /contact)
6. ✅ Verify new backgrounds display correctly

---

## 🐛 Troubleshooting

### Videos Not Playing?
- **Check URL format**: Must be valid YouTube, Vimeo, or direct video URL
- **Check enrollment**: Module videos only available to enrolled students
- **Check browser console**: Look for error messages
- **Verify Google Drive permissions**: If using Drive uploads

### Locked Lessons Not Working?
- **Check date format**: Must be valid ISO 8601 format
- **Check timezone**: Server uses UTC, adjust accordingly
- **Check module/lesson indices**: Must be valid (0-based)
- **Verify admin token**: Must have admin privileges

### Background Not Showing?
- **Check file size**: Must be under 5MB
- **Check file type**: Must be JPG, PNG, or WebP
- **Check upload success**: Look for success message
- **Clear browser cache**: Hard refresh (Ctrl+F5)
- **Check API URL**: Verify NEXT_PUBLIC_API_URL is set correctly

---

## 📊 Summary

### ✅ What's Now Possible:

**For Students:**
- ✅ Watch intro videos before enrolling
- ✅ Access all module videos after enrollment
- ✅ Professional video player with progress tracking
- ✅ See which lessons are locked and when they unlock
- ✅ Improved visual experience with custom page backgrounds

**For Admins:**
- ✅ Add videos via link or upload
- ✅ Schedule lesson releases for drip-feed content
- ✅ Customize header backgrounds for all pages
- ✅ Track student video progress
- ✅ Professional, user-friendly interface

### 🚀 Impact:
- **Better Engagement**: Progress tracking encourages completion
- **Flexible Content Delivery**: Release schedules prevent overwhelm
- **Professional Appearance**: Custom backgrounds & video player
- **Improved UX**: Clear indicators, smooth playback, responsive design

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review API documentation
3. Check browser console for errors
4. Verify admin permissions
5. Test with different browsers

---

**Last Updated**: January 8, 2026
**Version**: 1.0.0
