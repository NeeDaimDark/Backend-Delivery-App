import express from 'express';
import {
    register,
    login,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    verifyResetToken,
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

// Password Reset
router.post('/forgot-password', forgotPassword);
router.get('/reset-password/:token', verifyResetToken);  // Verify token (for email link)
router.post('/reset-password', resetPassword);           // Actually reset password

// OTP Verification
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// Refresh Token
router.post('/refresh-token', refreshToken);

// ==================== PROTECTED ROUTES ====================

// Logout (requires authentication)
router.post('/logout', checkToken, logout);

export default router;
