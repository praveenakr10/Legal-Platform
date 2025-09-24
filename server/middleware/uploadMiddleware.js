import multer from "multer";
import path from "path";

// Set storage destination and filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // You may need to create this folder
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + file.fieldname + ext);
  }
});

// File filter (allow only PDF, images, DOCX, etc.)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) cb(null, true);
  else cb(new Error("Only documents/images allowed (PDF, DOC, DOCX, JPG, PNG)"));
};

const upload = multer({ storage, fileFilter });

export default upload;
