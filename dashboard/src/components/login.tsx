import { useState } from "react";

type Props = { onSuccess: (token: string) => void; onBack: () => void; };

export function Login({ onSuccess, onBack }: Props) {
  const [mode, setMode]       = useState<"login" | "register">("login");
  const [email, setEmail]     = useState("");
  const [password, setPass]   = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) return setError("Fill in all fields");
    setLoading(true); setError("");
    try {
      const res  = await fetch(`/api/v1/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error ?? "Something went wrong");
      onSuccess(data.token);
    } catch {
      setError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 14px",
    background: "var(--bg3)", border: "1px solid var(--border2)",
    color: "var(--text)", fontFamily: "var(--mono)", fontSize: 13,
    outline: "none", marginBottom: 10,
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px", height: 60, borderBottom: "1px solid var(--border)" }}>
        <button onClick={onBack} style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, background: "none", border: "none", color: "var(--text)", cursor: "pointer" }}>NOTIFY</button>
        <button onClick={onBack} style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)", background: "none", border: "none", cursor: "pointer" }}>← back</button>
      </nav>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 380, padding: "0 24px" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 24 }}>
            {mode === "login" ? "sign in" : "create account"}
          </div>
          <input type="email" placeholder="email" value={email} onChange={e => setEmail(e.target.value)} style={inp} onKeyDown={e => e.key === "Enter" && submit()} />
          <input type="password" placeholder="password" value={password} onChange={e => setPass(e.target.value)} style={inp} onKeyDown={e => e.key === "Enter" && submit()} />
          {error && <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--red)", marginBottom: 10 }}>✗ {error}</div>}
          <button onClick={submit} disabled={loading} style={{
            width: "100%", padding: "11px",
            background: "var(--text)", color: "var(--bg)",
            border: "none", cursor: "pointer",
            fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700,
            marginBottom: 14, opacity: loading ? 0.6 : 1,
          }}>
            {loading ? "..." : mode === "login" ? "→ sign in" : "→ create account"}
          </button>
          <div style={{ textAlign: "center" }}>
            <button onClick={() => { setMode(m => m === "login" ? "register" : "login"); setError(""); }} style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)", background: "none", border: "none", cursor: "pointer" }}>
              {mode === "login" ? "no account? register" : "have an account? sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}