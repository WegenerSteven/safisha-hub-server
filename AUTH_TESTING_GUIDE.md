# Authentication System Testing Guide

## Prerequisites

1. **Environment Variables**: Create a `.env` file based on `.env.example`
2. **Database Setup**: Ensure PostgreSQL is running and configured
3. **Dependencies**: Run `npm install` to install all required packages

## Required Environment Variables

```bash
# JWT Secrets (generate secure keys for production)
JWT_ACCESS_SECRET=your_super_secret_access_key_here_should_be_at_least_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_should_be_at_least_32_chars
JWT_RESET_SECRET=your_super_secret_reset_key_here_should_be_at_least_32_chars

# JWT Expiration
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=safisha_hub
```

## Starting the Application

```bash
# Install dependencies
npm install

# Run database migrations
npm run migration:run

# Start the development server
npm run start:dev
```

## API Endpoints

### 1. User Registration (Sign Up)
- **URL**: `POST /auth/signup`
- **Public**: Yes
- **Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "customer" // or "service_provider"
}
```

### 2. User Login (Sign In)
- **URL**: `POST /auth/signin`
- **Public**: Yes
- **Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

### 3. User Logout (Sign Out)
- **URL**: `POST /auth/signout`
- **Protected**: Yes (Bearer Token)
- **Headers**: `Authorization: Bearer <access_token>`

### 4. Refresh Token
- **URL**: `POST /auth/refresh`
- **Protected**: Yes (Refresh Token)
- **Headers**: `Authorization: Bearer <refresh_token>`

### 5. Get User Profile
- **URL**: `GET /auth/profile`
- **Protected**: Yes (Bearer Token)
- **Headers**: `Authorization: Bearer <access_token>`

### 6. Forgot Password
- **URL**: `POST /auth/forgot-password`
- **Public**: Yes
- **Body**:
```json
{
  "email": "john.doe@example.com"
}
```

### 7. Reset Password
- **URL**: `POST /auth/reset-password`
- **Public**: Yes
- **Body**:
```json
{
  "token": "reset_token_from_email",
  "new_password": "newPassword123"
}
```

## Testing with cURL

### Sign Up
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "role": "customer"
  }'
```

### Sign In
```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```

### Get Profile (replace ACCESS_TOKEN with actual token)
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

## Role-Based Testing

### Customer Registration
```json
{
  "first_name": "John",
  "last_name": "Customer",
  "email": "customer@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "customer"
}
```

### Service Provider Registration
```json
{
  "first_name": "Jane",
  "last_name": "Provider",
  "email": "provider@example.com",
  "password": "password123",
  "phone": "+0987654321",
  "role": "service_provider"
}
```

## Error Scenarios to Test

1. **Duplicate Email Registration**: Try registering with the same email twice
2. **Invalid Credentials**: Try signing in with wrong password
3. **Malformed Requests**: Test with missing required fields
4. **Invalid Tokens**: Test with expired or malformed tokens
5. **Unauthorized Access**: Try accessing protected routes without tokens

## Expected Response Formats

### Successful Sign Up/Sign In
```json
{
  "user": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "role": "customer",
    "is_active": true,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT access and refresh tokens
- ✅ Token rotation on refresh
- ✅ Secure token storage (hashed refresh tokens)
- ✅ Role-based access control
- ✅ Input validation with class-validator
- ✅ Global authentication guard with public route decorators
- ✅ Password reset with secure tokens

## Swagger Documentation

Access the API documentation at: `http://localhost:3000/api`

## Common Issues and Solutions

1. **JWT Secret Not Set**: Ensure all JWT secrets are set in `.env`
2. **Database Connection**: Verify database credentials and connection
3. **Token Expiration**: Check if tokens are expired, use refresh endpoint
4. **CORS Issues**: Ensure frontend origin is allowed in CORS configuration

## Integration with Frontend

1. Store access token in memory or secure storage
2. Store refresh token in HTTP-only cookie (recommended) or secure storage
3. Implement automatic token refresh on 401 responses
4. Clear tokens on logout
5. Redirect to login on authentication errors
