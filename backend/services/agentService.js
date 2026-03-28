const { complete } = require("./aiService");

const SHARED_AGENT_RULES = `
Avoid generic phrases like "may", "could", and "likely" unless uncertainty is unavoidable.
Be specific, confident, and insight-driven.
Do not pad with safe disclaimers.
Ground every answer in recognizable policy, market, sector, macro, or consumer signals.
When live data is unavailable, infer from structural trends and make the strongest defensible call.
`;

// 🔒 Safe JSON parser
function safeParse(text) {
  if (text && typeof text === "object") {
    return text;
  }

  if (typeof text !== "string") {
    return {};
  }

  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch (e) {
    console.error("Parse error:", text);
    return {};
  }
}

// ── Agent 1: Summarizer ─────────────────────────
async function summarizerAgent(topic, mode) {
  const system = `You are Summarizer Agent.
${SHARED_AGENT_RULES}
Write like a sharp analyst opening a briefing.
Return ONLY JSON.`;

  const user = `Topic: "${topic}"
Mode: "${mode}"

Return:
{
  "key_takeaway": "one-sentence headline insight",
  "summary": "2-3 sentence summary with concrete drivers, stakes, and who should care"
}`;

  const res = await complete(system, user, 300);
  return safeParse(res);
}

// ── Agent 2: Context ────────────────────────────
async function contextAgent(topic, summary, mode) {
  const system = `You are Context Agent.
${SHARED_AGENT_RULES}
Explain the forces behind the story with concrete economic, policy, or sector logic.
Highlights must be non-obvious takeaways, not generic restatements.
Return JSON only.`;

  const user = `Topic: "${topic}"
Summary: "${summary}"
Mode: "${mode}"

Return:
{
  "details": "3-4 tight paragraphs with concrete signal-based explanation",
  "highlights": ["5 insight-driven bullet points with implications"]
}`;

  const res = await complete(system, user, 800);
  return safeParse(res);
}

// ── Agent 3: Insight ────────────────────────────
async function insightAgent(topic, details, mode) {
  const system = `You are Insight Agent.
${SHARED_AGENT_RULES}
Think like a market strategist. Name winners, losers, catalysts, and second-order effects when relevant.
Return JSON only.`;

  const user = `Topic: "${topic}"
Context: "${details}"
Mode: "${mode}"

Return:
{
  "bull_case": "specific upside scenario",
  "bear_case": "specific downside scenario",
  "future_outlook": "clear next-phase outlook",
  "risks": "key execution or macro risks",
  "impact": "concrete business, consumer, or market impact",
  "who_should_care": ["3 practical audiences with why each should care"],
  "sector_winners": ["up to 4 winning sectors"],
  "sector_losers": ["up to 4 losing sectors"]
}`;

  const res = await complete(system, user, 800);
  return safeParse(res);
}

// ── Agent 4: Simplifier ─────────────────────────
async function simplifierAgent(topic, summary, mode) {
  const system = `Explain like a 12-year-old.
${SHARED_AGENT_RULES}
Use one vivid analogy and keep it concrete.
Return JSON only.`;

  const user = `Topic: "${topic}"
Summary: "${summary}"
Mode: "${mode}"

Return:
{ "simple_explanation": "" }`;

  const res = await complete(system, user, 300);
  return safeParse(res);
}

// ── PIPELINE ────────────────────────────────────
async function runPipeline(topic, mode = "general") {
  console.log(`[Pipeline] Start → ${topic}`);

  const trace = [];

  // Step 1
  trace.push("Summarizer Agent");
  const s1 = await summarizerAgent(topic, mode);

  // Step 2
  trace.push("Context Agent");
  const s2 = await contextAgent(topic, s1.summary, mode);

  // Step 3 + 4 (parallel 🚀)
  trace.push("Insight Agent");
  trace.push("Simplifier Agent");

  const [s3, s4] = await Promise.all([
    insightAgent(topic, s2.details, mode),
    simplifierAgent(topic, s1.summary, mode),
  ]);

  return {
    key_takeaway: s1.key_takeaway || s1.summary || "",
    summary: s1.summary || "",
    details: s2.details || "",
    highlights: s2.highlights || [],
    impact: s3.impact || "",
    bull_case: s3.bull_case || "",
    bear_case: s3.bear_case || "",
    future_outlook: s3.future_outlook || "",
    risks: s3.risks || "",
    who_should_care: s3.who_should_care || [],
    sector_winners: s3.sector_winners || [],
    sector_losers: s3.sector_losers || [],
    simple_explanation: s4.simple_explanation || "",
    trace
  };
}

// ── Q&A AGENT (UPGRADED) ───────────────────────
async function qaAgent(question, briefing, history, topic) {
  const system = `
You are ET SmartBrief Q&A Agent.
${SHARED_AGENT_RULES}
Answer sharply, using briefing context.
Start with the answer, then explain.
Favor concrete implications, sector effects, winners, losers, and market consequences.
Do not say "it depends" unless you immediately name the deciding variable.
Return ONLY JSON.
`;

  const historyText = history
    .slice(-6)
    .map(h => `${h.role}: ${h.content}`)
    .join("\n");

  const user = `
Topic: ${topic}

Summary: ${briefing.summary}
Details: ${briefing.details}
Bull: ${briefing.bull_case}
Bear: ${briefing.bear_case}

History:
${historyText}

Question: ${question}

Return:
{
  "answer": "",
  "related_insight": "",
  "confidence": "High|Medium|Low",
  "confidence_score": 0
}
`;

  const res = await complete(system, user, 500);
  const parsed = safeParse(res);
  const fallbackScore = parsed.confidence === "High" ? 84 : parsed.confidence === "Low" ? 41 : 67;
  const rawScore = Number(parsed.confidence_score);
  const normalizedScore = Number.isFinite(rawScore)
    ? (rawScore <= 1 ? rawScore * 100 : rawScore)
    : null;

  return {
    ...parsed,
    confidence_score: Number.isFinite(normalizedScore)
      ? Math.max(0, Math.min(100, Math.round(normalizedScore)))
      : fallbackScore,
  };
}

module.exports = { runPipeline, qaAgent };
