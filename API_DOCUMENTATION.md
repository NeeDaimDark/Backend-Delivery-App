# Food Delivery Customer API Documentation

## 🚀 Server Information
- **Base URL**: `http://127.0.0.1:9090`
- **Database**: `food_delivery_DB`
- **Version**: 1.0.0

---

## 📋 Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [Customer Profile Endpoints](#customer-profile-endpoints)
3. [Address Management Endpoints](#address-management-endpoints)
4. [Admin Endpoints](#admin-endpoints)

---

## 🔐 Authentication Endpoints

### Base URL: `/api/auth`

### 1. Check if Customer Exists
**GET** `/api/auth/check-exists`

Query Parameters:
- `email` (optional): Customer email
- `phone` (optional): Customer phone

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
    "profileImage": "/uploads/images/profile.jpg",
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
  "email": "john@example.com",  // or use "phone"
  "password": "yourpassword"
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
    "profileImage": "/uploads/images/profile.jpg",
    "language": "en",
    "isVerified": true,
    "addresses": [],
    "defaultAddressId": null,
    "notificationPreferences": {
      "pushNotifications": true,
      "emailNotifications": true,
      "smsNotifications": false,
      "orderUpdates": true,
      "promotions": true
    },
    "role": "customer",
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

**Body:**
```json
{
  "token": "reset-token-from-email",
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

**Body:**
```json
{
  "email": "john@example.com"  // or "phone"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otpCode": "123456"  // Only in development mode
}
```

---

### 9. Verify OTP
**POST** `/api/auth/verify-otp`

**Body:**
```json
{
  "email": "john@example.com",  // or "phone"
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

## 👤 Customer Profile Endpoints

### Base URL: `/api/customers`
**Note:** All these endpoints require authentication

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
    "profileImage": "/uploads/images/profile.jpg",
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
    "fcmToken": null,
    "totalOrders": 0,
    "totalSpent": 0,
    "lastLogin": "2025-11-21T10:30:00.000Z",
    "createdAt": "2025-11-20T08:00:00.000Z",
    "updatedAt": "2025-11-21T10:30:00.000Z"
  }
}
```

---

### 2. Update Profile
**PUT** `/api/customers/profile`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (form-data):**
- `name` (optional): Customer name
- `phone` (optional): Phone number
- `language` (optional): Preferred language
- `notificationPreferences` (optional): JSON object
- `upload` (optional): Profile image file

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "customer": { /* updated customer object */ }
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
- `upload` (required): Image file

**Response:**
```json
{
  "success": true,
  "message": "Profile photo uploaded successfully",
  "profileImage": "/uploads/images/photo.jpg",
  "customer": { /* updated customer object */ }
}
```

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
  "currentPassword": "oldpassword",
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
  "customer": { /* updated customer object */ }
}
```

---

## 📍 Address Management Endpoints

### Base URL: `/api/customers/addresses`

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
  "type": "home",  // home, office, apartment, other
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

**Response:**
```json
{
  "success": true,
  "message": "Address added successfully",
  "address": { /* new address object */ },
  "addresses": [ /* all addresses */ ]
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

**Body:**
```json
{
  "label": "Updated Home Address",
  "street": "456 New Street",
  "isDefault": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Address updated successfully",
  "address": { /* updated address */ },
  "addresses": [ /* all addresses */ ]
}
```

---

### 4. Delete Address
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
  "addresses": [ /* remaining addresses */ ]
}
```

---

### 5. Set Default Address
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
  "addresses": [ /* all addresses */ ],
  "defaultAddressId": "674e5f7a8c9b2d3e4f5a6b7d"
}
```

---

## 👑 Admin Endpoints

### Base URL: `/api/customers`
**Note:** Requires admin role

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
- `isVerified` (optional): Filter by verification status
- `isActive` (optional): Filter by active status
- `sortBy` (optional): Field to sort by (default: createdAt)
- `order` (optional): Sort order (asc/desc, default: desc)

**Response:**
```json
{
  "success": true,
  "customers": [ /* array of customers */ ],
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
  "customer": { /* customer object */ }
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
  "customer": { /* updated customer */ }
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

---

## 🔧 Health Check Endpoints

### 1. API Health Check
**GET** `/api/health`

**Response:**
```json
{
  "success": true,
  "message": "Food Delivery API is running",
  "timestamp": "2025-11-21T10:30:00.000Z"
}
```

---

### 2. Welcome Endpoint
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

## 🔐 Authentication

Most endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Get the token from:
- Registration response
- Login response
- OTP verification response
- Refresh token endpoint

---

## ❌ Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## 📝 Notes

1. **Email Configuration**: Update `.env` with valid SMTP credentials for email features to work
2. **File Uploads**: Max file size is 5MB
3. **Token Expiry**: Access tokens expire in 7 days, refresh tokens in 30 days
4. **OTP Expiry**: OTP codes expire in 10 minutes
5. **Password Requirements**: Minimum 6 characters

---

## 🧪 Testing with Postman

Import this base URL: `http://127.0.0.1:9090`

**Example Registration:**
```bash
curl -X POST http://127.0.0.1:9090/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "password": "password123"
  }'
```

**Example Login:**
```bash
curl -X POST http://127.0.0.1:9090/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

**API Version:** 1.0.0  
**Last Updated:** November 21, 2025  
**Maintained by:** Food Delivery App Team
