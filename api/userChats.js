import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import connectDb from "../lib/db.js";
import authMiddleware from "../lib/auth.js";
import newUserChats from "../backend/models/newUserChat.js";
import NewChat from "../backend/models/newChat.js";

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    "https://your-frontend.vercel.app", // Replace with your actual frontend URL
    "http://localhost:3000"
  ],
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions));
app.use(express.json());

// Add user chat
app.post("/api/userChats", authMiddleware, async (req, res) => {
  await connectDb();
  
  const userId = req.userId;
  
  try {
    const { chatId, message, date } = req.body;
    if (!chatId || !message) {
      return res.status(400).json({ message: "chatId and message are required" });
    }
    
    const user = await newUserChats.findOne({ userId: userId });

    if (!user) {
      const newUserChat = new newUserChats({
        _id: new mongoose.Types.ObjectId(),
        userId: userId,
        chats: [
          {
            chatId: chatId,
            message: message,
            date: date
          }
        ]
      });
      await newUserChat.save();
      res.json({ status: 201, message: "new User Chat added" });
    } else {
      user.chats.push({ chatId, message, date });
      await user.save();
      res.status(201).json({ message: "User chat added successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// Get user chats
app.get("/api/userChats", authMiddleware, async (req, res) => {
  await connectDb();
  
  const userId = req.userId;
  try {
    const userChats = await newUserChats.findOne({ userId });
    let messageCount = 0;
    
    if (userChats && userChats.chats && userChats.chats.length > 0) {
      for (let chat of userChats.chats) {
        const chatDoc = await NewChat.findById(chat.chatId);
        chat.messageCount = chatDoc ? (chatDoc.messages ? chatDoc.messages.length : 0) : 0;
        messageCount = chat.messageCount + messageCount;
      }
    }
    
    res.status(200).json({ chats: userChats.chats, messageCount: messageCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user profile", error });
  }
});

export default app;
