// routes/verificationRoutes.js
import express from "express";
import {
  sendEmailVerification,
  verifyEmailCode
} from "../controllers/verificationController.js";

const router = express.Router();

router.post("/send-code", sendEmailVerification); // POST /send-code {email}
router.post("/verify-code", verifyEmailCode);     // POST /verify-code {email, code}

export default router;
