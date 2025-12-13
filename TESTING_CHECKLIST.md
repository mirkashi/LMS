# ✅ Testing Checklist - 9tangle LMS

## 🧪 Pre-Launch Testing Guide

Complete this checklist before deploying to production to ensure everything works correctly.

---

## 🔐 Authentication Testing

### Registration
- [ ] User can register with valid email and password
- [ ] User cannot register with existing email (conflict error)
- [ ] User cannot register with weak password
- [ ] User cannot register with mismatched password confirmation
- [ ] User receives verification email after registration
- [ ] User cannot login before email verification
- [ ] User can verify email using token from email
- [ ] Verification token expires after 24 hours
- [ ] User gets error if using expired token

### Login
- [ ] User can login with correct credentials
- [ ] User gets error with incorrect password
- [ ] User gets error with non-existent email
- [ ] JWT token is generated on successful login
- [ ] Token is stored in localStorage on frontend
- [ ] Token includes user ID and role
- [ ] User is redirected to dashboard after login
- [ ] Login form clears after successful login

### Password Reset
- [ ] User can request password reset
- [ ] User receives reset email
- [ ] User can reset password using email token
- [ ] Old password doesn't work after reset
- [ ] New password works for login
- [ ] Reset token expires after 24 hours
- [ ] Password reset link is secure (token-based)

### Logout
- [ ] Token is removed from localStorage on logout
- [ ] User is redirected to home page
- [ ] Protected routes redirect to login after logout

---

## 📚 Course Testing

### Course Display
- [ ] All courses display on courses page
- [ ] Course filtering by category works
- [ ] Course filtering by level works
- [ ] Course search by title works
- [ ] Course pagination works (limit & page)
- [ ] Course sorting works (price, rating, etc.)
- [ ] Course images load correctly
- [ ] Course cards show correct information

### Course Details
- [ ] Course detail page loads correctly
- [ ] All course information displays (title, description, price, instructor)
- [ ] Course modules and lessons display correctly
- [ ] Video player works for video lessons
- [ ] PDF viewer works for PDF lessons
- [ ] Course rating displays correctly
- [ ] All reviews display with correct data
- [ ] Unenrolled user sees "Enroll" button
- [ ] Enrolled user sees "Go to Course" button

### Course Reviews
- [ ] User can post review on enrolled course
- [ ] User cannot post review on non-enrolled course
- [ ] Review includes rating and comment
- [ ] Review appears immediately after posting
- [ ] User cannot post multiple reviews on same course
- [ ] Review delete works for admin
- [ ] Rating calculation updates correctly
- [ ] Review shows user name and date

---

## 👤 User Dashboard Testing

### Student Dashboard
- [ ] User can view enrolled courses
- [ ] Course progress bars display correctly
- [ ] User can access course lessons from dashboard
- [ ] Course cards show correct information
- [ ] User can navigate between lessons
- [ ] Lesson progress updates correctly
- [ ] Completed lessons are marked
- [ ] User can see overall progress percentage

### User Profile
- [ ] User can view profile information
- [ ] User can update name
- [ ] User can update phone number
- [ ] User can update bio
- [ ] User can view enrolled courses list
- [ ] User can view email
- [ ] Profile photo can be updated (when implemented)
- [ ] Changes are saved correctly

---

## 🛠️ Admin Panel Testing

### Admin Authentication
- [ ] Only admin role users can access admin routes
- [ ] Regular users get forbidden error on admin routes
- [ ] Admin token validation works
- [ ] Admin routes are protected

### Admin Dashboard
- [ ] Dashboard stats display correctly:
  - [ ] Total users count
  - [ ] Total courses count
  - [ ] Total orders count
  - [ ] Total revenue amount
- [ ] Recent orders table displays
- [ ] Recent orders show latest 5 orders
- [ ] Quick action buttons are present

### Course Management
- [ ] Admin can create new course
- [ ] All course fields are required
- [ ] Course thumbnail uploads correctly
- [ ] Admin can view all courses
- [ ] Admin can edit course details
- [ ] Admin can publish/unpublish course
- [ ] Admin can delete course
- [ ] Deleted course is not visible to users
- [ ] Price validation works (no negative prices)

