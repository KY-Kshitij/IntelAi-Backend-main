import express from "express";
import cors from "cors";
import authRoutes from "./auth.js";
import chatRoutes from "./chats/index.js";
import chatByIdRoutes from "./chats/[id].js";
import userChatsRoutes from "./userChats.js";
import userProfileRoutes from "./userProfile.js";

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

// Route handlers
app.use("/api", authRoutes);
app.use("/api", chatRoutes);
app.use("/api", chatByIdRoutes);
app.use("/api", userChatsRoutes);
app.use("/api", userProfileRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "API is running" });
});

export default app;
