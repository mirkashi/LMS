# ⚡ Quick Reference Card - 9tangle LMS

Print this page or bookmark for quick access to common commands and links.

---

## 🚀 Quick Start Commands

```bash
# Clone and setup
git clone <repo-url>
cd LMS

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your settings

# Run development servers
npm run dev
# Frontend: http://localhost:3000
# Backend: http://localhost:5000

# Build for production
npm run build

# Run production build
npm run start
```

---

## 📚 Documentation Map

| Need | Document |
|------|----------|
| Getting started in 5 min | [QUICK_START.md](QUICK_START.md) |
| Full project overview | [COMPLETE_README.md](COMPLETE_README.md) |
| Development guide | [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) |
| Customization | [CUSTOMIZATION_GUIDE.md](CUSTOMIZATION_GUIDE.md) |
| API documentation | [API_REFERENCE.md](API_REFERENCE.md) |
| Environment setup | [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) |
| Testing guide | [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) |
| Deployment | [DEPLOYMENT.md](DEPLOYMENT.md) |
| Maintenance | [MAINTENANCE_GUIDE.md](MAINTENANCE_GUIDE.md) |
| This guide | [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) |

---

## 🔌 API Quick Reference

### Authentication
```bash
POST   /api/auth/register           # Create account
POST   /api/auth/login              # Login
POST   /api/auth/verify-email       # Verify email
POST   /api/auth/forgot-password    # Request reset
POST   /api/auth/reset-password     # Reset password
```

### Courses
```bash
GET    /api/courses                 # List all courses
GET    /api/courses/:id             # Get course details
GET    /api/courses/:id/reviews     # Get reviews
POST   /api/courses/:id/reviews     # Post review
POST   /api/courses/:id/enroll      # Enroll in course
GET    /api/courses/enrolled/list   # Get enrolled courses
```

### User
```bash
GET    /api/users/profile           # Get user info
PUT    /api/users/profile           # Update profile
```

### Admin
```bash
POST   /api/admin/courses           # Create course
PUT    /api/admin/courses/:id       # Update course
DELETE /api/admin/courses/:id       # Delete course
POST   /api/admin/courses/:id/modules # Add module
POST   /api/admin/courses/:id/modules/:idx/lessons # Add lesson
GET    /api/admin/orders            # Get orders
PUT    /api/admin/orders/:id        # Update order
GET    /api/admin/dashboard/stats   # Get stats
```

---

## 🗂️ Project Structure Quick View

```
/LMS
├── /frontend          → Next.js React app
├── /backend           → Express.js API
├── /uploads           → User uploaded files
└── [Docs]            → All guides
```

### Frontend Structure
```
/app
├── page.tsx           → Home
├── login/page.tsx     → Login
├── register/page.tsx  → Register
├── courses/page.tsx   → Courses
├── dashboard/page.tsx → Student dashboard
├── admin/             → Admin pages
└── layout.tsx         → Root layout
```

### Backend Structure
```
/models       → Database schemas
/controllers  → Business logic
/routes       → API endpoints
/middleware   → Auth, upload, etc.
/utils        → Helpers (JWT, email)
/config       → Database config
server.js     → Express app
```

---

## 🔐 Environment Variables

### Backend Key Variables
```bash
NODE_ENV=development
MONGODB_URI=mongodb://...
JWT_SECRET=your-secret-key
EMAIL_SERVICE=gmail
CORS_ORIGINS=http://localhost:3000
```

### Frontend Key Variables
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_ENV=development
```

---

## 🧪 Testing Commands

```bash
# Run tests
npm test

# Check linting
npm run lint

# Check TypeScript
npm run type-check

# Build check
npm run build

# Full test suite
npm run test:full
```

---

## 📋 Deployment Quick Steps

### Frontend (Vercel)
```bash
# 1. Push to GitHub
git push origin main

# 2. Connect on Vercel (auto deploys)
# https://vercel.com/new

# 3. Set environment variables
# NEXT_PUBLIC_API_URL = production_api_url
```

### Backend (Railway)
```bash
# 1. Connect GitHub repo
# https://railway.app/dashboard

# 2. Add environment variables
# NODE_ENV = production
# MONGODB_URI = atlas_uri
# JWT_SECRET = your_secret

# 3. Deploy (automatic on push)
```

---

## 🔒 Security Checklist

- [ ] Change JWT_SECRET to random string
- [ ] Set strong database passwords
- [ ] Configure CORS properly
- [ ] Enable HTTPS in production
- [ ] Set up SSL certificates
- [ ] Configure email service
- [ ] Review API key permissions
- [ ] Enable database backups
- [ ] Setup error logging
- [ ] Enable rate limiting

---

## 🆘 Troubleshooting

### Problem: "Cannot connect to MongoDB"
```bash
# Check MongoDB is running
mongod --version

# Check connection string
echo $MONGODB_URI

