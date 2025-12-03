# Food Delivery Backend API

A production-ready RESTful API for a food delivery platform built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Email verification system
  - Password reset functionality
  - OTP verification
  - Secure password hashing with bcrypt

- **Customer Management**
  - User registration and login
  - Profile management with image upload
  - Multiple delivery addresses support
  - Account activation/deactivation

- **Cloud Services Integration**
  - **Cloudinary**: Image storage and optimization
  - **Brevo (SendinBlue)**: Transactional email delivery
  - **MongoDB Atlas**: Cloud database hosting

- **Security Features**
  - CORS enabled
  - Environment-based configuration
  - Secure token management
  - Input validation with Joi

## 🛠️ Tech Stack

- **Runtime**: Node.js (v22.16.0)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer + Cloudinary
- **Email Service**: Brevo API
- **Validation**: Joi
- **Password Hashing**: bcrypt

## 📁 Project Structure

```
Backend_Delivery_app/
├── config/
│   └── db.js                 # Database connection configuration
├── controllers/
│   ├── authController.js     # Authentication logic
│   └── customerController.js # Customer management logic
├── middlewares/
│   ├── auth.js              # JWT authentication middleware
│   ├── error-handler.js     # Global error handling
│   ├── mailer.js            # Email service (Brevo)
│   └── multer-config.js     # File upload configuration (Cloudinary)
├── models/
│   └── Customer.js          # Customer data model with validations
├── routes/
│   ├── authRoutes.js        # Authentication endpoints
│   └── customerRoutes.js    # Customer management endpoints
├── .env                     # Environment variables (not in git)
├── .env.example             # Environment variables template
├── server.js                # Application entry point
└── package.json             # Dependencies and scripts
```

## 🚦 Getting Started

### Prerequisites

- Node.js >= 16.x
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/NeeDaimDark/Backend-Delivery-App.git
   cd Backend-Delivery-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your credentials:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string

   # JWT Secrets
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret

   # Cloudinary (Image Storage)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Brevo (Email Service)
   BREVO_API_KEY=your_brevo_api_key
   EMAIL_USER=your_verified_email@gmail.com

   # URLs
   BACKEND_URL=http://localhost:9090
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

5. **Server will be running at**: `http://localhost:9090`

## 🌐 API Endpoints

### Base URL
- **Development**: `http://localhost:9090`
- **Production**: `https://backend-delivery-app-ynzy.onrender.com`

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| GET | `/verify-email/:token` | Verify email address | No |
| POST | `/forgot-password` | Request password reset | No |
| GET | `/reset-password/:token` | Verify reset token | No |
| POST | `/reset-password` | Reset password | No |
| POST | `/refresh-token` | Get new access token | No |
| POST | `/logout` | User logout | Yes |

### Customer Routes (`/api/customers`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update profile | Yes |
| POST | `/profile/upload-photo` | Upload profile photo | Yes |
| GET | `/addresses` | Get all addresses | Yes |
| POST | `/addresses` | Add new address | Yes |
| PUT | `/addresses/:id` | Update address | Yes |
| DELETE | `/addresses/:id` | Delete address | Yes |
| POST | `/deactivate` | Deactivate account | Yes |
| DELETE | `/delete` | Delete account permanently | Yes |

For detailed API documentation, see [FLUTTER_INTEGRATION.md](./FLUTTER_INTEGRATION.md)

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_REFRESH_SECRET` | Refresh token secret | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `BREVO_API_KEY` | Brevo email API key | Yes |
| `EMAIL_USER` | Sender email address | Yes |
| `BACKEND_URL` | Backend API URL | Yes |
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port (default: 9090) | No |

## 📧 Email Service Setup

This API uses **Brevo** (formerly SendinBlue) for email delivery.

### Why Brevo?
- ✅ Free tier: 300 emails/day
- ✅ Works on all hosting platforms (no SMTP port blocking)
- ✅ No domain verification required
- ✅ Easy HTTP API integration

### Setup Steps:
1. Sign up at [Brevo](https://app.brevo.com/account/register)
2. Verify your email
3. Go to SMTP & API → API Keys
4. Create new API key
5. Add to `.env` as `BREVO_API_KEY`

## ☁️ Cloudinary Setup

Images are stored on Cloudinary cloud storage.

### Setup Steps:
1. Sign up at [Cloudinary](https://cloudinary.com/users/register_free)
2. Get credentials from Dashboard
3. Add to `.env`:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

## 🚀 Deployment

### Deploy to Render

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Create Render Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Environment**: Add all env variables

3. **Add Environment Variables**
   - Copy all variables from `.env`
   - Add to Render environment tab
   - Set `NODE_ENV=production`

4. **Deploy!**
   - Render will auto-deploy on every git push

## 🧪 Testing

Use Postman or any API client to test endpoints.

### Example: Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123!",
  "language": "en"
}
```

### Example: Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### Example: Protected Route
```http
GET /api/customers/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📱 Flutter Integration

For complete Flutter integration guide with code examples, see:
**[FLUTTER_INTEGRATION.md](./FLUTTER_INTEGRATION.md)**

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

ISC License

## 👨‍💻 Author

**Backend API** - Food Delivery Platform

---

**Live API**: https://backend-delivery-app-ynzy.onrender.com

**Repository**: https://github.com/NeeDaimDark/Backend-Delivery-App
