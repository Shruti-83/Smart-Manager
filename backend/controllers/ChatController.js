// controllers/chatController.js
import Message from "../models/Chat.js";
import User from "../models/User.js";

export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getChatUsers = async (req, res) => {
  try {
    let users;

    if (req.user.role === "admin") {
      // admin → see all except himself
      users = await User.find({ _id: { $ne: req.user._id } });
    } else {
      // user → see only admins
      users = await User.find({ role: "admin" });
    }

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const sendFileMessage = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      status: "sent",
    });

    // ✅ populate sender so receiver can identify who sent it
    const populated = await Message.findById(newMessage._id)
      .populate("sender", "name email")
      .populate("receiver", "name email");

    // ✅ emit to receiver's room only
    const io = req.app.get("io");
    io.to(receiverId).emit("receiveMessage", populated);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};