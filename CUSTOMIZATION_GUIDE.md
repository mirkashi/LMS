# 🎨 Customization Guide - 9tangle LMS

## How to Customize 9tangle

This guide covers customizing the platform to match your brand and requirements.

---

## 🎯 Branding

### Logo & Company Name

#### Update Navbar
File: `frontend/components/Navbar.tsx`
```typescript
// Change the logo text
<Link href="/" className="text-2xl font-bold bg-gradient-primary...">
  9tangle  {/* Change this */}
</Link>
```

#### Update Footer
File: `frontend/components/Footer.tsx`
```typescript
<h3 className="text-2xl font-bold mb-4 bg-gradient-accent...">
  9tangle  {/* Change this */}
</h3>
```

#### Update Favicon
1. Replace `frontend/public/favicon.ico` with your logo
2. Update meta tags in `frontend/app/layout.tsx`

---

## 🎨 Colors & Styling

### Change Color Scheme

File: `frontend/tailwind.config.ts`

```typescript
theme: {
  extend: {
    colors: {
      primary: '#667eea',      // Change primary color
      secondary: '#764ba2',    // Change secondary color
      accent: '#f093fb',       // Change accent color
      dark: '#1a202c',         // Change dark background
      light: '#f7fafc',        // Change light background
    },
  },
},
```

### Quick Color Reference
```
Modern Blue: #667eea
Modern Purple: #764ba2
Modern Pink: #f093fb
Dark Gray: #1a202c
Light Gray: #f7fafc

Alternative Schemes:
- Professional: #0056b3, #003d7a, #0069d9
- Vibrant: #ff6b6b, #ee5a6f, #ff8787
- Green: #27ae60, #229954, #2ecc71
```

### Custom CSS

File: `frontend/styles/globals.css`

```css
/* Add custom styles */
:root {
  --primary: #667eea;
  --secondary: #764ba2;
  --accent: #f093fb;
}

/* Custom animations */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-in-up {
  animation: slideInUp 0.5s ease-out;
}
```

---

## 📝 Content Customization

### Homepage

File: `frontend/app/page.tsx`

Update these sections:
```typescript
// Hero section text
<h1 className="text-5xl font-bold mb-6">
  Learn from eBay Experts  {/* Change headline */}
</h1>

// Description
<p className="text-xl mb-8 text-gray-100">
  Master eBay selling strategies...  {/* Change description */}
</p>

// Featured courses section
<h2 className="text-4xl font-bold mb-4">
  Featured Courses  {/* Change section title */}
</h2>

// Stats section
<h3 className="text-4xl font-bold mb-2">500+</h3>
<p className="text-gray-400">Active Students</p>  {/* Update stats */}
```

### About Page

File: `frontend/app/about/page.tsx`

```typescript
// Update mission statement
<p className="text-gray-600 text-lg mb-4">
  9tangle is dedicated to...  {/* Change mission */}
</p>

// Update team information
<p className="text-gray-600">
  Specialized in eBay selling strategies...  {/* Change bio */}
</p>
```

---

## 🔧 Backend Configuration

### API Base URL

File: `backend/server.js`

```javascript
// Change API prefix
app.use('/api/auth', require('./routes/authRoutes'));
// Can change to: app.use('/v1/auth', ...)
```

### Email Customization

File: `backend/utils/mailer.js`

```javascript
const mailOptions = {
  from: process.env.EMAIL_FROM || 'noreply@9tangle.com',
  // Change default email
  
  subject: 'Email Verification - 9tangle',
  // Change email subject
  
  html: `...template...`
  // Update email template below
};
```

Update email templates:
```html
<h1 style="color: white; margin: 0;">Welcome to 9tangle</h1>
<!-- Change company name -->

<p>Hello,</p>
<p>Thank you for registering with 9tangle!</p>
<!-- Update welcome message -->
```

---

## 🏪 E-Commerce Customization

### Shop Page

File: `frontend/app/shop/page.tsx`

```typescript
// Add your products
const products = [
  {
    id: 1,
    name: 'Premium Course Bundle',
    description: 'Complete eBay mastery...',
    price: 99,
    // Add more products
  }
];

// Update cart functionality
const handleAddToCart = (product) => {
  // Implement your logic
};
```

### Pricing

Update in course creation or database:

```javascript
// Change default pricing
price: 99,  // Change default price
```

---

## 👥 User Roles & Permissions

### Add New Role

File: `backend/models/User.js`

```javascript
role: {
  type: String,
  enum: ['user', 'admin', 'instructor', 'moderator'],  // Add new roles
  default: 'user',
},
```

### Add Role-Based Permissions

File: `backend/middleware/auth.js`

```javascript
const instructorMiddleware = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({
        success: false,
        message: 'Instructor access required',
      });
    }
    next();
  });
};

module.exports = { authMiddleware, adminMiddleware, instructorMiddleware };
```

---

## 📧 Email Configuration

### Change Email Provider

File: `backend/utils/mailer.js`

