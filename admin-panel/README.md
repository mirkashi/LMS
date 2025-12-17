# Admin Panel - LMS Platform

A completely separate admin panel for managing the LMS platform independently from the main user interface.

## Overview

The admin panel is a **separate Next.js application** running on port **3001** that provides complete administrative control over the LMS platform.

### Key Features

- **Independent Application**: Completely separate from the main frontend (runs on different port)
- **Secure Admin Login**: Dedicated admin authentication endpoint
- **Dashboard Analytics**: View key metrics and statistics
- **User Management**: View and manage all platform users
- **Course Management**: Create, edit, and manage courses
- **Order Tracking**: Monitor all course purchases and transactions
- **Role-Based Access**: Admin-only access control

## Directory Structure

```
admin-panel/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── globals.css          # Global styles
│   ├── login/
│   │   └── page.tsx         # Admin login page
│   ├── dashboard/
│   │   └── page.tsx         # Main dashboard
│   ├── users/
│   │   └── page.tsx         # User management
│   ├── courses/
│   │   └── page.tsx         # Course management
│   └── orders/
│       └── page.tsx         # Order tracking
├── components/
│   └── AdminNav.tsx         # Admin navigation component
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── postcss.config.js
└── .env.local               # Environment configuration
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd admin-panel
npm install
```

### 2. Configure Environment

Edit `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Start Development Server

```bash
npm run dev
```

The admin panel will be available at: **http://localhost:3001**

### 4. Create Initial Admin User

In the backend directory, run the seed script:

```bash
cd backend
node scripts/seedAdmin.js
```

This will create the initial admin account with the following credentials:

**Email:** `admin@lmsplatform.com`  
**Password:** `Admin@12345`

## Admin Credentials

### Initial Setup

After running the seed script, use these credentials to login:

```
Email:    admin@lmsplatform.com
Password: Admin@12345
```

### First Steps After Login

⚠️ **IMPORTANT SECURITY STEPS:**

1. Login to the admin panel at http://localhost:3001/login
2. Navigate to your profile (top right)
3. Change your password immediately
4. Update your email if needed
5. Secure your admin account with a strong password

## Features

### Dashboard
- Total users count
- Total courses count
- Total revenue from course sales
- Active orders count
- Quick navigation to main management areas

### User Management
- View all registered users
- See email verification status
- Check user roles
- Monitor user activity

### Course Management
- View all courses
- Check course status (published/draft)
- Monitor course pricing
- Track course categories

### Order Management
- Track all course purchases
- View order details
- Monitor payment status
- Update order status

## API Endpoints Used

### Authentication
- `POST /api/auth/admin-login` - Admin login (separate from user login)

### Admin Operations
- `GET /api/admin/users` - Get all users
- `GET /api/admin/courses` - Get all courses
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `PUT /api/admin/orders/:orderId` - Update order status

## Security Features

### Authentication
- JWT token-based authentication
- Separate admin login endpoint
- Role-based access control
- Admin-only middleware protection

### Session Management
- Tokens stored in localStorage
- Automatic login redirect for unauthorized access
- Logout functionality clears all admin data

## Production Deployment

### Environment Variables

```env
# Production Backend URL
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### Build for Production

```bash
npm run build
npm start
```

### Port Configuration

The admin panel runs on port **3001** by default. This can be changed in `package.json`:

```json
"scripts": {
  "dev": "next dev -p YOUR_PORT",
  "start": "next start -p YOUR_PORT"
}
```

## Troubleshooting

### Cannot login to admin panel

1. Verify the seed script was run: `node scripts/seedAdmin.js`
2. Check backend API is running: `npm run dev` (in backend directory)
3. Verify `NEXT_PUBLIC_API_URL` in `.env.local` is correct
4. Check browser console for error messages

### Dashboard shows no data

1. Ensure backend is running on port 5000
2. Verify admin user has been created
3. Check network requests in browser DevTools
4. Verify JWT token is valid

### Styling not loading

```bash
# Rebuild Tailwind CSS
npm run dev

# Or rebuild:
npm run build
```

## File Locations

- **Backend Admin Controller**: `backend/controllers/adminController.js`
- **Backend Admin Routes**: `backend/routes/adminRoutes.js`
- **Admin Seeding Script**: `backend/scripts/seedAdmin.js`
- **Admin Login Endpoint**: `backend/controllers/authController.js` (adminLogin function)

## Development Notes

### Creating New Admin Pages

1. Create a new folder in `app/` (e.g., `analytics`)
2. Add `page.tsx` with your component
3. Import `AdminNav` component for navigation
4. Add route to `AdminNav` component
5. Fetch data from backend API with JWT token

### Example Page Template

```typescript
'use client';

import AdminNav from '@/components/AdminNav';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
      return;
    }
    // Fetch data
  }, [router]);

  return (
    <>
      <AdminNav />
      <main className="min-h-screen bg-gray-50">
        {/* Your content */}
      </main>
    </>
  );
}
```

## Support & Maintenance

### Password Reset
If admin password is forgotten, use the regular forgot-password endpoint or directly reset in database:

```bash
# Use MongoDB to update admin password
db.users.updateOne(
  { email: 'admin@lmsplatform.com' },
  { $unset: { password: 1 } }
)
```

### Backing Up Admin Credentials
- Store admin email and password securely
- Use password manager for complex passwords
- Keep backup recovery email updated

## Next Steps

1. ✅ Admin panel created and configured
2. ✅ Initial admin user created
3. 📋 Customize branding and styling
4. 📋 Add additional admin features as needed
5. 📋 Deploy to production

---

**Admin Panel URL**: http://localhost:3001  
**Backend API URL**: http://localhost:5000/api