### Module Management
- [ ] Admin can add module to course
- [ ] Module displays in course details
- [ ] Module order can be arranged
- [ ] Module can be deleted
- [ ] Module description displays correctly

### Lesson Management
- [ ] Admin can add video lesson
- [ ] Admin can add PDF lesson
- [ ] Admin can add text lesson
- [ ] Video files upload and play correctly
- [ ] PDF files upload and are accessible
- [ ] Lesson duration displays correctly
- [ ] Lessons display in correct order
- [ ] Lesson can be deleted
- [ ] File size limits are enforced (500MB max)

### Order Management
- [ ] Admin can view all orders
- [ ] Order details show correct information:
  - [ ] Order ID
  - [ ] Customer name/email
  - [ ] Items purchased
  - [ ] Total amount
  - [ ] Payment status
  - [ ] Order status
- [ ] Admin can update order status
- [ ] Admin can update payment status
- [ ] Order history is maintained

---

## 🛒 E-Commerce Testing (When Implemented)

### Shopping Cart
- [ ] User can add course to cart
- [ ] User can remove course from cart
- [ ] Cart total calculates correctly
- [ ] Cart persists on page refresh
- [ ] User cannot add same course twice

### Checkout
- [ ] User can proceed to checkout
- [ ] Shipping address fields appear
- [ ] Payment information form appears
- [ ] Form validation works
- [ ] User cannot checkout with empty fields

### Payment (Stripe/Paypal)
- [ ] Payment gateway integration works
- [ ] Test card numbers work
- [ ] Payment succeeds with valid card
- [ ] Payment fails with invalid card
- [ ] Order is created after successful payment
- [ ] User is enrolled in purchased courses
- [ ] Confirmation email is sent

---

## 📧 Email Testing

### Email Verification
- [ ] Verification email is sent on registration
- [ ] Email contains verification link
- [ ] Link works and verifies email
- [ ] User can click link in email

### Password Reset
- [ ] Reset email is sent on request
- [ ] Email contains reset link
- [ ] Link works and shows reset form
- [ ] Password can be reset via form

### Order Confirmation
- [ ] Confirmation email sent after purchase
- [ ] Email shows order details
- [ ] Email shows purchased courses
- [ ] Email has download/access link

### Admin Notifications
- [ ] Admin receives email on new order
- [ ] Admin receives email on new user registration
- [ ] Admin receives email on new review

---

## 🎨 UI/UX Testing

### Navigation
- [ ] Navigation bar appears on all pages
- [ ] All navigation links work correctly
- [ ] Mobile menu works and shows all items
- [ ] Active page is highlighted in nav
- [ ] User menu shows correct user info
- [ ] User can logout from menu
- [ ] Admin link appears only for admins

### Responsive Design
- [ ] Layout works on desktop (1920px+)
- [ ] Layout works on tablet (768px-1024px)
- [ ] Layout works on mobile (320px-767px)
- [ ] All buttons are clickable on mobile
- [ ] Text is readable on all devices
- [ ] Images resize correctly
- [ ] Navigation works on mobile

### Forms
- [ ] All form fields are properly labeled
- [ ] Form validation shows error messages
- [ ] Form loading state shows spinner
- [ ] Form can be submitted with keyboard
- [ ] Form fields maintain state on error
- [ ] Required fields are marked

### Accessibility
- [ ] All buttons have proper labels
- [ ] Form inputs have associated labels
- [ ] Images have alt text
- [ ] Links have descriptive text
- [ ] Keyboard navigation works
- [ ] Color contrast is sufficient
- [ ] Focus indicators are visible

---

## 🔒 Security Testing

### Authentication
- [ ] JWT token validation works
- [ ] Expired tokens are rejected
- [ ] Invalid tokens are rejected
- [ ] Token cannot be modified
- [ ] Password hashing works (bcryptjs)

### Authorization
- [ ] Protected routes require token
- [ ] Admin routes check role
- [ ] User cannot access other user's data
- [ ] User cannot access admin features

