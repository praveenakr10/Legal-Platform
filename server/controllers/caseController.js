// controllers/caseController.js
import Case from "../models/Case.js";
import User from "../models/User.js";

// Client requests consultation (creates a new case)
export const createCase = async (req, res) => {
  try {
    const { lawyerId, documents, details } = req.body;

    // Ensure only a client can create a case
    if (req.user.role !== "client")
      return res.status(403).json({ error: "Only clients can create cases" });

    // Ensure lawyer exists and is approved
    const lawyer = await User.findOne({ _id: lawyerId, role: "lawyer", approved: true });
    if (!lawyer) return res.status(404).json({ error: "Lawyer not found or not approved" });

    const newCase = new Case({
      client: req.user._id,
      lawyer: lawyerId,
      status: "pending",
      documents: documents || [],
      progress: details || ""
    });

    await newCase.save();
    res.status(201).json(newCase);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const addMeeting = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { date, link, notes } = req.body;

    const updatedCase = await Case.findByIdAndUpdate(
      caseId,
      { $push: { meetings: { date, link, notes } } },
      { new: true }
    );

    if (!updatedCase) {
      return res.status(404).json({ error: "Case not found" });
    }

    res.json(updatedCase);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ New: get single case
export const getCaseById = async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.caseId)
      .populate("client", "name email")
      .populate("lawyer", "name email");

    if (!caseDoc) {
      return res.status(404).json({ error: "Case not found" });
    }

    res.json(caseDoc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// List pending cases for logged-in lawyer
export const getPendingCasesForLawyer = async (req, res) => {
  try {
    if (req.user.role !== "lawyer") return res.status(403).json({ error: "Forbidden" });
    const cases = await Case.find({ lawyer: req.user._id, status: "pending" })
      .populate("client", "name email");
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lawyer accepts/rejects case request
export const handleConsultationRequest = async (req, res) => {
  try {
    if (req.user.role !== "lawyer") return res.status(403).json({ error: "Forbidden" });
    const { caseId } = req.params;
    const { action } = req.body; // "accept" or "reject"
    const foundCase = await Case.findOne({ _id: caseId, lawyer: req.user._id });

    if (!foundCase) return res.status(404).json({ error: "Case not found" });

    if (action === "accept") foundCase.status = "ongoing";
    else if (action === "reject") foundCase.status = "rejected";
    else return res.status(400).json({ error: "Invalid action" });

    await foundCase.save();
    res.json(foundCase);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Upload document to a case
export const uploadDocumentToCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const fileUrl = `/uploads/${req.file.filename}`;

    // Attach document to the case; only if current user is client or lawyer on the case
    const foundCase = await Case.findById(caseId);
    if (!foundCase) return res.status(404).json({ error: "Case not found" });

    // Must be client or lawyer for that case
    if (
      !(
        foundCase.client.toString() === req.user._id.toString() ||
        foundCase.lawyer.toString() === req.user._id.toString()
      )
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    foundCase.documents.push(fileUrl);
    await foundCase.save();
    res.json({ message: "Document uploaded", documents: foundCase.documents });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Lawyer updates status and progress of a case
export const updateCaseStatus = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { status, progress } = req.body;
    
    // Only a lawyer assigned to that case can update
    if (req.user.role !== "lawyer")
      return res.status(403).json({ error: "Only lawyers can update case status" });

    const foundCase = await Case.findById(caseId);
    if (!foundCase) return res.status(404).json({ error: "Case not found" });
    if (foundCase.lawyer.toString() !== req.user._id.toString())
      return res.status(403).json({ error: "Forbidden" });
    
    // Optionally restrict to valid statuses
    if (status && !["pending", "ongoing", "completed", "rejected"].includes(status))
      return res.status(400).json({ error: "Invalid status" });

    if (status) foundCase.status = status;
    if (progress) foundCase.progress = progress;

    await foundCase.save();
    res.json({ message: "Case updated", case: foundCase });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Client rates and reviews a lawyer after completion
export const rateAndReviewCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { rating, review } = req.body;

    // Only the client can rate/review their case
    if (req.user.role !== "client")
      return res.status(403).json({ error: "Only clients can review" });

    const foundCase = await Case.findById(caseId);
    if (!foundCase) return res.status(404).json({ error: "Case not found" });

    // Ensure the user owns the case and it's completed
    if (
      foundCase.client.toString() !== req.user._id.toString() ||
      foundCase.status !== "completed"
    ) return res.status(403).json({ error: "Unauthorized" });

    // (Optional) Prevent multiple reviews for the same case
    if (foundCase.rating && foundCase.review) {
      return res.status(400).json({ error: "Review already submitted" });
    }

    foundCase.review = {
  rating,
  review,
  client: req.user._id,
  createdAt: new Date()
};

    await foundCase.save();

    // Update lawyer average rating
    const lawyerCases = await Case.find({
  lawyer: foundCase.lawyer,
  "review.rating": { $exists: true }
});
const sumRatings = lawyerCases.reduce((sum, c) => sum + (c.review?.rating || 0), 0);
const avgRating = lawyerCases.length
  ? sumRatings / lawyerCases.length
  : 0;


    // Save avgRating on the lawyer object (assumes 'ratings' field exists)
    await User.findByIdAndUpdate(foundCase.lawyer, { ratings: avgRating });

    // Send a clear successful response
    res.json({
      message: "Review submitted successfully.",
      case: {
        _id: foundCase._id,
        rating: foundCase.rating,
        review: foundCase.review
      },
      lawyerAvgRating: avgRating
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// controllers/caseController.js
export const getMeetingsForCase = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.caseId);
    if (!caseItem) return res.status(404).json({ error: "Case not found" });
    return res.json(caseItem.meetings);   // Always send valid JSON!
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
export const updateMeetingForCase = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.caseId);
    if (!caseItem) return res.status(404).json({ error: "Case not found" });

    // Find the meeting by meetingId
    const meeting = caseItem.meetings.id(req.params.meetingId);
    if (!meeting) return res.status(404).json({ error: "Meeting not found" });

    // Update allowed fields
    const updatable = ['date', 'link', 'agenda', 'notes', 'status'];
    for (const key of updatable) {
      if (req.body[key] !== undefined) meeting[key] = req.body[key];
    }

    await caseItem.save();
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const deleteMeetingFromCase = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.caseId);
    if (!caseItem) return res.status(404).json({ error: "Case not found" });

    // Remove meeting subdoc by ID
    caseItem.meetings.pull({ _id: req.params.meetingId });
    await caseItem.save();

    res.json({ message: "Meeting deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const GetClientCases = async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ error: 'Only clients can access this' });
    }

    const cases = await Case.find({ client: req.user._id })
      .populate('lawyer', 'name email')
      .sort({ updatedAt: -1 });

    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get cases by status for authenticated user (lawyer or client)
export const getCasesByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (req.user.role === 'lawyer') {
      query.lawyer = req.user._id;
      if (status) query.status = status;
      const cases = await Case.find(query)
        .populate('client', 'name email')
        .sort({ updatedAt: -1 });
      res.json(cases);
    } else if (req.user.role === 'client') {
      query.client = req.user._id;
      if (status) query.status = status;
      const cases = await Case.find(query)
        .populate('lawyer', 'name email')
        .sort({ updatedAt: -1 });
      res.json(cases);
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
