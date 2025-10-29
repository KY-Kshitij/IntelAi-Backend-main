import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import connectDb from "../lib/db.js";
import authMiddleware from "../lib/auth.js";
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

// Create new chat
app.post("/api/chats", authMiddleware, async (req, res) => {
  await connectDb();
  
  const { role, message, image, date } = req.body;
  const userId = req.userId;
  
  try {
    const newChat = new NewChat({
      _id: new mongoose.Types.ObjectId(),
      userId: userId,
      messages: [
        {
          role: role,
          messages: message,
          images: image ? image : "",
          date: date,
        },
      ],
    });
    await newChat.save();
    res.json({ status: 201, message: "New Chat created", chatId: newChat._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete all chats (admin function)
app.delete("/api/chats", async (req, res) => {
  await connectDb();
  
  try {
    const result = await NewChat.deleteMany({});
    res.status(200).json({ message: "All chats deleted successfully", deletedCount: result.deletedCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting chats", error });
  }
});

export default app;
