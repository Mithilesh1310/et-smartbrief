/**
 * ET SmartBrief - components/HighlightsList.jsx
 * Key highlights + deep context + ELI12
 */
import styles from "./HighlightsList.module.css";

export default function HighlightsList({ highlights, details, simple_explanation, impact }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={`${styles.label} ${styles.blue}`}>Key Highlights</div>
        <ul className={styles.list}>
          {highlights.map((highlight, index) => (
            <li key={index} className={styles.item}>
              <span className={styles.num}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.text}>{highlight}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.card}>
        <div className={`${styles.label} ${styles.purple}`}>Deep Context</div>
        <p className={styles.details}>{details}</p>
        {impact && (
          <div className={styles.impact}>
            <div className={styles.impactLabel}>Business and Market Impact</div>
            <div className={styles.impactText}>{impact}</div>
          </div>
        )}
        <div className={styles.signalFootnote}>
          Interpretation is synthesized from policy direction, macro signals, sector behavior, and market context.
        </div>
      </div>

      <div className={styles.card}>
        <div className={`${styles.label} ${styles.orange}`}>Explain Like I&apos;m 12</div>
        <div className={styles.eli12}>{simple_explanation}</div>
      </div>
    </div>
  );
}
