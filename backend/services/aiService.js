/**
 * ET SmartBrief — services/aiService.js
 * Core Gemini API wrapper with JSON response handling
 */
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function getCandidateModels() {
  const configuredModels = [
    process.env.GEMINI_MODEL,
    ...(process.env.GEMINI_FALLBACK_MODELS || "").split(","),
  ]
    .map((model) => model && model.trim())
    .filter(Boolean);

  const defaultModels = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
  ];

  return [...new Set([...configuredModels, ...defaultModels])];
}

function extractFirstJsonObject(text) {
  const start = text.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaping = false;

  for (let i = start; i < text.length; i += 1) {
    const char = text[i];

    if (escaping) {
      escaping = false;
      continue;
    }

    if (char === "\\") {
      escaping = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;

    if (depth === 0) {
      return text.slice(start, i + 1);
    }
  }

  return null;
}

function normalizeGeminiError(error, modelName) {
  const message = error?.message || "Unknown Gemini API error";

  if (message.includes("429") || /quota exceeded/i.test(message) || /Too Many Requests/i.test(message)) {
    const retryMatch = message.match(/retryDelay":"?(\d+)s"?/i) || message.match(/Please retry in ([\d.]+)s/i);
    const retryAfter = retryMatch ? Math.ceil(Number(retryMatch[1])) : null;
    const freeTierBlocked = /free[_\s-]?tier/i.test(message) && /limit:\s*0/i.test(message);

    return new Error(
      freeTierBlocked
        ? `Gemini quota is unavailable for model ${modelName} on this API key right now. The current key appears to have free-tier limit 0 for generateContent. Use a different Gemini API key, enable billing, or switch to a model/quota tier available to this project.`
        : retryAfter
          ? `Gemini quota exceeded for model ${modelName}. Try again in about ${retryAfter} seconds, or use a different API key / higher quota plan.`
          : `Gemini quota exceeded for model ${modelName}. Try again later, or use a different API key / higher quota plan.`
    );
  }

  if (message.includes("404") && message.includes("not found")) {
    return new Error(`Gemini model "${modelName}" is unavailable for this API key. Set GEMINI_MODEL to a supported model in your backend environment.`);
  }

  return error instanceof Error ? error : new Error(message);
}

function createModel(modelName, systemPrompt, maxTokens, useJsonMode = true) {
  return genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: systemPrompt,
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.7,
      ...(useJsonMode ? { responseMimeType: "application/json" } : {}),
    },
  });
}

function parseGeminiJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const cleaned = text.replace(/```json|```/g, "").trim();
    const extracted = extractFirstJsonObject(cleaned);
    if (extracted) return JSON.parse(extracted);
    throw new Error("Gemini returned non-JSON output: " + text.slice(0, 200));
  }
}

/**
 * Single completion call — always returns parsed JSON.
 * @param {string} systemPrompt
 * @param {string} userContent
 * @param {number} maxTokens
 * @returns {Promise<object>}
 */
async function complete(systemPrompt, userContent, maxTokens = 900) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
    throw new Error("Missing GEMINI_API_KEY in the backend environment");
  }

  const candidateModels = getCandidateModels();
  const errors = [];

  for (const modelName of candidateModels) {
    try {
      const model = createModel(modelName, systemPrompt, maxTokens, false);
      const result = await model.generateContent(userContent);
      const text = result.response.text();

      try {
        return parseGeminiJson(text);
      } catch {
        const fallbackModel = createModel(modelName, systemPrompt, maxTokens, false);
        const fallbackResult = await fallbackModel.generateContent(
        `${userContent}\n\nReturn one valid JSON object only. No markdown. No extra commentary.`
        );
        return parseGeminiJson(fallbackResult.response.text());
      }
    } catch (error) {
      errors.push(normalizeGeminiError(error, modelName).message);
    }
  }

  throw new Error(
    `All configured Gemini models failed. Tried: ${candidateModels.join(", ")}. Last errors: ${errors.join(" | ")}`
  );
}

module.exports = { complete };
