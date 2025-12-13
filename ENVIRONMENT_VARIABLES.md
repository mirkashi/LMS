# 🔧 Environment Variables Guide - 9tangle LMS

Complete guide for configuring environment variables for development, testing, and production.

---

## 📁 Backend Environment Variables

### Create `.env` file in `/backend` directory

```bash
# ==========================================
# 🔐 SERVER CONFIGURATION
# ==========================================

# Server port
PORT=5000

# Node environment
NODE_ENV=development

# API Base URL
API_BASE_URL=http://localhost:5000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# ==========================================
# 🗄️ DATABASE CONFIGURATION
# ==========================================

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/lms-database
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lms-database?retryWrites=true&w=majority

# PostgreSQL Connection
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password_here
POSTGRES_DB=lms_database

# Or using connection string:
# DATABASE_URL=postgresql://user:password@localhost:5432/lms_database

# ==========================================
# 🔑 JWT CONFIGURATION
# ==========================================

# JWT Secret Key (use a strong, random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# JWT Expiration (in hours)
JWT_EXPIRATION=168

# Refresh Token Secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret_key

# ==========================================
# 📧 EMAIL CONFIGURATION
# ==========================================

# Email Service (gmail, sendgrid, mailgun, smtp)
EMAIL_SERVICE=gmail

# Gmail Configuration (if using Gmail)
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your_app_specific_password

# Sendgrid Configuration (if using Sendgrid)
SENDGRID_API_KEY=sg.xxxxxxxxxxxxxxxxxxxxx

# Mailgun Configuration (if using Mailgun)
MAILGUN_DOMAIN=sandboxxxxx.mailgun.org
MAILGUN_API_KEY=key-xxxxxxxxxxxxx

# Generic SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=noreply@9tangle.com
SMTP_FROM_NAME=9tangle LMS

# Email verification token expiry (in hours)
EMAIL_TOKEN_EXPIRY=24

# ==========================================
# 💳 PAYMENT GATEWAY CONFIGURATION
# ==========================================

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# PayPal
PAYPAL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxx
PAYPAL_SECRET=xxxxxxxxxxxxxxxxxxxxx
PAYPAL_MODE=sandbox

# ==========================================
# 📁 FILE UPLOAD CONFIGURATION
# ==========================================

# Upload directory
UPLOAD_DIR=./uploads

# Max file size (in bytes)
MAX_FILE_SIZE=524288000

# Allowed file types
ALLOWED_VIDEO_TYPES=mp4,avi,mov,mkv,webm
ALLOWED_PDF_TYPES=pdf
ALLOWED_IMAGE_TYPES=jpg,jpeg,png,gif,webp

# ==========================================
# 🔐 SECURITY CONFIGURATION
# ==========================================

# CORS allowed origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,https://yourdomain.com

# Session Secret
SESSION_SECRET=your_session_secret_key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ==========================================
# 🌍 AWS CONFIGURATION (if using AWS)
# ==========================================

AWS_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxx
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# ==========================================
# 📊 LOGGING & MONITORING
# ==========================================

# Log level (error, warn, info, debug)
LOG_LEVEL=info

# Sentry DSN (for error tracking)
SENTRY_DSN=

# ==========================================
# 🔗 EXTERNAL SERVICES
# ==========================================

# Google OAuth (if implementing)
GOOGLE_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxx
GOOGLE_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxx

# GitHub OAuth (if implementing)
GITHUB_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxx

# Twilio (for SMS)
TWILIO_ACCOUNT_SID=xxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

### `.env.example` - Commit this to git (without secrets)

```bash
PORT=5000
NODE_ENV=development
API_BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

MONGODB_URI=mongodb://localhost:27017/lms-database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=
POSTGRES_DB=lms_database

JWT_SECRET=
JWT_EXPIRATION=168
REFRESH_TOKEN_SECRET=

EMAIL_SERVICE=gmail
GMAIL_USER=
GMAIL_PASSWORD=
SMTP_FROM_EMAIL=noreply@9tangle.com
SMTP_FROM_NAME=9tangle LMS

STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=524288000

CORS_ORIGINS=http://localhost:3000,http://localhost:3001
SESSION_SECRET=

LOG_LEVEL=info
```

---

## 📁 Frontend Environment Variables

### Create `.env.local` file in `/frontend` directory

```bash
# ==========================================
# 🔗 API CONFIGURATION
# ==========================================

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# ==========================================
# 🌍 ENVIRONMENT
# ==========================================

# Environment (development, staging, production)
NEXT_PUBLIC_ENV=development

# Site Name
NEXT_PUBLIC_SITE_NAME=9tangle LMS

# Site Domain
NEXT_PUBLIC_DOMAIN=localhost:3000

# ==========================================
# 💳 PAYMENT CONFIGURATION
# ==========================================

# Stripe Publishable Key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx

# ==========================================
# 📊 ANALYTICS
# ==========================================

# Google Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXXXXX

# ==========================================
# 🔐 SECURITY
# ==========================================

# Enable security features
NEXT_PUBLIC_ENABLE_SECURITY=true

# ==========================================
# 🎨 UI CONFIGURATION
# ==========================================

# Primary color (hex)
NEXT_PUBLIC_PRIMARY_COLOR=#667eea

# Secondary color (hex)
NEXT_PUBLIC_SECONDARY_COLOR=#764ba2

# Theme (light, dark, auto)
NEXT_PUBLIC_THEME=light
```

### `.env.local.example` - Commit this to git

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_SITE_NAME=9tangle LMS
NEXT_PUBLIC_DOMAIN=localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=
NEXT_PUBLIC_PRIMARY_COLOR=#667eea
NEXT_PUBLIC_SECONDARY_COLOR=#764ba2
NEXT_PUBLIC_THEME=light
```

