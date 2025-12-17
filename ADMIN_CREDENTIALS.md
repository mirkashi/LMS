# 🔐 ADMIN CREDENTIALS & SETUP

## Your Admin Credentials

These credentials were automatically created when you run the seed script.

### Login Details

| Item | Value |
|------|-------|
| **Admin Email** | `admin@lmsplatform.com` |
| **Admin Password** | `Admin@12345` |
| **Admin Panel URL** | http://localhost:3001 |
| **Login Page** | http://localhost:3001/login |

### User Information
- **Name**: Admin
- **Role**: admin
- **Email Verified**: Yes (automatically verified)
- **Database**: MongoDB

---

## 🚀 How to Use These Credentials

### Step 1: Start Your Services

Open three terminals:

**Terminal 1 - Backend API:**
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

**Terminal 3 - Main Frontend (Optional):**
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

### Step 2: Login to Admin Panel

1. Open your browser and go to: **http://localhost:3001/login**
2. Enter email: **admin@lmsplatform.com**
3. Enter password: **Admin@12345**
4. Click the **Login** button

### Step 3: You're In!

After successful login, you'll see the admin dashboard with:
- 📊 Dashboard with statistics
- 👥 User management page
- 📚 Course management page
- 📦 Order tracking page

---

## ⚠️ IMPORTANT SECURITY NOTICE

### Change Your Password Immediately After First Login!

1. ✅ Login to the admin panel
2. ✅ Go to your profile (top right corner)
3. ✅ Click "Change Password"
4. ✅ Create a **strong, unique password**
   - At least 12 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Something memorable only to you
5. ✅ Save the new password securely

---

## 📋 What You Can Do in Admin Panel

Once logged in with these credentials, you can:

### Dashboard
- View total users count
- View total courses count
- View total revenue
- View active orders count
- Quick navigation to all management areas

### Users Management
- See all registered users
- Check email verification status
- View user roles
- Monitor user accounts

### Courses Management
- View all courses
- See pricing and categories
- Check publication status
- Manage course content

### Orders Management
- Track all purchases
- Monitor payment status
- View customer information
- Update order details

---

## 🔄 Changing Your Credentials Later

### Option 1: Change via Forgot Password (Recommended)
1. Go to login page: http://localhost:3001/login
2. Click "Forgot Password"
3. Enter your admin email: `admin@lmsplatform.com`
4. Check your email for reset link
5. Follow the link to set new password

### Option 2: Reset Directly in Database (Development Only)
```javascript
// If you forget your password and email isn't working:
// Use MongoDB Compass or Mongo shell to:
// 1. Find user with email: admin@lmsplatform.com
// 2. Delete the password field
// 3. Use forgot-password endpoint to reset
```

### Option 3: Re-run Seed Script
```bash
cd backend
node scripts/seedAdmin.js
# This will tell you if admin exists or create a new one
# Note: This won't overwrite existing admin
```

---

## 🔗 Related URLs

| Service | URL | Port |
|---------|-----|------|
| **Admin Panel** | http://localhost:3001 | 3001 |
| **Admin Login** | http://localhost:3001/login | 3001 |
| **Admin Dashboard** | http://localhost:3001/dashboard | 3001 |
| **Backend API** | http://localhost:5000 | 5000 |
| **Main Frontend** | http://localhost:3000 | 3000 |

---

## 📱 Admin Panel Pages

After login, you can navigate to:

### Dashboard
```
http://localhost:3001/dashboard
```
Shows overview statistics and quick actions.

### Users
```
http://localhost:3001/users
```
Manage and view all platform users.

### Courses
```
http://localhost:3001/courses
```
Manage and view all courses.

### Orders
```
http://localhost:3001/orders
```
View and track all course purchases.

---

## 🛠️ Troubleshooting

### Cannot Login?

**Check 1: Is the backend running?**
```bash
# Terminal 1 - Check backend is running on port 5000
curl http://localhost:5000
# Should respond (not timeout)
```

**Check 2: Did you run the seed script?**
```bash
cd backend
node scripts/seedAdmin.js
# Should show admin credentials or confirm admin exists
```

**Check 3: Is admin panel running?**
```bash
# Terminal 2 - Check admin panel runs
# Should see: ▲ Next.js 14.0.0
# local:        http://localhost:3001
```

**Check 4: Verify credentials**
- Email: Exactly `admin@lmsplatform.com` (case-insensitive)
- Password: Exactly `Admin@12345` (case-sensitive)

### Dashboard Shows No Data?

- Ensure backend is running
- Check browser console (F12) for API errors
- Verify `.env.local` has: `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
- Clear browser cache and reload

### Cannot Access Admin Panel?

- Check if port 3001 is available: `lsof -i :3001`
- Try different port: Edit `admin-panel/package.json` dev script
- Check for firewall blocking port 3001

---

## 📝 Admin Features Checklist

After login, verify these features work:

- [ ] Dashboard loads with statistics
- [ ] Users page shows registered users
- [ ] Courses page shows all courses
- [ ] Orders page shows purchases
- [ ] Navigation menu works
- [ ] Logout button functions
- [ ] Can navigate between pages
- [ ] Data loads from backend API

---

## 🔒 Security Reminders

✅ **DO:**
- Change default password after first login
- Use strong, unique passwords
- Keep admin email secure
- Use password manager to store credentials
- Regularly check admin access logs
- Update password every 90 days

❌ **DON'T:**
- Share admin credentials with anyone
- Write password in plain text
- Use simple passwords
- Commit credentials to Git
- Use admin for regular user tasks
- Leave admin session unattended

---

## 📞 Need Help?

### Check These Resources
1. **Quick Start**: See `ADMIN_PANEL_SETUP.md`
2. **Full Guide**: See `admin-panel/README.md`
3. **Architecture**: See `ADMIN_PANEL_COMPLETE.md`
4. **Backend API**: See `DEVELOPER_GUIDE.md`

### Common Commands

```bash
# Run seed script
cd backend && node scripts/seedAdmin.js

# Start backend
cd backend && npm run dev

# Start admin panel
cd admin-panel && npm run dev

# Install admin panel dependencies
cd admin-panel && npm install

# Clear admin session (if locked out)
# Open DevTools (F12) → Console → clear localStorage
# localStorage.clear()
```

---

## 🎉 You're All Set!

Your admin credentials are ready to use:

```
┌────────────────────────────────────┐
│   ADMIN PANEL LOGIN CREDENTIALS    │
├────────────────────────────────────┤
│ Email:    admin@lmsplatform.com    │
│ Password: Admin@12345              │
│ URL:      http://localhost:3001    │
└────────────────────────────────────┘
```

**Next Step**: Run `node scripts/seedAdmin.js` in backend directory to create the admin user, then login and enjoy managing your LMS platform!

---

**Last Updated**: December 17, 2025  
**Status**: ✅ Ready to Use  
**Version**: 1.0.0
