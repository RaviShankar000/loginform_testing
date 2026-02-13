# 🔐 Secure Login System with Comprehensive Testing

A full-stack secure authentication system with extensive functional, boundary, and security testing framework.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [Test Scenarios](#test-scenarios)

---

## 🎯 Overview

This project demonstrates a production-ready secure login system with:
- Modern responsive frontend with real-time password strength indicator
- Secure Node.js/Express backend with JWT authentication
- MongoDB database with proper schema validation
- Protection against common attacks (SQL/NoSQL injection, XSS, brute force)
- Comprehensive testing suite (17+ functional tests, 16+ boundary tests, 20+ security tests)
- Automated Selenium UI testing
- Postman API test collection

---

## ✨ Features

### Frontend Features
- ✅ Responsive login and registration forms
- ✅ Real-time password strength indicator
- ✅ Show/hide password toggle
- ✅ Client-side validation
- ✅ Error message display
- ✅ Forgot password modal
- ✅ User dashboard after successful login
- ✅ Smooth animations and modern UI

### Backend Features
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt (12 salt rounds)
- ✅ Input validation and sanitization
- ✅ Brute force protection (account lock after 5 failed attempts)
- ✅ Account lockout for 15 minutes
- ✅ Case-sensitive password verification
- ✅ Leading/trailing space trimming
- ✅ Maximum input length enforcement
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ Helmet.js for security headers
- ✅ CORS protection

### Security Features
- 🛡️ NoSQL injection prevention
- 🛡️ XSS attack prevention
- 🛡️ Command injection prevention
- 🛡️ Path traversal prevention
- 🛡️ LDAP injection prevention
- 🛡️ Brute force attack protection
- 🛡️ Weak password rejection
- 🛡️ Password complexity requirements
- 🛡️ Session management with JWT
- 🛡️ Secure HTTP headers

---

## 🛠️ Technology Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Vite (Development Server)
- Font Awesome (Icons)
- Google Fonts

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- bcryptjs (Password Hashing)
- jsonwebtoken (JWT Authentication)
- express-validator (Input Validation)
- express-rate-limit (Rate Limiting)
- helmet (Security Headers)
- cors, morgan, dotenv

### Testing
- Selenium WebDriver (UI Automation)
- Axios (HTTP Testing)
- Mocha & Chai (Test Framework)
- Postman (API Testing)

---

## 📁 Project Structure

```
loginform_testing/
├── client/                      # Frontend application
│   ├── index.html              # Main HTML file
│   ├── main.js                 # Frontend JavaScript logic
│   ├── style.css               # Styling
│   └── package.json            # Frontend dependencies
│
├── server/                      # Backend application
│   ├── index.js                # Server entry point
│   ├── package.json            # Backend dependencies
│   ├── .env.example            # Environment variables template
│   ├── seedDatabase.js         # Database seeding script
│   │
│   ├── controllers/
│   │   └── authController.js   # Authentication logic
│   │
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT verification middleware
│   │
│   ├── models/
│   │   └── User.js             # User schema
│   │
│   └── routes/
│       └── auth.js             # Authentication routes
│
├── tests/                       # Testing suite
│   ├── package.json            # Test dependencies
│   ├── functional_tests.js     # Functional test suite
│   ├── boundary_tests.js       # Boundary value tests
│   ├── security_tests.js       # Security penetration tests
│   ├── feature_test.js         # Selenium automation tests
│   ├── postman_collection_comprehensive.json  # Postman tests
│   └── *.html                  # Generated test reports
│
└── README.md                    # This file
```

---

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Chrome Browser (for Selenium tests)
- Git

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd loginform_testing
```

### Step 2: Install Backend Dependencies
```bash
cd server
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../client
npm install
```

### Step 4: Install Test Dependencies
```bash
cd ../tests
npm install
```

### Step 5: Setup MongoDB
Make sure MongoDB is running:
```bash
# For macOS with Homebrew
brew services start mongodb-community

# For Linux
sudo systemctl start mongod

# For Windows
# Start MongoDB service from Services app
```

### Step 6: Configure Environment Variables
```bash
cd ../server
cp .env.example .env
# Edit .env file with your configuration
```

Default `.env` configuration:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/secure_login_system
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
```

### Step 7: Seed Database with Test Users
```bash
cd server
npm run seed
```

This will create the following test users:
| Username | Email | Password |
|----------|-------|----------|
| testuser | testuser@example.com | Test@1234 |
| admin | admin@example.com | Admin@1234 |
| john_doe | john.doe@example.com | JohnDoe@123 |
| alice | alice@example.com | Alice@Password99 |
| bob | bob@example.com | Bob$ecure2024 |

---

## ▶️ Running the Application

### Start Backend Server
```bash
cd server
npm start
# or for development with auto-reload
npm run dev
```
Server will run on: http://localhost:3000

### Start Frontend
```bash
cd client
npm run dev
```
Frontend will run on: http://localhost:5173

### Access the Application
Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000/api/auth

---

## 🧪 Testing

### Run All Tests
```bash
cd tests
npm run test:all
```

### Run Individual Test Suites

#### 1. Functional Tests (17 Tests)
Tests all core functionality including login, registration, validation, etc.
```bash
npm run test:functional
```
**Generates**: `test_report.html`

#### 2. Boundary Value Tests (16 Tests)
Tests edge cases like min/max lengths, extreme values, null inputs.
```bash
npm run test:boundary
```
**Generates**: `boundary_test_report.html`

#### 3. Security Tests (20 Tests)
Tests protection against SQL injection, XSS, NoSQL injection, brute force, etc.
```bash
npm run test:security
```
**Generates**: `security_test_report.html`

#### 4. Selenium Automation Tests (13+ Tests)
Automated UI testing with browser automation.
```bash
npm run test:selenium
```
**Generates**: `selenium_test_report.html`

**Note**: Make sure both frontend and backend are running before executing tests.

---

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api/auth
```

### Endpoints

#### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string (3-30 chars)",
  "email": "string (valid email)",
  "password": "string (min 8 chars, 1 upper, 1 lower, 1 number, 1 special)"
}
```

**Success Response (200)**:
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "email@example.com"
  },
  "msg": "Registration Successful"
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "string (username or email)",
  "password": "string"
}
```

**Success Response (200)**:
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "email@example.com",
    "lastLogin": "2026-02-14T..."
  },
  "msg": "Login successful"
}
```

