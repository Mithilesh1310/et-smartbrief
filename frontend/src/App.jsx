/**
 * ET SmartBrief — App.jsx
 * Root application component
 */
import { useState, useCallback } from "react";
import { generateBriefing } from "./hooks/useApi";
import TopicInput     from "./components/TopicInput";
import BriefCard      from "./components/BriefCard";
import HighlightsList from "./components/HighlightsList";
import InsightPanel   from "./components/InsightPanel";
import ChatBox        from "./components/ChatBox";
import PipelineVisual from "./components/PipelineVisual";
import styles from "./App.module.css";

export default function App() {
  const [loading,      setLoading]      = useState(false);
  const [activeStage,  setActiveStage]  = useState(null);
  const [stageIndex,   setStageIndex]   = useState(0);
  const [briefing,     setBriefing]     = useState(null);
  const [sessionId,    setSessionId]    = useState(null);
  const [currentTopic, setCurrentTopic] = useState("");
  const [error,        setError]        = useState(null);

  const handleGenerate = useCallback(async (topic, mode) => {
    setLoading(true);
    setBriefing(null);
    setSessionId(null);
    setError(null);
    setActiveStage("summarizer");
    setStageIndex(0);

    // Animate pipeline stages while waiting for API
    const stages = ["summarizer", "context", "insight", "simplifier"];
    let si = 0;
    const interval = setInterval(() => {
      si++;
      if (si < stages.length) {
        setActiveStage(stages[si]);
        setStageIndex(si);
      } else {
        clearInterval(interval);
      }
    }, 4500);

    try {
      const data = await generateBriefing(topic, mode);
      clearInterval(interval);
      setStageIndex(4);
      setActiveStage("done");
      setSessionId(data.sessionId);
      setCurrentTopic(topic);
      setBriefing(data);
    } catch (e) {
      clearInterval(interval);
      setError(e.message);
    }
    setLoading(false);
    setActiveStage(null);
  }, []);

  return (
    <div className={styles.app}>
      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>ET</div>
          <div>
            <div className={styles.logoText}>SmartBrief</div>
            <div className={styles.logoSub}>AI Intelligence</div>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.liveBadge}>
            <div className={styles.liveDot} /> Live
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* ── HERO (only when empty) ── */}
        {!briefing && !loading && (
          <div className={styles.hero}>
            <div className={styles.heroTag}>⚡ 4-Agent Intelligence System</div>
            <h1 className={styles.heroTitle}>
              Never read<br />an article again
            </h1>
            <p className={styles.heroSub}>
              Enter any topic. Our AI pipeline generates a complete intelligence
              briefing — in seconds.
            </p>
          </div>
        )}

        {/* ── TOPIC INPUT ── */}
        <TopicInput onGenerate={handleGenerate} loading={loading} />

        {/* ── ERROR ── */}
        {error && (
          <div className={styles.error}>
            ⚠ {error}
          </div>
        )}

        {/* ── PIPELINE ANIMATION ── */}
        {loading && (
          <PipelineVisual activeStage={activeStage} stageIndex={stageIndex} />
        )}

        {/* ── BRIEFING OUTPUT ── */}
        {briefing && (
          <>
            <div className={styles.topicBadge}>⚡ Briefing: {currentTopic}</div>

            <div className={styles.signalNote}>
              Powered by synthesized insights from policy, macro, sector, and market signals.
            </div>

            <div className={styles.topGrid}>
              <BriefCard
                summary={briefing.summary}
                topic={currentTopic}
                keyTakeaway={briefing.key_takeaway}
                whoShouldCare={briefing.who_should_care}
              />
              <InsightPanel
                bull_case={briefing.bull_case}
                bear_case={briefing.bear_case}
                future_outlook={briefing.future_outlook}
                risks={briefing.risks}
                sector_winners={briefing.sector_winners}
                sector_losers={briefing.sector_losers}
              />
            </div>

            <HighlightsList
              highlights={briefing.highlights}
              details={briefing.details}
              simple_explanation={briefing.simple_explanation}
              impact={briefing.impact}
            />

            <div className={styles.divider}>
              <div className={styles.dividerLine} />
              <div className={styles.dividerLabel}>Ask Follow-up Questions</div>
              <div className={styles.dividerLine} />
            </div>

            <ChatBox sessionId={sessionId} topic={currentTopic} />
          </>
        )}

        {/* ── EMPTY STATE ── */}
        {!briefing && !loading && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>◈</div>
            <div className={styles.emptyTitle}>Intelligence Awaits</div>
            <div className={styles.emptySub}>
              Enter a topic above and our 4-agent AI pipeline<br />
              will generate your complete briefing.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
