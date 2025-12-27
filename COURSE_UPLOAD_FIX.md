# Course Upload and Display Issues - Resolution Guide

## Problems Identified

### Problem 1: Course Files Upload Failure
**Cause**: Google Drive API credentials are not properly configured in the `.env` file.

When a user uploads a course with files:
- The course basic information uploads successfully
- The associated image and PDF files fail to upload to Google Drive
- Users see an error message about Google Drive configuration

### Problem 2: Course Display Issues
**Cause**: Frontend was using wrong field name (`image` instead of `thumbnail`)

Courses weren't displaying properly because:
- The backend stores the image URL in the `thumbnail` field
- The frontend was looking for an `image` field
- PDF files weren't being displayed as attached resources

## Solutions Implemented

### 1. Frontend Course List Display (✅ Fixed)

**File**: [admin-panel/app/courses/page.tsx](admin-panel/app/courses/page.tsx)

**Changes Made**:
- Fixed field reference from `course.image` to `course.thumbnail`
- Added PDF resource counter showing attached files
- Displays "📎 X file(s) attached" indicator under course title

**How it works now**:
```tsx
const materialsModule = course.modules?.find(m => m.title === '__course_materials__');
const pdfCount = materialsModule?.lessons?.[0]?.resources?.length || 0;
```

### 2. Backend Error Handling (✅ Improved)

**File**: [backend/controllers/adminController.js](backend/controllers/adminController.js)

**Changes Made**:
- Added specific error detection for missing Google Drive configuration
- Improved error messages to guide users on what's wrong
- Better logging for debugging upload failures

## Required Setup: Google Drive Configuration

To enable file uploads, you need to configure Google Drive API:

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Google Drive API"

### Step 2: Create Service Account
1. Go to "Service Accounts" in the Console
2. Create a new service account
3. Generate a JSON key and save it securely

### Step 3: Configure OAuth 2.0
1. Go to "OAuth consent screen"
2. Set up OAuth 2.0 credentials
3. Note your `client_id`, `client_secret`, and `refresh_token`

### Step 4: Create Google Drive Folders
1. Create these folders in your Google Drive:
   - Course Images (for thumbnails)
   - Course Videos (for video content)
   - Course PDFs (for PDF materials)

2. Share these folders with your service account email
3. Note the folder IDs (from the URL: `/folders/{FOLDER_ID}`)

### Step 5: Update .env File

Edit [backend/.env](backend/.env) with:

```env
# Google Drive API Configuration
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
GOOGLE_REDIRECT_URI=urn:ietf:wg:oauth:2.0:oob

# Google Drive Folder IDs
GOOGLE_DRIVE_FOLDER_ID=your_main_folder_id
GOOGLE_DRIVE_VIDEO_FOLDER_ID=your_video_folder_id
GOOGLE_DRIVE_IMAGE_FOLDER_ID=your_image_folder_id
GOOGLE_DRIVE_PDF_FOLDER_ID=your_pdf_folder_id
```

### Step 6: Get Your Refresh Token

Run this command to get a refresh token:
```bash
node -e "
const { google } = require('googleapis');
const oauth2Client = new google.auth.OAuth2(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'urn:ietf:wg:oauth:2.0:oob'
);
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/drive']
});
console.log('Visit this URL:', authUrl);
"
```

1. Visit the generated URL
2. Authorize the application
3. Copy the authorization code
4. Run:
```bash
node -e "
const { google } = require('googleapis');
const oauth2Client = new google.auth.OAuth2(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'urn:ietf:wg:oauth:2.0:oob'
);
oauth2Client.getToken('AUTHORIZATION_CODE', (err, tokens) => {
  console.log('Refresh Token:', tokens.refresh_token);
});
"
```

## Testing Course Upload

### Test Case 1: Upload Course with Image and PDFs
1. Go to Admin Panel → Courses → Create New Course
2. Fill in basic information (Step 1)
3. Add instructor and duration (Step 2)
4. Set price (Step 3)
5. Upload a course image and PDF files (Step 4)
6. Submit the form

**Expected Result**: 
- ✅ Course created successfully
- ✅ Image uploaded to Google Drive
- ✅ PDF files uploaded to Google Drive
- ✅ Course appears in courses list
- ✅ Thumbnail displays in the course card
- ✅ "📎 X file(s) attached" indicator shows

### Test Case 2: View Course Details
1. Go to Courses list
2. Click on a course with attached files
3. Navigate to the course details page

**Expected Result**:
- ✅ Course thumbnail displays properly
- ✅ PDF resources are accessible
- ✅ All course information is visible

## File Upload Data Flow

### Current Implementation:

```
Frontend (create/page.tsx)
    ↓
    Collects: title, description, category, price, instructor, duration, image, pdfFiles
    ↓
    Submits as FormData to: POST /admin/courses
    ↓
Backend (adminController.js)
    ↓
    Creates Course document
    ↓
    Uploads image → Google Drive Image Folder
    ↓
    Uploads PDFs → Google Drive PDF Folder
    ↓
    Stores Google Drive URLs in course.thumbnail and course.modules[0].lessons[0].resources
    ↓
    Returns success response
    ↓
Frontend (courses/page.tsx)
    ↓
    Displays course with thumbnail
    ↓
    Shows file count indicator
    ↓
    User can download resources from course details page
```

## Troubleshooting

### Issue: "Google Drive client not configured"
**Solution**: Check that all environment variables are set correctly in `.env` file

### Issue: Files upload but aren't visible in course list
**Solution**: Ensure `course.thumbnail` field is being populated (check Google Drive upload was successful)

### Issue: "Failed to upload file" error
**Solution**: 
1. Verify Google Drive folders exist and are shared with service account
2. Check MIME types are correct (image/* for images, application/pdf for PDFs)
3. Ensure file sizes aren't too large

### Issue: Course displays without image or files
**Solution**: The course creation succeeded but file uploads failed. Check:
1. Google Drive API credentials
2. Folder permissions
3. Network connectivity to Google Drive API

## Quick Reference

**Course Model Fields**:
- `thumbnail`: URL to course image (String)
- `modules[].title`: Module name (String)
- `modules[].lessons[].resources`: Array of resource URLs (Array<String>)

**Materials Module Structure**:
```javascript
{
  title: '__course_materials__',
  description: 'Downloadable course materials and resources',
  order: 0,
  lessons: [{
    title: 'Course Resources',
    description: 'Course materials and resources',
    order: 0,
    type: 'pdf',
    resources: ['url1', 'url2', ...] // Google Drive URLs
  }]
}
```

## Implementation Status

- ✅ Frontend fixed to use correct field name
- ✅ Backend error messages improved
- ✅ PDF resource counter added to course list
- ✅ File upload data flow documented
- ⏳ Google Drive configuration needed for live testing

