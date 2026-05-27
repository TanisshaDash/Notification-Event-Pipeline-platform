import { useState } from "react";

const FEATURES = [
  { icon: "⚡", title: "Async by default", desc: "Events are queued instantly. Workers handle delivery in the background — your app never waits." },
  { icon: "🔁", title: "Auto retry + DLQ", desc: "Failed jobs retry with exponential backoff. Permanently failed jobs land in a dead letter queue for manual inspection." },
  { icon: "📬", title: "Multi-channel", desc: "One event fans out to Email, SMS, and Push simultaneously. Add or remove channels without touching your code." },
  { icon: "🧩", title: "Template engine", desc: "Handlebars templates per event type per channel. Change copy without redeploying." },
  { icon: "📊", title: "Live dashboard", desc: "Real-time queue depths, delivery logs, and failed job management — all in one place." },
  { icon: "🔐", title: "JWT secured", desc: "Every API route is protected. Register, login, and use your token to integrate in minutes." },
];

const CODE = `await fetch("https://api.notify.dev/api/v1/events", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_TOKEN",
  },
  body: JSON.stringify({
    type: "otp.requested",
    payload: {
      email: "user@example.com",
      phone: "919876543210",
      otp:   "482910",
    },
  }),
});
// Email + SMS sent automatically.`;

export function Landing({ onLogin }: { onLogin: () => void }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: 60, borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0, background: "var(--bg)", zIndex: 100,
      }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>NOTIFY</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="#features" style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text2)", textDecoration: "none" }}>features</a>
          <a href="#integration" style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text2)", textDecoration: "none" }}>integration</a>
          <button onClick={onLogin} style={{
            fontFamily: "var(--mono)", fontSize: 12, padding: "7px 18px",
            background: "var(--text)", color: "var(--bg)",
            border: "none", cursor: "pointer", fontWeight: 700,
          }}>→ login</button>
        </div>
      </nav>

      <section style={{ padding: "100px 48px 80px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <div style={{
          display: "inline-block", fontFamily: "var(--mono)", fontSize: 11,
          color: "var(--green)", border: "1px solid var(--green)44",
          padding: "4px 14px", marginBottom: 28, letterSpacing: "0.1em",
        }}>● LIVE — event pipeline</div>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 300, lineHeight: 1.1, marginBottom: 24, letterSpacing: "-0.03em" }}>
          Send notifications<br /><span style={{ fontWeight: 700 }}>without the complexity.</span>
        </h1>
        <p style={{ fontSize: 18, color: "var(--text2)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 40px" }}>
          Fire one event. NOTIFY handles routing, templating, retries, and delivery across Email, SMS, and Push — automatically.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onLogin} style={{
            fontFamily: "var(--mono)", fontSize: 13, padding: "12px 32px",
            background: "var(--text)", color: "var(--bg)",
            border: "none", cursor: "pointer", fontWeight: 700,
          }}>→ get started</button>
          <a href="#integration" style={{
            fontFamily: "var(--mono)", fontSize: 13, padding: "12px 32px",
            background: "transparent", color: "var(--text2)",
            border: "1px solid var(--border2)", cursor: "pointer", textDecoration: "none", display: "inline-block",
          }}>view docs</a>
        </div>
      </section>

      <div style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
        {[
          { val: "3",    label: "delivery channels" },
          { val: "< 1s", label: "queue latency" },
          { val: "3×",   label: "auto retry" },
        ].map((s, i) => (
          <div key={i} style={{ padding: "28px 0", textAlign: "center", borderRight: i < 2 ? "1px solid var(--border)" : "none" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 32, fontWeight: 700, color: "var(--green)", lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)", marginTop: 6, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>{s.label}</div>
          </div>
        ))}
      </div>

      <section id="features" style={{ padding: "80px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 40, textAlign: "center" }}>features</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1px", background: "var(--border)" }}>
          {FEATURES.map((f, i) => (
            <div key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ padding: "32px 28px", background: hovered === i ? "var(--bg3)" : "var(--bg2)", transition: "background .2s" }}>
              <div style={{ fontSize: 24, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="integration" style={{ padding: "0 48px 80px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 40, textAlign: "center" }}>integrate in minutes</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.3, marginBottom: 16, letterSpacing: "-0.02em" }}>
              One API call.<br /><strong>Every channel.</strong>
            </h2>
            <p style={{ color: "var(--text2)", lineHeight: 1.7, marginBottom: 20, fontSize: 14 }}>
              Register your event type, create templates for each channel, and fire events from anywhere. NOTIFY handles the rest.
            </p>
            {["No SDK required — plain HTTP", "Handlebars templating with your payload", "Real-time delivery tracking", "Failed job retry from dashboard"].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                <span style={{ color: "var(--green)", fontFamily: "var(--mono)", fontSize: 13 }}>✓</span>
                <span style={{ fontSize: 13, color: "var(--text2)" }}>{item}</span>
              </div>
            ))}
            <button onClick={onLogin} style={{
              marginTop: 24, fontFamily: "var(--mono)", fontSize: 12, padding: "10px 24px",
              background: "transparent", color: "var(--text)",
              border: "1px solid var(--border2)", cursor: "pointer",
            }}>→ open dashboard</button>
          </div>
          <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)", marginLeft: 8 }}>integration.js</span>
            </div>
            <pre style={{ fontFamily: "var(--mono)", fontSize: 12, lineHeight: 1.7, color: "var(--text2)", padding: "20px 24px", margin: 0, overflowX: "auto", whiteSpace: "pre-wrap" }}>{CODE}</pre>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700 }}>NOTIFY</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)" }}>built with Node.js · BullMQ · Redis · PostgreSQL</div>
        <button onClick={onLogin} style={{ fontFamily: "var(--mono)", fontSize: 11, padding: "6px 16px", background: "transparent", color: "var(--text2)", border: "1px solid var(--border2)", cursor: "pointer" }}>→ login</button>
      </footer>
    </div>
  );
}