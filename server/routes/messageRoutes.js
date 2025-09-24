import express from "express";
import { sendMessage, getMessages } from "../controllers/MessageController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/:caseId/send", authenticateToken, sendMessage);
router.get("/:caseId", authenticateToken, getMessages);

export default router;
