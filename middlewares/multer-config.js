import multer from "multer";
import { extname } from "path";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import * as dotenv from 'dotenv';

dotenv.config();

// ==================== CLOUDINARY CONFIGURATION (ACTIVE) ====================
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'food-delivery/profiles', // Folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }], // Optional: resize images
    public_id: (req, file) => {
      // Generate unique filename: username_timestamp
      const userName = req.user?.name || 'user';
      const sanitizedName = userName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      const timestamp = Date.now();
      return `${sanitizedName}_${timestamp}`;
    }
  }
});

// Multer configuration with Cloudinary storage
export default multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg|JPG|PNG|JPEG)$/)) {
      return cb(new Error("Please upload an Image (PNG, JPG, or JPEG only)"));
    }
    cb(undefined, true);
  }
}).single("upload");


// ==================== OLD LOCAL STORAGE CONFIGURATION (COMMENTED OUT) ====================
/*
import { diskStorage } from "multer";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

export default multer({
  storage: diskStorage({
    destination: (req, file, callback) => {
      const __dirname = dirname(fileURLToPath(import.meta.url));
      const imgPath = process.env.IMGURL ? process.env.IMGURL : '/uploads/images';
      callback(null, join(__dirname, "..", imgPath));  // Ensure the correct path is used
    },
    filename: (req, file, callback) => {
      // Get file extension
      const ext = extname(file.originalname).toLowerCase();

      // Get user name from request (sanitize it for filename)
      const userName = req.user?.name || 'user';
      const sanitizedName = userName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

      // Create unique filename: username_timestamp.ext
      const timestamp = Date.now();
      const filename = `${sanitizedName}_${timestamp}${ext}`;

      callback(null, filename);
    },
  }),

  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg|JPG|PNG|JPEG)$/)) {
      return cb(new Error("Please upload an Image"));
    }
    cb(undefined, true);
  },
}).single("upload");
*/