import mongoose from "mongoose";
import Task from "../models/Task.js";



// ✅ ADMIN: Create Task
export const createTask = async (req, res) => {
  try {
const { title, description, priority, assignedTo, deadline } = req.body;

   const files = req.files;

    const attachments = files?.map(file => ({
      fileName: file.originalname,
      fileUrl: `/uploads/${file.filename}`
    })) || [];

  const task = await Task.create({
  title,
  description,
  priority,
  deadline, // ✅ NEW
  assignedTo: new mongoose.Types.ObjectId(assignedTo),
  createdBy: req.user._id,
  attachments
});
    res.status(201).json(task);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ EMPLOYEE: Get My Tasks
export const getMyTasks = async (req, res) => {
  try {
  const userId = new mongoose.Types.ObjectId(
      req.user._id || req.user.id
    );
    // ✅ STEP 1: Auto mark failed tasks FIRST
    await Task.updateMany(
      {
        assignedTo: req.user._id,
        status: "pending",
        deadline: { $lt: new Date() }
      },
      { status: "failed" }
    );

    let tasks;

    if (req.user.role === "admin") {
      // ✅ Admin sees ALL tasks
      tasks = await Task.find().sort({ createdAt: -1 });
    } else {
      // ✅ Employee sees all assigned tasks (ALL statuses)
      tasks = await Task.find({
        assignedTo: userId
      }).sort({ createdAt: -1 });
    }
 
    res.json(tasks);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body; // completed / failed

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// controllers/TaskController.js


export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: "Comment text is required" });

    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    task.comments.push({ user: req.user._id, text });
    await task.save();

    // ✅ populate just the new comment's user before returning
    const updated = await Task.findById(task._id)
      .populate("comments.user", "name email");

    const newComment = updated.comments[updated.comments.length - 1];
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate("comments.user", "name email");
    if (!task) return res.status(404).json({ error: "Task not found" });

    res.json(task.comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const comment = task.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    // ✅ only the comment author or an admin can delete
    const isAuthor = String(comment.user) === String(req.user._id);
    const isAdmin  = req.user.role === "admin";
    if (!isAuthor && !isAdmin) return res.status(403).json({ error: "Not allowed" });

    comment.deleteOne();
    await task.save();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};