/**
 * ET SmartBrief — hooks/useApi.js
 * Production-ready API calls
 */

const BASE = import.meta.env.VITE_API_URL;

// ── Generate Brief ─────────────────────────────────────
export async function generateBriefing(topic, mode) {
  const res = await fetch(`${BASE}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ topic, mode }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ── Chat ───────────────────────────────────────────────
export async function sendChatMessage(sessionId, question) {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionId, question }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}