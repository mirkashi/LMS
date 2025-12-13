# 🧑‍💻 Developer Guide - 9tangle LMS

## Development Workflow

This guide covers the development process for 9tangle LMS.

---

## 📦 Project Setup

### First Time Setup
```bash
# Clone repository
git clone https://github.com/mirkashi/LMS.git
cd LMS

# Setup backend
cd backend
npm install
cp .env.example .env

# Setup frontend
cd ../frontend
npm install
cp .env.example .env.local
```

---

## 🛠️ Development Environment

### Recommended Tools
- **VS Code** - Code editor
- **Postman** - API testing
- **MongoDB Compass** - Database visualization
- **pgAdmin** - PostgreSQL management
- **Git** - Version control

### VS Code Extensions
```
- ESLint
- Prettier
- Thunder Client (or Postman)
- MongoDB for VS Code
- DBeaver (PostgreSQL)
- REST Client
```

---

## 🚀 Running the Project

### Terminal 1: Backend
```bash
cd backend
npm run dev
# Watches for changes and auto-restarts
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
# Hot module replacement enabled
```

### Terminal 3: Optional - Database
```bash
# MongoDB
mongod

# PostgreSQL
postgres -D /usr/local/var/postgres
```

---

## 📝 Coding Standards

### Frontend (React/Next.js)
```typescript
// Use functional components
const MyComponent: React.FC<Props> = ({ prop }) => {
  const [state, setState] = useState<Type>(initial);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  return <div>...</div>;
};

export default MyComponent;
```

### Backend (Express.js)
```javascript
// Controllers follow this pattern
exports.functionName = async (req, res) => {
  try {
    // Business logic
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Always use async/await
// Always include try/catch
// Always return structured responses
```

### Naming Conventions
```
Frontend:
- Components: PascalCase (MyComponent.tsx)
- Files: kebab-case (my-component.tsx)
- Functions: camelCase (fetchData())
- Variables: camelCase (userName)
- Constants: UPPER_SNAKE_CASE (MAX_SIZE)

Backend:
- Files: camelCase (userController.js)
- Functions: camelCase (getUserById())
- Variables: camelCase (totalPrice)
- Constants: UPPER_SNAKE_CASE (DATABASE_URL)
```

---

## 🐛 Debugging

### Frontend Debugging
```javascript
// Use console methods
console.log('Debug:', value);
console.error('Error:', error);
console.warn('Warning:', message);

// Use React DevTools
// DevTools > Components tab

// Use Next.js Debug Page
// http://localhost:3000/__nextjs_original-stack-frame
```

### Backend Debugging
```bash
# Run with debugger
node --inspect server.js

# In Chrome, go to: chrome://inspect

# Or use VS Code debugger
# Add .vscode/launch.json
```

### Network Debugging
```javascript
// Axios interceptor
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
});

api.interceptors.response.use(
  response => {
    console.log('API Response:', response);
    return response;
  },
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;
```

---

## 📂 Adding a New Feature

### Step 1: Plan
- [ ] Define requirements
- [ ] Design database schema
- [ ] Plan API endpoints
- [ ] Design UI/UX

### Step 2: Backend
```bash
# Create model
backend/models/NewModel.js

# Create controller
backend/controllers/newController.js

# Create routes
backend/routes/newRoutes.js

# Add to server.js
app.use('/api/new', require('./routes/newRoutes'));
```

### Step 3: Frontend
```bash
# Create component
frontend/components/NewComponent.tsx

# Create page
frontend/app/new/page.tsx

# Create API client
frontend/utils/newApi.ts

# Add route to navigation
```

### Step 4: Test
- [ ] Test backend endpoints with Postman
- [ ] Test frontend UI
- [ ] Test integration
- [ ] Test error handling

### Step 5: Deploy
- [ ] Push to repository
- [ ] Run tests
- [ ] Deploy to staging
- [ ] Deploy to production

---

## 🧪 Testing

