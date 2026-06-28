import { startWorker } from "./worker";
import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import path from "path";
import mongoose from "mongoose";
import { setupWebSocket } from "./lib/websocket";
import assignmentRoutes from "./routes/assignments";
import authRoutes from "./routes/auth";
import groupRoutes from "./routes/groups";
import libraryRoutes from "./routes/library";
import toolkitRoutes from "./routes/toolkit";
import fs from "fs";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

const app = express();
const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

// Create uploads directory
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// ─── Middleware ────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowedOrigins = (
        process.env.FRONTEND_URL || "http://localhost:3000"
      )
        .split(",")
        .map((value) => value.trim());
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ─── Routes ───────────────────────────────────────────────────
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
      success: false,
      error: "Too many authentication attempts. Please try again later.",
    },
  }),
  authRoutes,
);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/toolkit", toolkitRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── HTTP + WebSocket server ───────────────────────────────────
const server = http.createServer(app);
setupWebSocket(server);

// ─── Connect MongoDB → start server ───────────────────────────
async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);

    console.log("✅ Connected to MongoDB");

    // Start BullMQ worker
    await startWorker();

    server.listen(PORT, () => {
      console.log(`✅ API server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup failed:", err);
    process.exit(1);
  }
}

main();
