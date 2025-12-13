# 9tangle Frontend - Setup Instructions

## Prerequisites

- Node.js v16 or higher
- npm or yarn
- Backend server running on port 5000

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

The `.env.local` file should contain:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

### 4. Build for Production
```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/                   # Next.js app directory
│   ├── page.tsx          # Home page
│   ├── layout.tsx        # Root layout
│   ├── courses/
│   │   ├── page.tsx      # Courses list
│   │   └── [id]/
│   │       └── page.tsx  # Course detail
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── dashboard/page.tsx
│   └── admin/
│       ├── page.tsx
│       └── courses/
│           └── create/page.tsx
├── components/            # Reusable components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
├── styles/                # Global styles
│   └── globals.css
├── utils/                 # Utility functions
├── next.config.js         # Next.js config
├── tailwind.config.ts     # Tailwind config
├── tsconfig.json          # TypeScript config
└── package.json
```

## Pages Overview

### Public Pages
- **Home** (`/`) - Landing page with featured courses
- **Courses** (`/courses`) - Browse all courses with filters
- **Course Detail** (`/courses/[id]`) - View course details and enroll
- **Shop** (`/shop`) - Purchase courses
- **About** (`/about`) - About the platform
- **Login** (`/login`) - User login
- **Register** (`/register`) - User registration

### Protected Pages
- **Dashboard** (`/dashboard`) - Student learning dashboard
- **Admin** (`/admin`) - Admin dashboard
- **Admin Courses** (`/admin/courses`) - Manage courses
- **Create Course** (`/admin/courses/create`) - Create new course

## Features Implemented

### User Interface
- Modern, responsive design
- Gradient color scheme (primary: #667eea, secondary: #764ba2)
- Smooth animations and transitions
- Mobile-friendly layout
- Professional typography

### Authentication
- Registration form with validation
- Email verification
- Login with JWT
- Password reset functionality
- Protected routes

### Course Browsing
- Course listing with filters
- Search functionality
- Course details page
- Student reviews and ratings
- Enrollment system

### Admin Features
- Dashboard with statistics
- Course management (CRUD)
- Module and lesson management
- File upload support
- Order tracking

### State Management
- Local storage for auth tokens
- Client-side component state
- API integration with Axios

## Styling

The project uses **Tailwind CSS** with custom configuration:

### Color Palette
```
Primary: #667eea
Secondary: #764ba2
Accent: #f093fb
Dark: #1a202c
Light: #f7fafc
```

### Custom Utilities
- `bg-gradient-primary` - Blue to purple gradient
- `bg-gradient-accent` - Pink to red gradient
- Custom scrollbar styling
- Smooth transitions on all interactive elements

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Tips

1. **Image Optimization**
   - Next.js Image component used for optimization
   - Lazy loading on images
   - Responsive images

2. **Code Splitting**
   - Automatic with Next.js
   - Dynamic imports for heavy components

3. **Caching**
   - Local storage for auth tokens
   - Browser caching for static assets

## Troubleshooting

### API Connection Error
- Ensure backend is running on port 5000
- Check NEXT_PUBLIC_API_URL in .env.local
- Check browser console for CORS errors

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

### TypeScript Errors
- Ensure tsconfig.json is correct
- Run: `npm run lint` to check

## Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Other Platforms
1. Build: `npm run build`
2. Deploy the `.next` folder
3. Set environment variables on platform
4. Ensure backend API URL is correct

## Development Workflow

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Open `http://localhost:3000`
4. Make changes and see hot reload
5. Test authentication flow
6. Test course management
7. Check responsive design

## Next Steps

1. Customize branding/colors
2. Add payment integration
3. Implement more features
4. Deploy to production
5. Set up analytics

For more information, see the main README.md
