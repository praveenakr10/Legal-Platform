// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();
// Middleware to verify JWT token and attach user to req
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1]; // expects 'Bearer <token>'
  if (!token) return res.status(401).json({ error: "Token malformed" });

  try {
    // Verify JWT signature and get payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user in DB, exclude password
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ error: "User not found" });

    console.log("Authenticated user:", { id: user._id, role: user.role, locked: user.locked });

    // If admin has locked this account, block access
    if (user.locked) {
      return res.status(403).json({ error: "Account locked by admin" });
    }

    req.user = user; // Attach user to the request
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Middleware for role-based protection
// Usage: authorizeRole("admin"), authorizeRole("lawyer"), etc.
export const authorizeRole = (role) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  if (req.user.role !== role) {
    return res.status(403).json({ error: "Forbidden: Insufficient rights" });
  }
  next();
};

