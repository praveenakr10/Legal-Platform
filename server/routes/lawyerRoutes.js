import express from "express";
import { searchLawyers, uploadCertificate, getLawyerProfile, updateLawyerProfile, getLawyerCases, getLawyerFeedback } from "../controllers/lawyerController.js";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// 👇 Add this route to enable lawyer search
router.get("/search", authenticateToken, searchLawyers);

// Get current lawyer profile
router.get("/profile", authenticateToken, authorizeRole("lawyer"), getLawyerProfile);

// Update current lawyer profile
router.patch("/profile", authenticateToken, authorizeRole("lawyer"), updateLawyerProfile);

// Get lawyer's cases
router.get("/cases", authenticateToken, authorizeRole("lawyer"), getLawyerCases);

// Get lawyer's feedback
router.get("/feedback", authenticateToken, authorizeRole("lawyer"), getLawyerFeedback);

// Already present
router.post(
  "/:lawyerId/upload-certificate",
  authenticateToken,
  upload.single("certificate"),
  uploadCertificate
);

export default router;
