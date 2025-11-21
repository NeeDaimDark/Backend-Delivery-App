import mongoose from 'mongoose';
import Joi from 'joi';

const { Schema, model } = mongoose;

// Address Sub-Schema
const addressSchema = new Schema({
    type: {
        type: String,
        enum: ['home', 'office', 'apartment', 'other'],
        required: true
    },
    label: {
        type: String,
        required: true
    },
    street: {
        type: String,
        required: true
    },
    building: String,
    floor: String,
    apartment: String,
    city: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, { _id: true });

// Customer Schema
const customerSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        profileImage: {
            type: String,
            default: null
        },
        addresses: [addressSchema],
        defaultAddressId: {
            type: Schema.Types.ObjectId,
            default: null
        },
        language: {
            type: String,
            enum: ['en', 'fr', 'ar', 'es'],
            default: 'en'
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        isActive: {
            type: Boolean,
            default: true
        },
        role: {
            type: String,
            enum: ['customer', 'admin'],
            default: 'customer'
        },
        // Email Verification
        emailVerificationToken: String,
        emailVerificationExpires: Date,
        
        // Password Reset
        resetPasswordToken: String,
        resetPasswordExpires: Date,
        
        // OTP Verification
        otpCode: String,
        otpExpires: Date,
        
        // Notification Preferences
        notificationPreferences: {
            pushNotifications: {
                type: Boolean,
                default: true
            },
            emailNotifications: {
                type: Boolean,
                default: true
            },
            smsNotifications: {
                type: Boolean,
                default: false
            },
            orderUpdates: {
                type: Boolean,
                default: true
            },
            promotions: {
                type: Boolean,
                default: true
            }
        },
        
        // FCM Token for Push Notifications
        fcmToken: String,
        
        // User Stats
        totalOrders: {
            type: Number,
            default: 0
        },
        totalSpent: {
            type: Number,
            default: 0
        },
        
        // Last Login
        lastLogin: Date
    },
    {
        timestamps: true
    }
);

// Indexes for better query performance
customerSchema.index({ email: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ isActive: 1 });

// Virtual for orders (will be populated)
customerSchema.virtual('orders', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'customerId'
});

// Registration Validation
export function validateCustomerRegistration(customer) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(100).required(),
        email: Joi.string().email().required(),
        phone: Joi.string().min(10).max(15).required(),
        password: Joi.string().min(6).required(),
        language: Joi.string().valid('en', 'fr', 'ar', 'es').optional()
    });

    return schema.validate(customer);
}

// Login Validation
export function validateCustomerLogin(credentials) {
    const schema = Joi.object({
        email: Joi.string().email().optional(),
        phone: Joi.string().optional(),
        password: Joi.string().required()
    }).or('email', 'phone'); // At least one of email or phone must be present

    return schema.validate(credentials);
}

// Update Profile Validation
export function validateCustomerUpdate(data) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(100).optional(),
        phone: Joi.string().min(10).max(15).optional(),
        language: Joi.string().valid('en', 'fr', 'ar', 'es').optional(),
        notificationPreferences: Joi.object({
            pushNotifications: Joi.boolean().optional(),
            emailNotifications: Joi.boolean().optional(),
            smsNotifications: Joi.boolean().optional(),
            orderUpdates: Joi.boolean().optional(),
            promotions: Joi.boolean().optional()
        }).optional(),
        fcmToken: Joi.string().optional()
    });

    return schema.validate(data);
}

// Address Validation
export function validateAddress(address) {
    const schema = Joi.object({
        type: Joi.string().valid('home', 'office', 'apartment', 'other').required(),
        label: Joi.string().required(),
        street: Joi.string().required(),
        building: Joi.string().optional().allow(''),
        floor: Joi.string().optional().allow(''),
        apartment: Joi.string().optional().allow(''),
        city: Joi.string().required(),
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required(),
        isDefault: Joi.boolean().optional()
    });

    return schema.validate(address);
}

// Email Validation
export function validateEmail(data) {
    const schema = Joi.object({
        email: Joi.string().email().required()
    });

    return schema.validate(data);
}

// Password Reset Validation
export function validatePasswordReset(data) {
    const schema = Joi.object({
        token: Joi.string().required(),
        newPassword: Joi.string().min(6).required()
    });

    return schema.validate(data);
}

// OTP Validation
export function validateOTP(data) {
    const schema = Joi.object({
        email: Joi.string().email().optional(),
        phone: Joi.string().optional(),
        otpCode: Joi.string().length(6).required()
    }).or('email', 'phone');

    return schema.validate(data);
}

export default model('Customer', customerSchema);
