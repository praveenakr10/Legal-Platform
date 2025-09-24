// models/Case.js
import mongoose from "mongoose";


const meetingSchema = new mongoose.Schema({
  platform: { type: String, default: "Zoom" }, // or "Google Meet", etc.
  date: { type: Date, required: true },        // scheduled meeting datetime
  link: { type: String, required: true },      // meeting link (now required)
  agenda: { type: String },                    // agenda or topic
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // who scheduled
  notes: { type: String },                     // optional meeting notes
  status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" }
}, { _id: true, timestamps: true });


const caseSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  lawyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "ongoing", "completed","rejected"], default: "pending" },
  documents: [String],
  progress: String,
  meetings: [meetingSchema],   // 👈 multiple meetings stored here
  review: {
  rating: Number,
  review: String,
  client: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
},

}, { timestamps: true });

export default mongoose.model("Case", caseSchema);
