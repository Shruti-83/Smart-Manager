import express from "express";
import { getChatUsers, getMessages, sendFileMessage } from "../controllers/ChatController.js";
import { protect } from "../middlewares/AuthMiddleware.js";
import { upload } from "../config/multer.js";

const ChatRoutes = express.Router();

ChatRoutes.get("/messages/:userId", protect, getMessages);
ChatRoutes.get("/chat-users", protect, getChatUsers);
ChatRoutes.post("/send-file", protect, upload.single("file"), sendFileMessage);
export default ChatRoutes;