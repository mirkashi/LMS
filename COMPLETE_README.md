# 🎓 9tangle - Professional LMS Platform

A complete, production-ready Learning Management System built with MERN stack and Next.js for eBay consultants to sell courses in PDF and video formats. Modern, clean, visually appealing design with professional features and smooth aesthetic.

![9tangle](https://img.shields.io/badge/LMS-Professional-blue?style=flat-square)
![Tech Stack](https://img.shields.io/badge/MERN%2BNext.js-Full%20Stack-purple?style=flat-square)
![Status](https://img.shields.io/badge/Status-Production%20Ready-green?style=flat-square)

## ✨ Key Features

### Frontend Features
- ✅ Modern, professional, responsive design
- ✅ Smooth and cool aesthetic with gradient UI
- ✅ Navigation: Home, Courses, Shop, About
- ✅ User Registration & Login system
- ✅ Email verification for secure authentication
- ✅ Password validation and reset functionality
- ✅ Student dashboard for enrolled courses
- ✅ Course browsing with filters and search
- ✅ Course details with reviews and ratings
- ✅ Enrollment system with progress tracking

### Backend Features
- ✅ Express.js REST API
- ✅ Complete CRUD operations
- ✅ User authentication with JWT
- ✅ Email verification system
- ✅ Password hashing with bcryptjs
- ✅ Course management system
- ✅ Module and lesson management
- ✅ Support for PDF and video content
- ✅ File upload handling with Multer
- ✅ Review and rating system
- ✅ Order management
- ✅ Database error handling

### Admin Features
- ✅ Dedicated Admin Panel
- ✅ Dashboard with statistics
- ✅ Course management (create, read, update, delete)
- ✅ Module and lesson management
- ✅ File upload support (PDF, Video, Images)
- ✅ Order tracking and management
- ✅ User management
- ✅ Revenue tracking
- ✅ Full content control

## 🛠 Tech Stack

### Frontend
```
- Next.js 14 (React Framework)
- React 18 (UI Library)
- TypeScript (Type Safety)
- Tailwind CSS (Styling)
- Axios (HTTP Client)
- React Hook Form (Form Management)
- Zustand (State Management)
```

### Backend
```
- Node.js (Runtime)
- Express.js (Web Framework)
- MongoDB (NoSQL Database)
- PostgreSQL (SQL Database)
- Mongoose (MongoDB ODM)
- Sequelize (PostgreSQL ORM)
- JWT (Authentication)
- Nodemailer (Email Service)
- Multer (File Upload)
- bcryptjs (Password Hashing)
- Joi (Validation)
```

### DevOps & Tools
```
- npm (Package Manager)
- Git (Version Control)
- PostCSS (CSS Processor)
- ESLint (Code Linting)
```

## 📁 Project Structure

```
9tangle/
├── 📂 frontend/                    # Next.js Frontend Application
│   ├── 📂 app/                     # Next.js App Directory
│   │   ├── page.tsx               # Home Page
│   │   ├── layout.tsx             # Root Layout
│   │   ├── 📂 courses/
│   │   │   ├── page.tsx           # Courses Listing
│   │   │   └── 📂 [id]/
│   │   │       └── page.tsx       # Course Detail Page
│   │   ├── 📂 login/
│   │   │   └── page.tsx           # Login Page
│   │   ├── 📂 register/
│   │   │   └── page.tsx           # Registration Page
│   │   ├── 📂 dashboard/
│   │   │   └── page.tsx           # Student Dashboard
│   │   ├── 📂 shop/
│   │   │   └── page.tsx           # Shop Page
│   │   ├── 📂 about/
│   │   │   └── page.tsx           # About Page
│   │   └── 📂 admin/              # Admin Pages
│   │       ├── page.tsx           # Admin Dashboard
│   │       └── 📂 courses/
│   │           ├── page.tsx       # Manage Courses
│   │           └── 📂 create/
│   │               └── page.tsx   # Create Course
│   ├── 📂 components/              # Reusable Components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── 📂 styles/                  # Global Styles
│   │   └── globals.css
│   ├── 📂 utils/                   # Utility Functions
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── postcss.config.js
│   ├── .eslintrc.json
│   ├── package.json
│   ├── .env.example
│   └── SETUP.md
│
└── 📂 backend/                     # Express.js Backend
    ├── server.js                  # Main Server File
    ├── 📂 routes/                 # API Routes
    │   ├── authRoutes.js
    │   ├── courseRoutes.js
    │   ├── adminRoutes.js
    │   └── userRoutes.js
    ├── 📂 controllers/             # Business Logic
    │   ├── authController.js
    │   ├── courseController.js
    │   ├── adminController.js
    │   └── userController.js
    ├── 📂 models/                  # Database Models
    │   ├── User.js
    │   ├── Course.js
    │   ├── Review.js
    │   └── Order.js
    ├── 📂 middleware/              # Middleware Functions
    │   ├── auth.js
    │   ├── upload.js
    │   └── errorHandler.js
    ├── 📂 config/                  # Configuration
    │   └── database.js
    ├── 📂 utils/                   # Utility Functions
    │   ├── jwt.js
    │   └── mailer.js
    ├── 📂 uploads/                 # Uploaded Files (Runtime)
    ├── package.json
    ├── .env.example
    ├── SETUP.md
    └── README.md

ROOT FILES:
├── README.md                       # Project Documentation
└── .gitignore
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16 or higher
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas)
- **PostgreSQL** v12 or higher

### Backend Setup (5 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure .env with your settings
# - MongoDB URI
# - PostgreSQL credentials
# - JWT secret
# - Email configuration
# - Frontend URL

# Start development server
npm run dev
```

**Backend runs on:** `http://localhost:5000`

### Frontend Setup (5 minutes)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Configure .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

**Frontend runs on:** `http://localhost:3000`

### Verify Setup

1. Open `http://localhost:3000` in your browser
2. Navigate to Register and create a new account
3. Verify your email
4. Login to access the platform
5. If you're an admin, access `/admin`

## 📚 Database Setup

### MongoDB
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (Cloud)
# Update MONGODB_URI in .env
```

### PostgreSQL
```bash
# Create database
createdb 9tangle

# Update credentials in .env
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

## 🔑 Authentication System

### User Registration
- Full name, email, password required
- Password validation (minimum 6 characters)
- Confirmation password verification
- Email verification via token
- Secure password hashing with bcryptjs

### Email Verification
- Automatic email sent after registration
- Token expires in 24 hours
- Resendable verification emails
- Professional email template

### Login & Security
- JWT-based authentication
- Secure token storage
- Password reset functionality
- Session management
- Admin role verification

### Password Management
- Password hashing with salt rounds
- Secure password reset via email
- Token-based reset (1 hour expiry)
- Password strength validation

## 🎓 Course Management

### Admin Capabilities
- **Create Courses**
  - Add title, description, category
  - Set pricing and difficulty level
  - Upload thumbnail images
  - Specify duration

- **Organize Content**
  - Create modules
  - Add lessons with different types
  - Support: Video, PDF, Text content
  - Add resources to lessons

- **Publish & Control**
  - Draft/publish courses
  - Update course details
  - Delete courses
  - Manage enrollments

### Student Experience
- Browse all published courses
- Filter by category and difficulty
- Search courses
- View detailed course information
- Enroll in courses
- Access enrolled content
- Leave reviews and ratings
- Track progress

## 🛒 E-Commerce Features

### Shop Page
- Course bundles
- Product listings
- Add to cart functionality
- Order management

### Orders
- Order tracking
- Payment status management
- Order history
- Order fulfillment

## 👥 User Management

### Student Profile
- View enrolled courses
- Update profile information
- Track learning progress
- View certificates
- Manage preferences

### Admin Management
- View all users
- User statistics
- Track student activity
- Manage user roles

## 📊 Admin Dashboard

### Statistics
- Total users
- Total courses
- Total orders
- Total revenue
- Recent orders list

### Quick Actions
- Create new course
- Manage existing courses
- View all orders
- Manage users

## 🔒 Security Features

### Authentication & Authorization
- JWT token-based authentication
- Role-based access control (RBAC)
- Admin verification middleware
- Protected API endpoints

### Data Protection
- Password hashing (bcryptjs)
- Email verification tokens
- Password reset tokens
- CORS protection
- Environment variable protection

### File Security
- MIME type validation
- File size limits (500MB max)
- Secure file upload directory
- Filename sanitization

## 🎨 Design & UI

### Color Palette
```
Primary Blue: #667eea
Secondary Purple: #764ba2
Accent Pink: #f093fb
Accent Red: #f5576c
Dark: #1a202c
Light: #f7fafc
```

### Design Features
- Modern gradient backgrounds
- Smooth animations and transitions
- Responsive grid layouts
- Professional typography
- Consistent spacing
- Hover effects on interactive elements

### Responsive Design
- Mobile-first approach
- Tablet-optimized layouts
- Desktop full-featured experience
- Touch-friendly buttons
- Readable font sizes

## 📱 Pages & Routes

### Public Pages
| Route | Purpose |
|-------|---------|
| `/` | Home page with featured courses |
| `/courses` | Browse all courses |
| `/courses/[id]` | Course details |
| `/shop` | Shop page |
| `/about` | About platform |
| `/login` | User login |
| `/register` | User registration |

### Protected Pages (Student)
| Route | Purpose |
|-------|---------|
| `/dashboard` | Learning dashboard |
| `/profile` | User profile |

### Protected Pages (Admin)
| Route | Purpose |
|-------|---------|
| `/admin` | Admin dashboard |
| `/admin/courses` | Manage courses |
| `/admin/courses/create` | Create course |
| `/admin/courses/[id]/edit` | Edit course |
| `/admin/orders` | Manage orders |
| `/admin/users` | Manage users |

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login user
POST   /api/auth/verify-email      Verify email
POST   /api/auth/forgot-password   Request password reset
POST   /api/auth/reset-password    Reset password
```

### Courses
```
GET    /api/courses                Get all courses
GET    /api/courses/:id            Get course details
POST   /api/courses/:id/enroll     Enroll in course
GET    /api/courses/enrolled/list  Get enrolled courses
GET    /api/courses/:id/reviews    Get reviews
POST   /api/courses/:id/reviews    Post review
```

### Admin
```
POST   /api/admin/courses          Create course
PUT    /api/admin/courses/:id      Update course
DELETE /api/admin/courses/:id      Delete course
POST   /api/admin/courses/:id/modules         Add module
POST   /api/admin/courses/:id/modules/:idx/lessons  Add lesson
GET    /api/admin/orders           Get orders
PUT    /api/admin/orders/:id       Update order
GET    /api/admin/dashboard/stats  Dashboard stats
```

### Users
```
GET    /api/users/profile          Get user profile
PUT    /api/users/profile          Update profile
```

## 📧 Email Configuration

### Gmail Setup
1. Enable 2-factor authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Add to `.env`:
   ```
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```

### Email Templates
- Welcome email
- Email verification
- Password reset
- Professional branding

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm i -g vercel
vercel
```

### Backend (Heroku/Railway/Render)
```bash
# Build
npm run build

# Deploy with your provider
```

### Environment Variables
Set these on your deployment platform:
- `MONGODB_URI`
- `DB_*` (PostgreSQL credentials)
- `JWT_SECRET`
- `EMAIL_*` (Email config)
- `FRONTEND_URL`
- `NODE_ENV=production`

## 📈 Performance

### Optimization Techniques
- Image lazy loading
- CSS minification
- Code splitting
- Database query optimization
- Caching strategies
- File compression

### Best Practices
- RESTful API design
- Error handling
- Request validation
- Rate limiting ready
- Logging ready

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration works
- [ ] Email verification works
- [ ] Login/logout works
- [ ] Password reset works
- [ ] Course creation works
- [ ] Course enrollment works
- [ ] Admin dashboard loads
- [ ] File uploads work
- [ ] Reviews post correctly
- [ ] Filters and search work

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
```bash
# Check if MongoDB is running
mongod --version
# Or update MONGODB_URI to MongoDB Atlas
```

**API Not Responding**
```bash
# Ensure backend is running
npm run dev  # in backend directory
# Check NEXT_PUBLIC_API_URL in frontend
```

**Email Not Sending**
```bash
# Verify Gmail App Password
# Enable Less Secure Apps if using Gmail
# Check EMAIL_USER and EMAIL_PASSWORD
```

## 📝 Documentation

- [Backend Setup Guide](./backend/SETUP.md)
- [Frontend Setup Guide](./frontend/SETUP.md)
- [API Documentation](./backend/README.md)

## 🎯 Future Enhancements

- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Advanced video player with progress tracking
- [ ] Downloadable certificates
- [ ] Discussion forum per course
- [ ] Live webinar integration
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Student messaging system
- [ ] Course completion badges
- [ ] Batch user import

## 📄 License

MIT License - Feel free to use this in your projects

## 🤝 Support

For issues and support:
- Email: support@9tangle.com
- GitHub Issues: Report bugs here
- Documentation: See SETUP.md files

## 👨‍💻 Author

Built with ❤️ by the 9tangle Team

---

**Made for eBay Consultants | Professional Learning Platform**

*Last Updated: December 2025*
