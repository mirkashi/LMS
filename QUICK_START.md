# 🚀 Quick Start Guide - 9tangle LMS

## 5-Minute Setup

### Step 1: Backend Setup (Terminal 1)

```bash
# Navigate to backend
cd backend

# Install dependencies (if not done)
npm install

# Copy environment file
cp .env.example .env

# IMPORTANT: Edit .env with your settings
# - For local development, defaults should work
# - MongoDB: mongodb://localhost:27017/9tangle
# - PostgreSQL: user=postgres, password=postgres
# - JWT_SECRET: any random string
# - EMAIL: Optional, can skip for now

# Start backend server
npm run dev

# You should see: 🚀 Server running on port 5000
```

### Step 2: Frontend Setup (Terminal 2)

```bash
# Navigate to frontend
cd frontend

# Install dependencies (if not done)
npm install

# Copy environment file
cp .env.example .env.local

# .env.local is already configured correctly
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Start frontend server
npm run dev

# You should see: Ready in X.XXs
```

### Step 3: Open the App

Open your browser and go to: **http://localhost:3000**

## 🎯 What to Test First

### 1. Home Page
- See featured courses
- Check responsive design
- Click navigation links

### 2. User Registration
1. Click "Register" in navbar
2. Fill form with:
   - Name: John Doe
   - Email: test@example.com
   - Password: password123
3. Click "Create Account"
4. You'll see success message
5. *(Email verification is optional, skip if email not configured)*

### 3. User Login
1. Click "Login"
2. Enter email and password from registration
3. Click "Login"
4. You'll be redirected to dashboard

### 4. Browse Courses
1. Click "Courses" in navbar
2. See course listings
3. Use filters to narrow down
4. Click "View Details" on a course

### 5. Admin Panel (Advanced)
1. Create an admin account by:
   - Registering as normal user
   - Updating their role in database to "admin"
   - Then login and visit `/admin`

2. From admin panel:
   - Create a new course
   - Add course details
   - Publish course
   - Manage content

## 📦 Required Services

Make sure these are running:

### MongoDB
```bash
# MacOS with Homebrew
brew services start mongodb-community

# Ubuntu/Linux
sudo service mongod start

# Or use MongoDB Atlas (Cloud)
# Update MONGODB_URI in .env
```

### PostgreSQL
```bash
# MacOS with Homebrew
brew services start postgresql

# Ubuntu/Linux
sudo service postgresql start

# Windows
# Start PostgreSQL from Services
```

## 🔧 Troubleshooting

### Backend won't start?
```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill process if needed
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

### Frontend won't compile?
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run dev
```

### Database connection error?
```bash
# Test MongoDB
mongosh

# Test PostgreSQL
psql -U postgres
```

### Can't reach API from frontend?
```bash
# Check backend is running
curl http://localhost:5000/api/courses

# Check NEXT_PUBLIC_API_URL
cat .env.local
```

## 📁 File Organization

```
LMS/
├── frontend/        ← React/Next.js
├── backend/         ← Express/Node.js
└── README files     ← Documentation
```

## 🎓 Learning Path

1. **Understand Structure** - Read COMPLETE_README.md
2. **Test Registration** - Create an account
3. **Test Courses** - Browse and view courses
4. **Create Admin** - Set up admin user
5. **Create Course** - Add a sample course
6. **Explore Code** - Review source files
7. **Customize** - Modify styling and content

## 🚀 Next Steps

### For Development
- Edit components in `frontend/components/`
- Modify pages in `frontend/app/`
- Update APIs in `backend/controllers/`
- Add new routes in `backend/routes/`

### For Customization
- Change colors in `frontend/tailwind.config.ts`
- Update branding in `components/Navbar.tsx`
- Modify course fields in `backend/models/Course.js`

### For Deployment
- See backend/SETUP.md for backend deployment
- See frontend/SETUP.md for frontend deployment
- Update API URL in .env for production

## 📚 Documentation

- **Complete Docs**: See COMPLETE_README.md
- **Backend Docs**: See backend/SETUP.md
- **Frontend Docs**: See frontend/SETUP.md

## 💡 Pro Tips

1. **Use Postman** to test APIs
2. **Check Console** for errors
3. **Use DevTools** for debugging
4. **Keep Terminals Open** while developing
5. **Test Mobile View** for responsiveness

## 🆘 Need Help?

1. Check error messages in console
2. Review setup files (backend/SETUP.md, frontend/SETUP.md)
3. Verify environment variables
4. Check if services are running
5. Look at source code comments

## ✅ Success Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:3000
- [ ] Can register a new user
- [ ] Can login successfully
- [ ] Can see courses list
- [ ] Navbar shows all links
- [ ] Footer is visible

**You're all set! Happy coding! 🎉**

---

For detailed information, see COMPLETE_README.md
