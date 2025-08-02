# Bakso Kangen API Documentation

A comprehensive meatball ordering platform API built with Node.js, Express, and supports both MongoDB and SQLite databases.

## Table of Contents
- [Overview](#overview)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

## Overview

The Bakso Kangen API provides a complete solution for managing a meatball restaurant's operations, including:
- User authentication with JWT tokens
- Menu management
- Order processing and tracking
- Analytics and reporting
- Role-based access control (Customer, Admin, Owner)

### Base URL
```
https://your-domain.com/api
```

### Response Format
All API responses follow this consistent format:
```json
{
  "success": boolean,
  "message": string,
  "data": object | array,
  "error": {
    "name": string,
    "message": string
  },
  "errors": [
    {
      "field": string,
      "message": string
    }
  ]
}
```

## Getting Started

### Prerequisites
- Node.js 16+ 
- MongoDB or SQLite
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Seed the database: `npm run seed`
5. Start the server: `npm run dev`

### Environment Variables
```env
PORT=5000
NODE_ENV=development
DATABASE_TYPE=sqlite
SQLITE_PATH=./database/bakso-kangen.db
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **Customer**: Can place orders and view menu
- **Admin**: Can manage orders and view reports
- **Owner**: Can access all features including analytics

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "username": "customer1",
  "password": "Customer123",
  "role": "customer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "username": "customer1",
      "role": "customer",
      "createdAt": "2024-01-01T12:00:00Z",
      "updatedAt": "2024-01-01T12:00:00Z"
    },
    "token": "jwt-token"
  }
}
```

#### POST /api/auth/login
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "Admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "username": "admin",
      "role": "admin",
      "createdAt": "2024-01-01T12:00:00Z",
      "updatedAt": "2024-01-01T12:00:00Z"
    },
    "token": "jwt-token"
  }
}
```

#### GET /api/auth/profile
Get current user profile (requires authentication).

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "admin",
      "role": "admin",
      "createdAt": "2024-01-01T12:00:00Z",
      "updatedAt": "2024-01-01T12:00:00Z"
    }
  }
}
```

#### GET /api/auth/verify
Verify JWT token validity.

#### POST /api/auth/logout
Logout user (client-side token removal).

#### GET /api/auth/users
Get all users (Admin/Owner only).

#### POST /api/auth/users
Create new user (Admin/Owner only).

#### PUT /api/auth/users/:id
Update user by ID (Admin/Owner only).

#### DELETE /api/auth/users/:id
Delete user by ID (Admin/Owner only).

### Menu Endpoints

#### GET /api/menu
Get all menu items with optional filtering.

**Query Parameters:**
- `available` (boolean): Filter by availability

**Response:**
```json
{
  "success": true,
  "data": {
    "menuItems": [
      {
        "id": "uuid",
        "name": "Bakso Urat",
        "description": "Chewy meatballs with rich tendon",
        "price": 15000,
        "available": true,
        "createdAt": "2024-01-01T12:00:00Z",
        "updatedAt": "2024-01-01T12:00:00Z"
      }
    ],
    "count": 1
  }
}
```

#### GET /api/menu/available
Get only available menu items.

#### GET /api/menu/search
Search menu items by name.

**Query Parameters:**
- `q` (string, required): Search query

#### GET /api/menu/:id
Get single menu item by ID.

#### POST /api/menu
Create new menu item (Admin/Owner only).

**Request Body:**
```json
{
  "name": "Bakso Keju",
  "description": "Delicious meatballs filled with cheese",
  "price": 18000,
  "available": true
}
```

#### PUT /api/menu/:id
Update menu item (Admin/Owner only).

#### PATCH /api/menu/:id/toggle
Toggle menu item availability (Admin/Owner only).

#### DELETE /api/menu/:id
Delete menu item (Admin/Owner only).

#### POST /api/menu/bulk
Bulk create menu items (Admin/Owner only).

#### PATCH /api/menu/bulk/availability
Bulk update menu items availability (Admin/Owner only).

#### GET /api/menu/stats
Get menu statistics (Admin/Owner only).

### Order Endpoints

