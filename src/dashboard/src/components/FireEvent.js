"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FireEvent = FireEvent;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const input = {
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
    otp: "123456",
    name: "Tan",
}, null, 2);
function FireEvent({ onFired }) {
    const [type, setType] = (0, react_1.useState)("otp.requested");
    const [payload, setPayload] = (0, react_1.useState)(DEFAULT_PAYLOAD);
    const [status, setStatus] = (0, react_1.useState)("idle");
    const fire = async () => {
        setStatus("sending");
        try {
            const res = await fetch("/api/v1/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, payload: JSON.parse(payload) }),
            });
            if (!res.ok)
                throw new Error();
            setStatus("ok");
            setTimeout(() => { setStatus("idle"); onFired(); }, 1500);
        }
        catch {
            setStatus("err");
            setTimeout(() => setStatus("idle"), 2000);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { border: "1px solid var(--border)", padding: 20, background: "var(--bg2)", animation: "fadeIn .6s ease both" }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }, children: "fire test event" }), (0, jsx_runtime_1.jsx)("div", { style: { fontFamily: "var(--mono)", fontSize: 11, color: "var(--text2)", marginBottom: 4 }, children: "event type" }), (0, jsx_runtime_1.jsx)("input", { value: type, onChange: e => setType(e.target.value), style: input }), (0, jsx_runtime_1.jsx)("div", { style: { fontFamily: "var(--mono)", fontSize: 11, color: "var(--text2)", marginBottom: 4 }, children: "payload (json)" }), (0, jsx_runtime_1.jsx)("textarea", { value: payload, onChange: e => setPayload(e.target.value), rows: 7, style: { ...input, resize: "vertical", marginBottom: 12 } }), (0, jsx_runtime_1.jsx)("button", { onClick: fire, disabled: status === "sending", style: {
                    fontFamily: "var(--mono)",
                    fontSize: 12,
                    padding: "8px 20px",
                    background: status === "ok" ? "var(--green)"
                        : status === "err" ? "var(--red)"
                            : "var(--text)",
                    color: "var(--bg)",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    transition: "background .2s",
                    width: "100%",
                }, children: status === "sending" ? "firing..." : status === "ok" ? "✓ queued" : status === "err" ? "✗ error" : "→ fire event" })] }));
}
