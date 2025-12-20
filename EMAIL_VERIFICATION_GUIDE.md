# Email Verification System - Implementation Guide

## 📋 Overview

This document provides complete implementation details for the secure email verification system with 6-digit verification codes, rate limiting, and comprehensive email logging.

---

## 🎯 Features Implemented

### 1. **Secure 6-Digit Verification Code System**
- Cryptographically secure random code generation using `crypto.randomInt()`
- Codes are hashed using SHA-256 before storage
- 10-minute expiration time
- Maximum 3 verification attempts per code
- Automatic code invalidation after successful verification

### 2. **Rate Limiting Protection**
- Registration: 3 attempts per hour per IP
- Login: 5 attempts per 15 minutes per IP
- Password Reset: 3 attempts per hour per IP
- Verification Code: 5 attempts per hour per IP
- Resend Code: 3 attempts per hour per IP + 1 minute cooldown

### 3. **Email Audit Logging**
- All email sends are logged to `backend/logs/email-audit.log`
- Logs include: timestamp, recipient, subject, type, success/failure, errors
- Automatic log cleanup (90-day retention)
- Easy log querying and filtering

### 4. **Professional Email Templates**
- Beautiful, responsive HTML email templates
- Mobile-friendly design
- Clear branding and call-to-action
- Security warnings and expiration notices
- Support contact information

### 5. **Enhanced Security**
- Input validation for email format
- Strong password requirements (min 8 chars, uppercase, lowercase, number, special character)
- Prevention of email enumeration attacks
- HTTPS enforcement ready
- SPF, DKIM, DMARC configuration guide

---

## 📁 Files Modified/Created

### **Modified Files:**
1. `backend/models/User.js` - Added verification code fields and methods
2. `backend/controllers/authController.js` - Updated registration flow and added verification endpoints
3. `backend/routes/authRoutes.js` - Added new routes with rate limiting
4. `backend/utils/mailer.js` - Added code verification email template and logging
5. `backend/.env.example` - Comprehensive SMTP configuration guide

### **Created Files:**
1. `backend/utils/emailLogger.js` - Email audit logging utility
2. `backend/logs/email-audit.log` - Email send logs (auto-created)

---

## 🔧 Configuration

### Step 1: Install Dependencies

The `express-rate-limit` package has been installed. Verify it's in your `package.json`:

```json
{
  "dependencies": {
    "express-rate-limit": "^7.x.x"
  }
}
```

### Step 2: Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cd backend
cp .env.example .env
```

**Required Variables:**

```env
# Email Configuration - Choose ONE option:

# Option 1: Gmail (For Testing)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=noreply@9tangle.com

# Option 2: SendGrid (Production Recommended)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

### Step 3: Gmail Setup (For Testing)

1. Go to Google Account: https://myaccount.google.com
2. Enable 2-Factor Authentication
3. Generate App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password
   - Use this password in `EMAIL_PASSWORD`

### Step 4: Production Email Setup (SendGrid Example)

1. Sign up at https://sendgrid.com (Free tier: 100 emails/day)
2. Verify your sender email or domain
3. Create API Key:
   - Go to Settings → API Keys
   - Create API Key with "Mail Send" permission
   - Copy the API key
4. Configure DNS records for your domain:

**SPF Record (TXT):**
```
v=spf1 include:sendgrid.net ~all
```

**DKIM Records:** 
- Provided by SendGrid (3 CNAME records)
- Add them to your DNS settings

**DMARC Record (TXT):**
```
v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
```

---

## 🔌 API Endpoints

### 1. **User Registration**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Registration successful! A 6-digit verification code has been sent to your email.",
  "userId": "64abc123...",
  "email": "john@example.com"
}
```

**Rate Limit:** 3 requests per hour per IP

---

### 2. **Verify Email Code**
```http
POST /api/auth/verify-code
Content-Type: application/json

{
  "email": "john@example.com",
  "code": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Email verified successfully! You can now log in."
}
```

**Response (Invalid Code):**
```json
{
  "success": false,
  "message": "Invalid verification code. 2 attempts remaining."
}
```

**Response (Too Many Attempts):**
```json
{
  "success": false,
  "message": "Too many failed attempts. Please request a new verification code."
}
```

**Rate Limit:** 5 requests per hour per IP

---

### 3. **Resend Verification Code**
```http
POST /api/auth/resend-code
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "A new verification code has been sent to your email"
}
```

**Response (Cooldown):**
```json
{
  "success": false,
  "message": "Please wait 45 seconds before requesting a new code"
}
```

**Rate Limits:**
- 3 requests per hour per IP
- 1-minute cooldown between requests per user

---

### 4. **User Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "64abc123...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Response (Email Not Verified):**
```json
{
  "success": false,
  "message": "Please verify your email first"
}
```

**Rate Limit:** 5 requests per 15 minutes per IP

---

## 🎨 Frontend Integration Example

### Registration Flow

```javascript
// 1. Register User
const registerUser = async (formData) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Show verification code input form
      setShowVerificationForm(true);
      setUserEmail(formData.email);
    } else {
      // Show error message
      setError(data.message);
    }
  } catch (error) {
    setError('Registration failed. Please try again.');
  }
};

// 2. Verify Code
const verifyCode = async (code) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: userEmail, 
        code: code 
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Redirect to login page
      router.push('/login');
      showSuccess('Email verified! You can now log in.');
    } else {
      setError(data.message);
    }
  } catch (error) {
    setError('Verification failed. Please try again.');
  }
};

