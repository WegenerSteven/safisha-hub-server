# 🔌 API Documentation

## Overview

The CarWash Management System API is built with NestJS and follows RESTful principles. All endpoints return JSON responses and use standard HTTP status codes.

## Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "timestamp": "2025-06-30T10:00:00.000Z"
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": []
  },
  "timestamp": "2025-06-30T10:00:00.000Z"
}
```

## Status Codes

- `200` - OK: Request successful
- `201` - Created: Resource created successfully
- `400` - Bad Request: Invalid request data
- `401` - Unauthorized: Authentication required
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: Resource not found
- `409` - Conflict: Resource conflict
- `422` - Unprocessable Entity: Validation error
- `500` - Internal Server Error: Server error

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "phone": "+1234567890",
  "role": "customer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "customer",
      "isActive": true,
      "createdAt": "2025-06-30T10:00:00.000Z"
    },
    "tokens": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token"
    }
  }
}
```

### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "customer"
    },
    "tokens": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token"
    }
  }
}
```

### Refresh Token
```http
POST /api/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

### Logout
```http
POST /api/auth/logout
```

**Headers:** `Authorization: Bearer <token>`

### Forgot Password
```http
POST /api/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

### Reset Password
```http
POST /api/auth/reset-password
```

**Request Body:**
```json
{
  "token": "password-reset-token",
  "newPassword": "NewSecurePassword123!"
}
```

## User Management Endpoints

### Get User Profile
```http
GET /api/users/profile
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "role": "customer",
    "preferences": {
      "notifications": true,
      "newsletter": false
    },
    "createdAt": "2025-06-30T10:00:00.000Z",
    "updatedAt": "2025-06-30T10:00:00.000Z"
  }
}
```

### Update User Profile
```http
PUT /api/users/profile
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567891",
  "preferences": {
    "notifications": true,
    "newsletter": true
  }
}
```

### List All Users (Admin Only)
```http
GET /api/users?page=1&limit=10&role=customer&search=john
```

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role
- `search` (optional): Search by name or email

## Services Endpoints

### List All Services
```http
GET /api/services?category=basic&active=true
```

**Query Parameters:**
- `category` (optional): Filter by service category
- `active` (optional): Filter by active status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Basic Wash",
      "description": "Exterior wash with soap and rinse",
      "category": "basic",
      "price": 15.00,
      "duration": 30,
      "isActive": true,
      "features": [
        "Exterior wash",
        "Soap application",
        "Rinse and dry"
      ],
      "createdAt": "2025-06-30T10:00:00.000Z"
    }
  ]
}
```

### Get Service Details
```http
GET /api/services/{serviceId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Premium Wash",
    "description": "Complete wash with wax and interior cleaning",
    "category": "premium",
    "price": 35.00,
    "duration": 60,
    "isActive": true,
    "features": [
      "Exterior wash",
      "Wax application",
      "Interior cleaning",
      "Tire shine"
    ],
    "addOns": [
      {
        "id": "uuid",
        "name": "Engine Bay Cleaning",
        "price": 10.00
      }
    ]
  }
}
```

### Create Service (Admin Only)
```http
POST /api/services
```

**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:**
```json
{
  "name": "Deluxe Wash",
  "description": "Ultimate car wash experience",
  "category": "deluxe",
  "price": 50.00,
  "duration": 90,
  "features": [
    "Premium exterior wash",
    "Clay bar treatment",
    "Wax application",
    "Interior detailing",
    "Leather conditioning"
  ]
}
```

### Update Service (Admin Only)
```http
PUT /api/services/{serviceId}
```

**Headers:** `Authorization: Bearer <admin-token>`

### Delete Service (Admin Only)
```http
DELETE /api/services/{serviceId}
```

**Headers:** `Authorization: Bearer <admin-token>`

## Booking Endpoints

### Check Availability
```http
GET /api/bookings/availability?date=2025-06-30&serviceId=uuid
```

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format
- `serviceId` (required): Service ID

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2025-06-30",
    "availableSlots": [
      {
        "time": "09:00",
        "available": true
      },
      {
        "time": "10:00",
        "available": false
      },
      {
        "time": "11:00",
        "available": true
      }
    ]
  }
}
```

### Create Booking
```http
POST /api/bookings
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "serviceId": "uuid",
  "date": "2025-06-30",
  "time": "09:00",
  "vehicleInfo": {
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "color": "White",
    "licensePlate": "ABC123"
  },
  "addOns": ["uuid1", "uuid2"],
  "specialInstructions": "Please pay attention to the rim cleaning"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "bookingNumber": "BK-20250630-001",
    "service": {
      "id": "uuid",
      "name": "Premium Wash",
      "price": 35.00
    },
    "date": "2025-06-30",
    "time": "09:00",
    "status": "confirmed",
    "totalAmount": 45.00,
    "estimatedDuration": 60,
    "vehicleInfo": {
      "make": "Toyota",
      "model": "Camry",
      "year": 2020,
      "color": "White",
      "licensePlate": "ABC123"
    }
  }
}
```

### List User Bookings
```http
GET /api/bookings?status=confirmed&page=1&limit=10
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by booking status
- `page` (optional): Page number
- `limit` (optional): Items per page

