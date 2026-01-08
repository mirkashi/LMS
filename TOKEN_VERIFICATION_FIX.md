# Token Verification Error - Invalid Signature Fix

## Problem
You're getting:
- "Token verification error: invalid signature"
- 401 Unauthorized responses

## Root Causes

This error typically occurs when:
1. **JWT_SECRET mismatch**: Token was signed with one secret but verified with another
2. **Token corruption**: Token is being modified during transmission
3. **Environment variable not loaded**: `.env` file not being read properly
4. **Token format issue**: Bearer token format is incorrect

## Solution Applied

### 1. Enhanced JWT Utility (`backend/utils/jwt.js`)
- Added `.trim()` to remove whitespace from JWT_SECRET
- Added logging to verify secret is loaded correctly
- Enhanced error messages with diagnostic information

### 2. Improved Auth Middleware (`backend/middleware/auth.js`)
- Added detailed logging when token verification fails
- Better error messages for debugging

### 3. Added Token Validation Endpoint
- New endpoint: `GET /auth/validate-token`
- Requires valid token in Authorization header
- Returns user info if token is valid
- Use this to test if tokens are being verified correctly

## How to Verify the Fix

### Step 1: Check Backend Logs
Restart the backend and look for:
```
ℹ️ JWT_SECRET loaded: 46496b47... (length: 64)
```

This confirms the JWT_SECRET is loaded from `.env`

### Step 2: Test Token Validation
```bash
# After logging in, copy the token from response
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:5000/auth/validate-token
```

Expected response:
```json
{
  "success": true,
  "message": "Token is valid",
  "user": {
    "id": "user_id",
    "userId": "user_id",
    "role": "user"
  }
}
```

If you get 401 error, check logs for: `❌ Token verification failed`

### Step 3: Verify .env File
Ensure `backend/.env` has:
```
JWT_SECRET=46496b47f8fa05837a4b367bac06c32b2d4959f9e3271b23b7fe14f2d0c61311
JWT_EXPIRES_IN=364d
```

### Step 4: Check Node Environment
The backend must be started with dotenv loaded:
```bash
cd backend
npm start
# Should see the JWT_SECRET loaded message
```

## Common Issues & Solutions

### Issue: Still getting "invalid signature"
**Solution**: 
1. Delete node_modules and reinstall: `npm install`
2. Restart backend completely
3. Clear browser localStorage and login again
4. Check if JWT_SECRET has extra spaces

### Issue: Token works immediately after login but fails on refresh
**Solution**:
- Check if .env is being reloaded - restart backend after .env changes

### Issue: Works on one frontend URL but not another
**Solution**:
- Ensure CORS is properly configured
- Check that Authorization header is being sent (use browser DevTools)

## Testing Checklist

- [ ] Backend shows "JWT_SECRET loaded" message on startup
- [ ] Can call `/auth/validate-token` with valid token
- [ ] Token validation returns user info
- [ ] Can add to cart with valid token
- [ ] Can fetch user wishlist with valid token
- [ ] Invalid token returns 401 with proper error message

## Still Having Issues?

Check the detailed logs:
```bash
# Terminal 1: Start backend with verbose logging
cd backend
npm start

# Terminal 2: Test with curl
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/auth/validate-token
```

Look for error messages starting with `❌` in the backend logs.
