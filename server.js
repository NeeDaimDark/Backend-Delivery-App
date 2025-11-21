import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { NotFoundError, errorHandler } from "./middlewares/error-handler.js";
import morgan from "morgan";
import connectDb from "./config/db.js";
import bodyParser from "body-parser";
import multer from 'multer';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';

dotenv.config();

const app = express();

const hostname = process.env.DOCKERSERVERURL || '127.0.0.1';
const port = process.env.SERVERPORT || 9090;

// Info on req : GET /route ms -25
app.use(morgan("tiny"));
app.use(cors());

// Database connection
connectDb();

// Body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static folder setup
app.use("/media", express.static("media"));
app.use('/uploads/images', express.static('uploads/images'));

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/images');
    },
    filename: (req, file, cb) => {
        // Sanitize the filename
        const sanitizedFilename = file.originalname.replace(/\s+/g, '_');
        cb(null, sanitizedFilename);
    }
});

const upload = multer({ storage: storage });

app.post("/uploads", upload.single('upload'), (req, res) => {
    res.json({
        success: 1,
        profilePic: `/uploads/images/${req.file.filename}` // Return the correct path
    });
});

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