### Get Booking Details
```http
GET /api/bookings/{bookingId}
```

**Headers:** `Authorization: Bearer <token>`

### Update Booking
```http
PUT /api/bookings/{bookingId}
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "date": "2025-07-01",
  "time": "10:00",
  "specialInstructions": "Updated instructions"
}
```

### Cancel Booking
```http
DELETE /api/bookings/{bookingId}
```

**Headers:** `Authorization: Bearer <token>`

## Payment Endpoints

### Create Payment Intent
```http
POST /api/payments/create-intent
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "bookingId": "uuid",
  "amount": 45.00,
  "currency": "usd",
  "paymentMethod": "stripe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_stripe_client_secret",
    "paymentIntentId": "pi_stripe_payment_intent_id",
    "amount": 4500,
    "currency": "usd"
  }
}
```

### Confirm Payment
```http
POST /api/payments/confirm
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "paymentIntentId": "pi_stripe_payment_intent_id",
  "bookingId": "uuid"
}
```

### Payment History
```http
GET /api/payments/history?page=1&limit=10&status=succeeded
```

**Headers:** `Authorization: Bearer <token>`

### Process Refund (Admin Only)
```http
POST /api/payments/refund
```

**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:**
```json
{
  "paymentId": "uuid",
  "amount": 45.00,
  "reason": "Service cancellation"
}
```

## Analytics Endpoints (Admin Only)

### Dashboard Metrics
```http
GET /api/analytics/dashboard?period=30d
```

**Headers:** `Authorization: Bearer <admin-token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 15000.00,
    "totalBookings": 250,
    "activeCustomers": 180,
    "averageOrderValue": 60.00,
    "revenueGrowth": 12.5,
    "bookingGrowth": 8.3
  }
}
```

### Revenue Analytics
```http
GET /api/analytics/revenue?startDate=2025-06-01&endDate=2025-06-30&groupBy=day
```

**Query Parameters:**
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `groupBy`: Grouping period (day, week, month)

### Customer Analytics
```http
GET /api/analytics/customers?period=30d
```

### Service Performance
```http
GET /api/analytics/services?period=30d
```

## WebSocket Events

The API supports real-time communication via WebSocket for live updates.

### Connection
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events

#### Booking Updates
```javascript
// Listen for booking status changes
socket.on('booking:updated', (data) => {
  console.log('Booking updated:', data);
});

// Listen for new bookings (Staff/Admin)
socket.on('booking:created', (data) => {
  console.log('New booking:', data);
});
```

#### Notifications
```javascript
// Listen for notifications
socket.on('notification', (data) => {
  console.log('New notification:', data);
});
```

#### Queue Updates
```javascript
// Listen for queue position changes
socket.on('queue:updated', (data) => {
  console.log('Queue position:', data.position);
});
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **General endpoints**: 100 requests per minute
- **File upload endpoints**: 10 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_ERROR` | Authentication failed |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `RESOURCE_NOT_FOUND` | Requested resource not found |
| `RESOURCE_CONFLICT` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `PAYMENT_ERROR` | Payment processing failed |
| `SERVICE_UNAVAILABLE` | External service unavailable |
| `INTERNAL_ERROR` | Internal server error |

## Testing the API

### Using cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get services (with token)
curl -X GET http://localhost:5000/api/services \
  -H "Authorization: Bearer your-jwt-token"

# Create booking
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{"serviceId":"uuid","date":"2025-06-30","time":"09:00"}'
```

### Using Postman

1. Import the API collection from `/docs/postman-collection.json`
2. Set up environment variables for base URL and tokens
3. Use the pre-request scripts for automatic token management

### Interactive Documentation

Visit the Swagger UI at `http://localhost:5000/api/docs` for interactive API testing and exploration.

## SDK and Client Libraries

### JavaScript/TypeScript SDK

```bash
npm install @carwash/api-client
```

```typescript
import { CarWashAPI } from '@carwash/api-client';

const api = new CarWashAPI({
  baseURL: 'http://localhost:5000/api',
  token: 'your-jwt-token'
});

// List services
const services = await api.services.list();

// Create booking
const booking = await api.bookings.create({
  serviceId: 'uuid',
  date: '2025-06-30',
  time: '09:00'
});
```

For more detailed examples and advanced usage, see the [SDK Documentation](./SDK.md).
