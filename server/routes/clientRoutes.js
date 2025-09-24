import express from "express";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Case from "../models/Case.js";

const router = express.Router();

// Get current client profile
router.get("/profile", authenticateToken, authorizeRole("client"), async (req, res) => {
  try {
    // Fetch the latest user from DB
    const user = await User.findById(req.user._id).select("-password"); // exclude password
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update current client profile
// Update current client profile
router.patch(
  "/profile",
  authenticateToken,
  authorizeRole("client"),
  async (req, res) => {
    try {
      const { name, phone, location } = req.body;
      console.log("Updating profile for user:", req.user._id, "with data:", {
        name,
        phone,
        location,
      });

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { name, phone, location }, // ✅ allow phone too
        { new: true }
      ).select("-password");

      console.log("Profile updated successfully:", updatedUser);
      res.json({ user: updatedUser });
    } catch (err) {
      console.error("Error updating profile:", err);
      res.status(500).json({ error: err.message });
    }
  }
);


// Get all cases for the current client
router.get("/cases", authenticateToken, authorizeRole("client"), async (req, res) => {
  try {
    const cases = await Case.find({ client: req.user._id })
      .populate('lawyer', 'name email')
      .sort({ updatedAt: -1 });
    
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
