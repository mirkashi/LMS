# 9tangle Backend - Setup Instructions

## Prerequisites

- Node.js v16 or higher
- MongoDB (local or Atlas)
- PostgreSQL
- npm or yarn

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

### 3. Start MongoDB
```bash
# Using local MongoDB
mongod

# Or using MongoDB Atlas (update MONGODB_URI in .env)
```

### 4. Create PostgreSQL Database
```bash
createdb 9tangle
```

### 5. Start the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## Database Setup

### MongoDB
- Create user collection automatically on first signup
- Create course collection when admin creates first course

### PostgreSQL
- Optional: Can be used for analytics and structured data
- Models defined with Sequelize ORM

## Email Setup

To enable email verification and password reset:

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Add to `.env`:
   - EMAIL_USER=your_gmail@gmail.com
   - EMAIL_PASSWORD=your_app_password
  - BACKEND_URL=http://localhost:5000
  - FRONTEND_URL=http://localhost:3000

Development fallback:
- If `EMAIL_USER` and `EMAIL_PASSWORD` are not set and `NODE_ENV=development`, the app uses Ethereal test SMTP automatically.
- Check console for a “Preview URL”; open it to view the email.

## API Testing

Use Postman or similar tool with these endpoints:

### Register User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

### Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Course (Admin)
```
POST http://localhost:5000/api/admin/courses
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "eBay Mastery 101",
  "description": "Learn how to succeed on eBay",
  "category": "eBay Basics",
  "price": 99,
  "duration": 10,
  "level": "beginner"
}
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Try: `mongo` or `mongosh` to test connection

### PostgreSQL Connection Error
- Ensure PostgreSQL service is running
- Check database exists: `\l` in psql
- Verify credentials in .env
- If you don't need PostgreSQL locally, set `DB_ENABLED=false` in `.env` to skip connecting.
- If connecting, make sure `DB_USER` and `DB_PASSWORD` match your local Postgres user.

### Email Not Sending
- Check EMAIL_USER and EMAIL_PASSWORD
- Enable "Less secure app access" if using Gmail
- Try generating new App Password

## File Structure

```
backend/
├── server.js              # Entry point
├── routes/                # API endpoints
├── controllers/           # Business logic
├── models/                # Data models
├── middleware/            # Middleware functions
├── config/                # Configuration
├── utils/                 # Utility functions
├── uploads/               # Uploaded files (created at runtime)
├── .env.example           # Environment template
└── package.json
```

## Next Steps

1. Start the frontend development server
2. Test user registration and login
3. Create an admin user
4. Start uploading courses
5. Deploy when ready

For more information, see the main README.md
