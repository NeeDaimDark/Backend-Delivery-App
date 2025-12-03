# OTP-Based Password Reset Flow - Complete Guide

## 📋 Overview

Your food delivery app now has a **secure 3-step OTP-based password reset flow**:

1. **User enters email** → Backend sends 6-digit OTP to email
2. **User enters OTP** → Backend verifies OTP and generates temporary reset token
3. **User enters new password** → Backend updates password in database

This is much **more secure** than email links because:
- OTP is short-lived (10 minutes)
- OTP can't be accidentally shared in URLs
- OTP provides additional security verification
- Mobile-friendly (no email link clicking needed)

---

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    PASSWORD RESET FLOW                           │
└─────────────────────────────────────────────────────────────────┘

STEP 1: Forgot Password
┌──────────────────────┐
│ User taps            │
│ "Forgot Password"    │
└──────────────────────┘
           ↓
┌──────────────────────────────────────────────────────┐
│ User enters email: john@example.com                  │
│ [Submit]                                             │
└──────────────────────────────────────────────────────┘
           ↓
   POST /api/auth/forgot-password
   Body: { "email": "john@example.com" }
           ↓
┌──────────────────────────────────────────────────────┐
│ Backend:                                             │
│ ✓ Checks if email exists in database                │
│ ✓ Generates 6-digit OTP (e.g., 123456)             │
│ ✓ Saves OTP to database (10 min expiry)            │
│ ✓ Sends OTP to email                               │
│ ✓ Returns success message                          │
└──────────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────┐
│ 📧 Email Received:                                   │
│ ┌──────────────────────────────────────────┐        │
│ │ Your verification code is:               │        │
│ │                                          │        │
│ │          123456                          │        │
│ │                                          │        │
│ │ This code expires in 10 minutes          │        │
│ └──────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────┘


STEP 2: Verify OTP
┌──────────────────────────────────────────────────────┐
│ App shows: "Enter the code sent to your email"      │
│                                                      │
│ [1][2][3][4][5][6]  Input fields for OTP           │
│                                                      │
│ User enters: 123456                                 │
│ [Next]                                              │
└──────────────────────────────────────────────────────┘
           ↓
   POST /api/auth/verify-otp-reset
   Body: { 
     "email": "john@example.com",
     "otpCode": "123456"
   }
           ↓
