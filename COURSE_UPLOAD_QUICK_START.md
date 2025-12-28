# 🚀 Course Upload - Quick Start Guide

## ✅ System Status: READY TO USE

Your course upload system is now **fully operational** and works immediately with **local storage**. Google Drive is optional!

## 📁 How It Works Now

```
Course Upload → Files Saved Locally → Displayed on Website ✅
              (backend/uploads/courses/)
```

**No Google Drive setup required!** The system automatically:
- ✅ Saves files to `backend/uploads/courses/`
- ✅ Serves them via Express at `/uploads/courses/...`
- ✅ Displays them correctly on your website
- ✅ Handles all file types (images, PDFs, videos)

## 🎯 Quick Test (5 Minutes)

### Step 1: Start the Servers
```bash
# Terminal 1 - Backend
cd backend
npm start
# Wait for: "🚀 Server running on port 5000"

# Terminal 2 - Admin Panel
cd admin-panel
npm run dev
# Wait for: "- Local: http://localhost:3001"
```

### Step 2: Create a Test Course
1. Open: http://localhost:3001/login
2. Login with admin credentials
3. Click **"Courses"** → **"Create New Course"**
4. Fill in:
   - Title: "Test Course"
   - Description: "Testing file uploads"
   - Price: 99
   - Category: "Technology"
5. **Upload Course Image** (any JPG/PNG, max 10MB)
6. **Upload PDF Materials** (optional, max 50MB each)
7. Click **"Create Course"**

### Step 3: Upload a Video Lesson
1. Click **"Upload Course Video"**
2. Select your test course
3. Select module (or create new)
4. Enter lesson title and description
5. **Upload Video** (MP4/MOV/AVI, max 1GB)
6. Click **"Upload Lesson"**

### Expected Results:
✅ Course created successfully
✅ Image displayed as thumbnail
✅ PDF available for download
✅ Video playable in course
✅ All files stored in `backend/uploads/courses/`

## 📋 Supported File Formats

| Type | Formats | Max Size | Validated |
|------|---------|----------|-----------|
| **Images** | JPG, PNG, WebP | 10 MB | ✅ |
| **PDFs** | PDF | 50 MB | ✅ |
| **Videos** | MP4, MOV, AVI | 1 GB | ✅ |

## 🔍 Verify Uploads

### Check Files on Disk
```bash
# Windows
dir backend\uploads\courses\

# Mac/Linux
ls backend/uploads/courses/
```

### Check Database
```bash
# MongoDB shell
mongosh
use your_database_name
db.courses.find().pretty()

# Look for:
# - thumbnail: "/uploads/courses/1234567890-image.jpg"
# - thumbnailStorageType: "local"
# - modules.lessons.videoUrl: "/uploads/courses/1234567890-video.mp4"
```

### Check in Browser
- Course thumbnail should display
- PDFs should download
- Videos should play

## ⚠️ Troubleshooting

### Issue: "Failed to upload"
**Check backend console for:**
```
⚠️  Google Drive is NOT configured properly!
📁 Files will be stored LOCALLY in backend/uploads/ directory
✅ File saved locally: course-image-123.jpg
```
This is normal and expected! Files save locally.

### Issue: Image not displaying
**Solutions:**
1. Verify file exists: `backend/uploads/courses/filename.jpg`
2. Check browser console for 404 errors
3. Ensure backend is serving static files
4. Check course.thumbnail value in database

### Issue: Video not playing
**Solutions:**
1. Try MP4 format (most compatible)
2. Verify file size < 1GB
3. Check browser supports video format
4. Test direct URL: `http://localhost:5000/uploads/courses/video.mp4`

## 🌟 What's Been Fixed

### Before:
❌ Course uploads failed (Google Drive not configured)
❌ No error messages
❌ No file validation
❌ Required Google Drive setup

### After:
✅ Course uploads work immediately
✅ Clear error messages
✅ File validation (size & type)
✅ Works without Google Drive
✅ Automatic fallback system
✅ User-friendly notifications

## 🔄 Optional: Enable Google Drive

If you want to store files on Google Drive instead of locally:

1. **Get Google Drive credentials** (see COURSE_UPLOAD_COMPLETE_SOLUTION.md)
2. **Update backend/.env:**
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
```
3. **Restart backend server**
4. **New uploads will use Google Drive automatically**

The system will show:
```
✅ Google Drive client initialized successfully
📁 Created Google Drive folder for course: 60d5ec49...
✅ File uploaded to Google Drive: course-image.jpg
```

## 📝 File Management

### View Uploaded Files
```bash
# List all course files
ls backend/uploads/courses/

# Check file size
ls -lh backend/uploads/courses/filename.mp4
```

### Delete Old Files
```bash
# Manual deletion
rm backend/uploads/courses/old-file.jpg

# The database reference should also be updated
```

### Backup Files
```bash
# Backup entire uploads folder
tar -czf uploads-backup.tar.gz backend/uploads/

# Or copy to another location
cp -r backend/uploads/ /path/to/backup/
```

## 🎓 Best Practices

1. **File Naming:**
   - System auto-generates safe filenames
   - Format: `timestamp-originalname.ext`
   - Example: `1704067200000-lecture-video.mp4`

2. **File Organization:**
   - All course files in `backend/uploads/courses/`
   - Can create subdirectories if needed
   - Keep backups of important files

3. **File Formats:**
   - Images: Use JPG for photos, PNG for graphics
   - Videos: Use MP4 (H.264) for best compatibility
   - PDFs: Ensure PDFs are optimized for web

4. **Performance:**
   - Compress images before upload
   - Use appropriate video resolution (720p or 1080p)
   - Keep file sizes reasonable

## 📊 Storage Estimates

### Typical Course:
- Thumbnail: ~200 KB
- 5 PDF materials: ~25 MB total
- 10 video lessons (10 min each): ~2 GB total
- **Total per course: ~2 GB**

### Server Storage Planning:
- 10 courses: ~20 GB
- 50 courses: ~100 GB
- 100 courses: ~200 GB

## 🔐 Security Notes

- ✅ File type validation (frontend + backend)
- ✅ File size limits enforced
- ✅ Sanitized filenames (no path traversal)
- ✅ Files served through Express (controlled access)
- ✅ No direct file system exposure

## 💡 Tips

1. **Test with small files first** (< 1 MB) to verify everything works
2. **Check backend console logs** for detailed upload progress
3. **Use MP4 format for videos** for best browser compatibility
4. **Keep original files** as backup before uploading
5. **Monitor disk space** on your server

## ✨ You're Ready!

Your course upload system is now:
- ✅ **Fully functional** - works immediately
- ✅ **Reliable** - saves files locally
- ✅ **Flexible** - optional Google Drive integration
- ✅ **Validated** - checks file size and type
- ✅ **User-friendly** - clear error messages
- ✅ **Production-ready** - handle all file types

**Start creating courses now!** 🎉

---

**Need Help?**
- Check backend console logs for errors
- Review `COURSE_UPLOAD_COMPLETE_SOLUTION.md` for details
- Test with small files first
- Verify files appear in `backend/uploads/courses/`