#### POST /api/orders
Create new order (Public).

**Request Body:**
```json
{
  "tableNumber": "12",
  "menu": "Bakso Urat",
  "note": "Extra spicy please"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "order": {
      "id": "uuid",
      "tableNumber": "12",
      "menu": "Bakso Urat",
      "note": "Extra spicy please",
      "status": "Pending",
      "timestamp": "2024-01-01T12:00:00Z",
      "createdAt": "2024-01-01T12:00:00Z",
      "updatedAt": "2024-01-01T12:00:00Z"
    }
  }
}
```

#### GET /api/orders
Get all orders with filtering and pagination (Admin/Owner only).

**Query Parameters:**
- `status` (string): Filter by status (Pending, In Progress, Completed)
- `tableNumber` (string): Filter by table number
- `menu` (string): Filter by menu item
- `startDate` (ISO date): Start date filter
- `endDate` (ISO date): End date filter
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50, max: 100)
- `sortBy` (string): Sort field (timestamp, tableNumber, menu, status)
- `sortOrder` (string): Sort order (ASC, DESC)

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [],
    "total": 0,
    "pagination": {
      "page": 1,
      "limit": 50,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

#### GET /api/orders/pending
Get pending orders (Admin only).

#### GET /api/orders/in-progress
Get in progress orders (Admin only).

#### GET /api/orders/completed
Get completed orders (Admin/Owner only).

#### GET /api/orders/:id
Get single order by ID (Admin/Owner only).

#### PUT /api/orders/:id
Update order status and note (Admin only).

**Request Body:**
```json
{
  "status": "In Progress",
  "note": "Updated note"
}
```

#### PATCH /api/orders/:id/accept
Accept order (change status to In Progress) (Admin only).

#### PATCH /api/orders/:id/complete
Complete order (change status to Completed) (Admin only).

#### DELETE /api/orders/:id
Delete order (Admin/Owner only).

#### GET /api/orders/table/:tableNumber
Get orders by table number (Admin only).

#### GET /api/orders/export/csv
Export orders to CSV (Admin/Owner only).

#### PATCH /api/orders/bulk/status
Bulk update order status (Admin only).

**Request Body:**
```json
{
  "ids": ["uuid1", "uuid2"],
  "status": "Completed"
}
```

#### DELETE /api/orders/bulk
Bulk delete orders (Admin/Owner only).

**Request Body:**
```json
{
  "ids": ["uuid1", "uuid2"]
}
```

### Analytics Endpoints (Owner Only)

#### GET /api/orders/stats/daily
Get daily statistics.

**Query Parameters:**
- `date` (ISO date): Target date (default: today)

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-01-01",
    "stats": {
      "totalOrders": 50,
      "completedOrders": 45,
      "pendingOrders": 3,
      "inProgressOrders": 2,
      "activeTableCount": 8
    }
  }
}
```

#### GET /api/orders/stats/popular
Get popular menu items.

**Query Parameters:**
- `startDate` (ISO date): Start date (default: 30 days ago)
- `endDate` (ISO date): End date (default: today)

**Response:**
```json
{
  "success": true,
  "data": {
    "popularItems": [
      {
        "menu": "Bakso Urat",
        "count": 25
      }
    ],
    "dateRange": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    }
  }
}
```

#### GET /api/orders/analytics
Get comprehensive order analytics.

**Query Parameters:**
- `startDate` (ISO date, required): Start date
- `endDate` (ISO date, required): End date

**Response:**
```json
{
  "success": true,
  "data": {
    "analytics": {
      "totalOrders": 100,
      "completedOrders": 90,
      "pendingOrders": 5,
      "inProgressOrders": 5,
      "uniqueTables": 20,
      "dailyBreakdown": {
        "2024-01-01": {
          "total": 25,
          "completed": 23,
          "pending": 1,
          "inProgress": 1
        }
      },
      "menuStats": {
        "Bakso Urat": {
          "total": 30,
          "completed": 28,
          "pending": 1,
          "inProgress": 1
        }
      },
      "hourlyDistribution": [0, 0, 0, 0, 0, 0, 2, 5, 8, 12, 15, 18, 20, 15, 10, 8, 5, 3, 2, 1, 0, 0, 0, 0]
    },
    "dateRange": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    }
  }
}
```

## Data Models

### User
```json
{
  "id": "string (UUID)",
  "username": "string (3-50 chars, alphanumeric)",
  "role": "customer | admin | owner",
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime"
}
```

### MenuItem
```json
{
  "id": "string (UUID)",
  "name": "string (1-100 chars)",
  "description": "string (max 500 chars)",
  "price": "number (integer, min 0)",
  "available": "boolean",
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime"
}
```

### Order
```json
{
  "id": "string (UUID)",
  "tableNumber": "string (positive integer)",
  "menu": "string (menu item name)",
  "note": "string (max 500 chars)",
  "status": "Pending | In Progress | Completed",
  "timestamp": "ISO datetime",
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime"
}
```

## Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "error": {
    "name": "ValidationError",
    "message": "Validation failed"
  },
  "errors": [
    {
      "field": "username",
      "message": "Username is required"
    }
  ]
}
```

