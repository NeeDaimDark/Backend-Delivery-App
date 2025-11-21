import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const databaseName = process.env.DBNAME || "food_delivery_DB";
const mongoURI = process.env.MONGODB_URI || `mongodb://127.0.0.1:27017/${databaseName}`;

mongoose.set("strictQuery", false);
mongoose.set("debug", true);
mongoose.Promise = global.Promise;

const connectDb = () => {
  mongoose
    .connect(mongoURI)
    .then(() => {
      console.log(`Connected to database: ${databaseName}`);
    })
    .catch((err) => {
      console.error("Database connection error:", err);
    });
};

export default connectDb;
