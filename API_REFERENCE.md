# 🔌 API Reference - 9tangle LMS

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication
Most endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register User
```
POST /auth/register
Content-Type: application/json

Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}

Response (201):
{
  "success": true,
  "message": "User registered successfully...",
  "userId": "507f1f77bcf86cd799439011"
}
```

### Login User
```
POST /auth/login
Content-Type: application/json

Request:
{
  "email": "john@example.com",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "avatar": null
  }
}
```

### Verify Email
```
POST /auth/verify-email
Content-Type: application/json

Request:
{
  "token": "email_verification_token"
}

Response (200):
{
  "success": true,
  "message": "Email verified successfully"
}
```

### Forgot Password
```
POST /auth/forgot-password
Content-Type: application/json

Request:
{
  "email": "john@example.com"
}

Response (200):
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

### Reset Password
```
POST /auth/reset-password
Content-Type: application/json

Request:
{
  "token": "password_reset_token",
  "password": "newpassword123",
  "confirmPassword": "newpassword123"
}

Response (200):
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## 📚 Course Endpoints

### Get All Courses
```
GET /courses?category=beginner&level=beginner&search=eBay&limit=10&page=1
Authorization: Not required

Response (200):
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "eBay Mastery 101",
      "description": "Learn to sell on eBay",
      "category": "eBay Basics",
      "price": 99,
      "level": "beginner",
      "rating": 4.8,
      "totalRatings": 25,
      "students": ["...", "..."],
      "instructor": {
        "_id": "...",
        "name": "Expert Instructor",
        "email": "instructor@example.com"
      },
      "isPublished": true,
      "createdAt": "2025-12-13T10:00:00Z"
    }
  ]
}
```

### Get Course Details
```
GET /courses/:courseId
Authorization: Not required

Response (200):
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "eBay Mastery 101",
    "description": "Complete guide...",
    "category": "eBay Basics",
    "price": 99,
    "duration": 10,
    "level": "beginner",
    "rating": 4.8,
    "students": ["..."],
    "modules": [
      {
        "title": "Getting Started",
        "description": "Introduction to eBay",
        "lessons": [
          {
            "title": "What is eBay?",
            "type": "video",
            "duration": 15,
            "videoUrl": "/uploads/lesson1.mp4"
          }
        ]
      }
    ],
    "instructor": {
      "_id": "...",
      "name": "Expert",
      "email": "...",
      "bio": "..."
    },
    "isPublished": true
  }
}
```

### Get Course Reviews
```
GET /courses/:courseId/reviews
Authorization: Not required

Response (200):
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "rating": 5,
      "comment": "Great course!",
      "user": {
        "_id": "...",
        "name": "John Doe",
        "avatar": null
      },
      "createdAt": "2025-12-13T10:00:00Z"
    }
  ]
}
```

### Post Course Review
```
POST /courses/:courseId/reviews
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "rating": 5,
  "comment": "Excellent course, very informative!"
}

Response (201):
{
  "success": true,
  "message": "Review posted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "course": "...",
    "user": "...",
    "rating": 5,
    "comment": "Excellent course...",
    "createdAt": "2025-12-13T10:00:00Z"
  }
}
```

### Enroll in Course
```
POST /courses/:courseId/enroll
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Enrolled in course successfully"
}
```

### Get User Enrolled Courses
```
GET /courses/enrolled/list
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "...",
      "title": "eBay Mastery 101",
      "description": "...",
      "price": 99,
      "category": "eBay Basics",
      "level": "beginner",
      "rating": 4.8
    }
  ]
}
```

---

## 👤 User Endpoints

### Get User Profile
```
GET /users/profile
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isEmailVerified": true,
    "phone": null,
    "avatar": null,
    "bio": null,
    "enrolledCourses": ["...", "..."],
    "createdAt": "2025-12-13T10:00:00Z"
  }
}
```

### Update User Profile
```
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "name": "John Updated",
  "phone": "+1234567890",
  "bio": "eBay seller and entrepreneur"
}

Response (200):
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Updated",
    "email": "john@example.com",
    "phone": "+1234567890",
    "bio": "eBay seller and entrepreneur"
  }
}
```

---

## 🛠️ Admin Endpoints

### Create Course
```
POST /admin/courses
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Request:
{
  "title": "Advanced eBay Selling",
  "description": "Master advanced eBay strategies",
  "category": "Advanced Selling",
  "price": 149,
  "duration": 20,
  "level": "advanced",
  "thumbnail": <file>
}

Response (201):
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Advanced eBay Selling",
    "description": "...",
    "category": "Advanced Selling",
    "price": 149,
    "instructor": "507f1f77bcf86cd799439012",
    "modules": [],
    "isPublished": false,
    "createdAt": "2025-12-13T10:00:00Z"
  }
}
```

