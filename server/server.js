import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import adminRoutes from "./routes/adminRoutes.js";
import caseRoutes from "./routes/caseRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import lawyerRoutes from "./routes/lawyerRoutes.js";
import path from "path";
import "./models/User.js";
import "./models/Case.js";
// app.js or server.js
import clientRoutes from "./routes/clientRoutes.js";

import verificationRoutes from "./routes/verificationRoutes.js";



// ...rest of server config

dotenv.config();

console.log("Loaded environment variables:", {
  MONGO_URI: process.env.MONGO_URI,
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
});

const app = express();
app.use(express.json());


app.use("/api/verify", verificationRoutes);

app.use("/feedback", feedbackRoutes);

app.use("/lawyers", lawyerRoutes);

// Middleware

app.use(cors());
app.use(morgan("dev"));
app.use("/messages", messageRoutes);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/cases", caseRoutes);
app.use("/client", clientRoutes);

app.use("/admin", adminRoutes);
app.use("/", authRoutes);  // This exposes /register and /login as POST endpoints
// Base route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// MongoDB connect
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
