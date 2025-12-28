# Testing Guide - JWT and Cart Fixes

## 🧪 Quick Test Checklist

### Prerequisites
```bash
# 1. Start MongoDB (if not running)
# 2. Ensure backend/.env has JWT_SECRET configured
# 3. Install dependencies if needed
cd backend && npm install
cd ../frontend && npm install
```

### Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm start
# Should see: "✅ MongoDB connected" and "🚀 Server running on port 5000"

# Terminal 2 - Frontend
cd frontend
npm run dev
# Should see: "- Local: http://localhost:3000"
```

## ✅ Test Scenarios

### Test 1: JWT Authentication for Add to Cart
**Steps:**
1. Open browser to `http://localhost:3000`
2. Register a new account or login
3. Navigate to Shop page
4. Click "Add to Cart" on any product
5. **Expected:** Item added successfully without JWT errors
6. Check browser console - should see NO "invalid signature" errors

**If it fails:**
- Check backend console for JWT errors
- Verify JWT_SECRET in backend/.env
- Clear localStorage and login again

### Test 2: JWT Authentication for Add to Favorites
**Steps:**
1. While logged in, go to Shop page
2. Click the heart icon on any product
3. **Expected:** Item added to wishlist successfully
4. Navigate to `/wishlist` to verify
5. Check browser console - should see NO authentication errors

**If it fails:**
- Open browser DevTools > Application > Local Storage
- Verify 'token' exists and has a value
- Try logging out and back in

### Test 3: Session Expiry Handling
**Steps:**
1. Login to the application
2. Open browser DevTools > Application > Local Storage
3. Delete or corrupt the 'token' value
4. Try to add an item to cart
5. **Expected:** 
   - Alert: "Your session has expired. Please log in again."
   - Automatic redirect to login page
   - Token cleared from localStorage

### Test 4: Empty Cart Validation
**Steps:**
1. Login to the application
2. Ensure cart is empty (clear if needed)
3. Navigate directly to `/checkout`
4. **Expected:** 
   - See "Your cart is empty" message
   - "Return to Shop" button displayed
5. Cannot proceed with order creation

**Alternative Test:**
1. Add items to cart
2. Remove all items
3. Try to access checkout
4. Should see empty cart message

### Test 5: Empty Cart API Error
**Steps:**
1. Login and get token from localStorage
2. Open browser DevTools > Console
3. Run this code:
```javascript
const token = localStorage.getItem('token');
fetch('http://localhost:5000/api/orders', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    items: [],
    shippingAddress: { street: 'Test', city: 'Test' },
    customerName: 'Test User',
    customerEmail: 'test@test.com',
    totalAmount: 0
  })
}).then(r => r.json()).then(console.log);
```
4. **Expected Response:**
```json
{
  "success": false,
  "message": "Cannot create order with empty cart. Please add items to your cart first.",
  "errorCode": "EMPTY_CART"
}
```

## 🔍 Debugging Tips

### Check JWT Token
```javascript
// In browser console
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);
console.log('Token:', token);

// Decode token (middle part between dots)
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token payload:', payload);
console.log('Expires:', new Date(payload.exp * 1000));
```

### Check Backend JWT Processing
```bash
# In backend terminal, you should see:
# ⚠️ WARNING: Using default JWT_SECRET... (if not set in .env)
# Or no warning if JWT_SECRET is properly configured
```

### Common Issues and Solutions

#### Issue: "Invalid signature" still appears
**Solution:**
1. Restart backend server
2. Clear browser localStorage
3. Login again with fresh token
4. Verify JWT_SECRET in backend/.env matches the value used

#### Issue: Cart items not saving
**Solution:**
1. Check if logged in (token exists)
2. Verify backend is running
3. Check network tab for 401 errors
4. Try logout and login again

#### Issue: Redirecting to login unexpectedly
**Solution:**
1. Token may have expired (7-day expiry)
2. Clear localStorage and login again
3. Check backend for JWT verification errors

## 📊 Expected Logs

### Backend Console (Successful Operations)
```
✅ MongoDB connected
🚀 Server running on port 5000
POST /api/users/cart 200 - 45ms
POST /api/users/wishlist/123abc 200 - 32ms
```

### Backend Console (Authentication Errors - These are now handled gracefully)
```
Token verification error: invalid signature
Token expired: jwt expired
```

### Browser Console (Successful Operations)
```
Cart updated successfully
Wishlist updated successfully
```

### Browser Console (Expected Error Handling)
```
Authentication error: Invalid or expired token. Please log in again.
(User is automatically redirected to login)
```

## ✅ Success Criteria

All tests pass when:
- ✅ Add to Cart works without JWT errors
- ✅ Add to Favorites works without JWT errors  
- ✅ Invalid tokens trigger user-friendly alerts
- ✅ Expired tokens redirect to login automatically
- ✅ Empty cart shows clear message
- ✅ Empty cart API returns proper error code
- ✅ No console errors during normal operations
- ✅ Users are informed of issues clearly

## 🎯 Performance Verification

After fixes, verify:
1. **Response Time:** API calls should complete in < 200ms
2. **No Memory Leaks:** Token verification doesn't accumulate errors
3. **Proper Cleanup:** Tokens removed on logout/expiry
4. **User Experience:** No technical jargon shown to users

## 📝 Test Report Template

```
Date: ___________
Tester: ___________

Test 1 - Add to Cart: ☐ Pass ☐ Fail
Test 2 - Add to Favorites: ☐ Pass ☐ Fail
Test 3 - Session Expiry: ☐ Pass ☐ Fail
Test 4 - Empty Cart UI: ☐ Pass ☐ Fail
Test 5 - Empty Cart API: ☐ Pass ☐ Fail

Issues Found:
_________________________________
_________________________________

Notes:
_________________________________
_________________________________
```

---

**All tests should pass with the implemented fixes!** 🎉
