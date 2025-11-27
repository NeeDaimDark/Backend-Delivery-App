import multer, { diskStorage } from "multer";
import { join, dirname, extname } from "path";
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
