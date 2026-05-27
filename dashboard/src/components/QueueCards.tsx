import { QueueStat } from "../hooks/useMetrics";

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1px",
    background: "var(--border)",
    border: "1px solid var(--border)",
  },
  card: {
    background: "var(--bg2)",
    padding: "20px 24px",
    animation: "fadeIn .4s ease both",
  },
  name: {
    fontFamily: "var(--mono)",
    fontSize: "11px",
    color: "var(--text3)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    marginBottom: "16px",
  },
  statRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  label: { fontSize: "12px", color: "var(--text2)" },
  val: { fontFamily: "var(--mono)", fontSize: "18px", fontWeight: 700 },
};

const colors: Record<string, string> = {
  waiting:   "var(--amber)",
  active:    "var(--blue)",
  completed: "var(--green)",
  failed:    "var(--red)",
};

export function QueueCards({ queues }: { queues: QueueStat[] }) {
  if (!queues.length) return (
    <div style={{ ...styles.card, color: "var(--text3)", fontFamily: "var(--mono)", fontSize: 12 }}>
      waiting for data...
    </div>
  );

  return (
    <div style={styles.grid}>
      {queues.map((q, i) => (
        <div key={q.name} style={{ ...styles.card, animationDelay: `${i * 60}ms` }}>
          <div style={styles.name}>{q.name}</div>
          {(["waiting", "active", "completed", "failed"] as const).map(k => (
            <div key={k} style={styles.statRow}>
              <span style={styles.label}>{k}</span>
              <span style={{ ...styles.val, color: colors[k] }}>{q[k]}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}