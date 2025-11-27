# Deployment Guide

Complete guide for deploying the Food Delivery Backend API to production.

## Prerequisites

- MongoDB Atlas account (free tier)
- GitHub account
- Render.com or Railway.app account (free tier)
- Your local project ready

---

## Step 1: MongoDB Atlas Setup ✅

### 1.1 Create Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a FREE M0 cluster
3. Choose AWS and closest region
4. Name: `FoodDeliveryCluster`

### 1.2 Create Database User
1. Database Access → Add New User
2. Username: `fooddelivery_admin`
3. Password: (generate and save securely)
4. Role: Read and write to any database

### 1.3 Network Access
1. Network Access → Add IP Address
2. Select: **Allow Access from Anywhere** (`0.0.0.0/0`)

### 1.4 Get Connection String
1. Database → Connect → Connect your application
2. Copy connection string
3. Replace `<password>` with your actual password
4. Add database name: `/food_delivery_DB`

Example:
```
mongodb+srv://fooddelivery_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/food_delivery_DB?retryWrites=true&w=majority
```

---

## Step 2: Push to GitHub

### 2.1 Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit - Food Delivery Backend"
```

### 2.2 Create GitHub Repository
1. Go to [GitHub](https://github.com)
2. Click **New Repository**
3. Name: `food-delivery-backend`
4. Description: "Backend API for Food Delivery App"
5. Visibility: **Public** (or Private if preferred)
6. **DO NOT** initialize with README (you already have one)
7. Click **Create Repository**

### 2.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/food-delivery-backend.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Render (Recommended - Free Tier)

### 3.1 Sign Up for Render
1. Go to [Render.com](https://render.com)
2. Sign up with GitHub account

### 3.2 Create New Web Service
1. Dashboard → **New** → **Web Service**
2. Connect your GitHub repository: `food-delivery-backend`
3. Click **Connect**

### 3.3 Configure Web Service
**Basic Settings:**
- Name: `food-delivery-api`
- Region: Choose closest to you
- Branch: `main`
- Root Directory: (leave empty)
- Runtime: **Node**
- Build Command: `npm install`
- Start Command: `npm start`

**Instance Type:**
- Select: **Free**

### 3.4 Add Environment Variables
Click **Advanced** → **Add Environment Variable**

Add these variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `SERVERPORT` | `9090` |
| `MONGO_URI` | `mongodb+srv://fooddelivery_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/food_delivery_DB?retryWrites=true&w=majority` |
| `JWT_SECRET` | `your_super_secret_jwt_key_123456` |
| `JWT_REFRESH_SECRET` | `your_super_secret_refresh_key_789` |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | `your_email@gmail.com` |
| `EMAIL_PASSWORD` | `your_app_password` |
| `EMAIL_FROM` | `"Food Delivery App <your_email@gmail.com>"` |
| `CLIENT_URL` | `https://your-app.com` |
| `IMGURL` | `/uploads/images` |

### 3.5 Deploy
1. Click **Create Web Service**
2. Wait for deployment (5-10 minutes)
3. Your API will be live at: `https://food-delivery-api.onrender.com`

---

## Step 4: Alternative - Deploy to Railway (Also Free)

### 4.1 Sign Up for Railway
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub

### 4.2 Create New Project
1. Dashboard → **New Project**
2. Select **Deploy from GitHub repo**
3. Choose: `food-delivery-backend`

### 4.3 Add Environment Variables
1. Click on your service
2. Go to **Variables** tab
3. Click **Raw Editor**
4. Paste all environment variables:

```
NODE_ENV=production
SERVERPORT=9090
MONGO_URI=mongodb+srv://fooddelivery_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/food_delivery_DB?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_123456
JWT_REFRESH_SECRET=your_super_secret_refresh_key_789
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM="Food Delivery App <your_email@gmail.com>"
CLIENT_URL=https://your-app.com
IMGURL=/uploads/images
```

### 4.4 Generate Domain
1. Go to **Settings** tab
2. Click **Generate Domain**
3. Your API will be live at: `https://food-delivery-backend.up.railway.app`

