# Quick Fix: Token Verification Error - Invalid Signature

## ⚡ What Was Changed

Fixed JWT token verification issue in backend that was causing "invalid signature" and 401 errors:

1. ✅ **backend/utils/jwt.js** - Added JWT_SECRET validation and logging
2. ✅ **backend/middleware/auth.js** - Enhanced error debugging
3. ✅ **backend/routes/authRoutes.js** - Added token validation endpoint

## 🚀 Immediate Actions Required

### 1. Restart Backend
```bash
# Terminal: Backend
cd backend
npm install  # Fresh install of dependencies
npm start    # Start backend with logging
```

Watch for this message:
```
ℹ️ JWT_SECRET loaded: 46496b47... (length: 64)
```

### 2. Test Token Verification
After logging in, your token should work. You can test it:

**Option A: Browser Console**
```javascript
const token = localStorage.getItem('token'); // or 'adminToken'
fetch('http://localhost:5000/api/auth/validate-token', {
  headers: { Authorization: `Bearer ${token}` }
}).then(r => r.json()).then(console.log)
```

**Option B: Command Line (PowerShell)**
```powershell
$token = "YOUR_TOKEN_HERE"
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/validate-token" -Headers $headers
```

### 3. Clear Browser Cache
- Open DevTools (F12)
- Local Storage → Delete "token" and "adminToken"
- Clear all cookies
- Login again and try the request

## ✅ Verification Checklist

After applying the fix, verify:

- [ ] Backend starts without errors
- [ ] Backend logs show "JWT_SECRET loaded" message
- [ ] Can login successfully
- [ ] Token validation endpoint returns 200 status
- [ ] Can add items to cart (or perform authenticated action)
- [ ] Can access admin panel (if admin user)
- [ ] No 401 errors on authenticated requests

## 🔍 Debugging if Issue Persists

### Check Backend Logs
Look for these messages:
```
✅ Success message (token works)
❌ Token verification failed (check secret)
```

### Common Issues

**Issue: Still getting 401 after login**
- Ensure `.env` file is in `backend/` folder
- Check that `JWT_SECRET` value matches between login and verification
- Restart backend completely

**Issue: Token works sometimes, fails other times**
- May need to restart backend after checking logs
- Verify no other backend process running on port 5000

**Issue: Only admin login fails**
- Admin and regular users use same JWT_SECRET
- Verify admin user exists in database with role='admin'
- Check that admin is email-verified

## 📝 Technical Details

### The Problem
When you generate a JWT token during login, it's signed with `JWT_SECRET`. When you make requests, the middleware verifies the token signature matches the same secret. If they don't match, you get "invalid signature".

### The Solution
1. **Strip whitespace** from JWT_SECRET (in case of trailing spaces in .env)
2. **Add logging** to confirm secret is loaded from .env
3. **Better error messages** to help diagnose issues
4. **Validation endpoint** to test tokens independently

### JWT Flow
```
Login Request
    ↓
generateToken() → signs with JWT_SECRET
    ↓
Returns token to frontend
    ↓
Frontend stores in localStorage
    ↓
API Request with "Bearer token"
    ↓
authMiddleware
    ↓
verifyToken() → verifies with JWT_SECRET
    ↓
✅ Match = Access Granted
❌ No Match = 401 Unauthorized
```

## 🎯 Next Steps

1. Restart backend and check logs
2. Clear browser storage and login again  
3. Test the validation endpoint
4. If still issues, check backend console for `❌` error messages

The fix is ready to use - just restart your backend!
