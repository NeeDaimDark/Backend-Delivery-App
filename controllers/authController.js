import Customer, {
    validateCustomerRegistration,
    validateCustomerLogin,
    validateEmail,
    validatePasswordReset,
    validateOTP
} from '../models/Customer.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail, sendOTPEmail } from '../middlewares/mailer.js';

const JWT_SECRET = process.env.JWT_SECRET || 'privateKey';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refreshPrivateKey';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '30d';

// Generate JWT Token
const generateToken = (customerId, expiresIn = JWT_EXPIRE) => {
    return jwt.sign({ _id: customerId }, JWT_SECRET, { expiresIn });
};

// Generate Refresh Token
const generateRefreshToken = (customerId) => {
    return jwt.sign({ _id: customerId }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRE });
};

// Generate OTP Code
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// ==================== REGISTER ====================
export async function register(req, res) {
    try {
        const { error } = validateCustomerRegistration(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false,
                message: error.details[0].message 
            });
        }

        const { name, email, phone, password, language } = req.body;

        // Check if customer already exists
        const existingCustomer = await Customer.findOne({ 
            $or: [{ email }, { phone }] 
        });

        if (existingCustomer) {
            if (existingCustomer.email === email) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Email already registered' 
                });
            }
            if (existingCustomer.phone === phone) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Phone number already registered' 
                });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate email verification token
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        // Create new customer
        const newCustomer = await Customer.create({
            name,
            email,
            phone,
            password: hashedPassword,
            language: language || 'en',
            // Cloudinary returns the secure URL in req.file.path
            profileImage: req.file ? req.file.path : null,
            emailVerificationToken,
            emailVerificationExpires
        });

        // Send verification email
        try {
            await sendVerificationEmail(email, name, emailVerificationToken);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Continue registration even if email fails
        }

        // Generate tokens
        const token = generateToken(newCustomer._id);
        const refreshToken = generateRefreshToken(newCustomer._id);

        // Remove sensitive data
        const customerResponse = {
            id: newCustomer._id,
            name: newCustomer.name,
            email: newCustomer.email,
            phone: newCustomer.phone,
            profileImage: newCustomer.profileImage,
            language: newCustomer.language,
            isVerified: newCustomer.isVerified,
            role: newCustomer.role
        };

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email to verify your account.',
            token,
            refreshToken,
            customer: customerResponse
        });

    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error during registration',
            error: err.message 
        });
    }
}

// ==================== LOGIN ====================
export async function login(req, res) {
    try {
        const { error } = validateCustomerLogin(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false,
                message: error.details[0].message 
            });
        }

        const { email, phone, password } = req.body;

        // Find customer by email or phone
        const customer = await Customer.findOne({
            $or: [
                { email: email || '' },
                { phone: phone || '' }
            ]
        });

        if (!customer) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // Check if account is active
        if (!customer.isActive) {
            return res.status(403).json({ 
                success: false,
                message: 'Account has been deactivated. Please contact support.' 
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, customer.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // Update last login
        customer.lastLogin = new Date();
        await customer.save();

        // Generate tokens
        const token = generateToken(customer._id);
        const refreshToken = generateRefreshToken(customer._id);

        // Customer response
        const customerResponse = {
            id: customer._id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            profileImage: customer.profileImage,
            language: customer.language,
            isVerified: customer.isVerified,
            addresses: customer.addresses,
            defaultAddressId: customer.defaultAddressId,
            notificationPreferences: customer.notificationPreferences,
            role: customer.role,
            totalOrders: customer.totalOrders,
            totalSpent: customer.totalSpent
        };

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            refreshToken,
            customer: customerResponse
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error during login',
            error: err.message 
        });
    }
}

// ==================== VERIFY EMAIL ====================
export async function verifyEmail(req, res) {
    try {
        const { token } = req.params;

        const customer = await Customer.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!customer) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid or expired verification token' 
            });
        }

        customer.isVerified = true;
        customer.emailVerificationToken = undefined;
        customer.emailVerificationExpires = undefined;
        await customer.save();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });

    } catch (err) {
        console.error('Email verification error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error during email verification',
            error: err.message 
        });
    }
}

// ==================== RESEND VERIFICATION EMAIL ====================
export async function resendVerificationEmail(req, res) {
    try {
        const { error } = validateEmail(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false,
                message: error.details[0].message 
            });
        }

        const { email } = req.body;

        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(404).json({ 
                success: false,
                message: 'Customer not found' 
            });
        }

        if (customer.isVerified) {
            return res.status(400).json({ 
                success: false,
                message: 'Email already verified' 
            });
        }

        // Generate new verification token
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

        customer.emailVerificationToken = emailVerificationToken;
        customer.emailVerificationExpires = emailVerificationExpires;
        await customer.save();

        // Send verification email
        await sendVerificationEmail(email, customer.name, emailVerificationToken);

        res.status(200).json({
            success: true,
            message: 'Verification email sent successfully'
        });

    } catch (err) {
        console.error('Resend verification error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: err.message 
        });
    }
}

// ==================== FORGOT PASSWORD ====================
/**
 * Forgot Password - Step 1: Generate and send OTP
 * User enters email, backend sends OTP code to email
 */
export async function forgotPassword(req, res) {
    try {
        const { error } = validateEmail(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false,
                message: error.details[0].message 
            });
        }

        const { email } = req.body;

        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(404).json({ 
                success: false,
                message: 'Customer not found' 
            });
        }

        // Generate OTP (6-digit code)
        const otpCode = generateOTP();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Mark this OTP for password reset
        customer.otpCode = otpCode;
        customer.otpExpires = otpExpires;
        await customer.save();

        // Send OTP via email
        await sendOTPEmail(email, customer.name, otpCode);

        res.status(200).json({
            success: true,
            message: 'OTP sent to your email. Check your inbox for the verification code.',
            email: email // Return email for verification in next step
        });

    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: err.message 
        });
    }
}

