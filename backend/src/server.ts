import "dotenv/config";
import express          from "express";
import cors             from "cors";
import helmet           from "helmet";
import compression      from "compression";
import morgan           from "morgan";
import rateLimit        from "express-rate-limit";
import { PrismaClient } from "@prisma/client";

// Routes
import authRoutes         from "./routes/auth";
import albumRoutes        from "./routes/albums";
import trackRoutes        from "./routes/tracks";
import artistRoutes       from "./routes/artists";
import searchRoutes       from "./routes/search";
import subscriptionRoutes from "./routes/subscriptions";
import libraryRoutes      from "./routes/library";
import genreRoutes        from "./routes/genres";
import homeRoutes         from "./routes/home";
import uploadRoutes       from "./routes/upload";
import webhookRoutes      from "./routes/webhooks";

import { errorHandler } from "./middleware/errorHandler";
import { logger }       from "./config/logger";

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
});

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin:      process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
  credentials: true,
  methods:     ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));

// ── Stripe webhooks need raw body ─────────────────────────────────────────────
app.use("/api/webhooks/stripe", express.raw({ type: "application/json" }));

// ── General parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(compression());

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined", {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }));
}

// ── Rate limiting ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      200,
  message:  { success: false, message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders:   false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  { success: false, message: "Too many auth attempts." },
});

app.use("/api", globalLimiter);
app.use("/api/auth", authLimiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), version: "1.0.0" });
});

// ── API routes ────────────────────────────────────────────────────────────────
const API = "/api";
app.use(`${API}/auth`,          authRoutes);
app.use(`${API}/albums`,        albumRoutes);
app.use(`${API}/tracks`,        trackRoutes);
app.use(`${API}/artists`,       artistRoutes);
app.use(`${API}/search`,        searchRoutes);
app.use(`${API}/subscriptions`, subscriptionRoutes);
app.use(`${API}/library`,       libraryRoutes);
app.use(`${API}/genres`,        genreRoutes);
app.use(`${API}/home`,          homeRoutes);
app.use(`${API}/upload`,        uploadRoutes);
app.use(`${API}/webhooks`,      webhookRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────────
async function start() {
  try {
    await prisma.$connect();
    logger.info("✅ Database connected");

    app.listen(PORT, () => {
      logger.info(`🚀 Soundwave API running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  } catch (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  }
}

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully…");
  await prisma.$disconnect();
  process.exit(0);
});

start();

export default app;