---

## 🚀 Environment Configurations

### Development Environment

#### Backend `.env`:
```bash
NODE_ENV=development
PORT=5000
API_BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/lms-dev
JWT_SECRET=dev-secret-key-change-in-production
EMAIL_SERVICE=gmail
GMAIL_USER=your-dev-email@gmail.com
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
LOG_LEVEL=debug
```

#### Frontend `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_DOMAIN=localhost:3000
```

### Production Environment

#### Backend `.env`:
```bash
NODE_ENV=production
PORT=5000
API_BASE_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/lms?retryWrites=true&w=majority
JWT_SECRET=your-very-long-random-secret-key-min-32-chars
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=sg.xxxxx
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
LOG_LEVEL=info
```

#### Frontend `.env.production.local`:
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_DOMAIN=yourdomain.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
```

---

## 🔐 Security Best Practices

### 1. **Never Commit Secrets**
```bash
# .gitignore
.env
.env.local
.env.*.local
.env.production.local
node_modules/
uploads/
```

### 2. **Use `.env.example` Instead**
- Commit `example` files without secrets
- Team members copy and fill with their own values
- CI/CD systems use secrets management (GitHub Secrets, AWS Secrets Manager, etc.)

### 3. **Rotate Secrets Regularly**
- Change JWT_SECRET every 6 months
- Rotate API keys when team members leave
- Update database passwords periodically

### 4. **Use Strong Secrets**
```bash
# Generate strong secret in bash:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use openssl:
openssl rand -hex 32
```

### 5. **Environment-Specific Secrets**
- Development: Use local file (.env.local)
- Production: Use managed secrets service
- Staging: Use staging secrets service

---

## 🚀 Deployment Environment Variables

### Vercel (Frontend)

1. Go to Project Settings → Environment Variables
2. Add variables for each environment:

```
Production:
- NEXT_PUBLIC_API_URL = https://api.yourdomain.com
- NEXT_PUBLIC_ENV = production

Preview:
- NEXT_PUBLIC_API_URL = https://staging-api.yourdomain.com
- NEXT_PUBLIC_ENV = staging

Development:
- NEXT_PUBLIC_API_URL = https://api.yourdomain.com
- NEXT_PUBLIC_ENV = development
```

### Railway (Backend)

1. Go to Project Settings → Variables
2. Add for each environment:

```
NODE_ENV = production
PORT = 5000
MONGODB_URI = (from MongoDB Atlas)
JWT_SECRET = (use secure generator)
EMAIL_SERVICE = sendgrid
SENDGRID_API_KEY = (from Sendgrid)
```

### Heroku

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET="your-secret"
heroku config:set MONGODB_URI="mongodb+srv://..."
heroku config:set STRIPE_SECRET_KEY="sk_live_..."
```

---

## 📋 Environment Variable Checklist

### Before Deployment

- [ ] All required variables are set
- [ ] Secrets are strong (min 32 chars)
- [ ] No secrets in version control
- [ ] `.env.example` is up-to-date
- [ ] Development/Production configs differ
- [ ] API URLs are correct
- [ ] Database connections work
- [ ] Email service is configured
- [ ] Payment keys are correct
- [ ] CORS origins are set
- [ ] File upload directory exists
- [ ] Logging is configured
- [ ] Error tracking is enabled

---

## 🔍 Validation Script

Create `scripts/validate-env.js`:

```javascript
const requiredEnvVars = {
  backend: [
    'PORT',
    'NODE_ENV',
    'MONGODB_URI',
    'JWT_SECRET',
    'EMAIL_SERVICE',
  ],
  frontend: [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_DOMAIN',
  ],
};

function validateEnv(vars) {
  const missing = vars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    process.exit(1);
  }
  
  console.log('✅ All environment variables are set!');
}

if (process.argv[2] === 'backend') {
  validateEnv(requiredEnvVars.backend);
} else if (process.argv[2] === 'frontend') {
  validateEnv(requiredEnvVars.frontend);
}
```

Run before startup:
```bash
# Backend
node scripts/validate-env.js backend

# Frontend
node scripts/validate-env.js frontend
```

---

## 📚 Environment Variable Reference

| Variable | Purpose | Example | Required |
|----------|---------|---------|----------|
| NODE_ENV | App environment | development | ✅ |
| PORT | Server port | 5000 | ✅ |
| MONGODB_URI | MongoDB connection | mongodb://... | ✅ |
| JWT_SECRET | JWT signing key | random-32-chars | ✅ |
| EMAIL_SERVICE | Email provider | gmail | ✅ |
| STRIPE_SECRET_KEY | Stripe API key | sk_test_... | ❌ |
| CORS_ORIGINS | Allowed origins | http://localhost:3000 | ✅ |
| LOG_LEVEL | Logging level | info | ❌ |

---

## 🆘 Common Issues

### Issue: "MONGODB_URI is not defined"
**Solution:** Create `.env` file with `MONGODB_URI=...`

### Issue: "CORS error when calling API"
**Solution:** Add frontend URL to `CORS_ORIGINS` in backend `.env`

### Issue: "Email not sending"
**Solution:** Check `EMAIL_SERVICE` and credentials in `.env`

### Issue: "Token validation fails"
**Solution:** Ensure `JWT_SECRET` is the same in all instances

### Issue: "Cannot find module: dotenv"
**Solution:** Run `npm install dotenv` in backend

---

**Environment Configuration Complete! 🎉**
