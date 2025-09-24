import express from "express";
import { createCase, addMeeting, getCaseById, getPendingCasesForLawyer, handleConsultationRequest } from "../controllers/caseController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { updateMeetingForCase,updateCaseStatus,rateAndReviewCase,getMeetingsForCase, uploadDocumentToCase  } from "../controllers/caseController.js";
import { deleteMeetingFromCase, GetClientCases} from "../controllers/caseController.js";



const router = express.Router();

// Get all pending cases for lawyer
router.get("/pending", authenticateToken, getPendingCasesForLawyer);
// PATCH /cases/:caseId/status
router.patch("/:caseId/status", authenticateToken, updateCaseStatus);

router.patch("/:caseId/meetings/:meetingId", authenticateToken, updateMeetingForCase);
router.delete("/:caseId/meetings/:meetingId", authenticateToken, deleteMeetingFromCase);
// Client rates/reviews completed case
router.post("/:caseId/rate", authenticateToken, rateAndReviewCase);

// Only authenticated users can create a case
router.post("/", authenticateToken, createCase);
router.post("/:caseId/meetings", authenticateToken, addMeeting);
router.get("/:caseId", authenticateToken, getCaseById);
router.get("/:caseId/meetings", authenticateToken, getMeetingsForCase);
// Accept/reject case request (lawyer only)
router.patch("/:caseId/consultation", authenticateToken, handleConsultationRequest);
// Upload legal document to a case (client or lawyer must be logged in)
router.post("/:caseId/upload", authenticateToken, upload.single("document"), uploadDocumentToCase);
export default router;
// Add route to get cases for current client
router.get("/client", authenticateToken, GetClientCases);