import express from "express";
import { searchLawyers, uploadCertificate,updateLawyerProfile } from "../controllers/lawyerController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// 👇 Add this route to enable lawyer search
router.get("/search", authenticateToken, searchLawyers);

// Already present
router.post(
  "/:lawyerId/upload-certificate",
  authenticateToken,
  upload.single("certificate"),
  uploadCertificate
);
router.patch("/:lawyerId/update", authenticateToken, updateLawyerProfile);

export default router;
