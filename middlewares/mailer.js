import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Don't verify on startup to avoid DNS errors
// Emails will still work when actually sent

// Send verification email
export async function sendVerificationEmail(email, name, token) {
    try {
        const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email/${token}`;

        const mailOptions = {
            from: process.env.EMAIL_FROM || `"Food Delivery App" <${process.env.EMAIL_USER || "medaminekoubaa0@gmail.com"}>`,
            to: email,
            subject: 'Verify Your Email - Food Delivery App',
            html: `
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
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Verification email sent successfully to:', email);
        return info;
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        // Don't throw error - let registration continue even if email fails
        return null;
    }
}

// Send password reset email
export async function sendPasswordResetEmail(email, name, token) {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${token}`;
    
    const mailOptions = {
        from: process.env.EMAIL_FROM || `"Food Delivery App" <${process.env.EMAIL_USER || "medaminekoubaa0@gmail.com"}>`,
        to: email,
        subject: 'Reset Your Password - Food Delivery App',
        html: `
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
        `
    };

    return transporter.sendMail(mailOptions);
}

// Send OTP email
export async function sendOTPEmail(email, name, otpCode) {
    const mailOptions = {
        from: process.env.EMAIL_FROM || `"Food Delivery App" <${process.env.EMAIL_USER || "medaminekoubaa0@gmail.com"}>`,
        to: email,
        subject: 'Your OTP Code - Food Delivery App',
        html: `
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
        `
    };

    return transporter.sendMail(mailOptions);
}

// Send welcome email
export async function sendWelcomeEmail(email, name) {
    const mailOptions = {
        from: process.env.EMAIL_FROM || `"Food Delivery App" <${process.env.EMAIL_USER || "medaminekoubaa0@gmail.com"}>`,
        to: email,
        subject: 'Welcome to Food Delivery App!',
        html: `
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
                    <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" 
                       style="background-color: #FF6B35; color: white; padding: 12px 30px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Start Ordering
                    </a>
                </div>
                <p>If you have any questions, feel free to reach out to our support team.</p>
                <p>Happy ordering!</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
}

// Send order confirmation email
export async function sendOrderConfirmationEmail(email, name, orderId, orderDetails) {
    const mailOptions = {
        from: process.env.EMAIL_FROM || `"Food Delivery App" <${process.env.EMAIL_USER || "medaminekoubaa0@gmail.com"}>`,
        to: email,
        subject: `Order Confirmation #${orderId} - Food Delivery App`,
        html: `
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
        `
    };

    return transporter.sendMail(mailOptions);
}

// Legacy function for backward compatibility
export async function sendConfirmationEmail(email, activationCode) {
    try {
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER ,
                pass: process.env.EMAIL_PASSWORD ,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER ,
            to: email,
            subject: "Please confirm your account",
            text: "Email Confirmation",
            html: `<h1> This is your code </h1>
        <h3> ${activationCode}</h3>`,
        });

        console.log("email sent sucessfully");
    } catch (error) {
        console.log("email not sent");
        console.log(error);
    }
}

export default sendConfirmationEmail;