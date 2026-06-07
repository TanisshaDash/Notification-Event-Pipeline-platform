import { useState, useEffect } from "react";

type Template = {
  id: string;
  eventType: string;
  channel: string;
  subject?: string;
  body: string;
  active: boolean;
};

const inp: React.CSSProperties = {
  width: "100%", padding: "8px 12px",
  background: "var(--bg3)", border: "1px solid var(--border2)",
  color: "var(--text)", fontFamily: "var(--mono)", fontSize: 12,
  outline: "none", marginBottom: 8,
};

export function TemplateManager({ token }: { token: string }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading]     = useState(true);
  const [creating, setCreating]   = useState(false);
  const [form, setForm] = useState({
    eventType: "", channel: "EMAIL", subject: "", body: "", active: true,
  });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  const fetchTemplates = async () => {
    setLoading(true);
    const res  = await fetch("/api/v1/templates", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTemplates(data);
    setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, [token]);

  const save = async () => {
    if (!form.eventType || !form.body) return setError("Event type and body required");
    setSaving(true); setError("");
    const res = await fetch("/api/v1/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error?.formErrors?.[0] ?? "Failed to save");
    } else {
      setCreating(false);
      setForm({ eventType: "", channel: "EMAIL", subject: "", body: "", active: true });
      fetchTemplates();
    }
    setSaving(false);
  };

  const toggle = async (t: Template) => {
    await fetch(`/api/v1/templates/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ active: !t.active }),
    });
    fetchTemplates();
  };

  const remove = async (id: string) => {
    await fetch(`/api/v1/templates/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTemplates();
  };

  return (
    <div style={{ animation: "fadeIn .5s ease both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
          templates
        </div>
        <button onClick={() => setCreating(c => !c)} style={{
          fontFamily: "var(--mono)", fontSize: 11, padding: "4px 12px",
          background: creating ? "var(--text)" : "transparent",
          color: creating ? "var(--bg)" : "var(--text2)",
          border: "1px solid var(--border2)", cursor: "pointer",
        }}>
          {creating ? "✕ cancel" : "+ new template"}
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div style={{ border: "1px solid var(--border)", padding: 16, marginBottom: 16, background: "var(--bg2)" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text2)", marginBottom: 4 }}>event type</div>
          <input placeholder="e.g. otp.requested" value={form.eventType}
            onChange={e => setForm(f => ({ ...f, eventType: e.target.value }))} style={inp} />

          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text2)", marginBottom: 4 }}>channel</div>
          <select value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}
            style={{ ...inp, marginBottom: 8 }}>
            <option>EMAIL</option>
            <option>SMS</option>
            <option>PUSH</option>
          </select>

          {form.channel === "EMAIL" && (
            <>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text2)", marginBottom: 4 }}>subject</div>
              <input placeholder="Email subject" value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} style={inp} />
            </>
          )}

          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text2)", marginBottom: 4 }}>
            body <span style={{ color: "var(--text3)" }}>(handlebars: {"{{name}}, {{otp}}"})</span>
          </div>
          <textarea placeholder="Template body..." value={form.body} rows={4}
            onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            style={{ ...inp, resize: "vertical" }} />

          {error && <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--red)", marginBottom: 8 }}>✗ {error}</div>}

          <button onClick={save} disabled={saving} style={{
            fontFamily: "var(--mono)", fontSize: 12, padding: "8px 20px",
            background: "var(--text)", color: "var(--bg)",
            border: "none", cursor: "pointer", fontWeight: 700, width: "100%",
            opacity: saving ? 0.6 : 1,
          }}>
            {saving ? "saving..." : "→ save template"}
          </button>
        </div>
      )}

      {/* Templates list */}
      <div style={{ border: "1px solid var(--border)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border)" }}>
              {["event type", "channel", "subject", "status", "actions"].map(h => (
                <th key={h} style={{
                  padding: "10px 14px", textAlign: "left",
                  fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)",
                  letterSpacing: "0.1em", textTransform: "uppercase" as const, fontWeight: 400,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "var(--text3)", fontFamily: "var(--mono)", fontSize: 12 }}>loading...</td></tr>
            ) : templates.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "var(--text3)", fontFamily: "var(--mono)", fontSize: 12 }}>no templates — create one above</td></tr>
            ) : templates.map((t, i) => (
              <tr key={t.id} style={{
                borderBottom: "1px solid var(--border)",
                background: i % 2 === 0 ? "var(--bg2)" : "var(--bg)",
              }}>
                <td style={{ padding: "10px 14px", fontFamily: "var(--mono)", fontSize: 12 }}>{t.eventType}</td>
                <td style={{ padding: "10px 14px", fontFamily: "var(--mono)", fontSize: 12, color: "var(--text2)" }}>{t.channel}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text2)" }}>{t.subject ?? "—"}</td>
                <td style={{ padding: "10px 14px" }}>
                  <span style={{
                    fontFamily: "var(--mono)", fontSize: 11, padding: "2px 8px",
                    background: t.active ? "var(--green-dim)" : "var(--red-dim)",
                    color: t.active ? "var(--green)" : "var(--red)",
                    border: `1px solid ${t.active ? "var(--green)" : "var(--red)"}44`,
                  }}>{t.active ? "active" : "inactive"}</span>
                </td>
                <td style={{ padding: "10px 14px", display: "flex", gap: 8 }}>
                  <button onClick={() => toggle(t)} style={{
                    fontFamily: "var(--mono)", fontSize: 10, padding: "3px 8px",
                    background: "transparent", color: "var(--amber)",
                    border: "1px solid var(--amber)44", cursor: "pointer",
                  }}>{t.active ? "disable" : "enable"}</button>
                  <button onClick={() => remove(t.id)} style={{
                    fontFamily: "var(--mono)", fontSize: 10, padding: "3px 8px",
                    background: "transparent", color: "var(--red)",
                    border: "1px solid var(--red)44", cursor: "pointer",
                  }}>delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}