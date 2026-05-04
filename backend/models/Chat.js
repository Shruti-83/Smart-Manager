import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: String, // ✅ FIXED
   fileUrl: String,     // 🔥 file/image URL
  fileType: String,    // 🔥 "image", "pdf", "doc", etc.

  status: {
  type: String,
  enum: ["sent", "delivered", "seen"],
  default: "sent",
}
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);