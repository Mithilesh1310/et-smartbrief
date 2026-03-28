# ET SmartBrief — AI-Native News Intelligence Platform

> **Never read multiple articles again.** Enter any topic. Our 4-agent AI pipeline generates a complete intelligence briefing in seconds.

---

## Architecture

```
et-smartbrief/
├── backend/
│   ├── server.js                  # Express entry point + session store
│   ├── package.json
│   ├── .env.example
│   ├── routes/
│   │   ├── analyzeRoute.js        # POST /analyze  → triggers pipeline
│   │   └── chatRoute.js           # POST /chat     → stateful Q&A
│   └── services/
│       ├── aiService.js           # OpenAI API wrapper (JSON mode)
│       └── agentService.js        # 4-agent pipeline + Q&A agent
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── App.module.css
        ├── index.css
        ├── hooks/
        │   └── useApi.js           # fetch wrappers for backend
        └── components/
            ├── TopicInput.jsx      # Input + mode selector + sample chips
            ├── BriefCard.jsx       # Executive summary card
            ├── HighlightsList.jsx  # Highlights + context + ELI12
            ├── InsightPanel.jsx    # Bull/Bear/Outlook/Risks grid
            ├── ChatBox.jsx         # Stateful follow-up chat
            └── PipelineVisual.jsx  # Animated agent pipeline display
```

---

## Multi-Agent Pipeline

```
User Topic
    │
    ▼
┌─────────────────┐
│ Summarizer Agent│  → punchy executive summary (2-3 sentences)
└────────┬────────┘
         │ summary
         ▼
┌─────────────────┐
│  Context Agent  │  → deep details + 5 highlights
└────────┬────────┘
         │ details + highlights
         ▼
┌─────────────────┐
│  Insight Agent  │  → bull/bear/outlook/risks/impact
└────────┬────────┘
         │ all insights
         ▼
┌─────────────────┐
│Simplifier Agent │  → explain like I'm 12
└────────┬────────┘
         │
         ▼
   Final Briefing (structured JSON)
         │
         ▼
   Session stored → Q&A Agent handles follow-up chat
```

Each agent is a **separate, real API call** with its own system prompt, persona, and responsibility. No faking.

---

## API Response Formats

### POST /analyze
**Request:**
```json
{ "topic": "Budget 2026", "mode": "Investor" }
```
**Response:**
```json
{
  "sessionId": "uuid-v4",
  "topic": "Budget 2026",
  "mode": "Investor",
  "summary": "...",
  "details": "...",
  "highlights": ["...", "...", "...", "...", "..."],
  "impact": "...",
  "bull_case": "...",
  "bear_case": "...",
  "future_outlook": "...",
  "risks": "...",
  "simple_explanation": "..."
}
```

### POST /chat
**Request:**
```json
{ "sessionId": "uuid-v4", "question": "What does this mean for retail investors?" }
```
**Response:**
```json
{
  "answer": "...",
  "related_insight": "...",
  "confidence": "High|Medium|Low",
  "historyLength": 4
}
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- A Google Gemini API key — get one free at https://aistudio.google.com/app/apikey

---

### Step 1 — Clone / Download the project

```bash
# If using git
git clone <your-repo-url> et-smartbrief
cd et-smartbrief
```

---

### Step 2 — Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and add your key:
```
PORT=5000
GEMINI_API_KEY=AIza...your-key-here...
GEMINI_MODEL=gemini-2.0-flash
GEMINI_FALLBACK_MODELS=gemini-2.0-flash-lite,gemini-1.5-flash
NODE_ENV=development
```

Start the backend:
```bash
npm run dev       # development (nodemon, auto-reload)
# OR
npm start         # production
```

Backend runs on: `http://localhost:5000`

---

### Step 3 — Frontend setup

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

The Vite proxy automatically forwards `/analyze` and `/chat` to the backend — no CORS issues.

---

### Step 4 — Open in browser

```
http://localhost:5173
```

---

## Demo Flow

1. Open `http://localhost:5173`
2. Type a topic (e.g. **"Budget 2026"**) or click a sample chip
3. Select a mode (General / Investor / Student / Beginner)
4. Click **⚡ Generate Brief**
5. Watch the 4-agent pipeline animate
6. Read your complete intelligence briefing:
   - Executive Summary
   - Key Highlights
   - Deep Context + Impact
   - Bull Case / Bear Case / Future Outlook / Risks
   - Explain Like I'm 12
7. Scroll to the **Chat** section and ask follow-up questions

---

## Sample Topics to Demo

| Topic | Mode |
|-------|------|
| Budget 2026 | Investor |
| AI startup funding India | General |
| Stock market crash | Investor |
| RBI interest rate policy | Student |
| India-China trade relations | General |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ | Your Google Gemini API key |
| `GEMINI_MODEL` | Optional | Primary Gemini model to try first |
| `GEMINI_FALLBACK_MODELS` | Optional | Comma-separated fallback models if the primary one is blocked/unavailable |
| `PORT` | Optional | Backend port (default: 5000) |
| `NODE_ENV` | Optional | `development` or `production` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | CSS Modules + CSS Variables |
| Backend | Node.js + Express |
| AI | Google Gemini 1.5 Flash (JSON mode) |
| State | In-memory session store (Map) |
| Fonts | Playfair Display + DM Sans + DM Mono |

---

## Notes

- Sessions auto-expire after 2 hours
- Chat history is bounded to last 20 messages per session
- All AI responses use `response_format: { type: "json_object" }` for guaranteed structured output
- The pipeline makes 4 sequential API calls; typical total time is 8–18 seconds
