# OTP Password Reset - Postman Quick Test Guide

## 🎯 Quick 3-Step Testing Process

### **Step 1: Request OTP**
```
POST http://127.0.0.1:9090/api/auth/forgot-password

Headers:
Content-Type: application/json

Body (raw JSON):
{
  "email": "test@example.com"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email. Check your inbox for the verification code.",
  "email": "test@example.com"
}
```

✅ **Check your email for the 6-digit OTP code** (e.g., 123456)

---

### **Step 2: Verify OTP**
```
POST http://127.0.0.1:9090/api/auth/verify-otp-reset

Headers:
Content-Type: application/json

Body (raw JSON):
{
  "email": "test@example.com",
  "otpCode": "123456"
}
```

**Replace `123456` with the actual OTP from your email**

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully. You can now reset your password.",
  "resetToken": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
  "email": "test@example.com"
}
```

✅ **Copy the `resetToken` from response - you'll need it in Step 3!**

---

### **Step 3: Reset Password**
```
POST http://127.0.0.1:9090/api/auth/reset-password

Headers:
Content-Type: application/json

Body (raw JSON):
{
  "token": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
  "newPassword": "NewSecurePassword123"
}
```

**Paste the actual `resetToken` from Step 2**

**Expected Response:**
```json
{
  "success": true,
  "message": "Password reset successfully! You can now login with your new password."
}
```

✅ **Password has been reset!**

---

### **Step 4: Login with New Password**
```
POST http://127.0.0.1:9090/api/auth/login

Headers:
Content-Type: application/json

Body (raw JSON):
{
  "email": "test@example.com",
  "password": "NewSecurePassword123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "customer": { ... }
}
```

✅ **Success! You're logged in with the new password!**

---

## 🔑 Important Tips

### **For Step 1 (OTP Request):**
- Email must be registered in database
- Email will receive OTP code
- OTP valid for 10 minutes
- Check spam folder if not in inbox

### **For Step 2 (OTP Verification):**
- Enter exact OTP from email (6 digits)
- Must be within 10 minutes of sending
- Copy the returned `resetToken` carefully
- Reset token valid for 15 minutes

### **For Step 3 (Password Reset):**
- Paste the exact `resetToken` from Step 2
- Password must be at least 6 characters
- After reset, old password won't work
- Token expires after 15 minutes

---

## 📝 Postman Environment Variables (Recommended)

Create variables in Postman for easier testing:

1. Click ⚙️ icon → **Manage Environments** → **Add**
2. Add these variables:
   - `base_url`: `http://127.0.0.1:9090`
   - `test_email`: `test@example.com`
   - `otp_code`: (copy OTP from email)
   - `reset_token`: (copy from Step 2 response)

3. Use in requests:
   ```
   POST {{base_url}}/api/auth/forgot-password
   
   Body:
   {
     "email": "{{test_email}}"
   }
   ```

---

## ✅ Checklist

- [ ] Step 1: OTP sent to email
- [ ] Step 2: OTP verified, reset token received
- [ ] Step 3: Password reset successful
- [ ] Step 4: Login works with new password
- [ ] Old password no longer works

---

## ❌ Common Issues

### **"Customer not found"**
- Register the email first
- Use correct email address

### **"Invalid or expired OTP"**
- Check email for correct OTP
- Make sure it's within 10 minutes
- Try requesting new OTP

### **"Invalid or expired reset token"**
- Use token from Step 2 response
- Must be within 15 minutes
- Start over if too much time passed

---

## 🎬 Complete Workflow (Copy-Paste Ready)

**Test User:**
```
Email: password_reset_test@example.com
Password: oldpassword123
New Password: newpassword456
```

**Step 1 - Request OTP:**
```json
POST http://127.0.0.1:9090/api/auth/forgot-password
{
  "email": "password_reset_test@example.com"
}
```

**Step 2 - Verify OTP (use code from email):**
```json
POST http://127.0.0.1:9090/api/auth/verify-otp-reset
{
  "email": "password_reset_test@example.com",
  "otpCode": "COPY_CODE_FROM_EMAIL_HERE"
}
```

**Step 3 - Reset Password (use token from Step 2):**
```json
POST http://127.0.0.1:9090/api/auth/reset-password
{
  "token": "COPY_TOKEN_FROM_STEP2_HERE",
  "newPassword": "newpassword456"
}
```

**Step 4 - Login (verify it works):**
```json
POST http://127.0.0.1:9090/api/auth/login
{
  "email": "password_reset_test@example.com",
  "password": "newpassword456"
}
```

---

**Happy Testing!** 🚀
