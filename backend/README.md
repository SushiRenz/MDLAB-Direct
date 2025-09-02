# MDLAB Direct Backend API

A comprehensive backend API for the MDLAB Direct Laboratory Management System built with Node.js, Express, and MongoDB.

## Features

- 🔐 **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Patient, MedTech, Pathologist, Admin)
  - Password hashing with bcrypt
  - Account lockout after failed attempts
  - Rate limiting for security

- 👥 **User Management**
  - User registration and login
  - Profile management
  - Password change functionality
  - Admin user management (CRUD operations)
  - User statistics and analytics

- 🛡️ **Security Features**
  - Helmet for security headers
  - CORS protection
  - Input validation and sanitization
  - Rate limiting
  - Error handling

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository and navigate to backend folder**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env` file and update the variables:
   ```bash
   # Update these values in .env file
   MONGODB_URI=mongodb://localhost:27017/MDLAB_DIRECT
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

4. **Start MongoDB**
   - For local MongoDB: Make sure MongoDB is running
   - For MongoDB Atlas: Use your connection string in `MONGODB_URI`

5. **Seed the database** (Optional but recommended)
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## Default Admin Account

After seeding the database, you can login with:
- **Email**: admin@mdlab.com
- **Username**: admin
- **Password**: Admin123!

⚠️ **Important**: Change the default password immediately after first login!

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | User login | Public |
| POST | `/logout` | User logout | Private |
| GET | `/me` | Get current user | Private |
| PUT | `/profile` | Update user profile | Private |
| PUT | `/change-password` | Change password | Private |

### User Management Routes (`/api/users`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Get all users | Admin |
| POST | `/` | Create new user | Admin |
| GET | `/stats` | Get user statistics | Admin |
| GET | `/:id` | Get user by ID | Admin |
| PUT | `/:id` | Update user | Admin |
| DELETE | `/:id` | Delete user | Admin |
| PUT | `/:id/activate` | Activate user | Admin |
| PUT | `/:id/deactivate` | Deactivate user | Admin |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API health check |

## User Roles

1. **Patient** - Regular users who can book appointments and view results
2. **MedTech** - Laboratory technicians who process samples
3. **Pathologist** - Medical professionals who review and approve results
4. **Admin** - System administrators with full access

## Authentication Flow

1. **Registration/Login** → Returns JWT token
2. **Subsequent Requests** → Include token in Authorization header:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

## Example API Usage

### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+639123456789",
    "role": "patient"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "admin@mdlab.com",
    "password": "Admin123!"
  }'
```

### Get current user (with token)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Database Schema

### User Model
```javascript
{
  username: String (unique),
  email: String (unique),
  passwordHash: String,
  role: Enum ['patient', 'medtech', 'pathologist', 'admin'],
  firstName: String,
  lastName: String,
  phone: String,
  address: {
    street: String,
    city: String,
    province: String,
    zipCode: String
  },
  dateOfBirth: Date,
  gender: Enum ['male', 'female', 'other'],
  isActive: Boolean,
  isEmailVerified: Boolean,
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors if any
}
```

## Security Features

- **Password Requirements**: Minimum 6 characters with uppercase, lowercase, and number
- **Account Lockout**: After 5 failed login attempts, account locks for 15 minutes
- **Rate Limiting**: 
  - General API: 100 requests per 15 minutes
  - Auth endpoints: 10 requests per 15 minutes
  - Login endpoint: 5 requests per 15 minutes
- **Input Validation**: All inputs are validated and sanitized
- **CORS**: Configured for frontend domain

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | localhost |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `BCRYPT_SALT_ROUNDS` | Password hashing rounds | 12 |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |
| `MAX_LOGIN_ATTEMPTS` | Max login attempts before lock | 5 |
| `LOCKOUT_TIME` | Account lockout time (minutes) | 15 |

## Scripts

```bash
# Start server in development mode
npm run dev

# Start server in production mode
npm start

# Seed database with sample data
npm run seed
```

## Development

### Project Structure
```
backend/
├── controllers/     # Route handlers
├── middleware/      # Custom middleware
├── models/         # Database models
├── routes/         # Route definitions
├── utils/          # Utility functions
├── .env            # Environment variables
├── server.js       # Main server file
└── seedDatabase.js # Database seeding script
```

### Adding New Features

1. Create model in `models/`
2. Create controller in `controllers/`
3. Add validation in `middleware/validation.js`
4. Create routes in `routes/`
5. Import routes in `server.js`

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Use MongoDB Atlas or secured MongoDB instance
4. Enable HTTPS
5. Configure proper CORS origins
6. Set up monitoring and logging

## Support

For issues and questions, please contact the development team or create an issue in the repository.
