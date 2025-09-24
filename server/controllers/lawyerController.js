// Admin uploads certificate to lawyer, or lawyer can upload their own
// controllers/lawyerController.js
import User from "../models/User.js";

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

// controllers/lawyerController.js
export const updateLawyerProfile = async (req, res) => {
  try {
    // Only lawyer themself can update
    if (req.user.role !== "lawyer" || req.user._id.toString() !== req.params.lawyerId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { location } = req.body;
    const lawyer = await User.findByIdAndUpdate(req.params.lawyerId, { location }, { new: true });
    res.json(lawyer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
