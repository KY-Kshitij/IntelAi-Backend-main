import express from "express";
import cors from "cors";
import connectDb from "../lib/db.js";
import authMiddleware from "../lib/auth.js";
import UserProfile from "../backend/models/userProfile.js";
import User from "../backend/models/User.js";

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

// Get user profile
app.get("/api/userProfile", authMiddleware, async (req, res) => {
  await connectDb();
  
  const userId = req.userId;
  try {
    const userProfile = await UserProfile.findOne({ userId });
    res.status(200).json(userProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user profile", error });
  }
});

// Create user profile
app.post("/api/userProfile", authMiddleware, async (req, res) => {
  await connectDb();
  
  const userId = req.userId;
  try {
    const { name, email, phone, location, bio, avatar, date } = req.body;
    const userProfile = new UserProfile({ name, email, phone, location, bio, date, userId, avatar });
    await userProfile.save();
    res.status(201).json({ message: "User profile created", userProfile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user profile", error });
  }
});

// Update user profile
app.put("/api/userProfile", authMiddleware, async (req, res) => {
  await connectDb();
  
  const userId = req.userId;
  try {
    const { name, email, phone, location, bio, avatar, date } = req.body;
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { name, email, phone, location, bio, avatar, date },
      { new: true }
    );
    
    const user = await User.findById(userId);
    if (req.body.email !== user.email) {
      user.email = req.body.email;
      await user.save();
    }
    
    if (!updatedProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }
    
    res.status(201).json({ message: "User profile updated", userProfile: updatedProfile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user profile", error });
  }
});

export default app;