// ==================== VERIFY OTP FOR PASSWORD RESET ====================
/**
 * Verify OTP for password reset - Step 2
 * User enters OTP code received in email
 * Returns reset token to allow user to proceed to password reset
 */
export async function verifyOTPForPasswordReset(req, res) {
    try {
        const { email, otpCode } = req.body;

        if (!email || !otpCode) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        const customer = await Customer.findOne({
            email,
            otpCode,
            otpExpires: { $gt: Date.now() }
        });

        if (!customer) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Generate a temporary reset token (valid for 15 minutes)
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

        // Save temporary reset token
        customer.resetPasswordToken = resetPasswordToken;
        customer.resetPasswordExpires = resetPasswordExpires;
        // Clear OTP after verification
        customer.otpCode = undefined;
        customer.otpExpires = undefined;
        await customer.save();

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully. You can now reset your password.',
            resetToken: resetToken,
            email: email
        });

    } catch (err) {
        console.error('Verify OTP for password reset error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
}

// ==================== RESET PASSWORD ====================
/**
 * Reset password - Step 3: Confirm new password
 * After OTP verification, user submits new password with temporary reset token
 * This updates the password in the database
 */
export async function resetPassword(req, res) {
    try {
        const { error } = validatePasswordReset(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false,
                message: error.details[0].message 
            });
        }

        const { token, newPassword } = req.body;

        // Hash the token to compare with stored hash
        const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

        const customer = await Customer.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!customer) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid or expired reset token. Please start password reset again.' 
            });
        }

        // Hash new password with bcrypt
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token
        customer.password = hashedPassword;
        customer.resetPasswordToken = undefined;
        customer.resetPasswordExpires = undefined;
        await customer.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successfully! You can now login with your new password.'
        });

    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: err.message 
        });
    }
}

// ==================== SEND OTP ====================
export async function sendOTP(req, res) {
    try {
        const { email, phone } = req.body;

        if (!email && !phone) {
            return res.status(400).json({ 
                success: false,
                message: 'Email or phone is required' 
            });
        }

        const customer = await Customer.findOne({
            $or: [
                { email: email || '' },
                { phone: phone || '' }
            ]
        });

        if (!customer) {
            return res.status(404).json({ 
                success: false,
                message: 'Customer not found' 
            });
        }

        // Generate OTP
        const otpCode = generateOTP();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        customer.otpCode = otpCode;
        customer.otpExpires = otpExpires;
        await customer.save();

        // Send OTP via email
        if (email) {
            await sendOTPEmail(email, customer.name, otpCode);
        }

        // TODO: Send OTP via SMS if phone is provided

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            // For testing purposes only - remove in production
            ...(process.env.NODE_ENV === 'development' && { otpCode })
        });

    } catch (err) {
        console.error('Send OTP error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: err.message 
        });
    }
}

// ==================== VERIFY OTP ====================
export async function verifyOTP(req, res) {
    try {
        const { error } = validateOTP(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false,
                message: error.details[0].message 
            });
        }

        const { email, phone, otpCode } = req.body;

        const customer = await Customer.findOne({
            $or: [
                { email: email || '' },
                { phone: phone || '' }
            ],
            otpCode,
            otpExpires: { $gt: Date.now() }
        });

        if (!customer) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid or expired OTP' 
            });
        }

        customer.otpCode = undefined;
        customer.otpExpires = undefined;
        customer.isVerified = true;
        await customer.save();

        // Generate tokens
        const token = generateToken(customer._id);
        const refreshToken = generateRefreshToken(customer._id);

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            token,
            refreshToken
        });

    } catch (err) {
        console.error('Verify OTP error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: err.message 
        });
    }
}

// ==================== REFRESH TOKEN ====================
export async function refreshToken(req, res) {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ 
                success: false,
                message: 'Refresh token is required' 
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

        // Check if customer exists and is active
        const customer = await Customer.findById(decoded._id);
        if (!customer || !customer.isActive) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid refresh token' 
            });
        }

        // Generate new tokens
        const newToken = generateToken(customer._id);
        const newRefreshToken = generateRefreshToken(customer._id);

        res.status(200).json({
            success: true,
            token: newToken,
            refreshToken: newRefreshToken
        });

    } catch (err) {
        console.error('Refresh token error:', err);
        res.status(401).json({ 
            success: false,
            message: 'Invalid or expired refresh token',
            error: err.message 
        });
    }
}

// ==================== LOGOUT ====================
export async function logout(req, res) {
    try {
        // In a stateless JWT system, logout is typically handled client-side
        // by removing the token. However, we can clear FCM token here.
        
        const { _id } = req.user;

        await Customer.findByIdAndUpdate(_id, {
            fcmToken: null
        });

        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });

    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: err.message 
        });
    }
}

// ==================== CHECK IF CUSTOMER EXISTS ====================
export async function checkCustomerExists(req, res) {
    try {
        const { email, phone } = req.query;

        if (!email && !phone) {
            return res.status(400).json({ 
                success: false,
                message: 'Email or phone is required' 
            });
        }

        const customer = await Customer.findOne({
            $or: [
                { email: email || '' },
                { phone: phone || '' }
            ]
        });

        res.status(200).json({
            success: true,
            exists: !!customer
        });

    } catch (err) {
        console.error('Check customer exists error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: err.message 
        });
    }
}
