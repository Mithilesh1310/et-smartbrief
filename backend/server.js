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
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"] }));
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
  res.json({ status: "ok", sessions: sessionStore.size, ts: new Date().toISOString() });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[ET SmartBrief Error]", err.message);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n🚀 ET SmartBrief backend running on http://localhost:${PORT}`);
  console.log(`   POST /analyze  → Generate intelligence briefing`);
  console.log(`   POST /chat     → Interactive follow-up chat\n`);
});