**Error Responses**:
- `400`: Invalid Credentials
- `403`: Account locked (after 5 failed attempts)

#### 3. Get User Profile
```http
GET /api/auth/profile
x-auth-token: jwt_token_here
```

**Success Response (200)**:
```json
{
  "id": "user_id",
  "username": "username",
  "email": "email@example.com",
  "lastLogin": "timestamp",
  "failedLoginAttempts": 0,
  "createdAt": "timestamp"
}
```

#### 4. Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "email@example.com"
}
```

**Success Response (200)**:
```json
{
  "msg": "Password reset link sent to email (Check server console for token)"
}
```

---

## 🛡️ Security Features

### 1. Password Security
- **Hashing**: bcrypt with 12 salt rounds
- **Complexity Requirements**:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character
- **Case Sensitivity**: Passwords are case-sensitive
- **Maximum Length**: 128 characters

### 2. Brute Force Protection
- Maximum 5 failed login attempts
- Account locks for 15 minutes after 5 failed attempts
- Remaining attempts displayed in error message
- Automatic unlock after timeout

### 3. Input Validation & Sanitization
- Username: 3-30 characters, trimmed
- Email: Valid email format, normalized
- Special character escaping to prevent injection
- Leading/trailing space removal

### 4. Injection Prevention
- **NoSQL Injection**: Input sanitization with regex escaping
- **SQL Injection**: Parameterized queries (Mongoose)
- **XSS**: Input sanitization with express-validator
- **Command Injection**: Special character escaping

### 5. Security Headers (Helmet.js)
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Strict-Transport-Security

### 6. Rate Limiting
- 100 requests per 15 minutes per IP
- Applies to all API endpoints

---

## 📊 Test Scenarios

### Functional Tests (17 Tests)
1. ✅ Valid user registration
2. ✅ Valid login
3. ✅ Invalid username
4. ✅ Invalid password
5. ✅ Empty username
6. ✅ Empty password
7. ✅ Both fields empty
8. ✅ Special characters in username
9. ✅ Case-sensitive password check
10. ✅ Leading/trailing spaces handling
11. ✅ Maximum length username
12. ✅ Minimum length password
13. ✅ Multiple failed attempts (brute force)
14. ✅ Forgot password flow
15. ✅ SQL injection attempt
16. ✅ Script injection attempt
17. ✅ Weak password rejection

### Boundary Value Tests (16 Tests)
1. ✅ Username length = 0
2. ✅ Username length = 1
3. ✅ Username length = 2
4. ✅ Username length = 3 (minimum)
5. ✅ Username length = 30 (maximum)
6. ✅ Username length = 31 (above max)
7. ✅ Password length = 7 (below min)
8. ✅ Password length = 8 (minimum)
9. ✅ Password length = 128 (maximum)
10. ✅ Password length = 129 (above max)
11. ✅ Extremely long username (1000 chars)
12. ✅ Extremely long password (1000 chars)
13. ✅ Unicode characters
14. ✅ Very long email
15. ✅ Null username
16. ✅ Undefined password

### Security Tests (20 Tests)
1. ✅ SQL Injection - OR 1=1
2. ✅ SQL Injection - Comment attack
3. ✅ NoSQL Injection - $ne operator
4. ✅ NoSQL Injection - $gt operator
5. ✅ XSS - Script tag
6. ✅ XSS - IMG tag with onerror
7. ✅ XSS - JavaScript protocol
8. ✅ Brute force protection (5+ attempts)
9. ✅ Account lock duration check
10. ✅ Weak password - No uppercase
11. ✅ Weak password - No special char
12. ✅ Weak password - No numbers
13. ✅ Weak password - All lowercase
14. ✅ Command injection - Semicolon
15. ✅ Command injection - Pipe
16. ✅ Path traversal attack
17. ✅ LDAP injection
18. ✅ Special character flood
19. ✅ Null byte injection
20. ✅ Format string attack

---

## 📄 Postman Collection

Import the Postman collection from:
```
tests/postman_collection_comprehensive.json
```

The collection includes:
- **Authentication Tests** (7 requests)
- **Security Tests** (4 requests)
- **Boundary Tests** (5 requests)
- **Edge Cases** (3 requests)

Set the `base_url` variable to `http://localhost:3000` in Postman environment.

---

## 🎯 Project Objectives Achieved

✅ **Secure Authentication**: JWT-based authentication with bcrypt password hashing  
✅ **Input Validation**: Comprehensive validation and sanitization  
✅ **Security Protection**: Protection against SQL/NoSQL injection, XSS, brute force  
✅ **Functional Testing**: 17+ functional test cases  
✅ **Boundary Testing**: 16+ boundary value test cases  
✅ **Security Testing**: 20+ security penetration tests  
✅ **UI Automation**: Selenium WebDriver automation tests  
✅ **API Testing**: Comprehensive Postman collection  
✅ **Report Generation**: HTML test reports with pass/fail status  
✅ **Documentation**: Complete setup and execution guide

---

## 🚀 Quick Start Commands

```bash
# Setup
cd server && npm install && cp .env.example .env
cd ../client && npm install
cd ../tests && npm install

# Seed database
cd ../server && npm run seed

# Run application
cd server && npm start            # Terminal 1
cd ../client && npm run dev       # Terminal 2

# Run tests
cd tests && npm run test:all      # Terminal 3
```

---

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**🔐 Remember**: Always change default credentials and JWT secrets in production!