┌──────────────────────────────────────────────────────┐
│ Backend:                                             │
│ ✓ Checks if OTP matches and not expired            │
│ ✓ Generates temporary reset token (15 min)         │
│ ✓ Saves reset token to database                    │
│ ✓ Clears OTP (can't be reused)                    │
│ ✓ Returns reset token                              │
└──────────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────┐
│ ✅ OTP Verified!                                     │
│                                                      │
│ Proceed to set new password                         │
└──────────────────────────────────────────────────────┘


STEP 3: Reset Password
┌──────────────────────────────────────────────────────┐
│ User enters new password:                            │
│                                                      │
│ New Password: [__________________]                   │
│ Confirm Password: [__________________]               │
│                                                      │
│ [Reset Password]                                     │
└──────────────────────────────────────────────────────┘
           ↓
   POST /api/auth/reset-password
   Body: {
     "token": "abc123def456...",
     "newPassword": "NewSecurePassword123"
   }
           ↓
┌──────────────────────────────────────────────────────┐
│ Backend:                                             │
│ ✓ Validates reset token (not expired)               │
│ ✓ Hashes new password with bcrypt                   │
│ ✓ Updates password in database                      │
│ ✓ Clears reset token (can't be reused)             │
│ ✓ Returns success message                          │
└──────────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────┐
│ ✅ Password Reset Successfully!                      │
│                                                      │
│ You can now login with your new password            │
│                                                      │
│ [Go to Login]                                        │
└──────────────────────────────────────────────────────┘
           ↓
   Login with new credentials
   POST /api/auth/login
   Body: {
     "email": "john@example.com",
     "password": "NewSecurePassword123"
   }
           ↓
   ✅ Login successful!
```

---

## 🔌 API Endpoints

### **Endpoint 1: Forgot Password (Step 1)**

**Purpose:** User enters email, backend sends OTP

```
POST http://127.0.0.1:9090/api/auth/forgot-password
```

**Postman Setup:**
1. Method: `POST`
2. URL: `http://127.0.0.1:9090/api/auth/forgot-password`
3. Headers:
   ```
   Content-Type: application/json
   ```
4. Body → raw → JSON:
   ```json
   {
     "email": "john.doe@example.com"
   }
   ```

**Request Validation:**
- Email must be valid format
- Email must be registered in database

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent to your email. Check your inbox for the verification code.",
  "email": "john.doe@example.com"
}
```

**Expected Response (Error - Email not found):**
```json
{
  "success": false,
  "message": "Customer not found"
}
```

**What Happens:**
1. Backend validates email format
2. Backend searches database for customer with that email
3. If found:
   - Generates 6-digit random OTP
   - Saves OTP to database with 10-minute expiration
   - Sends email with OTP code
   - Returns success
4. If not found:
   - Returns error message

**⏱️ OTP Expiration:** 10 minutes

---

### **Endpoint 2: Verify OTP for Password Reset (Step 2)**

**Purpose:** User enters OTP, backend verifies and allows password reset

```
POST http://127.0.0.1:9090/api/auth/verify-otp-reset
```

**Postman Setup:**
1. Method: `POST`
2. URL: `http://127.0.0.1:9090/api/auth/verify-otp-reset`
3. Headers:
   ```
   Content-Type: application/json
   ```
4. Body → raw → JSON:
   ```json
   {
     "email": "john.doe@example.com",
     "otpCode": "123456"
   }
   ```

**Request Validation:**
- Email must be provided
- OTP must be 6 digits
- OTP must not be expired (< 10 minutes old)
- OTP must match the one in database

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "OTP verified successfully. You can now reset your password.",
  "resetToken": "abc123def456ghi789jkl012mno345pqr...",
  "email": "john.doe@example.com"
}
```

**Expected Response (Error - Invalid OTP):**
```json
{
  "success": false,
  "message": "Invalid or expired OTP"
}
```

**What Happens:**
1. Backend validates email and OTP
2. Backend searches for customer with matching email and OTP
3. Backend checks if OTP hasn't expired (< 10 minutes)
4. If OTP is valid:
   - Generates temporary reset token (15-minute expiration)
   - Saves reset token to database
   - Clears OTP (prevents reuse)
   - Returns reset token
5. If OTP is invalid/expired:
   - Returns error message

**⏱️ Reset Token Expiration:** 15 minutes

**💡 Save the `resetToken`** - You'll need it for Step 3!

---

### **Endpoint 3: Reset Password (Step 3)**

**Purpose:** User submits new password with reset token

```
POST http://127.0.0.1:9090/api/auth/reset-password
```

**Postman Setup:**
1. Method: `POST`
2. URL: `http://127.0.0.1:9090/api/auth/reset-password`
3. Headers:
   ```
   Content-Type: application/json
   ```
4. Body → raw → JSON:
   ```json
   {
     "token": "abc123def456ghi789jkl012mno345pqr...",
     "newPassword": "MyNewSecurePassword123"
   }
   ```

**Request Validation:**
- Token must be valid (not expired)
- New password must be at least 6 characters
- Token must not have been used already

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "Password reset successfully! You can now login with your new password."
}
```

**Expected Response (Error - Token expired):**
```json
{
  "success": false,
  "message": "Invalid or expired reset token. Please start password reset again."
}
```

**What Happens:**
1. Backend validates token and new password
2. Backend checks if reset token hasn't expired (< 15 minutes)
3. If token is valid:
   - Hashes new password with bcrypt (10 salt rounds)
   - Updates password in database
   - Clears reset token (prevents reuse)
   - Returns success message
4. If token is invalid/expired:
   - Returns error message
   - User must start password reset again

---

## 🧪 Complete Testing Workflow

### **Test Step 1: Request Password Reset**

```
POST http://127.0.0.1:9090/api/auth/forgot-password

Body:
{
  "email": "john.doe@example.com"
}
```

✅ **Expected:** OTP sent to email

---

### **Test Step 2: Get OTP from Email**

1. Open your email inbox
2. Find email from Food Delivery App
3. Look for 6-digit code, example:
   ```
   Your verification code is:
   
   123456
   ```
4. **Copy the code**

---

### **Test Step 3: Verify OTP**

```
POST http://127.0.0.1:9090/api/auth/verify-otp-reset

Body:
{
  "email": "john.doe@example.com",
  "otpCode": "123456"
}
```

✅ **Expected:** Reset token returned

**Save the `resetToken` from response!**

---

### **Test Step 4: Reset Password**

```
POST http://127.0.0.1:9090/api/auth/reset-password

Body:
{
  "token": "PASTE_RESET_TOKEN_HERE",
  "newPassword": "MyNewSecurePassword123"
}
```

✅ **Expected:** Password reset successful

---

### **Test Step 5: Login with New Password**

```
POST http://127.0.0.1:9090/api/auth/login

