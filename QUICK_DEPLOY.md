# Quick Deployment Checklist

Follow these steps in order to deploy your Food Delivery Backend API.

---

## ✅ Checklist

### 1. MongoDB Atlas (Database)
- [ ] Create MongoDB Atlas account at https://mongodb.com/cloud/atlas
- [ ] Create FREE M0 cluster
- [ ] Create database user (username + password)
- [ ] Whitelist all IPs (`0.0.0.0/0`)
- [ ] Copy connection string
- [ ] Save connection string securely

**Your Connection String:**
```
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/food_delivery_DB?retryWrites=true&w=majority
```

---

### 2. GitHub Repository
- [ ] Create GitHub account (if needed)
- [ ] Create new repository: `food-delivery-backend`
- [ ] Keep it Public (or Private)
- [ ] DO NOT initialize with README

**Commands to run:**
```bash
git status  # Check if git is initialized
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/food-delivery-backend.git
git push -u origin main
```

---

### 3. Deploy to Render.com (Recommended)

#### Step 3.1: Create Account
- [ ] Go to https://render.com
- [ ] Sign up with GitHub

#### Step 3.2: Create Web Service
- [ ] Dashboard → New → Web Service
- [ ] Connect GitHub repo: `food-delivery-backend`
- [ ] Click Connect

#### Step 3.3: Configure
**Settings:**
- Name: `food-delivery-api`
- Branch: `main`
- Build Command: `npm install`
- Start Command: `npm start`
- Instance: **Free**

#### Step 3.4: Environment Variables
Click "Advanced" → Add these variables:

```
NODE_ENV=production
SERVERPORT=9090
MONGO_URI=mongodb+srv://YOUR_MONGO_CONNECTION_STRING
JWT_SECRET=generate_a_random_string_here_123456789
JWT_REFRESH_SECRET=another_random_string_here_987654321
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM="Food Delivery App <your_email@gmail.com>"
CLIENT_URL=https://your-frontend.com
IMGURL=/uploads/images
```

- [ ] All environment variables added
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (5-10 minutes)

---

### 4. Get Your API URL

After deployment completes:
- [ ] Copy your API URL: `https://food-delivery-api.onrender.com`
- [ ] Test health endpoint: `https://food-delivery-api.onrender.com/api/health`

**Your Live API URL:**
```
https://food-delivery-api.onrender.com
```

---

### 5. Test Your API

Use Postman or curl:

```bash
# Health Check
curl https://food-delivery-api.onrender.com/api/health

# Register User
curl -X POST https://food-delivery-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "password": "test123"
  }'
```

- [ ] Health check works
- [ ] Registration works
- [ ] Login works

---

### 6. Update Flutter App

In your Flutter project:

```dart
// lib/constants/api_constants.dart or similar
class ApiConstants {
  static const String baseUrl = 'https://food-delivery-api.onrender.com';

  // Endpoints
  static const String register = '$baseUrl/api/auth/register';
  static const String login = '$baseUrl/api/auth/login';
  static const String profile = '$baseUrl/api/customers/profile';
  // ... add more endpoints
}
```

- [ ] Update API base URL in Flutter
- [ ] Test connection from Flutter app
- [ ] Update all API calls

---

## 🚨 Important Notes

### Gmail App Password Setup
1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account → Security
3. 2-Step Verification → App passwords
4. Generate password for "Mail"
5. Copy the 16-character password
6. Use this in `EMAIL_PASSWORD` environment variable

### Generate Strong JWT Secrets
Use this command or online generator:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### MongoDB Connection Troubleshooting
- Ensure password has no special characters or URL-encode them
- Whitelist `0.0.0.0/0` in Network Access
- Database name must be `/food_delivery_DB`

---

## 📱 Flutter Integration Example

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiService {
  static const String baseUrl = 'https://food-delivery-api.onrender.com';

  // Login
  static Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Login failed');
    }
  }

  // Get Profile
  static Future<Map<String, dynamic>> getProfile(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/customers/profile'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load profile');
    }
  }
}
```

---

## ✅ Final Checklist

- [ ] MongoDB Atlas cluster created and running
- [ ] Code pushed to GitHub
- [ ] Deployed to Render (or Railway)
- [ ] All environment variables set
- [ ] API is live and responding
- [ ] Tested health endpoint
- [ ] Tested register/login
- [ ] Flutter app updated with new URL
- [ ] End-to-end test successful

---

## 🎉 Success!

Your API is now live and ready for your Flutter app!

**API URLs to save:**
- Base: `https://food-delivery-api.onrender.com`
- Health: `https://food-delivery-api.onrender.com/api/health`
- Docs: See API_ROUTES.md

---

## Need Help?

1. Check DEPLOYMENT.md for detailed instructions
2. View logs in Render dashboard
3. Check MongoDB Atlas metrics
4. Test with Postman first

**Happy coding! 🚀**
