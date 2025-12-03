# Password Reset Flow - Complete Guide

## 📋 Overview

The password reset system has **2 steps**:

1. **Step 1: Request Password Reset** - User requests a reset link
2. **Step 2: Reset Password** - User submits new password with token from email

---

## 🔄 How It Works (Technical Flow)

### **Step 1: User Requests Password Reset**

```
User Input: Email Address
    ↓
Backend Generates: Random Reset Token
    ↓
Backend Hashes Token: SHA256 encryption for security
    ↓
Backend Stores: Hashed token in database with 1-hour expiration
    ↓
Backend Sends Email: With reset link containing unhashed token
    ↓
User Receives: Email with reset link
```

### **Step 2: User Submits New Password**

```
User Clicks: Link in email with reset token
    ↓
User Enters: New password
    ↓
Frontend Sends: Token + new password to backend
    ↓
Backend Validates: Token hasn't expired (< 1 hour)
    ↓
Backend Hashes: New password with bcrypt
    ↓
Backend Saves: New hashed password in database
    ↓
Backend Clears: Old reset token (prevents reuse)
    ↓
User Can Login: With new password
```

---

## 🔐 Security Features

1. **Token Hashing**: Reset token is hashed before storing in database
2. **Token Expiration**: Reset token valid for only 1 hour
3. **One-Time Use**: Token is deleted after successful reset (can't be reused)
4. **Password Hashing**: New password is hashed with bcrypt (salt rounds: 10)
5. **Email Verification**: Token is sent only to registered email address

---

## 📝 API Endpoints for Password Reset

### **Endpoint 1: Forgot Password (Request Reset)**

**Purpose:** User requests to reset forgotten password

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

**Expected Response:**
```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

**What Happens Behind the Scenes:**
1. Backend finds customer by email
2. Generates a random 32-byte reset token
3. Hashes the token with SHA256
4. Stores hashed token in database with 1-hour expiration
5. Sends email with reset link containing the **unhashed** token
6. User receives email with link like:
   ```
   http://yourapp.com/reset-password/abc123def456...
   ```

---

### **Endpoint 2: Reset Password (Confirm Reset)**

**Purpose:** User submits new password using token from email

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
     "token": "abc123def456...",
     "newPassword": "NewSecurePassword123"
   }
   ```

**Where to Get Token:**
- The token comes from the email sent in Step 1
- It will be in the reset link: `http://yourapp.com/reset-password/{TOKEN_HERE}`
- Copy the token part from the URL

**Expected Response:**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

**What Happens Behind the Scenes:**
1. Backend receives token + new password
2. Hashes the token with SHA256 (same algorithm as stored token)
3. Finds customer with matching hashed token
4. Checks if token hasn't expired (< 1 hour)
5. If valid:
   - Hashes new password with bcrypt
   - Updates password in database
   - Deletes reset token (prevents reuse)
   - Returns success message
6. User can now login with new password

---

## 🚀 Complete Testing Workflow

### **Test Step 1: Request Password Reset**

Open Postman:

```
POST http://127.0.0.1:9090/api/auth/forgot-password

Body:
{
  "email": "john.doe@example.com"
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

✅ **Email should be sent** (check your inbox)

---

### **Test Step 2: Get Reset Token from Email**

1. Open your email inbox (the email you registered with)
2. Look for email from your app with subject like "Password Reset Request"
3. Find the reset link in the email, it should look like:
   ```
   http://yourapp.com/reset-password/abc123def456ghi789...
   ```
4. **Copy the token part** (the long string after `/reset-password/`)
   ```
   abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
   ```

---

### **Test Step 3: Reset Password with Token**

Open Postman:

```
POST http://127.0.0.1:9090/api/auth/reset-password

Body:
{
  "token": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
  "newPassword": "MyNewSecurePassword123"
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

✅ **Password has been changed!**

---

### **Test Step 4: Login with New Password**

```
POST http://127.0.0.1:9090/api/auth/login

Body:
{
  "email": "john.doe@example.com",
  "password": "MyNewSecurePassword123"
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "customer": { ... }
}
```

✅ **Success! You're logged in with new password!**

---

## 🔧 Code Implementation (Backend)

### **Part 1: Forgot Password Function**

```javascript
export async function forgotPassword(req, res) {
    try {
        const { email } = req.body;

        // Find customer
        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(404).json({ 
                success: false,
                message: 'Customer not found' 
            });
        }

        // Generate random token
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Hash token for storage (SHA256)
        const resetPasswordToken = crypto.createHash('sha256')
            .update(resetToken)
            .digest('hex');
        
        // Token expires in 1 hour
        const resetPasswordExpires = Date.now() + 60 * 60 * 1000;

        // Save hashed token to database
        customer.resetPasswordToken = resetPasswordToken;
        customer.resetPasswordExpires = resetPasswordExpires;
        await customer.save();

        // Send email with unhashed token in link
        await sendPasswordResetEmail(email, customer.name, resetToken);

        res.status(200).json({
            success: true,
            message: 'Password reset email sent successfully'
        });

    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: 'Server error'
        });
    }
}
```

### **Part 2: Reset Password Function**

```javascript
export async function resetPassword(req, res) {
    try {
        const { token, newPassword } = req.body;

        // Hash the token to compare with stored hash
        const resetPasswordToken = crypto.createHash('sha256')
            .update(token)
            .digest('hex');

        // Find customer with valid token
        const customer = await Customer.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() }  // Token not expired
        });

        if (!customer) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid or expired reset token' 
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token
        customer.password = hashedPassword;
        customer.resetPasswordToken = undefined;
        customer.resetPasswordExpires = undefined;
        await customer.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });

    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: 'Server error'
        });
    }
}
```

---

## 📧 Email Template

The email sent to user looks like:

```
Subject: Password Reset Request

Hi John,

We received a request to reset your password. Click the link below to reset it:

[Button: Reset Password]
http://yourapp.com/reset-password/abc123def456...

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email.

Best regards,
Food Delivery App Team
```

---

## ⚠️ Error Scenarios

### **Error 1: "Customer not found"**
**Cause:** Email is not registered
**Solution:** Register the email first

```json
{
  "success": false,
  "message": "Customer not found"
}
```

---

### **Error 2: "Invalid or expired reset token"**
**Causes:**
1. Token is incorrect
2. Token has expired (> 1 hour old)
3. Token was already used to reset password

**Solution:** Request a new password reset

```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

---

### **Error 3: "Password too short"**
**Cause:** New password is less than 6 characters
**Solution:** Use a password with 6+ characters

```json
{
  "success": false,
  "message": "Password must be at least 6 characters"
}
```

---

## 🔄 Database Schema (Customer Model)

```javascript
const customerSchema = new Schema({
    // ... other fields
    
    // Password reset fields
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    }
});
```

**Field Explanation:**
- `resetPasswordToken`: SHA256 hashed reset token (stored for security)
- `resetPasswordExpires`: Timestamp when token expires (1 hour from generation)

---

## 📱 Flutter Implementation

### **Step 1: Request Password Reset**

```dart
// lib/services/auth_service.dart

static Future<Map<String, dynamic>> forgotPassword(String email) async {
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
    };
  } catch (e) {
    return {'success': false, 'message': 'Network error: $e'};
  }
}
```

### **Step 2: Reset Password**

```dart
static Future<Map<String, dynamic>> resetPassword({
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

### **Flutter UI - Password Reset Screen**

```dart
// lib/screens/forgot_password_screen.dart

class ForgotPasswordScreen extends StatefulWidget {
  @override
  _ForgotPasswordScreenState createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _tokenController = TextEditingController();
  bool _isLoading = false;
  int _step = 1; // Step 1: Request, Step 2: Reset

  // Step 1: Request Password Reset
  Future<void> _requestReset() async {
    setState(() => _isLoading = true);

    final result = await AuthService.forgotPassword(_emailController.text);

    setState(() => _isLoading = false);

    if (result['success']) {
      // Move to step 2
      setState(() => _step = 2);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Reset email sent! Check your inbox.')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['message']), backgroundColor: Colors.red),
      );
    }
  }

  // Step 2: Reset Password
  Future<void> _resetPassword() async {
    if (_passwordController.text.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Password must be at least 6 characters')),
      );
      return;
    }

    setState(() => _isLoading = true);

    final result = await AuthService.resetPassword(
      token: _tokenController.text,
      newPassword: _passwordController.text,
    );

    setState(() => _isLoading = false);

    if (result['success']) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Password reset successfully!')),
      );
      // Navigate to login screen
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
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: _step == 1
            ? _buildRequestStep()
            : _buildResetStep(),
      ),
    );
  }

  Widget _buildRequestStep() {
    return Column(
      children: [
        Text(
          'Reset Password',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        SizedBox(height: 20),
        Text('Enter your email to receive a password reset link'),
        SizedBox(height: 20),
        TextFormField(
          controller: _emailController,
          decoration: InputDecoration(
            labelText: 'Email',
            border: OutlineInputBorder(),
          ),
          keyboardType: TextInputType.emailAddress,
        ),
        SizedBox(height: 20),
        ElevatedButton(
          onPressed: _isLoading ? null : _requestReset,
          child: _isLoading
              ? CircularProgressIndicator()
              : Text('Send Reset Email'),
        ),
      ],
    );
  }

  Widget _buildResetStep() {
    return Column(
      children: [
        Text(
          'Enter New Password',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        SizedBox(height: 20),
        Text('Paste the token from your email and enter your new password'),
        SizedBox(height: 20),
        TextFormField(
          controller: _tokenController,
          decoration: InputDecoration(
            labelText: 'Reset Token (from email)',
            border: OutlineInputBorder(),
          ),
          maxLines: 3,
        ),
        SizedBox(height: 16),
        TextFormField(
          controller: _passwordController,
          decoration: InputDecoration(
            labelText: 'New Password',
            border: OutlineInputBorder(),
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
          onPressed: () => setState(() => _step = 1),
          child: Text('Back'),
        ),
      ],
    );
  }
}
```

---

## 🎯 Summary

**Password Reset = 2 Simple Steps:**

1. **User clicks "Forgot Password"**
   - Enters email
   - Backend sends reset link to email
   - Link contains a token

2. **User clicks link in email**
   - Enters new password
   - Backend verifies token
   - Backend updates password
   - User can now login

**All passwords are hashed** so backend never stores plain text passwords.

**All tokens expire** after 1 hour for security.

---

## 📚 Related Endpoints

- [Login](#) - After password reset
- [Register](#) - If user doesn't have account
- [Forgot Password Email](#) - Requests reset link
- [Reset Password](#) - Confirms new password
- [Change Password](#) - If user is already logged in

---

**That's it! Your password reset is fully secure and functional.** 🔐