Body:
{
  "email": "john.doe@example.com",
  "password": "MyNewSecurePassword123"
}
```

✅ **Expected:** Login successful with new password!

---

## 📱 Flutter Implementation

### **Step 1: Request OTP**

```dart
Future<Map<String, dynamic>> forgotPassword(String email) async {
  try {
    final response = await http.post(
      Uri.parse('http://127.0.0.1:9090/api/auth/forgot-password'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'email': email}),
    );

    final data = json.decode(response.body);

    return {
      'success': response.statusCode == 200,
      'message': data['message'],
      'email': data['email'],
    };
  } catch (e) {
    return {'success': false, 'message': 'Network error: $e'};
  }
}
```

### **Step 2: Verify OTP**

```dart
Future<Map<String, dynamic>> verifyOTPForPasswordReset({
  required String email,
  required String otpCode,
}) async {
  try {
    final response = await http.post(
      Uri.parse('http://127.0.0.1:9090/api/auth/verify-otp-reset'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'email': email,
        'otpCode': otpCode,
      }),
    );

    final data = json.decode(response.body);

    return {
      'success': response.statusCode == 200,
      'message': data['message'],
      'resetToken': data['resetToken'],
    };
  } catch (e) {
    return {'success': false, 'message': 'Network error: $e'};
  }
}
```

### **Step 3: Reset Password**

```dart
Future<Map<String, dynamic>> resetPassword({
  required String token,
  required String newPassword,
}) async {
  try {
    final response = await http.post(
      Uri.parse('http://127.0.0.1:9090/api/auth/reset-password'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'token': token,
        'newPassword': newPassword,
      }),
    );

    final data = json.decode(response.body);

    return {
      'success': response.statusCode == 200,
      'message': data['message'],
    };
  } catch (e) {
    return {'success': false, 'message': 'Network error: $e'};
  }
}
```

### **Flutter UI Flow**

```dart
class PasswordResetScreen extends StatefulWidget {
  @override
  _PasswordResetScreenState createState() => _PasswordResetScreenState();
}

class _PasswordResetScreenState extends State<PasswordResetScreen> {
  final _emailController = TextEditingController();
  final _otpController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  
  int _currentStep = 1; // 1: Email, 2: OTP, 3: Password
  String _resetToken = '';
  bool _isLoading = false;

