// Admin uploads certificate to lawyer, or lawyer can upload their own
// controllers/lawyerController.js
import User from "../models/User.js";
import Case from "../models/Case.js";

// --- Add this whole function ---
export const searchLawyers = async (req, res) => {
  try {
    const { name, location } = req.query;
    let query = { role: "lawyer", approved: true };
    if (name) query.name = { $regex: name, $options: "i" };
    if (location) query.location = { $regex: location, $options: "i" };
    const lawyers = await User.find(query).select("-password");
    res.json(lawyers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// --- Keep your existing export for uploadCertificate below ---

export const uploadCertificate = async (req, res) => {
  try {
    const { lawyerId } = req.params;
    const lawyer = await User.findOne({ _id: lawyerId, role: "lawyer" });
    if (!lawyer) return res.status(404).json({ error: "Lawyer not found" });

    // Only admin or the lawyer themself
    if (
      !(
        req.user.role === "admin" ||
        req.user._id.toString() === lawyerId
      )
    ) return res.status(403).json({ error: "Forbidden" });

    lawyer.certificates.push(`/uploads/${req.file.filename}`);
    await lawyer.save();
    res.json({ message: "Certificate uploaded", certificates: lawyer.certificates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get current lawyer profile
export const getLawyerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update current lawyer profile
export const updateLawyerProfile = async (req, res) => {
  try {
    // Only lawyer themself can update
    if (req.user.role !== "lawyer") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { name, phone, location } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, location },
      { new: true }
    ).select("-password");
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get lawyer's cases (ongoing and completed)
export const getLawyerCases = async (req, res) => {
  try {
    if (req.user.role !== "lawyer") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const cases = await Case.find({ lawyer: req.user._id, status: { $in: ["ongoing", "completed"] } })
      .populate("client", "name email")
      .sort({ updatedAt: -1 });
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get lawyer's feedback (reviews from clients)
export const getLawyerFeedback = async (req, res) => {
  try {
    if (req.user.role !== "lawyer") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const cases = await Case.find({ lawyer: req.user._id, "review.rating": { $exists: true } })
      .populate("client", "name")
      .select("review client");
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
