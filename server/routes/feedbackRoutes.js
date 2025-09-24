import express from "express";
import { createFeedback, getAllFeedback } from "../controllers/feedbackController.js";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/", authenticateToken, createFeedback);            // Any user can send
router.get("/", authenticateToken,getAllFeedback);  // Only admin gets all

export default router;

