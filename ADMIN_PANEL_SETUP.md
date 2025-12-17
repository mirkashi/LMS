# Admin Panel Setup Guide

## Quick Start

### Step 1: Install Dependencies

```bash
cd admin-panel
npm install
```

### Step 2: Create Initial Admin User

```bash
cd backend
node scripts/seedAdmin.js
```

You will see output like:

```
✅ MongoDB connected
✅ Admin user created successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 ADMIN CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email:    admin@lmsplatform.com
Password: Admin@12345
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 3: Start All Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 - Admin Panel:**
```bash
cd admin-panel
npm run dev
# Runs on http://localhost:3001
```

**Terminal 3 - Frontend (optional):**
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

### Step 4: Login to Admin Panel

1. Open http://localhost:3001/login
2. Enter email: `admin@lmsplatform.com`
3. Enter password: `Admin@12345`
4. Click Login

### Step 5: Change Admin Credentials

⚠️ **SECURITY IMPORTANT:**

1. After first login, navigate to your profile
2. Change the default password immediately
3. Update to a strong, unique password
4. Save securely

---

## Separate Admin Panel Architecture

The admin panel is **completely independent** from the main user interface:

### Frontend (Main Site)
- **Port**: 3000
- **URL**: http://localhost:3000
- **Used by**: Regular users and instructors
- **Login endpoint**: `/api/auth/login`

### Admin Panel (Separate App)
- **Port**: 3001
- **URL**: http://localhost:3001
- **Used by**: Administrators only
- **Login endpoint**: `/api/auth/admin-login`
- **Authentication**: Separate JWT tokens stored in `adminToken`

### Backend (API Server)
- **Port**: 5000
- **URL**: http://localhost:5000
- **Serves both**: Frontend and Admin Panel

---

## Admin Credentials

### Initial Credentials (from seed script)

| Field | Value |
|-------|-------|
| **Email** | admin@lmsplatform.com |
| **Password** | Admin@12345 |
| **Role** | admin |
| **Verified** | Yes (auto-verified) |

### After Creation

The admin user is:
- ✅ Email verified automatically
- ✅ Can login to admin panel
- ✅ Has full admin privileges
- ✅ Can manage all users, courses, and orders

---

## Admin Panel Pages

### Dashboard (`/dashboard`)
- View platform statistics
- Total users, courses, revenue
- Recent orders
- Quick action links

### Users (`/users`)
- View all registered users
- See user details
- Check verification status
- Monitor user roles

### Courses (`/courses`)
- List all courses
- View course details
- Monitor pricing
- Check publication status

### Orders (`/orders`)
- Track all purchases
- View order details
- Monitor payment status
- Update order information

---

## File Structure

```
LMS/
├── backend/
│   ├── controllers/
│   │   ├── authController.js      ← Contains adminLogin()
│   │   └── adminController.js     ← Admin features
│   ├── routes/
│   │   ├── authRoutes.js          ← /api/auth/admin-login
│   │   └── adminRoutes.js         ← /api/admin/*
│   ├── scripts/
│   │   └── seedAdmin.js           ← Creates initial admin
│   └── server.js
├── admin-panel/                   ← NEW: Separate admin app
│   ├── app/
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── users/page.tsx
│   │   ├── courses/page.tsx
│   │   └── orders/page.tsx
│   ├── components/
│   │   └── AdminNav.tsx
│   ├── package.json
│   └── .env.local
├── frontend/                      ← Main user interface
│   ├── app/
│   │   └── login/page.tsx
│   └── package.json
└── README.md
```

---

## API Endpoints

### Authentication
- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/admin-login` - Admin login (NEW)
- **POST** `/api/auth/register` - User registration

### Admin Operations
- **GET** `/api/admin/users` - List all users
- **GET** `/api/admin/courses` - List all courses
- **GET** `/api/admin/orders` - List all orders
- **GET** `/api/admin/dashboard/stats` - Dashboard statistics
- **PUT** `/api/admin/orders/:id` - Update order

All admin endpoints require:
- JWT token from `/api/auth/admin-login`
- Authorization header: `Bearer <token>`
- User role must be `admin`

---

## Environment Configuration

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/9tangle
PORT=5000
```

### Admin Panel (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Troubleshooting

### "Invalid email or password" on login
- Ensure you ran `node scripts/seedAdmin.js`
- Verify credentials are exactly: `admin@lmsplatform.com` / `Admin@12345`
- Check backend is running

### "Admin access required" error
- Verify JWT token is from admin-login endpoint
- Check user role is `admin` in database
- Re-login to get fresh token

### Dashboard shows no data
- Verify backend is running on port 5000
- Check NEXT_PUBLIC_API_URL is correct
- Ensure admin token is valid (not expired)

### Cannot reach admin panel
- Check if port 3001 is available
- Verify `npm run dev` in admin-panel directory
- Check for firewall blocks

---

## Changing Admin Password Later

### Option 1: Using forgot password endpoint
1. Navigate to login page
2. Click "Forgot Password"
3. Enter admin email: `admin@lmsplatform.com`
4. Follow email link to reset

### Option 2: Direct database update (development only)
```javascript
// In MongoDB shell or Compass
db.users.findOne({ email: 'admin@lmsplatform.com' })
// Then use password reset endpoint
```

---

## Best Practices

✅ **DO:**
- Change default admin password immediately
- Use strong, unique passwords (12+ characters)
- Keep admin email secure
- Regularly backup admin credentials
- Use environment variables for configuration
- Monitor admin access logs

❌ **DON'T:**
- Share admin credentials
- Use simple passwords like "123456"
- Commit .env files to Git
- Use same password for multiple accounts
- Leave admin session active unattended

---

## Next Steps

1. ✅ Seed admin user: `node scripts/seedAdmin.js`
2. ✅ Start admin panel: `npm run dev` (port 3001)
3. ✅ Login with credentials provided
4. 📋 Change admin password
5. 📋 Start managing platform
6. 📋 Add more admin users (via database)

---

**Questions?** Check:
- [Admin Panel README](admin-panel/README.md)
- [Backend API Documentation](DEVELOPER_GUIDE.md)
- [Environment Setup](ENVIRONMENT_VARIABLES.md)