### Common Error Types
- `ValidationError` - Input validation failed
- `AuthenticationError` - Invalid or expired token
- `AuthorizationError` - Insufficient permissions
- `NotFoundError` - Resource not found
- `DuplicateError` - Resource already exists
- `RateLimitError` - Too many requests

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **Order Creation**: 10 requests per minute
- **Public Endpoints**: 200 requests per 15 minutes
- **Admin Operations**: 30 requests per minute

Rate limit headers are included in responses:
- `RateLimit-Limit`
- `RateLimit-Remaining`
- `RateLimit-Reset`

## Examples

### Complete Order Flow

1. **Get Available Menu Items**
```bash
curl -X GET "https://api.bakso-kangen.com/api/menu/available"
```

2. **Place an Order**
```bash
curl -X POST "https://api.bakso-kangen.com/api/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "tableNumber": "5",
    "menu": "Bakso Urat",
    "note": "No onions please"
  }'
```

3. **Admin Login**
```bash
curl -X POST "https://api.bakso-kangen.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123"
  }'
```

4. **Accept Order (Admin)**
```bash
curl -X PATCH "https://api.bakso-kangen.com/api/orders/{orderId}/accept" \
  -H "Authorization: Bearer {jwt-token}"
```

5. **Complete Order (Admin)**
```bash
curl -X PATCH "https://api.bakso-kangen.com/api/orders/{orderId}/complete" \
  -H "Authorization: Bearer {jwt-token}"
```

### Analytics Example (Owner)

```bash
curl -X GET "https://api.bakso-kangen.com/api/orders/analytics?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer {owner-jwt-token}"
```

### Bulk Operations Example

```bash
curl -X PATCH "https://api.bakso-kangen.com/api/orders/bulk/status" \
  -H "Authorization: Bearer {admin-jwt-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["order-id-1", "order-id-2"],
    "status": "Completed"
  }'
```

## SDK and Client Libraries

### JavaScript/TypeScript
```typescript
import { BaksoKangenAPI } from 'bakso-kangen-sdk';

const api = new BaksoKangenAPI({
  baseURL: 'https://api.bakso-kangen.com/api',
  token: 'your-jwt-token'
});

// Place an order
const order = await api.orders.create({
  tableNumber: '5',
  menu: 'Bakso Urat',
  note: 'Extra spicy'
});

// Get menu items
const menuItems = await api.menu.getAvailable();

// Admin: Get pending orders
const pendingOrders = await api.orders.getPending();
```

## Testing

Run the test suite:
```bash
npm test
```

API tests are available in the `/tests` directory with comprehensive coverage of all endpoints.

## Support

For support and questions:
- Documentation: [https://docs.bakso-kangen.com](https://docs.bakso-kangen.com)
- GitHub Issues: [https://github.com/bakso-kangen/api/issues](https://github.com/bakso-kangen/api/issues)
- Email: support@bakso-kangen.com

## License

MIT License - see LICENSE file for details.

---

*This documentation is for Bakso Kangen API v1.0.0*