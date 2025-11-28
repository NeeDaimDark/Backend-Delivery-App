import * as brevo from '@getbrevo/brevo';
import * as dotenv from 'dotenv';

dotenv.config();

// ==================== BREVO CONFIGURATION (ACTIVE) ====================
// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

// Verify Brevo configuration on startup
if (process.env.NODE_ENV) {
    if (!process.env.BREVO_API_KEY) {
        console.log('⚠️ BREVO_API_KEY not found in environment variables');
    } else {
        console.log('✅ Brevo email service configured');
    }
}

// ==================== BREVO EMAIL FUNCTIONS ====================

// Send verification email
export async function sendVerificationEmail(email, name, token) {
    // Use backend URL for API verification endpoint
    const backendUrl = process.env.BACKEND_URL || process.env.CLIENT_URL || 'https://backend-delivery-app-ynzy.onrender.com';
    const verificationUrl = `${backendUrl}/api/auth/verify-email/${token}`;

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = {
        name: 'Food Delivery App',
        email: process.env.EMAIL_USER || 'medaminekoubaa0@gmail.com'
    };
    sendSmtpEmail.to = [{ email: email, name: name }];
    sendSmtpEmail.subject = 'Verify Your Email - Food Delivery App';
    sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FF6B35;">Welcome to Food Delivery App!</h2>
            <p>Hi ${name},</p>
            <p>Thank you for registering with us. Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}"
                   style="background-color: #FF6B35; color: white; padding: 12px 30px;
                          text-decoration: none; border-radius: 5px; display: inline-block;">
                    Verify Email
                </a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
                This link will expire in 24 hours. If you didn't create an account, please ignore this email.
            </p>
        </div>
    `;

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('✅ Verification email sent successfully to:', email);
        return data;
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        throw error;
    }
}

// Send password reset email
export async function sendPasswordResetEmail(email, name, token) {
    // Use backend URL for API reset endpoint
    const backendUrl = process.env.BACKEND_URL || process.env.CLIENT_URL || 'https://backend-delivery-app-ynzy.onrender.com';
    const resetUrl = `${backendUrl}/api/auth/reset-password/${token}`;

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = {
        name: 'Food Delivery App',
        email: process.env.EMAIL_USER || 'medaminekoubaa0@gmail.com'
    };
    sendSmtpEmail.to = [{ email: email, name: name }];
    sendSmtpEmail.subject = 'Reset Your Password - Food Delivery App';
    sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FF6B35;">Password Reset Request</h2>
            <p>Hi ${name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}"
                   style="background-color: #FF6B35; color: white; padding: 12px 30px;
                          text-decoration: none; border-radius: 5px; display: inline-block;">
                    Reset Password
                </a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="color: #666; word-break: break-all;">${resetUrl}</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
                This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
            </p>
        </div>
    `;

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('✅ Password reset email sent successfully to:', email);
        return data;
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        throw error;
    }
}

// Send OTP email
export async function sendOTPEmail(email, name, otpCode) {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = {
        name: 'Food Delivery App',
        email: process.env.EMAIL_USER || 'medaminekoubaa0@gmail.com'
    };
    sendSmtpEmail.to = [{ email: email, name: name }];
    sendSmtpEmail.subject = 'Your OTP Code - Food Delivery App';
    sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FF6B35;">Verification Code</h2>
            <p>Hi ${name},</p>
            <p>Your verification code is:</p>
            <div style="text-align: center; margin: 30px 0;">
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;
                            font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #FF6B35;">
                    ${otpCode}
                </div>
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
                This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
            </p>
        </div>
    `;

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('✅ OTP email sent successfully to:', email);
        return data;
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        throw error;
    }
}

// Send welcome email
export async function sendWelcomeEmail(email, name) {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = {
        name: 'Food Delivery App',
        email: process.env.EMAIL_USER || 'medaminekoubaa0@gmail.com'
    };
    sendSmtpEmail.to = [{ email: email, name: name }];
    sendSmtpEmail.subject = 'Welcome to Food Delivery App!';
    sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FF6B35;">Welcome aboard, ${name}! 🎉</h2>
            <p>We're excited to have you as part of our food delivery family!</p>
            <p>Here's what you can do now:</p>
            <ul>
                <li>Browse thousands of restaurants</li>
                <li>Order your favorite meals</li>
                <li>Track your delivery in real-time</li>
                <li>Get exclusive offers and deals</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL}"
                   style="background-color: #FF6B35; color: white; padding: 12px 30px;
                          text-decoration: none; border-radius: 5px; display: inline-block;">
                    Start Ordering
                </a>
            </div>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Happy ordering!</p>
        </div>
    `;

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('✅ Welcome email sent successfully to:', email);
        return data;
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        throw error;
    }
}

// Send order confirmation email
export async function sendOrderConfirmationEmail(email, name, orderId, orderDetails) {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = {
        name: 'Food Delivery App',
        email: process.env.EMAIL_USER || 'medaminekoubaa0@gmail.com'
    };
    sendSmtpEmail.to = [{ email: email, name: name }];
    sendSmtpEmail.subject = `Order Confirmation #${orderId} - Food Delivery App`;
    sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FF6B35;">Order Confirmed!</h2>
            <p>Hi ${name},</p>
            <p>Your order has been confirmed and is being prepared.</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3>Order #${orderId}</h3>
                <p><strong>Total:</strong> $${orderDetails.total}</p>
                <p><strong>Estimated Delivery:</strong> ${orderDetails.estimatedTime}</p>
            </div>
            <p>You can track your order status in the app.</p>
            <p>Thank you for your order!</p>
        </div>
    `;

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('✅ Order confirmation email sent successfully to:', email);
        return data;
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        throw error;
    }
}


// ==================== OLD EMAIL SERVICE CODE (COMMENTED OUT) ====================
/*
// ==================== RESEND CONFIGURATION (COMMENTED OUT) ====================
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Verify Resend configuration on startup
if (process.env.NODE_ENV) {
    if (!process.env.RESEND_API_KEY) {
        console.log('⚠️ RESEND_API_KEY not found in environment variables');
    } else {
        console.log('✅ Resend email service configured');
    }
}


// ==================== NODEMAILER/SMTP CODE (COMMENTED OUT) ====================
import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
    host:  'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    }
});

// Verify transporter configuration (optional - won't block startup)
if (process.env.NODE_ENV ) {
    transporter.verify((error, success) => {
        if (error) {
            console.log('⚠️ Email configuration warning:', error.message);
        } else {
            console.log('✅ Email server is ready to send messages');
        }
    });
}
*/
