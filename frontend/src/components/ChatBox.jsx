/**
 * ET SmartBrief - components/ChatBox.jsx
 * Stateful Q&A chat with session memory
 */
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { sendChatMessage } from "../hooks/useApi";
import styles from "./ChatBox.module.css";

function getConfidenceScore(confidence, confidenceScore) {
  if (typeof confidenceScore === "number") {
    return Math.max(0, Math.min(100, Math.round(confidenceScore)));
  }

  if (confidence === "High") return 84;
  if (confidence === "Low") return 41;
  return 67;
}

function buildStarterPrompts(topic) {
  const normalizedTopic = topic.toLowerCase();

  if (/(budget|tax|fiscal|finance bill)/i.test(normalizedTopic)) {
    return [
      "Which sectors gain first from this budget?",
      "Who gets hurt most if these budget signals play out?",
      "What is the clearest investor takeaway here?",
    ];
  }

  if (/(rbi|interest rate|inflation|repo|monetary)/i.test(normalizedTopic)) {
    return [
      "Which sectors react first to this rate outlook?",
      "What does this mean for borrowers and consumers?",
      "What is the likely market reaction over the next quarter?",
    ];
  }

  if (/(ai|startup|funding|venture|saas|tech)/i.test(normalizedTopic)) {
    return [
      "Which startups benefit most from this funding trend?",
      "Where will investor appetite weaken first?",
      "What does this mean for AI hiring and valuations?",
    ];
  }

  if (/(stock|sensex|nifty|market|equity|shares)/i.test(normalizedTopic)) {
    return [
      "Which sectors are positioned to outperform first?",
      "What is the biggest risk to market sentiment here?",
      "How should investors interpret this signal right now?",
    ];
  }

  if (/(china|trade|geopolitics|war|tariff|exports|imports)/i.test(normalizedTopic)) {
    return [
      "Which industries become most exposed if this trend deepens?",
      "Who gains strategically from this shift?",
      "What is the near-term business impact here?",
    ];
  }

  return [
    `What matters most about ${topic} right now?`,
    `Who benefits first if ${topic} develops further?`,
    `What is the smartest next question on ${topic}?`,
  ];
}

function buildIntroMessage(topic) {
  const normalizedTopic = topic.toLowerCase();

  if (/(ai|startup|funding|venture|saas|tech)/i.test(normalizedTopic)) {
    return `Briefing for "${topic}" is ready. What do you want to explore deeper? I can break down funding momentum, startup winners, valuation pressure, and investor behavior.`;
  }

  if (/(budget|tax|fiscal|finance bill)/i.test(normalizedTopic)) {
    return `Briefing for "${topic}" is ready. What do you want to explore deeper? I can break down sector rotation, tax effects, policy winners, and market consequences.`;
  }

  if (/(rbi|interest rate|inflation|repo|monetary)/i.test(normalizedTopic)) {
    return `Briefing for "${topic}" is ready. What do you want to explore deeper? I can break down rate sensitivity, inflation effects, borrower impact, and market reaction.`;
  }

  if (/(china|trade|geopolitics|war|tariff|exports|imports)/i.test(normalizedTopic)) {
    return `Briefing for "${topic}" is ready. What do you want to explore deeper? I can break down strategic risks, business exposure, sector winners, and policy implications.`;
  }

  return `Briefing for "${topic}" is ready. What do you want to explore deeper? I can break down market impact, key drivers, risks, and sector winners or losers.`;
}

export default function ChatBox({ sessionId, topic }) {
  const starterPrompts = useMemo(() => buildStarterPrompts(topic), [topic]);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: buildIntroMessage(topic),
      confidence: "High",
      confidence_score: 84,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: buildIntroMessage(topic),
        confidence: "High",
        confidence_score: 84,
      },
    ]);
  }, [topic]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(async (presetQuestion) => {
    const q = (presetQuestion ?? input).trim();
    if (!q || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setLoading(true);

    try {
      const res = await sendChatMessage(sessionId, q);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: res.answer,
          related_insight: res.related_insight,
          confidence: res.confidence,
          confidence_score: res.confidence_score,
        },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: `Warning: ${e.message}`,
          confidence: "Low",
          confidence_score: 28,
        },
      ]);
    }

    setLoading(false);
  }, [input, loading, sessionId]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.label}>Interactive Intelligence Chat</div>

      <div className={styles.starters}>
        {starterPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className={styles.starterChip}
            onClick={() => send(prompt)}
            disabled={loading}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className={styles.messages}>
        {messages.map((msg, i) => {
          const score = getConfidenceScore(msg.confidence, msg.confidence_score);

          return (
            <div key={i} className={`${styles.msg} ${styles[msg.role]}`}>
              <div className={styles.bubble}>{msg.content}</div>
              {msg.role === "assistant" && msg.related_insight && (
                <div className={styles.insight}>Insight: {msg.related_insight}</div>
              )}
              {msg.role === "assistant" && msg.confidence && (
                <div className={styles.confidenceWrap}>
                  <div className={styles.confidenceHeader}>
                    <span className={`${styles.confidence} ${styles[`conf${msg.confidence}`]}`}>
                      {msg.confidence} Confidence
                    </span>
                    <span className={styles.scoreText}>{score}%</span>
                  </div>
                  <div className={styles.meterTrack} aria-hidden="true">
                    <div className={styles.meterFill} style={{ width: `${score}%` }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className={`${styles.msg} ${styles.assistant}`}>
            <div className={styles.bubble}>
              <div className={styles.typing}>
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className={styles.inputRow}>
        <textarea
          className={styles.input}
          placeholder={`Ask a deeper question about ${topic}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          disabled={loading}
        />
        <button
          className={styles.sendBtn}
          onClick={() => send()}
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
