import express from "express";
import { addComment, createTask, deleteComment, getComments, getMyTasks, updateTaskStatus } from "../controllers/TaskController.js";
import { protect } from "../middlewares/AuthMiddleware.js";
import { isAdmin } from "../middlewares/AuthorizeRoles.js";
import { upload } from "../config/multer.js";

const TaskRoutes = express.Router();

// Admin assigns task
TaskRoutes.post("/create-task", protect, isAdmin, upload.array("attachments", 5), createTask);

// Employee gets tasks
TaskRoutes.get("/my-tasks", protect, getMyTasks);

TaskRoutes.put("/update-status/:id", protect, updateTaskStatus);
TaskRoutes.post("/:taskId/comments", protect, addComment);
TaskRoutes.get("/:taskId/comments", protect, getComments);
TaskRoutes.delete("/:taskId/comments/:commentId", protect, deleteComment);

export default TaskRoutes;