---

## Step 5: Test Your Deployed API

### 5.1 Health Check
```
GET https://your-api-url.com/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Food Delivery API is running",
  "timestamp": "2025-11-27T..."
}
```

### 5.2 Test Registration
```
POST https://your-api-url.com/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "phone": "+1234567890",
  "password": "test123"
}
```

### 5.3 Common Issues

**Issue:** Cannot connect to database
- **Fix:** Check MongoDB Atlas whitelist includes `0.0.0.0/0`
- **Fix:** Verify connection string is correct

**Issue:** 500 Server Error
- **Fix:** Check deployment logs in Render/Railway
- **Fix:** Verify all environment variables are set

**Issue:** Email not sending
- **Fix:** Verify Gmail app password is correct
- **Fix:** Check if 2FA is enabled on Gmail

---

## Step 6: Use in Flutter App

### 6.1 Update Your Flutter API Base URL

In your Flutter project, update the API base URL:

```dart
// lib/config/api_config.dart
class ApiConfig {
  // Development
  // static const String baseUrl = 'http://127.0.0.1:9090';

  // Production
  static const String baseUrl = 'https://food-delivery-api.onrender.com';

  // API Endpoints
  static const String authEndpoint = '$baseUrl/api/auth';
  static const String customerEndpoint = '$baseUrl/api/customers';
}
```

### 6.2 Example API Call in Flutter

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> registerUser() async {
  final url = Uri.parse('${ApiConfig.baseUrl}/api/auth/register');

  final response = await http.post(
    url,
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'name': 'John Doe',
      'email': 'john@example.com',
      'phone': '+1234567890',
      'password': 'password123',
    }),
  );

  if (response.statusCode == 201) {
    final data = jsonDecode(response.body);
    print('Token: ${data['token']}');
  } else {
    print('Error: ${response.body}');
  }
}
```

---

## Step 7: Monitoring & Maintenance

### 7.1 Monitor Your API
- **Render:** Dashboard → View logs
- **Railway:** Service → Logs tab
- **MongoDB Atlas:** Database → Monitoring

### 7.2 Update Your API

When you make changes:
```bash
git add .
git commit -m "Your update message"
git push origin main
```

Render/Railway will automatically redeploy!

### 7.3 Scale Up (When Needed)
- Render: Upgrade to paid tier for better performance
- Railway: Add usage-based billing
- MongoDB Atlas: Upgrade cluster tier

---

## Important Security Notes

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Use strong JWT secrets** - Generate random strings
3. **Enable HTTPS only** - Both platforms provide free SSL
4. **Whitelist IPs** - In production, limit MongoDB access
5. **Rate limiting** - Add rate limiting middleware
6. **Monitor logs** - Check for suspicious activity

---

## Cost Breakdown (Free Tier Limits)

### MongoDB Atlas (Free M0)
- ✅ 512 MB storage
- ✅ Shared RAM
- ✅ Good for development/small apps
- 💰 Upgrade: $9/month (M10)

### Render (Free Tier)
- ✅ 750 hours/month
- ✅ Auto-sleep after 15 min inactivity
- ✅ 100 GB bandwidth/month
- ⚠️ Cold starts (slow first request)
- 💰 Upgrade: $7/month (always on)

### Railway (Free Tier)
- ✅ $5 free credit/month
- ✅ ~500 hours runtime
- ✅ No cold starts
- 💰 Pay-as-you-go after credits

---

## Your API URLs

After deployment, save these URLs:

- **API Base URL:** `https://food-delivery-api.onrender.com`
- **Health Check:** `https://food-delivery-api.onrender.com/api/health`
- **Auth Endpoints:** `https://food-delivery-api.onrender.com/api/auth/*`
- **Customer Endpoints:** `https://food-delivery-api.onrender.com/api/customers/*`

Use this base URL in your Flutter app!

---

## Need Help?

- Render Docs: https://render.com/docs
- Railway Docs: https://docs.railway.app
- MongoDB Atlas: https://docs.atlas.mongodb.com

---

**Good luck with your deployment! 🚀**
