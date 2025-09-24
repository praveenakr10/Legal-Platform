// controllers/authController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
// Simple email regex example (production apps might use more advanced validation!)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, type,dob,gender } = req.body;

    // Validate email format
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate phone: only digits, length check, etc. (expand as needed)
    if (!phone || !/^\d{8,15}$/.test(phone)) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    // Check for existing email
    const existingEmail = await User.findOne({ email });
    if (existingEmail)
      return res.status(400).json({ error: "Email already registered" });

    // Check for existing phone
    const existingPhone = await User.findOne({ phone });
    if (existingPhone)
      return res.status(400).json({ error: "Phone number already registered" });
    if (!dob) {
      return res.status(400).json({ error: "Date of birth is required" });
    }
    const birthDate = new Date(dob);
    if (isNaN(birthDate)) {
      return res.status(400).json({ error: "Invalid date of birth" });
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--; // adjust if birthday hasn't happened yet this year
    }

    if (age < 18) {
      return res.status(400).json({ error: "You must be at least 18 years old to register" });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let userRole = "client";
    if (type === "lawyer") userRole = "lawyer";

    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: userRole,
      dob,
      gender
    });

    await user.save();
    res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const JWT_SECRET = process.env.JWT_SECRET || "supersecret!"; // Use .env in production

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find user
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "User not found" });

    // Check password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ error: "Invalid password" });

    // Sign JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
