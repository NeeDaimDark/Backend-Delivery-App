# API Routes Documentation

Complete reference for all API endpoints in the Food Delivery Backend Application.

**Base URL:** `http://127.0.0.1:9090`

---

## Table of Contents
1. [Health Check](#health-check)
2. [Authentication Routes](#authentication-routes)
3. [Customer Profile Routes](#customer-profile-routes)
4. [Address Management Routes](#address-management-routes)
5. [Admin Routes](#admin-routes)
6. [Error Responses](#error-responses)

---

## Health Check

### Check Server Status
**GET** `/api/health`

**Headers:** None required

**Response:**
```json
{
  "success": true,
  "message": "Food Delivery API is running",
  "timestamp": "2025-11-27T10:30:00.000Z"
}
```

### Welcome Endpoint
**GET** `/`

**Response:**
```json
{
  "success": true,
  "message": "Welcome to Food Delivery API",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "customers": "/api/customers",
    "health": "/api/health"
  }
}
```

---

## Authentication Routes

Base path: `/api/auth`

### 1. Check if Customer Exists
**GET** `/api/auth/check-exists`

**Query Parameters:**
- `email` (optional): Customer email
- `phone` (optional): Customer phone

**Example:**
```
GET /api/auth/check-exists?email=user@example.com
```

**Response:**
```json
{
  "success": true,
  "exists": true
}
```

---

### 2. Register New Customer
**POST** `/api/auth/register`

**Headers:**
```
Content-Type: multipart/form-data
```

**Body (form-data):**
- `name` (required): Customer name
- `email` (required): Customer email
- `phone` (required): Customer phone number
- `password` (required): Password (min 6 characters)
- `language` (optional): Preferred language (en, fr, ar, es)
- `upload` (optional): Profile image file

**Example:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful! Please check your email to verify your account.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "customer": {
    "id": "674e5f7a8c9b2d3e4f5a6b7c",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "profileImage": "/uploads/images/john_doe_1732718234567.jpg",
    "language": "en",
    "isVerified": false,
    "role": "customer"
  }
}
```

---

### 3. Login
**POST** `/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Alternative (using phone):**
```json
{
  "phone": "+1234567890",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "customer": {
    "id": "674e5f7a8c9b2d3e4f5a6b7c",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "isVerified": true,
    "addresses": [],
    "totalOrders": 0,
    "totalSpent": 0
  }
}
```

---

### 4. Verify Email
**GET** `/api/auth/verify-email/:token`

**Parameters:**
- `token`: Email verification token from email

**Example:**
```
GET /api/auth/verify-email/db3c8845f2cc2092a277d6187ca9a1d861069e395cec3f30c4823d4d7745e8ca
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### 5. Resend Verification Email
**POST** `/api/auth/resend-verification`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

---

### 6. Forgot Password
**POST** `/api/auth/forgot-password`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

---

### 7. Reset Password
**POST** `/api/auth/reset-password`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "token": "9ebb98a3cc37acf4708501f0b9c002312609c896e02085cad2e4b8eb5aec0bab",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

### 8. Send OTP
**POST** `/api/auth/send-otp`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john@example.com"
}
```

**Alternative (using phone):**
```json
{
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otpCode": "123456"
}
```

**Note:** `otpCode` is only shown in development mode.

---

### 9. Verify OTP
**POST** `/api/auth/verify-otp`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john@example.com",
  "otpCode": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 10. Refresh Token
**POST** `/api/auth/refresh-token`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "token": "new-access-token",
  "refreshToken": "new-refresh-token"
}
```

---

### 11. Logout
**POST** `/api/auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Customer Profile Routes

Base path: `/api/customers`

**Authentication Required:** All routes require Bearer token

---

### 1. Get Current Customer Profile
**GET** `/api/customers/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "customer": {
    "id": "674e5f7a8c9b2d3e4f5a6b7c",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "profileImage": "/uploads/images/john_doe_1732718234567.jpg",
    "addresses": [],
    "defaultAddressId": null,
    "language": "en",
    "isVerified": true,
    "isActive": true,
    "role": "customer",
    "notificationPreferences": {
      "pushNotifications": true,
      "emailNotifications": true,
      "smsNotifications": false,
      "orderUpdates": true,
      "promotions": true
    },
    "totalOrders": 0,
    "totalSpent": 0,
    "lastLogin": "2025-11-27T10:30:00.000Z",
    "createdAt": "2025-11-20T08:00:00.000Z",
    "updatedAt": "2025-11-27T10:30:00.000Z"
  }
}
```

---

### 2. Update Profile
**PUT** `/api/customers/profile`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "John Smith",
  "phone": "+1234567890",
  "language": "fr",
  "notificationPreferences": {
    "pushNotifications": true,
    "emailNotifications": true,
    "smsNotifications": true,
    "orderUpdates": true,
    "promotions": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "customer": {
    "id": "674e5f7a8c9b2d3e4f5a6b7c",
    "name": "John Smith",
    "language": "fr",
    ...
  }
}
```

---

### 3. Upload Profile Photo
**POST** `/api/customers/profile/upload-photo`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (form-data):**
- `upload` (required): Image file (PNG, JPG, JPEG - max 5MB)

**Response:**
```json
{
  "success": true,
  "message": "Profile photo uploaded successfully",
  "profileImage": "/uploads/images/john_smith_1732718234567.jpg",
  "customer": {
    "id": "674e5f7a8c9b2d3e4f5a6b7c",
    "profileImage": "/uploads/images/john_smith_1732718234567.jpg",
    ...
  }
}
```

**Note:** Images are automatically renamed to: `username_timestamp.extension`

---

### 4. Change Password
**POST** `/api/customers/profile/change-password`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### 5. Deactivate Account
**POST** `/api/customers/profile/deactivate`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Account deactivated successfully",
  "customer": {
    "id": "674e5f7a8c9b2d3e4f5a6b7c",
    "isActive": false,
    ...
  }
}
```

**Note:** Deactivated accounts cannot login until reactivated by admin.

---

## Address Management Routes

Base path: `/api/customers/addresses`

**Authentication Required:** All routes require Bearer token

---

### 1. Get All Addresses
**GET** `/api/customers/addresses`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "addresses": [
    {
      "_id": "674e5f7a8c9b2d3e4f5a6b7d",
      "type": "home",
      "label": "My Home",
      "street": "123 Main Street",
      "building": "Building A",
      "floor": "3",
      "apartment": "301",
      "city": "New York",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "isDefault": true
    }
  ],
  "defaultAddressId": "674e5f7a8c9b2d3e4f5a6b7d"
}
```

---

### 2. Add New Address
**POST** `/api/customers/addresses`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "type": "home",
  "label": "My Home",
  "street": "123 Main Street",
  "building": "Building A",
  "floor": "3",
  "apartment": "301",
  "city": "New York",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "isDefault": true
}
```

**Field Requirements:**
- `type` (required): "home", "office", "apartment", or "other"
- `label` (required): Address label
- `street` (required): Street address
- `building` (optional): Building name/number
- `floor` (optional): Floor number
- `apartment` (optional): Apartment number
- `city` (required): City name
- `latitude` (required): Latitude coordinate
- `longitude` (required): Longitude coordinate
- `isDefault` (optional): Set as default address

**Response:**
```json
{
  "success": true,
  "message": "Address added successfully",
  "address": {
    "_id": "674e5f7a8c9b2d3e4f5a6b7d",
    "type": "home",
    "label": "My Home",
    ...
  },
  "addresses": [...]
}
```

---

### 3. Update Address
**PUT** `/api/customers/addresses/:addressId`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (all fields optional for partial update):**
```json
{
  "label": "Updated Home Address",
  "street": "456 New Street",
  "floor": "5"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Address updated successfully",
  "address": {
    "_id": "674e5f7a8c9b2d3e4f5a6b7d",
    "label": "Updated Home Address",
    "street": "456 New Street",
    "floor": "5",
    ...
  },
  "addresses": [...]
}
```

---

### 4. Set Default Address
**POST** `/api/customers/addresses/:addressId/set-default`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Default address set successfully",
  "addresses": [...],
  "defaultAddressId": "674e5f7a8c9b2d3e4f5a6b7d"
}
```

---

### 5. Delete Address
**DELETE** `/api/customers/addresses/:addressId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Address deleted successfully",
  "addresses": []
}
```

---

## Admin Routes

Base path: `/api/customers`

**Authentication Required:** All routes require Bearer token with admin role

---

### 1. Get All Customers
**GET** `/api/customers`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name, email, or phone
- `isVerified` (optional): Filter by verification status (true/false)
- `isActive` (optional): Filter by active status (true/false)
- `sortBy` (optional): Field to sort by (default: createdAt)
- `order` (optional): Sort order - asc/desc (default: desc)

**Example:**
```
GET /api/customers?page=1&limit=10&search=john&isVerified=true&sortBy=createdAt&order=desc
```

**Response:**
```json
{
  "success": true,
  "customers": [
    {
      "id": "674e5f7a8c9b2d3e4f5a6b7c",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "isVerified": true,
      "isActive": true,
      "totalOrders": 5,
      "totalSpent": 125.50,
      ...
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

---

### 2. Get Customer By ID
**GET** `/api/customers/:id`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "customer": {
    "id": "674e5f7a8c9b2d3e4f5a6b7c",
    "name": "John Doe",
    "email": "john@example.com",
    ...
  }
}
```

---

### 3. Update Customer By ID
**PUT** `/api/customers/:id`

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data
```

**Body:** Any customer fields to update

**Response:**
```json
{
  "success": true,
  "message": "Customer updated successfully",
  "customer": {
    "id": "674e5f7a8c9b2d3e4f5a6b7c",
    ...
  }
}
```

---

### 4. Delete Customer
**DELETE** `/api/customers/:id`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Customer deleted successfully"
}
```

**Note:** This is a permanent deletion. The customer data cannot be recovered.

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Common HTTP Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required or token invalid |
| 403 | Forbidden | Access denied (insufficient permissions) |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

### Common Error Examples

**401 - No Token:**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

**401 - Invalid Token:**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**403 - Admin Required:**
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

**400 - Validation Error:**
```json
{
  "success": false,
  "message": "\"email\" must be a valid email"
}
```

**404 - Not Found:**
```json
{
  "success": false,
  "message": "Customer not found"
}
```

---

## Authentication

Most endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Getting a Token

You can get a token from:
1. **Registration** - `/api/auth/register`
2. **Login** - `/api/auth/login`
3. **OTP Verification** - `/api/auth/verify-otp`
4. **Refresh Token** - `/api/auth/refresh-token`

### Token Types

- **Access Token**: Valid for 7 days, used for API authentication
- **Refresh Token**: Valid for 30 days, used to get new access tokens

### Token Expiry

When your access token expires, use the refresh token endpoint to get a new one without requiring the user to login again.

---

## Rate Limiting

Currently, there are no rate limits implemented. Consider adding rate limiting in production.

---

## CORS

CORS is enabled for all origins. Configure this in production to allow only specific domains.

---

## File Upload Specifications

### Profile Images

- **Endpoint:** `/api/customers/profile/upload-photo`
- **Field Name:** `upload`
- **Supported Formats:** PNG, JPG, JPEG
- **Max File Size:** 5MB
- **Naming Convention:** `username_timestamp.extension`
  - Example: `john_doe_1732718234567.jpg`
- **Storage Path:** `/uploads/images/`

---

## Important Notes

1. **Email Verification:** Users must verify their email before full access
2. **Password Requirements:** Minimum 6 characters
3. **OTP Expiry:** OTP codes expire in 10 minutes
4. **Reset Token Expiry:** Password reset tokens expire in 1 hour
5. **Token Storage:** Store tokens securely (never in localStorage for production)
6. **HTTPS:** Always use HTTPS in production
7. **Environment Variables:** Never commit `.env` file to version control

---

## Testing with Postman

### Setup

1. Create a new environment in Postman
2. Add variables:
   - `base_url`: `http://127.0.0.1:9090`
   - `token`: (will be set after login)
   - `refresh_token`: (will be set after login)

### Testing Flow

1. **Health Check:** `GET {{base_url}}/api/health`
2. **Register:** `POST {{base_url}}/api/auth/register`
3. **Verify Email:** `GET {{base_url}}/api/auth/verify-email/:token`
4. **Login:** `POST {{base_url}}/api/auth/login`
   - Save token to environment variable
5. **Get Profile:** `GET {{base_url}}/api/customers/profile`
   - Use `{{token}}` in Authorization header
6. **Add Address:** `POST {{base_url}}/api/customers/addresses`
7. **Upload Photo:** `POST {{base_url}}/api/customers/profile/upload-photo`

---

## Support

For issues or questions:
- Create an issue in the repository
- Check existing documentation
- Review error messages carefully

---

**Last Updated:** November 27, 2025
**API Version:** 1.0.0