// 3. Resend Code
const resendCode = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/resend-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showSuccess(data.message);
      // Start 60-second countdown timer
      startCountdown(60);
    } else {
      setError(data.message);
    }
  } catch (error) {
    setError('Failed to resend code. Please try again.');
  }
};
```

### React Component Example

```jsx
import { useState } from 'react';

function VerificationCodeInput() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`).focus();
    }

    // Auto-submit when all 6 digits entered
    if (newCode.every(digit => digit !== '') && index === 5) {
      verifyCode(newCode.join(''));
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split('');
    setCode([...newCode, ...Array(6 - newCode.length).fill('')]);
    
    if (newCode.length === 6) {
      verifyCode(pastedData);
    }
  };

  return (
    <div className="verification-form">
      <h2>Enter Verification Code</h2>
      <p>We've sent a 6-digit code to your email</p>
      
      <div className="code-inputs" onPaste={handlePaste}>
        {code.map((digit, index) => (
          <input
            key={index}
            id={`code-${index}`}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            className="code-input"
          />
        ))}
      </div>

      {error && <p className="error">{error}</p>}
      
      <button onClick={resendCode} disabled={loading}>
        Resend Code
      </button>
    </div>
  );
}
```

---

## 📊 Email Audit Logs

### Accessing Logs

Logs are automatically written to `backend/logs/email-audit.log`

**Example Log Entry:**
```json
{
  "timestamp": "2025-12-20T14:30:45.123Z",
  "to": "user@example.com",
  "subject": "Email Verification Code - 9tangle",
  "type": "verification-code",
  "success": true,
  "error": null,
  "userId": "64abc123...",
  "ip": "192.168.1.1"
}
```

### Using the Email Logger

```javascript
const { logEmail, getEmailLogs, cleanOldLogs } = require('./utils/emailLogger');

// Get all verification emails
const verificationLogs = getEmailLogs({ type: 'verification-code' });

// Get emails for specific user
const userLogs = getEmailLogs({ email: 'user@example.com', limit: 10 });

// Clean logs older than 90 days
cleanOldLogs(90);
```

---

## 🔒 Security Best Practices

### 1. **Password Requirements**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&#)

### 2. **Rate Limiting**
All sensitive endpoints are protected:
- Prevents brute force attacks
- Mitigates DDoS attempts
- Reduces spam registrations

### 3. **Code Security**
- Codes are hashed using SHA-256 before storage
- 10-minute expiration
- Single-use codes (invalidated after verification)
- Max 3 verification attempts

### 4. **Email Security**
- All emails sent from official domain
- SPF/DKIM/DMARC configured
- Audit logging enabled
- HTTPS enforcement in production

---

## 🧪 Testing

### Manual Testing

1. **Test Registration:**
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

2. **Check Email:**
- If using Gmail: Check your inbox
- If using Ethereal (dev): Check console for preview link

3. **Test Verification:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456"
  }'
```

4. **Test Rate Limiting:**
- Send 4 registration requests rapidly
- 4th request should return 429 Too Many Requests

---

## 📝 Database Schema Changes

The User model now includes these fields:

```javascript
{
  // Existing fields...
  
  // Email verification with code
  emailVerificationCode: String,              // Hashed 6-digit code
  emailVerificationCodeExpires: Date,         // 10-minute expiration
  emailVerificationAttempts: Number,          // Max 3 attempts
  lastEmailVerificationSentAt: Date,          // For rate limiting
  
  // Password reset with code (future use)
  passwordResetCode: String,                  // Hashed 6-digit code
  passwordResetCodeExpires: Date,             // 10-minute expiration
  passwordResetAttempts: Number,              // Max 3 attempts
}
```

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Configure production email service (SendGrid/SES recommended)
- [ ] Set up DNS records (SPF, DKIM, DMARC)
- [ ] Generate secure JWT_SECRET (32+ characters)
- [ ] Set NODE_ENV=production
- [ ] Configure HTTPS URLs
- [ ] Update CORS_ORIGIN with production domain
- [ ] Change default admin password
- [ ] Set up MongoDB authentication
- [ ] Configure backups
- [ ] Set up error monitoring (Sentry, etc.)

### Post-Deployment

- [ ] Test registration flow
- [ ] Test email delivery
- [ ] Verify rate limiting works
- [ ] Check email logs
- [ ] Monitor email deliverability
- [ ] Test password reset flow
- [ ] Verify HTTPS enforcement

---

## 🐛 Troubleshooting

### Emails Not Sending

**Problem:** Emails not being received

**Solutions:**
1. Check `.env` file has correct SMTP credentials
2. For Gmail: Ensure App Password is used (not regular password)
3. Check email logs: `backend/logs/email-audit.log`
4. In development, check console for Ethereal preview link
5. Verify EMAIL_FROM domain matches your SMTP provider

### Rate Limiting Issues

**Problem:** Getting rate limited too quickly

**Solutions:**
1. Check if testing from same IP
2. Adjust rate limit values in [authRoutes.js](d:\eby\LMS\backend\routes\authRoutes.js)
3. Clear rate limit: Restart server (uses in-memory store)

### Code Expiration

**Problem:** Code expires too quickly

**Solutions:**
1. Increase expiration time in User model:
```javascript
this.emailVerificationCodeExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
```

### Email Deliverability

**Problem:** Emails going to spam

**Solutions:**
1. Set up SPF, DKIM, DMARC records
2. Use a verified sender domain
3. Use professional email service (SendGrid, SES)
4. Warm up your sending domain gradually
5. Include unsubscribe link in emails

---

## 📞 Support

For issues or questions:
- Email: support@9tangle.com
- Documentation: See `.env.example` for detailed configuration
- Logs: Check `backend/logs/email-audit.log`

---

## 📜 License

All rights reserved © 2025 9tangle