### Manual Testing
```bash
# Frontend
npm run dev
# Visit http://localhost:3000
# Test each page and feature

# Backend
npm run dev
# Use Postman to test API endpoints
```

### API Testing with cURL
```bash
# Create course (requires token)
curl -X POST http://localhost:5000/api/admin/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{
    "title": "Course Title",
    "description": "Description",
    "category": "Category",
    "price": 99
  }'
```

---

## 🚨 Common Issues & Solutions

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 npm run dev
```

### MongoDB Connection Failed
```bash
# Check MongoDB is running
mongosh

# Or update connection string in .env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/9tangle
```

### CORS Error
```javascript
// In backend server.js
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Database Schema Updates

### Add New Field to User
```javascript
// backend/models/User.js
const userSchema = new mongoose.Schema({
  // ... existing fields
  newField: {
    type: String,
    required: false
  }
});

// No migration needed with MongoDB!
```

### Add Column to PostgreSQL
```javascript
// Use Sequelize migrations
npx sequelize migration:create --name add-column-to-users

// Edit migration file
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'newColumn', {
      type: Sequelize.STRING
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'newColumn');
  }
};

// Run migration
npx sequelize db:migrate
```

---

## 🔑 Environment Variables

### Development (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/9tangle
JWT_SECRET=dev_secret_key_123
EMAIL_USER=dev@gmail.com
```

### Production (.env)
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://prod_user:prod_pass@cluster.mongodb.net/9tangle
JWT_SECRET=very_long_secure_production_key
EMAIL_USER=noreply@9tangle.com
```

---

## 📚 Code Documentation

### JSDoc Comments
```javascript
/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {string} req.body.email - User email
 * @param {string} req.body.password - User password
 * @returns {Object} Response with user data and token
 */
exports.register = async (req, res) => {
  // ...
};
```

### Component Documentation
```typescript
/**
 * LoginForm Component
 * 
 * Handles user login with email and password validation.
 * Stores JWT token in localStorage on successful login.
 * 
 * @component
 * @returns {JSX.Element} Login form
 */
export default function LoginForm() {
  // ...
}
```

---

## 🔄 Git Workflow

### Feature Branch
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
git add .
git commit -m "feat: add new feature"

# Push branch
git push origin feature/new-feature

# Create pull request
# Review → Merge → Delete branch
```

### Commit Messages
```
feat: add new feature
fix: fix bug
docs: update documentation
style: code style changes
refactor: refactor code
test: add tests
chore: maintenance tasks
```

---

## 📈 Performance Optimization

### Frontend
```typescript
// Use React.memo for expensive components
const MyComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});

// Use useCallback for memoized functions
const handleClick = useCallback(() => {
  // ...
}, [dependencies]);

// Use dynamic imports
import dynamic from 'next/dynamic';
const HeavyComponent = dynamic(() => import('./HeavyComponent'));
```

### Backend
```javascript
// Use database indexing
courseSchema.index({ instructor: 1, isPublished: 1 });

// Use pagination
const courses = await Course.find()
  .skip((page - 1) * limit)
  .limit(limit);

// Cache frequently accessed data
const cache = new Map();
```

---

## 🔒 Security Best Practices

- Never commit .env files
- Use environment variables for secrets
- Validate all user inputs
- Sanitize database queries
- Use HTTPS in production
- Keep dependencies updated
- Regular security audits

---

## 📦 Dependency Management

### Update Dependencies
```bash
# Check outdated packages
npm outdated

# Update all packages
npm update

# Update specific package
npm install package@latest
```

### Remove Unused Dependencies
```bash
# Check for unused packages
npm prune

# Remove specific package
npm uninstall package-name
```

---

## 🎯 Before Committing

- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] No console errors/warnings
- [ ] Follows coding standards
- [ ] Has meaningful commit message
- [ ] No sensitive data included
- [ ] Tested on mobile view (frontend)

---

## 📞 Getting Help

- Check README files
- Review existing code
- Search GitHub issues
- Ask on discussion forums
- Check package documentation

---

**Happy developing! 🚀**
