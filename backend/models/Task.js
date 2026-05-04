import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },

    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "low"
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    comments: [commentSchema],
    status: {
  type: String,
  enum: ["pending", "completed", "failed"],
  default: "pending"
},

deadline: {
  type: Date
},
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    attachments: [
  {
    fileName: String,
    fileUrl: String
  }
]
  },
  
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);