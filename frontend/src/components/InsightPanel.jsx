/**
 * ET SmartBrief - components/InsightPanel.jsx
 * Bull/Bear, Future Outlook, Risks, and sector positioning
 */
import styles from "./InsightPanel.module.css";

export default function InsightPanel({
  bull_case,
  bear_case,
  future_outlook,
  risks,
  sector_winners = [],
  sector_losers = [],
}) {
  return (
    <div className={styles.card}>
      <div className={styles.label}>Strategic Intelligence</div>

      {(sector_winners.length > 0 || sector_losers.length > 0) && (
        <div className={styles.sectorGrid}>
          <div className={`${styles.sectorCard} ${styles.winners}`}>
            <div className={styles.sectorLabel}>Sector Winners</div>
            <ul className={styles.sectorList}>
              {sector_winners.map((sector) => (
                <li key={sector} className={styles.sectorItem}>{sector}</li>
              ))}
            </ul>
          </div>

          <div className={`${styles.sectorCard} ${styles.losers}`}>
            <div className={styles.sectorLabel}>Sector Losers</div>
            <ul className={styles.sectorList}>
              {sector_losers.map((sector) => (
                <li key={sector} className={styles.sectorItem}>{sector}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className={styles.grid}>
        <div className={`${styles.box} ${styles.bull}`}>
          <div className={styles.boxLabel}>Bull Case</div>
          <div className={styles.boxText}>{bull_case}</div>
        </div>
        <div className={`${styles.box} ${styles.bear}`}>
          <div className={styles.boxLabel}>Bear Case</div>
          <div className={styles.boxText}>{bear_case}</div>
        </div>
        <div className={`${styles.box} ${styles.outlook}`}>
          <div className={styles.boxLabel}>Future Outlook</div>
          <div className={styles.boxText}>{future_outlook}</div>
        </div>
        <div className={`${styles.box} ${styles.risk}`}>
          <div className={styles.boxLabel}>Key Risks</div>
          <div className={styles.boxText}>{risks}</div>
        </div>
      </div>
    </div>
  );
}
