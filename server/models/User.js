// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ["client", "lawyer", "admin"], required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dob:{type: Date, required: true},
  gender:{type: String,enum:["Female","Male","Other"],required: true},
  location: { type: String } ,
  certificates: [String], // for lawyer
  approved: { type: Boolean, default: false }, // only for lawyer
  ratings: { type: Number, default: 0 },
  locked: { type: Boolean, default: false },
});

export default mongoose.model("User", userSchema);
