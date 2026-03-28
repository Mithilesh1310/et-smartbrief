/**
 * ET SmartBrief — server.js
 * Main Express server with session management
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const analyzeRoute = require("./routes/analyzeRoute");
const chatRoute = require("./routes/chatRoute");

const app = express();
const PORT = process.env.PORT || 5000;


// ── Middleware ────────────────────────────────────────────────────────────────

// Allow both local + deployed frontend
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://et-smartbrief.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS not allowed"));
    }
  },
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json({ limit: "2mb" }));


// ── Session store (in-memory, production: use Redis) ─────────────────────────
const sessionStore = new Map();

// Attach session store to every request
app.use((req, _res, next) => {
  req.sessionStore = sessionStore;
  next();
});


// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/analyze", analyzeRoute);
app.use("/chat", chatRoute);


// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    sessions: sessionStore.size,
    ts: new Date().toISOString()
  });
});

// Optional root route (for browser testing)
app.get("/", (_req, res) => {
  res.send("🚀 ET SmartBrief Backend is Live");
});


// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[ET SmartBrief Error]", err.message);
  res.status(500).json({ error: err.message || "Internal server error" });
});


// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 ET SmartBrief backend running on port ${PORT}`);
  console.log(`   POST /analyze  → Generate intelligence briefing`);
  console.log(`   POST /chat     → Interactive follow-up chat\n`);
});