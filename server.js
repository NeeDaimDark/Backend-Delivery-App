/**
 * Food Delivery API Server
 * Main application entry point
 *
 * Features:
 * - RESTful API for food delivery platform
 * - JWT-based authentication
 * - Image upload to Cloudinary
 * - Email notifications via Brevo
 * - MongoDB database integration
 */

import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { NotFoundError, errorHandler } from "./middlewares/error-handler.js";
import morgan from "morgan";
import connectDb from "./config/db.js";
import bodyParser from "body-parser";

// Import Routes
import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// Server configuration
// Use 0.0.0.0 for production hosting (Render, Railway, etc.) or localhost for local development
const hostname = process.env.NODE_ENV === 'production' ? '0.0.0.0' : (process.env.DOCKERSERVERURL || '127.0.0.1');
const port = process.env.PORT || process.env.SERVERPORT || 9090;

// ==================== MIDDLEWARE CONFIGURATION ====================

// HTTP request logger for development
app.use(morgan("tiny"));

// Enable CORS for all routes
app.use(cors());

// Connect to MongoDB database
connectDb();

// Body parser middleware - parse JSON and URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (legacy - images now stored on Cloudinary)
app.use("/media", express.static("media"));
app.use('/uploads/images', express.static('uploads/images'));

// ==================== API ROUTES ====================

// Food Delivery App Routes
app.use('/api/auth', authRoutes);           // Authentication routes
app.use('/api/customers', customerRoutes);  // Customer management routes

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Food Delivery API is running',
        timestamp: new Date().toISOString()
    });
});

// Welcome endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to Food Delivery API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
            auth: '/api/auth',
            customers: '/api/customers',
            health: '/api/health'
        }
    });
});

// Error handling middleware
app.use(NotFoundError);
app.use(errorHandler);

// Start the server
app.listen(port, hostname, () => {
    console.log(`🚀 Food Delivery API Server running on ${hostname}:${port}`);
    console.log(`📊 Database: food_delivery_DB`);
    console.log(`📧 Email service configured`);
    console.log(`✅ Ready to accept requests`);
});
