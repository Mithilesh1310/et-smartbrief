/**
 * ET SmartBrief — routes/chatRoute.js
 * POST /chat
 * Stateful Q&A with full briefing context
 */
const express = require("express");
const { qaAgent } = require("../services/agentService");

const router = express.Router();

router.post("/", async (req, res) => {
  const { sessionId, question } = req.body;

  if (!sessionId) return res.status(400).json({ error: "sessionId required" });
  if (!question || question.trim().length < 2) {
    return res.status(400).json({ error: "question required (min 2 chars)" });
  }

  const session = req.sessionStore.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: "Session not found or expired. Please generate a new briefing." });
  }

  const cleanQuestion = question.trim().slice(0, 500);

  try {
    // Append user message to history
    session.history.push({ role: "user", content: cleanQuestion });

    const chatResponse = await qaAgent(
      cleanQuestion,
      session.briefing,
      session.history,
      session.topic
    );

    // Append assistant response
    session.history.push({ role: "assistant", content: chatResponse.answer });

    // Keep history bounded (last 20 messages)
    if (session.history.length > 20) {
      session.history = session.history.slice(-20);
    }

    res.json({
      answer: chatResponse.answer || "",
      related_insight: chatResponse.related_insight || "",
      confidence: chatResponse.confidence || "Medium",
      confidence_score: chatResponse.confidence_score || 67,
      historyLength: session.history.length,
    });
  } catch (err) {
    console.error("[/chat error]", err.message);
    res.status(500).json({ error: "Chat failed: " + err.message });
  }
});

module.exports = router;
