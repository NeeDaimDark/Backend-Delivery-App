/**
 * Database Configuration
 * Handles MongoDB connection using Mongoose
 *
 * Supports both:
 * - MongoDB Atlas (cloud database for production)
 * - Local MongoDB (for development)
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Database configuration from environment variables
const databaseName = process.env.DBNAME || "food_delivery_DB";
const mongoURI = process.env.MONGODB_URI || `mongodb://127.0.0.1:27017/${databaseName}`;

// Mongoose configuration
mongoose.set("strictQuery", false); // Suppress deprecation warning
mongoose.set("debug", true);        // Log MongoDB queries in development
mongoose.Promise = global.Promise;  // Use native ES6 promises

/**
 * Connect to MongoDB database
 * Establishes connection with retry logic handled by Mongoose
 */
const connectDb = () => {
  mongoose
    .connect(mongoURI)
    .then(() => {
      console.log(`Connected to database: ${databaseName}`);
    })
    .catch((err) => {
      console.error("Database connection error:", err);
      // Note: Mongoose will attempt to reconnect automatically
    });
};

export default connectDb;
