import jwt from 'jsonwebtoken';
import Customer from '../models/Customer.js';

const JWT_SECRET = process.env.JWT_SECRET || 'privateKey';

// Verify JWT Token and Authenticate User
export function checkToken(req, res, next) {
    let token = req.headers["x-access-token"] || req.headers.authorization;
    
    if (token && token.startsWith("Bearer ")) {
        token = token.slice(7, token.length);
    } else {
        return res.status(401).json({ 
            success: false,
            message: 'Access denied. No token provided.' 
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(400).json({ 
            success: false,
            message: 'Invalid or expired token' 
        });
    }
}

// Check if user is authenticated (alias for checkToken)
export const authenticate = checkToken;

// Check if user is active
export async function checkActive(req, res, next) {
    try {
        const customer = await Customer.findById(req.user._id);
        
        if (!customer) {
            return res.status(404).json({ 
                success: false,
                message: 'Customer not found' 
            });
        }

        if (!customer.isActive) {
            return res.status(403).json({ 
                success: false,
                message: 'Account has been deactivated. Please contact support.' 
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
}

// Check if user is verified
export async function checkVerified(req, res, next) {
    try {
        const customer = await Customer.findById(req.user._id);
        
        if (!customer) {
            return res.status(404).json({ 
                success: false,
                message: 'Customer not found' 
            });
        }

        if (!customer.isVerified) {
            return res.status(403).json({ 
                success: false,
                message: 'Please verify your email first' 
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
}

// Check if user is admin
export async function checkAdmin(req, res, next) {
    try {
        const customer = await Customer.findById(req.user._id);
        
        if (!customer) {
            return res.status(404).json({ 
                success: false,
                message: 'Customer not found' 
            });
        }

        if (customer.role !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: 'Access denied. Admin privileges required.' 
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
}

// Optional authentication - doesn't fail if no token
export function optionalAuth(req, res, next) {
    let token = req.headers["x-access-token"] || req.headers.authorization;
    
    if (token && token.startsWith("Bearer ")) {
        token = token.slice(7, token.length);
        
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
        } catch (error) {
            // Token is invalid but we don't fail the request
            req.user = null;
        }
    }
    
    next();
}
