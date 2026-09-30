import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
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

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  return (
    /^https:\/\/skillswap(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(origin) ||
    /^http:\/\/localhost(?::\d+)?$/i.test(origin) ||
    /^http:\/\/127\.0\.0\.1(?::\d+)?$/i.test(origin) ||
    origin === process.env.FRONTEND_URL
  );
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS origin not allowed"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));

let databaseReadyPromise;

async function ensureDatabase() {
  if (!databaseReadyPromise) {
    databaseReadyPromise = connectDB();
  }
  await databaseReadyPromise;
}

app.get("/", async (req, res) => {
  try {
    await ensureDatabase();
    res.json({ message: "SkillSwap API is running" });
  } catch (error) {
    console.error("Root database initialization failed:", error);
    res.status(500).json({ message: "Database initialization failed" });
  }
});

app.get("/api/health", async (req, res) => {
  try {
    await ensureDatabase();
    res.json({ ok: true, service: "skillswap-api", database: "mongodb" });
  } catch (error) {
    console.error("Health database initialization failed:", error);
    res.status(500).json({ ok: false, message: "Database initialization failed" });
  }
});

app.use(async (req, res, next) => {
  try {
    await ensureDatabase();
    next();
  } catch (error) {
    console.error("Database initialization failed:", error);
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
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

export default app;