# Test connection
mongo $MONGODB_URI
```

### Problem: "Port 5000 already in use"
```bash
# Find what's using it
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev:backend
```

### Problem: "Email not sending"
```bash
# Check Gmail app password (if using Gmail)
# Check SENDGRID_API_KEY (if using Sendgrid)
# Review email logs
tail -f logs/email.log
```

### Problem: "CORS error"
```bash
# Add frontend URL to CORS_ORIGINS
# Format: http://localhost:3000,https://yourdomain.com
# Restart backend server
```

### Problem: "Token validation fails"
```bash
# Ensure JWT_SECRET is same in all instances
# Check token hasn't expired (7 days)
# Clear localStorage and login again
```

---

## 📞 Common Contacts

| Role | Task |
|------|------|
| Frontend Issues | Check [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) |
| Backend Issues | Check [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) |
| Deployment | See [DEPLOYMENT.md](DEPLOYMENT.md) |
| Configuration | See [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) |
| Production | See [MAINTENANCE_GUIDE.md](MAINTENANCE_GUIDE.md) |

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Setup & run locally | 5 min |
| Customize branding | 30 min |
| Run full test suite | 30 min |
| Deploy to production | 1-2 hours |
| Setup monitoring | 1 hour |
| Full setup (from scratch) | 3-4 hours |

---

## 🎯 Key Files to Know

### Configuration
- `.env` - Backend secrets
- `.env.local` - Frontend config
- `tailwind.config.ts` - Colors & styling
- `next.config.js` - Next.js config
- `tsconfig.json` - TypeScript config

### Frontend
- `/app/page.tsx` - Home page
- `/components/Navbar.tsx` - Navigation
- `/styles/globals.css` - Global styles

### Backend
- `server.js` - Express app setup
- `/routes/*Routes.js` - API endpoints
- `/models/*.js` - Database schemas
- `/middleware/auth.js` - Authentication

---

## 🚀 Deployment Platforms

### Frontend
- **Vercel** (Recommended) - Free tier available
- **Netlify** - Alternative
- **AWS S3 + CloudFront** - Enterprise

### Backend
- **Railway** (Recommended) - Pay-as-you-go
- **Heroku** - Simple PaaS
- **AWS EC2** - Full control
- **DigitalOcean** - Affordable

### Databases
- **MongoDB Atlas** - Cloud MongoDB (free tier)
- **AWS RDS** - PostgreSQL hosting
- **Heroku Postgres** - PostgreSQL PaaS

---

## 📊 Technology Stack at a Glance

```
Frontend:  Next.js 14 + React 18 + Tailwind CSS
Backend:   Express.js + Node.js
Database:  MongoDB + PostgreSQL
Auth:      JWT + Bcryptjs
Email:     Nodemailer
Upload:    Multer
Deploy:    Vercel + Railway
```

---

## 🎓 Learning Resources

- Next.js: https://nextjs.org/docs
- React: https://react.dev
- Express: https://expressjs.com
- Tailwind: https://tailwindcss.com
- MongoDB: https://docs.mongodb.com
- PostgreSQL: https://www.postgresql.org/docs

---

## 📱 Responsive Breakpoints

```
Mobile:    < 768px (use single column)
Tablet:    768px - 1024px (use 2 columns)
Desktop:   > 1024px (use 3+ columns)
```

---

## 🎨 Brand Colors

```css
Primary:   #667eea (Indigo)
Secondary: #764ba2 (Purple)
Accent:    #f093fb (Pink)
Success:   #4ade80 (Green)
Error:     #ef4444 (Red)
Warning:   #eab308 (Yellow)
Info:      #06b6d4 (Cyan)
```

---

## 🔄 Common Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes, commit
git add .
git commit -m "Add new feature"

# Push and create PR
git push origin feature/new-feature

# After review, merge to main
git checkout main
git merge feature/new-feature

# Deploy
git push origin main
```

---

## 🆘 Quick Debug Tips

```javascript
// Log to console
console.log('Debug:', variable);

// Use debugger
debugger;

// Check API response
console.log('API Response:', response.data);

// Test database
db.courses.find().limit(1);

// Check environment
console.log(process.env.JWT_SECRET);
```

---

## 📈 Performance Tips

1. **Use pagination** - Don't fetch all data at once
2. **Add indexes** - Speed up database queries
3. **Cache responses** - Reduce API calls
4. **Lazy load images** - Improve page load
5. **Minify assets** - Reduce bundle size
6. **Use CDN** - Serve files from edge

---

## 🔐 Security Reminders

- ✅ Use HTTPS in production
- ✅ Keep JWT_SECRET private
- ✅ Validate all inputs
- ✅ Hash passwords with bcrypt
- ✅ Use environment variables
- ✅ Enable CORS selectively
- ✅ Rotate secrets regularly
- ✅ Monitor error logs

---

## 📞 Support Resources

- **GitHub Issues** - Ask questions
- **Stack Overflow** - Common problems
- **Discord Communities** - Real-time help
- **Documentation** - Comprehensive guides (this folder!)

---

## ✅ Pre-Launch Checklist

- [ ] All tests passing
- [ ] Environment variables set
- [ ] Database backups configured
- [ ] SSL certificate installed
- [ ] Email service working
- [ ] Payment gateway tested
- [ ] Monitoring enabled
- [ ] Logging configured
- [ ] Performance optimized
- [ ] Security audit completed

---

## 🎉 You're Ready!

Your complete LMS platform is built and documented. Start with:

```bash
# 1. Setup
npm install

# 2. Configure
cp .env.example .env.local
# Edit with your settings

# 3. Run
npm run dev

# 4. Visit
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

**Happy building! 🚀**

---

*Print this page for quick reference*
*Last updated: 2025*
