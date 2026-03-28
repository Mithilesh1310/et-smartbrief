/**
 * ET SmartBrief - components/BriefCard.jsx
 * Executive Summary card
 */
import styles from "./BriefCard.module.css";

const SIMULATED_SOURCES = [
  "Budget signals",
  "Rate outlook",
  "Sector rotation",
  "Policy direction",
];

export default function BriefCard({ summary, topic, keyTakeaway, whoShouldCare = [] }) {
  return (
    <div className={styles.card}>
      <div className={styles.memoryHook}>
        This is not a summary - this is an AI-generated strategic briefing.
      </div>

      {keyTakeaway && (
        <div className={styles.takeawayBox}>
          <div className={styles.takeawayLabel}>Key Takeaway</div>
          <div className={styles.takeawayText}>{keyTakeaway}</div>
        </div>
      )}

      <div className={styles.label}>Executive Summary</div>
      <div className={styles.topic}>{topic}</div>
      <p className={styles.summary}>{summary}</p>

      {whoShouldCare.length > 0 && (
        <div className={styles.audienceBlock}>
          <div className={styles.audienceLabel}>Who Should Care</div>
          <ul className={styles.audienceList}>
            {whoShouldCare.map((item) => (
              <li key={item} className={styles.audienceItem}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.sources}>
        <div className={styles.sourcesLabel}>Sources (simulated)</div>
        <div className={styles.sourcesRow}>
          {SIMULATED_SOURCES.map((source) => (
            <span key={source} className={styles.sourceChip}>
              {source}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
