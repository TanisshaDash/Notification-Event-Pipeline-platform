import { useState } from "react";
import { useMetrics } from "../dashboard/src/hooks/useMetrics";
import { QueueCards } from "../dashboard/src/components/QueueCards";
import { DeliveryTable } from "../dashboard/src/components/DeliveryTable";
import { FireEvent } from "../dashboard/src/components/FireEvent";
import { Landing } from "../dashboard/src/components/landing";
import { Login } from "../dashboard/src/components/login";

type Page = "landing" | "login" | "dashboard";

// Store token in memory (cleared on refresh — fine for demo)
let memoryToken = "";

export function getToken() { return memoryToken; }

export default function App() {
  const [page, setPage]       = useState<Page>("landing");
  const [token, setToken]     = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLogin = (t: string) => {
    memoryToken = t;
    setToken(t);
    setPage("dashboard");
  };

  const handleLogout = () => {
    memoryToken = "";
    setToken("");
    setPage("landing");
  };

  if (page === "landing") return <Landing onLogin={() => setPage("login")} />;
  if (page === "login")   return <Login onSuccess={handleLogin} onBack={() => setPage("landing")} />;

  return <Dashboard token={token} onLogout={handleLogout} refreshKey={refreshKey} setRefreshKey={setRefreshKey} />;
}

function Dashboard({ token, onLogout, refreshKey, setRefreshKey }: {
  token: string;
  onLogout: () => void;
  refreshKey: number;
  setRefreshKey: (fn: (k: number) => number) => void;
}) {
  const { queues, connected } = useMetrics(token);

  const totalDelivered = queues.reduce((a, q) => a + q.completed, 0);
  const totalFailed    = queues.reduce((a, q) => a + q.failed, 0);
  const totalActive    = queues.reduce((a, q) => a + q.active, 0);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,.015) 2px, rgba(255,255,255,.015) 4px)",
        pointerEvents: "none", zIndex: 999,
      }} />

      <header style={{
        borderBottom: "1px solid var(--border)",
        padding: "0 32px",
        display: "flex", alignItems: "center", height: 56,
        position: "sticky", top: 0, background: "var(--bg)", zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>NOTIFY</div>
          <div style={{ width: 1, height: 16, background: "var(--border2)" }} />
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)" }}>dashboard</div>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 20 }}>
          {[
            { label: "delivered", val: totalDelivered, color: "var(--green)" },
            { label: "failed",    val: totalFailed,    color: "var(--red)"   },
            { label: "active",    val: totalActive,    color: "var(--blue)"  },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: connected ? "var(--green)" : "var(--red)",
              animation: connected ? "pulse 2s infinite" : "none",
            }} />
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)" }}>
              {connected ? "live" : "offline"}
            </span>
          </div>

          <button onClick={onLogout} style={{
            fontFamily: "var(--mono)", fontSize: 11, padding: "5px 12px",
            background: "transparent", color: "var(--text3)",
            border: "1px solid var(--border)", cursor: "pointer",
          }}>logout</button>
        </div>
      </header>

      <main style={{ padding: "32px", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
          queue status — updates every 3s
        </div>
        <div style={{ marginBottom: 32 }}>
          <QueueCards queues={queues} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
              delivery logs
            </div>
            <DeliveryTable key={refreshKey} token={token} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
              test
            </div>
            <FireEvent token={token} onFired={() => setTimeout(() => setRefreshKey(k => k + 1), 800)} />
          </div>
        </div>
      </main>
    </div>
  );
}