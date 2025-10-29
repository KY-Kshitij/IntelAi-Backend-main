import express from "express";
import cors from "cors";
import connectDb from "../lib/db.js";
import authMiddleware from "../lib/auth.js";
import NewChat from "../../backend/models/newChat.js";

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

// Get chat by ID
app.get("/api/chats/:id", authMiddleware, async (req, res) => {
  await connectDb();
  
  const { id } = req.params;
  const userId = req.userId;
  
  try {
    const existingChat = await NewChat.findById(id);
    
    // Verify chat ownership
    if (!existingChat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    
    if (existingChat.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied: You don't have permission to view this chat" });
    }
    
    const messages = existingChat.messages || [];
    return res.status(200).json({ chats: messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add message to existing chat
app.post("/api/chats/:id", authMiddleware, async (req, res) => {
  await connectDb();
  
  const { id } = req.params;
  const { role, message, image, date } = req.body;
  const userId = req.userId;
  
  try {
    if (!userId) {
      return res.json({ status: 500, message: "Please Login First" });
    }
    
    const existingChat = await NewChat.findById(id);
    
    if (!existingChat) {
      return res.status(404).json({ status: 404, message: "Chat not found" });
    }
    
    // Verify chat ownership
    if (existingChat.userId.toString() !== userId.toString()) {
      return res.status(403).json({ status: 403, message: "Access denied: You don't have permission to modify this chat" });
    }
    
    existingChat.messages.push({
      role: role,
      messages: message,
      images: image ? image : "",
      date: date
    });
    await existingChat.save();
    res.json({ status: 201, message: "Existing Chat updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default app;
