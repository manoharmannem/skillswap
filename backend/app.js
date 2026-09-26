import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { seedDatabase } from "./seed.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import practiceRoutes from "./routes/practiceRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import connectionRoutes from "./routes/connectionRoutes.js";

dotenv.config();

const app = express();

const allowedOrigin =
  process.env.FRONTEND_URL ||
  "https://skillswap-59xb-eeei74mqa-titan-4daf.vercel.app";

const corsOptions = {
  origin: allowedOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "1mb" }));

let databaseReadyPromise;
let seedReadyPromise;

async function ensureDatabase() {
  if (!databaseReadyPromise) {
    databaseReadyPromise = connectDB();
  }
  await databaseReadyPromise;

  if (!seedReadyPromise) {
    seedReadyPromise = seedDatabase().catch((error) => {
      seedReadyPromise = null;
      console.error("SkillSwap seed failed:", error.message);
      throw error;
    });
  }
  await seedReadyPromise;
}

app.get("/", async (req, res) => {
  try {
    await ensureDatabase();
    res.json({ message: "SkillSwap API is running" });
  } catch (error) {
    res.status(500).json({ message: "Database initialization failed" });
  }
});

app.get("/api/health", async (req, res) => {
  try {
    await ensureDatabase();
    res.json({ ok: true, service: "skillswap-api", database: "mongodb" });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Database initialization failed" });
  }
});

app.use(async (req, res, next) => {
  try {
    await ensureDatabase();
    next();
  } catch (error) {
    console.error("Database initialization failed:", error.message);
    res.status(500).json({ message: "Database initialization failed" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/practice", practiceRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/connections", connectionRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

export default app;