### Update Course
```
PUT /admin/courses/:courseId
Authorization: Bearer <admin_token>
Content-Type: application/json

Request:
{
  "title": "Updated Title",
  "price": 129,
  "isPublished": true
}

Response (200):
{
  "success": true,
  "message": "Course updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Updated Title",
    "price": 129,
    "isPublished": true
  }
}
```

### Delete Course
```
DELETE /admin/courses/:courseId
Authorization: Bearer <admin_token>

Response (200):
{
  "success": true,
  "message": "Course deleted successfully"
}
```

### Add Module
```
POST /admin/courses/:courseId/modules
Authorization: Bearer <admin_token>
Content-Type: application/json

Request:
{
  "title": "Module 1: Basics",
  "description": "Introduction to eBay basics",
  "order": 1
}

Response (201):
{
  "success": true,
  "message": "Module added successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Module 1: Basics",
    "description": "Introduction to eBay basics",
    "modules": [
      {
        "title": "Module 1: Basics",
        "lessons": []
      }
    ]
  }
}
```

### Add Lesson
```
POST /admin/courses/:courseId/modules/:moduleIndex/lessons
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Request:
{
  "title": "Lesson 1: Getting Started",
  "description": "Your first steps on eBay",
  "type": "video",  // or "pdf" or "text"
  "duration": 15,
  "video": <file>,  // if type is video
  "pdf": <file>,    // if type is pdf
  "content": "...", // if type is text
  "order": 1
}

Response (201):
{
  "success": true,
  "message": "Lesson added successfully"
}
```

### Get All Orders
```
GET /admin/orders
Authorization: Bearer <admin_token>

Response (200):
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "orderId": "ORD-2025-001",
      "user": {
        "_id": "...",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "items": [
        {
          "course": {
            "_id": "...",
            "title": "eBay Mastery"
          },
          "price": 99
        }
      ],
      "totalAmount": 99,
      "paymentStatus": "completed",
      "status": "completed",
      "createdAt": "2025-12-13T10:00:00Z"
    }
  ]
}
```

### Update Order Status
```
PUT /admin/orders/:orderId
Authorization: Bearer <admin_token>
Content-Type: application/json

Request:
{
  "status": "completed",
  "paymentStatus": "completed"
}

Response (200):
{
  "success": true,
  "message": "Order updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "completed",
    "paymentStatus": "completed"
  }
}
```

### Get Dashboard Stats
```
GET /admin/dashboard/stats
Authorization: Bearer <admin_token>

Response (200):
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalCourses": 12,
    "totalOrders": 45,
    "totalRevenue": 4455,
    "recentOrders": [
      {
        "_id": "...",
        "orderId": "ORD-2025-001",
        "totalAmount": 99,
        "status": "completed"
      }
    ]
  }
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Admin access required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Course not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal Server Error",
  "error": "error details (development only)"
}
```

---

## 📋 Query Parameters

### Pagination
```
GET /courses?page=1&limit=10
```

### Filtering
```
GET /courses?category=eBay&level=beginner
```

### Searching
```
GET /courses?search=mastery
```

### Sorting
```
GET /courses?sort=price&order=asc
```

---

## 🔑 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Server Error |

---

## 📝 Field Types & Validation

### User
- `name`: String (required, 2-100 chars)
- `email`: String (required, valid email)
- `password`: String (required, min 6 chars)
- `role`: String (enum: 'user', 'admin')

### Course
- `title`: String (required, 1-200 chars)
- `description`: String (required, min 10 chars)
- `category`: String (required)
- `price`: Number (required, >= 0)
- `duration`: Number (hours, >= 0)
- `level`: String (enum: 'beginner', 'intermediate', 'advanced')

### Review
- `rating`: Number (required, 1-5)
- `comment`: String (optional)

---

## 🔒 Authentication Methods

### JWT Token
```
Bearer: Authorization: Bearer <token>
Expires: 7 days
Storage: localStorage (frontend)
```

---

## 📊 Rate Limiting

Coming soon:
- 100 requests per 15 minutes per IP
- Stricter limits on auth endpoints
- 5 login attempts per 15 minutes

---

## 🔄 Pagination Example

```
GET /courses?page=2&limit=10

Response:
{
  "success": true,
  "count": 10,
  "page": 2,
  "totalPages": 5,
  "total": 50,
  "data": [...]
}
```

---

## 🧪 Testing with cURL

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Get Courses
```bash
curl http://localhost:5000/api/courses
```

### Test Protected Route
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/users/profile
```

---

## 📚 Integration Examples

### JavaScript/Fetch
```javascript
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

### Python/Requests
```python
import requests

response = requests.post(
  'http://localhost:5000/api/auth/login',
  json={
    'email': 'test@example.com',
    'password': 'password123'
  }
)
print(response.json())
```

---

**API Documentation Complete! 🎉**
