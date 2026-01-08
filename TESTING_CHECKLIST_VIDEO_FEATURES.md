# ✅ Testing Checklist - Video & Background Features

Use this checklist to verify all features are working correctly.

---

## 🎥 Problem 1: Video Links Visible After Enrollment

### Test Steps:
1. [ ] Navigate to any course detail page as a non-enrolled user
2. [ ] Verify intro video is visible at the top
3. [ ] Enroll in the course (or login as enrolled user)
4. [ ] Verify course modules are now visible
5. [ ] Look for lessons with video type
6. [ ] Verify green "✓ Video Ready - Click to Play" badge appears
7. [ ] Click on a video lesson
8. [ ] Verify video loads and plays

### Expected Results:
- ✅ Intro video visible to all users
- ✅ Module videos visible to enrolled users only
- ✅ Clear visual indicators for video availability
- ✅ Videos are clickable and functional

---

## ▶️ Problem 2: Videos Play Correctly

### Test Steps:
1. [ ] Click on a lesson with video
2. [ ] Verify "Now Playing" section appears with highlighted border
3. [ ] Verify video player loads
4. [ ] Play the video
5. [ ] Verify progress bar updates as video plays
6. [ ] Verify time counter updates (e.g., "1:30 / 5:00")
7. [ ] Refresh the page
8. [ ] Verify progress persists (video resumes where you left off)
9. [ ] Test with different video types:
   - [ ] YouTube video
   - [ ] Vimeo video
   - [ ] Direct MP4 upload
   - [ ] Google Drive video
10. [ ] Verify "Close Video" button works

### Expected Results:
- ✅ Videos play smoothly
- ✅ Progress tracking works
- ✅ All video formats supported
- ✅ Professional player UI
- ✅ Progress persists across page refreshes
- ✅ Can close active video

---

## 📅 Problem 3: Daily Video Release System

### Setup (Admin):
```bash
# Lock a lesson with future release date
curl -X PATCH \
  http://localhost:5000/api/admin/courses/YOUR_COURSE_ID/modules/0/lessons/1/release-date \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "releaseDate": "2026-12-31T00:00:00.000Z",
    "isLocked": true
  }'
```

### Test Steps:
1. [ ] Set release date for a lesson (use API endpoint above)
2. [ ] Verify API returns success response
3. [ ] Login as enrolled student
4. [ ] Navigate to course detail page
5. [ ] Find the locked lesson
6. [ ] Verify 🔒 icon appears instead of 🎥
7. [ ] Verify release date message displays (e.g., "Available on 12/31/2026")
8. [ ] Try clicking the locked lesson
9. [ ] Verify nothing happens (not clickable)
10. [ ] Verify lesson is grayed out / has reduced opacity
11. [ ] Now unlock the lesson:
```bash
curl -X PATCH \
  http://localhost:5000/api/admin/courses/YOUR_COURSE_ID/modules/0/lessons/1/release-date \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "releaseDate": null,
    "isLocked": false
  }'
```
12. [ ] Refresh page
13. [ ] Verify lesson is now unlocked and clickable

### Expected Results:
- ✅ Locked lessons show 🔒 icon
- ✅ Release date message displays
- ✅ Locked lessons are not clickable
- ✅ Styling indicates locked state
- ✅ Unlocking works correctly

---

## 🎨 Problem 4: Header Background Management

### Test Steps - Admin Upload:
1. [ ] Login to Admin Panel
2. [ ] Navigate to "Page Backgrounds" in sidebar
3. [ ] Verify all 4 page tabs visible (Course, Shop, About, Contact)
4. [ ] Select "Course Page"
5. [ ] Drag & drop an image or click to select
6. [ ] Verify preview appears before upload
7. [ ] Verify file validation works:
   - [ ] Try file > 5MB → Should show error
   - [ ] Try non-image file → Should show error
   - [ ] Try valid JPG/PNG → Should work
8. [ ] Add alt text (optional)
9. [ ] Add description (optional)
10. [ ] Click "Upload Background"
11. [ ] Verify success message appears
12. [ ] Verify background appears in list
13. [ ] Repeat for Shop, About, Contact pages

### Test Steps - User View:
1. [ ] Visit `/courses` page
2. [ ] Verify new background displays in header
3. [ ] Verify text is still readable (gradient overlay working)
4. [ ] Test responsiveness:
   - [ ] Desktop view
   - [ ] Tablet view
   - [ ] Mobile view
5. [ ] Repeat for:
   - [ ] `/shop` page
   - [ ] `/about` page
   - [ ] `/contact` page

### Expected Results:
- ✅ Can upload for all 4 pages
- ✅ Drag & drop works
- ✅ Preview shows before upload
- ✅ Validation prevents invalid files
- ✅ Backgrounds display correctly on respective pages
- ✅ Text remains readable
- ✅ Responsive on all devices

