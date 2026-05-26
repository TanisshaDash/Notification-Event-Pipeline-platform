import { useState } from "react";

const input: React.CSSProperties = {
  width: "100%",
  background: "var(--bg3)",
  border: "1px solid var(--border2)",
  color: "var(--text)",
  fontFamily: "var(--mono)",
  fontSize: 12,
  padding: "8px 12px",
  outline: "none",
  marginBottom: 8,
};

const DEFAULT_PAYLOAD = JSON.stringify({
  email: "test@example.com",
  phone: "919876543210",
  otp:   "123456",
  name:  "Tan",
}, null, 2);

export function FireEvent({ onFired }: { onFired: () => void }) {
  const [type, setType]       = useState("otp.requested");
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [status, setStatus]   = useState<"idle"|"sending"|"ok"|"err">("idle");

  const fire = async () => {
    setStatus("sending");
    try {
      const res = await fetch("/api/v1/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, payload: JSON.parse(payload) }),
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
      setTimeout(() => { setStatus("idle"); onFired(); }, 1500);
    } catch {
      setStatus("err");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  return (
    <div style={{ border: "1px solid var(--border)", padding: 20, background: "var(--bg2)", animation: "fadeIn .6s ease both" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
        fire test event
      </div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text2)", marginBottom: 4 }}>event type</div>
      <input value={type} onChange={e => setType(e.target.value)} style={input} />
      <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text2)", marginBottom: 4 }}>payload (json)</div>
      <textarea value={payload} onChange={e => setPayload(e.target.value)} rows={7} style={{ ...input, resize: "vertical", marginBottom: 12 }} />
      <button onClick={fire} disabled={status === "sending"} style={{
        fontFamily: "var(--mono)",
        fontSize: 12,
        padding: "8px 20px",
        background: status === "ok"  ? "var(--green)"
                  : status === "err" ? "var(--red)"
                  : "var(--text)",
        color: "var(--bg)",
        border: "none",
        cursor: "pointer",
        fontWeight: 700,
        letterSpacing: "0.05em",
        transition: "background .2s",
        width: "100%",
      }}>
        {status === "sending" ? "firing..." : status === "ok" ? "✓ queued" : status === "err" ? "✗ error" : "→ fire event"}
      </button>
    </div>
  );
}