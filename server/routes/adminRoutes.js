import express from "express";
import {
  getAllLawyers,
  approveLawyer,
  rejectLawyer,
  ProfileUpdate
} from "../controllers/adminController.js";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware.js";
import { toggleUserLock } from "../controllers/adminController.js";
import { getAllFeedback } from "../controllers/feedbackController.js";

const router = express.Router();

router.patch("/users/:userId/lock", authenticateToken, authorizeRole("admin"), toggleUserLock);

// Admin: get all lawyers
router.get("/lawyers", authenticateToken, authorizeRole("admin"), getAllLawyers);

// Admin: approve lawyer by ID
router.patch("/lawyer/:lawyerId/approve", authenticateToken, authorizeRole("admin"), approveLawyer);

// Admin: reject lawyer by ID
router.patch("/lawyer/:lawyerId/reject", authenticateToken, authorizeRole("admin"), rejectLawyer);


// Protect any route (login not required on /register, /login):
router.get("/profile", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});
// Admin-only example:
router.get("/feedback", authenticateToken, authorizeRole("admin"), getAllFeedback);
router.patch("/profile", authenticateToken, ProfileUpdate);
export default router;
