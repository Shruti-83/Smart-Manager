import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
const onlineUsers = new Map(); // userId -> socketId
import { Server } from "socket.io";

import { connectDB } from "./config/db.js";
import router from "./routes/AuthRoutes.js";
import TaskRoutes from "./routes/TaskRoutes.js";
import ChatRoutes from "./routes/ChatRoutes.js";
import Message from "./models/Chat.js"; // ✅ Updated import

dotenv.config();
connectDB();

const app = express(); // ✅ FIRST create app

// ✅ middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ✅ routes
app.use("/api/auth", router);
app.use("/api/tasks", TaskRoutes);
app.use("/api/chat", ChatRoutes);
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("API is running");
});

// ✅ CREATE SERVER (after app)
const server = http.createServer(app);

// ✅ SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true
  }
});
app.set("io", io);
// ✅ SOCKET EVENTS
io.on("connection", (socket) => {

  //JOIN ROOM
  socket.on("joinRoom", (userId) => {
    if (!userId) return;

    socket.join(userId);

    onlineUsers.set(userId.toString(), socket.id);

    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  //SEND MESSAGE
  socket.on("sendMessage", async (data) => {
    const newMessage = await Message.create({
      sender: data.senderId,
      receiver: data.receiverId,
      message: data.message || "",
      fileUrl: data.fileUrl || "",
      fileType: data.fileType || "",
      status: "sent",
    });

    io.to(data.receiverId).emit("receiveMessage", newMessage);

    const isOnline = onlineUsers.has(data.receiverId.toString());

    if (isOnline) {
      newMessage.status = "delivered";
      await newMessage.save();

      io.to(data.senderId).emit("messageStatusUpdate", {
        messageId: newMessage._id,
        status: "delivered",
      });
    }

    io.to(data.senderId).emit("receiveMessage", newMessage);
  });

  // ✅ TYPING START
  socket.on("typing", ({ senderId, receiverId }) => {
   socket.to(receiverId).emit("typing", { senderId });
  });

  // ✅ TYPING STOP
  socket.on("stopTyping", ({ senderId, receiverId }) => {
    socket.to(receiverId).emit("stopTyping", { senderId });
  });

  //mark seen
  socket.on("markSeen", async ({ senderId, receiverId }) => {
    await Message.updateMany(
      {
        sender: senderId,
        receiver: receiverId,
        status: { $ne: "seen" },
      },
      { status: "seen" }
    );

    io.to(senderId).emit("messagesSeen", {
      senderId,
    });
  });

  //DISCONNECT MESSAGE
  socket.on("disconnect", () => {
    for (let [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }

    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });
});

// ❗ IMPORTANT: use server.listen NOT app.listen
server.listen(process.env.PORT, () => {
  console.log("Server running on PORT " + process.env.PORT);
});