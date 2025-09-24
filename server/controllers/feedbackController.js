import Feedback from "../models/Feedback.js";

// Any logged-in user sends feedback
export const createFeedback = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    const feedback = new Feedback({ user: req.user._id, message });
    await feedback.save();
    res.status(201).json({ message: "Feedback sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin gets all feedback
// controllers/feedbackController.js


export const getAllFeedback = async (req, res) => {
  try {
    // Only allow admin users
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    // Optionally, populate user info for more details
    const feedbacks = await Feedback.find().populate("user", "name email");
    res.json({ feedbacks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