#### Using SendGrid
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, html) => {
  await sgMail.send({
    to,
    from: process.env.EMAIL_FROM,
    subject,
    html,
  });
};
```

#### Using AWS SES
```javascript
const AWS = require('aws-sdk');

const ses = new AWS.SES({
  region: process.env.AWS_REGION,
});

const sendEmail = async (to, subject, html) => {
  const params = {
    Source: process.env.EMAIL_FROM,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: { Html: { Data: html } },
    },
  };
  
  return ses.sendEmail(params).promise();
};
```

---

## 💳 Payment Integration

### Add Stripe

#### Install
```bash
npm install stripe @stripe/react-stripe-js
```

#### Add Checkout
File: `frontend/components/PaymentForm.tsx`

```typescript
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

export default function PaymentForm() {
  return (
    <Elements stripe={stripePromise}>
      {/* Add payment form */}
    </Elements>
  );
}
```

---

## 🌍 Multi-Language Support

### Add i18n

#### Install
```bash
npm install next-i18next
```

#### Create Translation Files
```
frontend/public/locales/
├── en/
│   └── common.json
├── es/
│   └── common.json
└── fr/
    └── common.json
```

#### Use in Components
```typescript
import { useTranslation } from 'next-i18next';

export default function MyComponent() {
  const { t } = useTranslation('common');
  
  return <h1>{t('welcome')}</h1>;
}
```

---

## 🔔 Notifications

### Email Notifications

Update in controllers to add notifications:

```javascript
// After user action
const { sendVerificationEmail } = require('../utils/mailer');

await sendVerificationEmail(user.email, token);
```

### SMS Notifications (Optional)

```bash
npm install twilio
```

```javascript
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

await client.messages.create({
  body: 'Your enrollment is confirmed!',
  from: process.env.TWILIO_PHONE_NUMBER,
  to: user.phone,
});
```

---

## 📱 Mobile App Customization

### React Native Version

```bash
npx create-expo-app 9tangle-mobile
cd 9tangle-mobile
npm install axios react-navigation
```

### Share API Logic
```typescript
// shared/api.ts - Use in both web and mobile
export const courseAPI = {
  getAllCourses: () => axios.get('/courses'),
  enrollCourse: (courseId) => axios.post(`/courses/${courseId}/enroll`),
  // ... other endpoints
};
```

---

## 🎓 Learning Content

### Add Certificates

File: `backend/models/User.js`

```javascript
certificates: [{
  course: ObjectId,
  dateCompleted: Date,
  certificateUrl: String,
}],
```

### Add Course Progress Tracking

File: `backend/models/Course.js`

```javascript
userProgress: [{
  user: ObjectId,
  completedLessons: [ObjectId],
  progress: Number,  // 0-100
}],
```

---

## 🔐 Security Customizations

### Two-Factor Authentication

```bash
npm install speakeasy qrcode
```

```javascript
const speakeasy = require('speakeasy');

// Generate secret
const secret = speakeasy.generateSecret({
  name: `9tangle (${email})`,
});

// Verify token
const verified = speakeasy.totp.verify({
  secret: secret.base32,
  encoding: 'base32',
  token: userToken,
});
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,  // 5 attempts
  message: 'Too many login attempts',
});

app.post('/api/auth/login', authLimiter, authController.login);
```

---

## 🎯 Analytics

### Google Analytics

```typescript
// frontend/app/layout.tsx
import { GoogleAnalytics } from '@next/google-analytics';

export default function RootLayout() {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
```

---

## 📊 Custom Dashboard

### Add New Admin Stats

File: `backend/controllers/adminController.js`

```javascript
exports.getDashboardStats = async (req, res) => {
  // ... existing code ...
  
  // Add custom metric
  const avgCoursePrice = await Course.aggregate([
    { $group: { _id: null, avgPrice: { $avg: '$price' } } }
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      // ... existing data ...
      avgCoursePrice: avgCoursePrice[0]?.avgPrice || 0,
    },
  });
};
```

---

## 🚀 Performance Tweaks

### Image Optimization

File: `frontend/app/page.tsx`

```typescript
import Image from 'next/image';

<Image
  src="/course-image.jpg"
  alt="Course"
  width={300}
  height={200}
  loading="lazy"
  quality={80}
/>
```

### Caching

```javascript
// backend/middleware/cache.js
const cache = {};

exports.cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    const key = req.originalUrl;
    
    if (cache[key]) {
      return res.json(cache[key]);
    }
    
    res.json = ((json) => {
      cache[key] = json;
      setTimeout(() => delete cache[key], duration * 1000);
      return json;
    }).bind(res);
    
    next();
  };
};
```

---

## 📚 Additional Resources

- [Next.js Customization](https://nextjs.org/docs)
- [Express.js Middleware](https://expressjs.com/en/guide/using-middleware.html)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [MongoDB Guide](https://docs.mongodb.com)

---

**Customize 9tangle to match your brand! 🎨**
