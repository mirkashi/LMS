# Email Verification Setup Guide

## 🚀 Quick Setup (3 Steps)

### Step 1: Choose Your Email Provider

#### Option A: Gmail (Easiest for Testing)
1. Open: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Copy the 16-character App Password

**Add to `.env`:**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
EMAIL_FROM=your-email@gmail.com
```

---

#### Option B: SendGrid (Recommended for Production)
1. Sign up: https://sendgrid.com
2. Create API key (Mail Send permission)
3. Get SMTP credentials from Settings > SMTP

**Add to `.env`:**
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.your-api-key-here
EMAIL_FROM=noreply@yourdomain.com
```

---

#### Option C: Mailgun
1. Sign up: https://www.mailgun.com
2. Add domain in Mailgun dashboard
3. Get SMTP credentials

**Add to `.env`:**
```
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=postmaster@sandboxxxxx.mailgun.org
EMAIL_PASSWORD=your-mailgun-password
EMAIL_FROM=noreply@yourdomain.com
```

---

### Step 2: Update Backend .env

```bash
# Copy the values from your chosen provider above
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

### Step 3: Test the Flow

**1. Start Backend:**
```bash
cd backend
npm install
npm start
```

**2. Test Registration (via Postman or curl):**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "your-email@gmail.com",
    "password": "Password123",
    "confirmPassword": "Password123",
    "phone": "03001234567"
  }'
```

**3. Check Email** - You should receive a 6-digit verification code

**4. Verify Email (via Postman):**
```bash
curl -X POST http://localhost:5000/api/auth/verify-email-code \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@gmail.com",
    "code": "123456"  # Replace with code from email
  }'
```

---

## 🔧 Environment Variables Reference

```env
# EMAIL CONFIGURATION
EMAIL_HOST=smtp.gmail.com              # Your SMTP server
EMAIL_PORT=587                         # Usually 587 for TLS
EMAIL_SECURE=false                     # false for TLS, true for SSL
EMAIL_USER=your-email@gmail.com        # SMTP username
EMAIL_PASSWORD=your-app-password       # SMTP password or API key
EMAIL_FROM=your-email@gmail.com        # From email address

# SERVER URLS (for production)
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

---

## ✅ Verification Complete When:

- ✅ User registers with email and password
- ✅ 6-digit code sent to email automatically
- ✅ User enters code on frontend
- ✅ Backend validates code
- ✅ Account marked as verified
- ✅ User logged in automatically with token

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Email not sending | Check credentials in `.env` |
| "SMTP transporter init failed" | Missing EMAIL_* variables in `.env` |
| Gmail says "Invalid credentials" | Use App Password, not regular password |
| SendGrid says "Invalid API key" | Check key format starts with `SG.` |
| Code expires too quickly | Default is 10 minutes (configurable) |

---

## 📝 Files Updated

✅ `mailer.js` - SMTP configured
✅ `authController.js` - Registration & verification logic
✅ `User.js` - Code generation & verification
✅ `.env.example` - All variables documented

