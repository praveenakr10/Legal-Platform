import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: "Case", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Message", messageSchema);
