/**
 * ET SmartBrief — components/PipelineVisual.jsx
 * Shows the 4-agent processing pipeline with live stage indicator
 */
import styles from "./PipelineVisual.module.css";

const AGENTS = [
  { id: "summarizer", icon: "✦", label: "Summarizer", desc: "Core extraction" },
  { id: "context",    icon: "⬡", label: "Context",    desc: "Background & facts" },
  { id: "insight",    icon: "◈", label: "Insight",    desc: "Bull / Bear / Risks" },
  { id: "simplifier", icon: "✿", label: "Simplifier", desc: "ELI12 translation" },
];

export default function PipelineVisual({ activeStage, stageIndex }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>⟳ Multi-Agent Intelligence Pipeline</div>
      <div className={styles.stages}>
        {AGENTS.map((agent, i) => {
          const isDone   = i < stageIndex;
          const isActive = agent.id === activeStage;
          return (
            <div key={agent.id} className={styles.stage}>
              {i < AGENTS.length - 1 && <div className={styles.connector} />}
              <div className={`${styles.icon} ${isActive ? styles.active : ""} ${isDone ? styles.done : ""}`}>
                {isDone ? "✓" : agent.icon}
              </div>
              <div className={`${styles.name} ${isActive ? styles.activeName : ""} ${isDone ? styles.doneName : ""}`}>
                {agent.label}
              </div>
              <div className={styles.desc}>{agent.desc}</div>
            </div>
          );
        })}
      </div>
      <div className={styles.statusBar}>
        <div
          className={styles.statusFill}
          style={{ width: `${(stageIndex / AGENTS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