---

## 🔄 Integration Tests

### Test Workflow 1: Complete Course Experience
1. [ ] Create new course as admin with intro video
2. [ ] Add module with 3 lessons (2 unlocked, 1 locked)
3. [ ] Enroll as student
4. [ ] Verify intro video plays
5. [ ] Verify 2 lessons are accessible
6. [ ] Verify 1 lesson is locked
7. [ ] Watch one lesson completely
8. [ ] Verify progress saves
9. [ ] Logout and login again
10. [ ] Verify progress persists

### Test Workflow 2: Background Customization
1. [ ] Upload backgrounds for all 4 pages
2. [ ] Visit each page and verify
3. [ ] Delete one background
4. [ ] Verify fallback image displays
5. [ ] Re-upload new background
6. [ ] Verify new image replaces old

### Test Workflow 3: Release Schedule
1. [ ] Set staggered release dates for 5 lessons:
   - Lesson 1: Available now
   - Lesson 2: Tomorrow
   - Lesson 3: Next week
   - Lesson 4: Next month
   - Lesson 5: Available now
2. [ ] Verify only lessons 1 & 5 accessible
3. [ ] Verify lessons 2, 3, 4 show correct release dates
4. [ ] Change lesson 2 to unlock now
5. [ ] Verify lesson 2 becomes accessible

---

## 🐛 Error Handling Tests

### Video Player Errors:
1. [ ] Test with invalid video URL
2. [ ] Verify error message displays
3. [ ] Test with deleted Google Drive file
4. [ ] Verify graceful error handling

### Background Upload Errors:
1. [ ] Try uploading without being logged in
2. [ ] Verify unauthorized error
3. [ ] Try uploading corrupt image
4. [ ] Verify validation error

### API Errors:
1. [ ] Send invalid course ID to release date endpoint
2. [ ] Verify 404 error
3. [ ] Send invalid date format
4. [ ] Verify 400 error

---

## 📱 Cross-Browser Testing

Test on:
- [ ] Chrome (Desktop)
- [ ] Firefox (Desktop)
- [ ] Safari (Mac/iOS)
- [ ] Edge (Desktop)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

Verify:
- [ ] Videos play on all browsers
- [ ] Backgrounds display correctly
- [ ] UI is responsive
- [ ] Progress tracking works
- [ ] No console errors

---

## ⚡ Performance Tests

1. [ ] Load course with 10+ video lessons
2. [ ] Verify page loads in < 3 seconds
3. [ ] Play video and check for buffering
4. [ ] Upload 5MB background image
5. [ ] Verify upload completes in < 10 seconds
6. [ ] Test with slow 3G connection
7. [ ] Verify graceful degradation

---

## 🔒 Security Tests

1. [ ] Try accessing admin endpoints without token
2. [ ] Verify 401 Unauthorized
3. [ ] Try accessing locked lesson content directly
4. [ ] Verify content is hidden in API response
5. [ ] Try uploading background as non-admin
6. [ ] Verify 403 Forbidden

---

## ✅ Final Verification

### All Features Working:
- [ ] ✓ Video links visible after enrollment
- [ ] ✓ Videos play correctly
- [ ] ✓ Release date system working
- [ ] ✓ Background management working
- [ ] ✓ Progress tracking working
- [ ] ✓ All documentation complete
- [ ] ✓ No console errors
- [ ] ✓ Responsive design verified
- [ ] ✓ Cross-browser tested
- [ ] ✓ API endpoints tested

### Documentation Complete:
- [ ] VIDEO_AND_BACKGROUND_FEATURES_GUIDE.md
- [ ] API_QUICK_REFERENCE_VIDEO_FEATURES.md
- [ ] IMPLEMENTATION_SUMMARY_VIDEO_FEATURES.md
- [ ] This testing checklist

---

## 🚀 Production Readiness

Before deploying to production, ensure:
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Backend server starts without errors
- [ ] Frontend builds successfully
- [ ] Environment variables configured
- [ ] Google Drive API configured (if using Drive storage)
- [ ] Database backups created
- [ ] Admin users have proper permissions
- [ ] Documentation shared with team

---

## 📊 Test Results Summary

**Date Tested**: _____________

**Tester**: _____________

**Overall Status**: [ ] PASS  [ ] FAIL

**Issues Found**: _____________

**Notes**: _____________

---

## 🆘 If Tests Fail

1. Check browser console for errors
2. Verify backend server is running
3. Check API URL in environment variables
4. Verify database connection
5. Review [TROUBLESHOOTING.md](./VIDEO_AND_BACKGROUND_FEATURES_GUIDE.md#-troubleshooting)
6. Check network requests in DevTools
7. Verify admin token is valid

---

**Testing Complete!** ✅

Once all tests pass, the system is ready for production deployment.