### Data Validation
- [ ] Email format is validated
- [ ] Password requirements enforced
- [ ] Required fields are checked
- [ ] SQL injection prevention works
- [ ] XSS protection works

### File Upload
- [ ] Only allowed file types upload
- [ ] File size limits enforced
- [ ] Files cannot overwrite each other
- [ ] Uploaded files are scanned for malware
- [ ] Sensitive files cannot be uploaded

### CORS
- [ ] Frontend can communicate with backend
- [ ] Cross-origin requests have correct headers
- [ ] Preflight requests work

---

## 🚀 Performance Testing

### Page Load Times
- [ ] Home page loads in < 2 seconds
- [ ] Courses page loads in < 2 seconds
- [ ] Course detail loads in < 3 seconds
- [ ] Admin dashboard loads in < 3 seconds

### Database Performance
- [ ] Course queries return in < 500ms
- [ ] User queries return in < 300ms
- [ ] Bulk operations complete efficiently
- [ ] No N+1 query problems

### Frontend Performance
- [ ] JavaScript bundles are optimized
- [ ] Images are optimized/lazy loaded
- [ ] CSS is minified
- [ ] No memory leaks in components
- [ ] Smooth animations/transitions

### API Performance
- [ ] API responses are under 200ms
- [ ] Large datasets are paginated
- [ ] File uploads handle large files
- [ ] Concurrent requests are handled

---

## 🐛 Browser Compatibility

- [ ] Works on Chrome (latest)
- [ ] Works on Firefox (latest)
- [ ] Works on Safari (latest)
- [ ] Works on Edge (latest)
- [ ] Works on mobile Safari
- [ ] Works on Android Chrome
- [ ] No console errors on any browser

---

## 📱 Mobile Testing

- [ ] All pages are mobile-responsive
- [ ] Touch interactions work (buttons, links)
- [ ] Forms are easy to fill on mobile
- [ ] Images scale correctly
- [ ] Text is readable without zooming
- [ ] Navigation works on mobile
- [ ] Video player works on mobile
- [ ] Login persists on mobile refresh

---

## 🔄 Integration Testing

### Frontend-Backend Integration
- [ ] Login on frontend saves token correctly
- [ ] Protected routes check token
- [ ] API errors display to user
- [ ] Loading states work correctly
- [ ] Redirects work after actions

### Database Integration
- [ ] Data persists after page refresh
- [ ] Multiple users can access same data
- [ ] Concurrent operations work correctly
- [ ] Transactions are atomic

---

## 📊 Analytics & Logging

- [ ] Error logging works
- [ ] User actions are logged
- [ ] API calls are logged
- [ ] Database operations are logged
- [ ] Admin can view logs/analytics

---

## 🚨 Error Handling

### User-Friendly Errors
- [ ] 404 pages display correctly
- [ ] 500 errors don't crash app
- [ ] Network errors are handled
- [ ] Validation errors show helpful messages
- [ ] Users can recover from errors

### Error Messages
- [ ] Errors are clear and helpful
- [ ] Errors suggest actions
- [ ] Errors don't show sensitive info
- [ ] Errors are logged for debugging

---

## 📋 Final Checklist

Before deploying to production:

- [ ] All tests above pass
- [ ] Code is reviewed
- [ ] Environment variables are set
- [ ] Database is configured
- [ ] Email service is configured
- [ ] File upload directory exists
- [ ] CORS is configured for production domain
- [ ] HTTPS is enabled
- [ ] SSL certificate is valid
- [ ] Database backups are setup
- [ ] Logging/monitoring is setup
- [ ] Error tracking is configured
- [ ] Performance monitoring is setup
- [ ] Status page is ready
- [ ] Support email is configured
- [ ] Documentation is complete
- [ ] Deployment plan is documented
- [ ] Rollback plan is documented

---

## 📝 Testing Notes

**Date Tested:** ________________

**Tester Name:** ________________

**Browser/Device:** ________________

**Pass/Fail:** ________________

**Issues Found:**

1. ________________
2. ________________
3. ________________

**Comments:**

________________

---

**Ready for Production? [ ] YES  [ ] NO**

---

Happy Testing! 🎉
