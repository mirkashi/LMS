# Email Verification API - Quick Reference

## 🚀 New API Endpoints

### 1. Register User (Updated)
```
POST /api/auth/register
```
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```
**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful! A 6-digit verification code has been sent to your email.",
  "userId": "64abc...",
  "email": "john@example.com"
}
```
**Rate Limit:** 3 requests/hour per IP

---

### 2. Verify Email Code (New)
```
POST /api/auth/verify-code
```
**Request Body:**
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```
**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully! You can now log in."
}
```
**Error Responses:**
- **400:** Invalid code format
- **400:** Invalid code (with attempts remaining)
- **400:** Code expired
- **429:** Too many attempts
**Rate Limit:** 5 requests/hour per IP

---

### 3. Resend Verification Code (New)
```
POST /api/auth/resend-code
```
**Request Body:**
```json
{
  "email": "john@example.com"
}
```
**Success Response (200):**
```json
{
  "success": true,
  "message": "A new verification code has been sent to your email"
}
```
**Error Responses:**
- **404:** User not found
- **400:** Email already verified
- **429:** Rate limit (wait X seconds)
**Rate Limits:** 
- 3 requests/hour per IP
- 1-minute cooldown per user

---

## 📧 Email Templates

### Verification Code Email
- **Subject:** Email Verification Code - 9tangle
- **From:** noreply@9tangle.com
- **Contains:**
  - Welcome message with user's name
  - Large, clearly visible 6-digit code
  - Expiration notice (10 minutes)
  - Security warning
  - Support contact

---

## 🔐 Security Features

### Password Requirements
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)
- ✅ At least one special character (@$!%*?&#)

### Rate Limiting
| Endpoint | Limit | Window |
|----------|-------|--------|
| /register | 3 requests | 1 hour |
| /verify-code | 5 requests | 1 hour |
| /resend-code | 3 requests | 1 hour |
| /login | 5 requests | 15 minutes |
| /forgot-password | 3 requests | 1 hour |

### Code Security
- 🔒 Cryptographically secure generation (crypto.randomInt)
- 🔒 SHA-256 hashing before storage
- ⏱️ 10-minute expiration
- 🔢 Maximum 3 verification attempts
- ♻️ Automatic invalidation after use

---

## 📊 Email Logging

All emails are logged to: `backend/logs/email-audit.log`

**Log Entry Format:**
```json
{
  "timestamp": "2025-12-20T14:30:45.123Z",
  "to": "user@example.com",
  "subject": "Email Verification Code - 9tangle",
  "type": "verification-code",
  "success": true,
  "error": null,
  "userId": "64abc...",
  "ip": "192.168.1.1"
}
```

**Email Types:**
- `verification-code` - 6-digit code for registration
- `email-verification` - Link-based verification (legacy)
- `email-change-verification` - Email change confirmation
- `password-reset` - Password reset link
- `password-change-notification` - Password changed alert

---

## ⚙️ Environment Variables

**Required for Email:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@9tangle.com
```

**Gmail Setup:**
1. Enable 2FA on your Google Account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character password in EMAIL_PASSWORD

**Production (SendGrid):**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.your_sendgrid_api_key
```

---

## 🧪 Testing with cURL

**1. Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!",
    "confirmPassword": "TestPass123!"
  }'
```

**2. Verify Code:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456"
  }'
```

**3. Resend Code:**
```bash
curl -X POST http://localhost:5000/api/auth/resend-code \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**4. Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

---

## 🎨 Frontend Integration Snippet

```javascript
// After successful registration
const handleRegister = async (formData) => {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  
  const data = await res.json();
  
  if (data.success) {
    // Show verification code input
    setStep('verify-code');
    setEmail(formData.email);
  }
};

// Verify the code
const handleVerifyCode = async (code) => {
  const res = await fetch('/api/auth/verify-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code })
  });
  
  const data = await res.json();
  
  if (data.success) {
    // Redirect to login
    router.push('/login?verified=1');
  }
};

// Resend code with cooldown
const handleResendCode = async () => {
  const res = await fetch('/api/auth/resend-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  if (res.ok) {
    // Start 60-second countdown
    setCountdown(60);
  }
};
```

---

## 📝 Migration Notes

### Database Changes
The User model has new fields. Existing users will need to:
- Keep existing `emailVerificationToken` for backward compatibility
- New registrations use `emailVerificationCode`

### Backward Compatibility
Both verification methods are supported:
- Old: Link-based verification (`/api/auth/verify-email?token=...`)
- New: Code-based verification (`/api/auth/verify-code`)

---

## 🔍 Troubleshooting

**Problem:** Emails not sending
- ✅ Check EMAIL_USER and EMAIL_PASSWORD in .env
- ✅ For Gmail, use App Password (not regular password)
- ✅ Check console logs for Ethereal preview link (dev mode)
- ✅ View email logs: `backend/logs/email-audit.log`

**Problem:** Rate limited
- ✅ Wait for the specified time window
- ✅ Restart server to clear in-memory rate limits
- ✅ Adjust limits in authRoutes.js if needed

**Problem:** Code expired
- ✅ Request new code via /resend-code
- ✅ Increase expiration time in User model if needed

---

For complete documentation, see: [EMAIL_VERIFICATION_GUIDE.md](./EMAIL_VERIFICATION_GUIDE.md)
