/**
 * ET SmartBrief — components/TopicInput.jsx
 */
import { useState } from "react";
import styles from "./TopicInput.module.css";

const SAMPLE_TOPICS = [
  "Budget 2026",
  "AI startup funding India",
  "Stock market crash",
  "RBI interest rate policy",
  "India-China trade relations",
  "Sensex all-time high",
];

const MODES = [
  { id: "General", icon: "◈", desc: "Balanced overview" },
  { id: "Investor", icon: "▲", desc: "Market lens" },
  { id: "Student", icon: "⬡", desc: "Academic depth" },
  { id: "Beginner", icon: "✿", desc: "Simple language" },
];

export default function TopicInput({ onGenerate, loading }) {
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState("General");

  const handleSubmit = () => {
    const t = topic.trim();
    if (!t || loading) return;
    onGenerate(t, mode);
  };

  return (
    <div className={styles.card}>
      <div className={styles.inputRow}>
        <input
          className={styles.input}
          placeholder="Enter any topic — Budget 2026, AI startups India, Stock market crash..."
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          disabled={loading}
        />
        <button
          className={styles.generateBtn}
          onClick={handleSubmit}
          disabled={loading || !topic.trim()}
        >
          {loading ? "⟳ Analyzing..." : "⚡ Generate Brief"}
        </button>
      </div>

      <div className={styles.modeSection}>
        <div className={styles.modeLabel}>Perspective Mode</div>
        <div className={styles.modeRow}>
          {MODES.map(m => (
            <button
              key={m.id}
              className={`${styles.modeBtn} ${mode === m.id ? styles.active : ""}`}
              onClick={() => setMode(m.id)}
            >
              <span className={styles.modeIcon}>{m.icon}</span>
              <span>{m.id}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.samples}>
        <div className={styles.sampleLabel}>Try a sample:</div>
        <div className={styles.chips}>
          {SAMPLE_TOPICS.map(t => (
            <button key={t} className={styles.chip} onClick={() => setTopic(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