  // Step 1: Request OTP
  Future<void> _requestOTP() async {
    setState(() => _isLoading = true);

    final result = await AuthService.forgotPassword(
      _emailController.text,
    );

    setState(() => _isLoading = false);

    if (result['success']) {
      setState(() => _currentStep = 2);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('OTP sent to your email')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['message']), backgroundColor: Colors.red),
      );
    }
  }

  // Step 2: Verify OTP
  Future<void> _verifyOTP() async {
    setState(() => _isLoading = true);

    final result = await AuthService.verifyOTPForPasswordReset(
      email: _emailController.text,
      otpCode: _otpController.text,
    );

    setState(() => _isLoading = false);

    if (result['success']) {
      _resetToken = result['resetToken'];
      setState(() => _currentStep = 3);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('OTP verified! Enter your new password')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['message']), backgroundColor: Colors.red),
      );
    }
  }

  // Step 3: Reset Password
  Future<void> _resetPassword() async {
    if (_passwordController.text != _confirmPasswordController.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Passwords do not match')),
      );
      return;
    }

    setState(() => _isLoading = true);

    final result = await AuthService.resetPassword(
      token: _resetToken,
      newPassword: _passwordController.text,
    );

    setState(() => _isLoading = false);

    if (result['success']) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Password reset successfully!')),
      );
      // Navigate to login
      Navigator.pushReplacementNamed(context, '/login');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['message']), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Reset Password')),
      body: _buildCurrentStep(),
    );
  }

  Widget _buildCurrentStep() {
    if (_currentStep == 1) {
      return _buildEmailStep();
    } else if (_currentStep == 2) {
      return _buildOTPStep();
    } else {
      return _buildPasswordStep();
    }
  }

  Widget _buildEmailStep() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(16),
      child: Column(
        children: [
          SizedBox(height: 20),
          Icon(Icons.lock_outline, size: 80, color: Colors.teal),
          SizedBox(height: 20),
          Text(
            'Reset Password',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          SizedBox(height: 10),
          Text('Enter your email to receive an OTP code'),
          SizedBox(height: 30),
          TextField(
            controller: _emailController,
            decoration: InputDecoration(
              labelText: 'Email',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.email),
            ),
            keyboardType: TextInputType.emailAddress,
          ),
          SizedBox(height: 20),
          ElevatedButton(
            onPressed: _isLoading ? null : _requestOTP,
            child: _isLoading
                ? CircularProgressIndicator()
                : Text('Send OTP'),
          ),
        ],
      ),
    );
  }

  Widget _buildOTPStep() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(16),
      child: Column(
        children: [
          SizedBox(height: 20),
          Icon(Icons.verified_user, size: 80, color: Colors.teal),
          SizedBox(height: 20),
          Text(
            'Enter Verification Code',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          SizedBox(height: 10),
          Text('We sent a 6-digit code to ${_emailController.text}'),
          SizedBox(height: 30),
          TextField(
            controller: _otpController,
            decoration: InputDecoration(
              labelText: 'OTP Code',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.numbers),
            ),
            keyboardType: TextInputType.number,
            maxLength: 6,
          ),
          SizedBox(height: 20),
          ElevatedButton(
            onPressed: _isLoading ? null : _verifyOTP,
            child: _isLoading
                ? CircularProgressIndicator()
                : Text('Verify OTP'),
          ),
          SizedBox(height: 10),
          TextButton(
            onPressed: () => setState(() => _currentStep = 1),
            child: Text('Back to email'),
          ),
        ],
      ),
    );
  }

  Widget _buildPasswordStep() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(16),
      child: Column(
        children: [
          SizedBox(height: 20),
          Icon(Icons.password, size: 80, color: Colors.teal),
          SizedBox(height: 20),
          Text(
            'Create New Password',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          SizedBox(height: 30),
          TextField(
            controller: _passwordController,
            decoration: InputDecoration(
              labelText: 'New Password',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.lock),
            ),
            obscureText: true,
          ),
          SizedBox(height: 16),
          TextField(
            controller: _confirmPasswordController,
            decoration: InputDecoration(
              labelText: 'Confirm Password',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.lock),
            ),
            obscureText: true,
          ),
          SizedBox(height: 20),
          ElevatedButton(
            onPressed: _isLoading ? null : _resetPassword,
            child: _isLoading
                ? CircularProgressIndicator()
                : Text('Reset Password'),
          ),
          SizedBox(height: 10),
          TextButton(
            onPressed: () => setState(() => _currentStep = 2),
            child: Text('Back to OTP'),
          ),
        ],
      ),
    );
  }
}
```

---

## 🔒 Security Features

1. **OTP Expiration:** 10 minutes
2. **Reset Token Expiration:** 15 minutes
3. **One-Time Use:** 
   - OTP is cleared after verification
   - Reset token is cleared after password reset
4. **Password Hashing:** 
   - Passwords hashed with bcrypt (10 salt rounds)
5. **Email Verification:** 
   - OTP only sent to registered email
6. **Token Hashing:** 
   - Reset token hashed with SHA256 before storage
7. **No Hardcoding:** 
   - All credentials in environment variables

---

## ⚠️ Error Scenarios

### **Error 1: "Customer not found"**
**When:** Email not registered
**Solution:** Register first, then try password reset

---

### **Error 2: "Invalid or expired OTP"**
**When:** 
- Wrong OTP entered
- OTP expired (> 10 minutes)
- OTP already used

**Solution:** Request new OTP

---

### **Error 3: "Invalid or expired reset token"**
**When:**
- Reset token expired (> 15 minutes)
- Password reset already completed

**Solution:** Start password reset process again

---

### **Error 4: "Password must be at least 6 characters"**
**When:** New password too short
**Solution:** Use password with 6+ characters

---

## 📊 Database Changes

The customer model now uses:

```javascript
// OTP fields for password reset
otpCode: String,
otpExpires: Date,

// Reset token fields
resetPasswordToken: String,
resetPasswordExpires: Date,
```

---

## 🔄 Complete API Summary

| Endpoint | Method | Purpose | Input |
|----------|--------|---------|-------|
| `/api/auth/forgot-password` | POST | Send OTP | email |
| `/api/auth/verify-otp-reset` | POST | Verify OTP | email, otpCode |
| `/api/auth/reset-password` | POST | Update password | token, newPassword |

---

## ✅ Implementation Checklist

- ✅ Forgot password generates OTP
- ✅ OTP sent to email via Brevo
- ✅ OTP verification endpoint created
- ✅ Temporary reset token generated after OTP verification
- ✅ Password reset uses reset token
- ✅ All fields cleared after use (no reuse)
- ✅ Email validation
- ✅ OTP validation (6 digits, expiration)
- ✅ Password validation (min 6 characters)
- ✅ Error handling for all scenarios
- ✅ Bcrypt password hashing
- ✅ Database indexes for performance

---

## 🚀 Next Steps

1. **Test the flow** in Postman using this guide
2. **Integrate in Flutter app** using provided code
3. **Test with real emails** to verify OTP sending
4. **Monitor logs** for any errors
5. **Get feedback** from testers

---

**Your password reset flow is now secure and mobile-friendly!** 🔐✨
