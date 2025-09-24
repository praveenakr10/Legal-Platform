import User from "../models/User.js";

// Get all lawyers (optionally filter by approval)
export const getAllLawyers = async (req, res) => {
  try {
    const lawyers = await User.find({ role: "lawyer" });
    res.json(lawyers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve a lawyer registration
export const approveLawyer = async (req, res) => {
  try {
    const lawyer = await User.findById(req.params.lawyerId);
    if (!lawyer || lawyer.role !== "lawyer") {
      return res.status(404).json({ error: "Lawyer not found" });
    }
    lawyer.approved = true;
    await lawyer.save();
    res.json({ message: "Lawyer approved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reject a lawyer registration
export const rejectLawyer = async (req, res) => {
  try {
    const lawyer = await User.findById(req.params.lawyerId);
    if (!lawyer || lawyer.role !== "lawyer") {
      return res.status(404).json({ error: "Lawyer not found" });
    }
    lawyer.approved = false;
    await lawyer.save();
    res.json({ message: "Lawyer rejected" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Admin can lock/unlock any user


// Admin: Lock/Unlock a user's account (toggle)
export const toggleUserLock = async (req, res) => {
  try {
    const { userId } = req.params;

    // Don't allow admin to lock themselves (optional good practice)
    if (req.user._id.toString() === userId) {
      return res.status(400).json({ error: "Admin cannot lock/unlock themselves" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.locked = !user.locked;
    await user.save();

    res.json({
      message: user.locked ? "User account locked" : "User account unlocked",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        locked: user.locked,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const ProfileUpdate = async (req, res) => {
  try {
    const { name, location } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, location },
      { new: true }
    ).select('-password');
    
    res.json({ user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
