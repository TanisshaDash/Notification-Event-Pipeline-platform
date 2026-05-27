import { useState } from "react";
import { useDeliveryLogs } from "../hooks/useDeliveryLogs";



const STATUS_COLORS: Record<string, string> = {
  DELIVERED: "var(--green)",
  SENT:      "var(--blue)",
  QUEUED:    "var(--amber)",
  FAILED:    "var(--red)",
  DEAD:      "var(--red)",
};

const FILTERS = ["ALL", "DELIVERED", "FAILED", "QUEUED", "DEAD"];

export function DeliveryTable({ token }: { token: string }) {
  const [filter, setFilter] = useState("ALL");
  const { logs, total, loading, page, setPage, refetch } =
    useDeliveryLogs(token, filter === "ALL" ? undefined : filter);

  const retryJob = async (id: string) => {
    await fetch(`/api/v1/jobs/email/${id}/retry`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    refetch();
  };

  return (
    <div style={{ animation: "fadeIn .5s ease both" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => { setFilter(f); setPage(1); }} style={{
            fontFamily: "var(--mono)", fontSize: 11, padding: "4px 12px",
            background: filter === f ? "var(--text)" : "transparent",
            color: filter === f ? "var(--bg)" : "var(--text2)",
            border: "1px solid var(--border2)", cursor: "pointer", letterSpacing: "0.05em",
          }}>{f}</button>
        ))}
        <button onClick={refetch} style={{
          marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 11, padding: "4px 12px",
          background: "transparent", color: "var(--text3)",
          border: "1px solid var(--border)", cursor: "pointer",
        }}>↻ refresh</button>
      </div>

      <div style={{ border: "1px solid var(--border)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border)" }}>
              {["event type", "channel", "provider", "status", "attempts", "sent at", "action"].map(h => (
                <th key={h} style={{
                  padding: "10px 14px", textAlign: "left",
                  fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)",
                  letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 400,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: "var(--text3)", fontFamily: "var(--mono)", fontSize: 12 }}>loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: "var(--text3)", fontFamily: "var(--mono)", fontSize: 12 }}>no records</td></tr>
            ) : logs.map((log, i) => (
              <tr key={log.id} style={{
                borderBottom: "1px solid var(--border)",
                background: i % 2 === 0 ? "var(--bg2)" : "var(--bg)",
                animation: `fadeIn .3s ease ${i * 30}ms both`,
              }}>
                <td style={{ padding: "10px 14px", fontFamily: "var(--mono)", fontSize: 12, color: "var(--text2)" }}>{log.event?.type ?? "—"}</td>
                <td style={{ padding: "10px 14px", fontFamily: "var(--mono)", fontSize: 12 }}>{log.channel}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text2)" }}>{log.provider}</td>
                <td style={{ padding: "10px 14px" }}>
                  <span style={{
                    fontFamily: "var(--mono)", fontSize: 11, padding: "2px 8px",
                    background: `${STATUS_COLORS[log.status]}22`,
                    color: STATUS_COLORS[log.status] ?? "var(--text)",
                    border: `1px solid ${STATUS_COLORS[log.status] ?? "var(--border)"}44`,
                  }}>{log.status}</span>
                </td>
                <td style={{ padding: "10px 14px", fontFamily: "var(--mono)", fontSize: 12, textAlign: "center" }}>{log.attempts}</td>
                <td style={{ padding: "10px 14px", fontSize: 11, color: "var(--text3)" }}>
                  {log.sentAt ? new Date(log.sentAt).toLocaleString() : "—"}
                </td>
                <td style={{ padding: "10px 14px" }}>
                  {(log.status === "FAILED" || log.status === "DEAD") && (
                    <button onClick={() => retryJob(log.id)} style={{
                      fontFamily: "var(--mono)", fontSize: 10, padding: "3px 8px",
                      background: "transparent", color: "var(--amber)",
                      border: "1px solid var(--amber)44", cursor: "pointer",
                    }}>retry</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)" }}>{total} total</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
            fontFamily: "var(--mono)", fontSize: 11, padding: "4px 10px",
            background: "transparent", color: "var(--text2)",
            border: "1px solid var(--border)", cursor: "pointer", opacity: page === 1 ? 0.3 : 1,
          }}>← prev</button>
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)", padding: "4px 8px" }}>pg {page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={logs.length < 20} style={{
            fontFamily: "var(--mono)", fontSize: 11, padding: "4px 10px",
            background: "transparent", color: "var(--text2)",
            border: "1px solid var(--border)", cursor: "pointer", opacity: logs.length < 20 ? 0.3 : 1,
          }}>next →</button>
        </div>
      </div>
    </div>
  );
}