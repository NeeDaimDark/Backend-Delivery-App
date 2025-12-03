import express from 'express';
import {
    register,
    login,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    verifyOTPForPasswordReset,
    resetPassword,
    sendOTP,
    verifyOTP,
    refreshToken,
    logout,
    checkCustomerExists
} from '../controllers/authController.js';
import { checkToken } from '../middlewares/auth.js';
import multerConfig from '../middlewares/multer-config.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Check if customer exists
router.get('/check-exists', checkCustomerExists);

// Register new customer
router.post('/register', multerConfig, register);

// Login
router.post('/login', login);

// Email Verification
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

// Password Reset with OTP Flow
router.post('/forgot-password', forgotPassword);                    // Step 1: Send OTP
router.post('/verify-otp-reset', verifyOTPForPasswordReset);       // Step 2: Verify OTP
router.post('/reset-password', resetPassword);                      // Step 3: Reset password

// OTP Verification
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// Refresh Token
router.post('/refresh-token', refreshToken);

// ==================== PROTECTED ROUTES ====================

// Logout (requires authentication)
router.post('/logout', checkToken, logout);

export default router;
