/**
 * ET SmartBrief — routes/analyzeRoute.js
 * POST /analyze
 * Triggers the 4-agent intelligence pipeline
 */
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { runPipeline } = require("../services/agentService");

const router = express.Router();

router.post("/", async (req, res) => {
  const { topic, mode = "General" } = req.body;

  if (!topic || typeof topic !== "string" || topic.trim().length < 2) {
    return res.status(400).json({ error: "topic is required (min 2 chars)" });
  }

  const cleanTopic = topic.trim().slice(0, 300);
  const validModes = ["General", "Investor", "Student", "Beginner"];
  const cleanMode = validModes.includes(mode) ? mode : "General";

  try {
    const briefing = await runPipeline(cleanTopic, cleanMode);

    // Create a session for follow-up chat
    const sessionId = uuidv4();
    req.sessionStore.set(sessionId, {
      topic: cleanTopic,
      mode: cleanMode,
      briefing,
      history: [],
      createdAt: Date.now(),
    });

    // Auto-expire session after 2 hours
    setTimeout(() => req.sessionStore.delete(sessionId), 7200000);

    res.json({ sessionId, topic: cleanTopic, mode: cleanMode, ...briefing });
  } catch (err) {
    console.error("[/analyze error]", err.message);
    res.status(500).json({ error: "Pipeline failed: " + err.message });
  }
});

module.exports = router;
