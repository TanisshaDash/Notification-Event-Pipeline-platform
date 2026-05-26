"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useMetrics_1 = require("./hooks/useMetrics");
const QueueCards_1 = require("./components/QueueCards");
const DeliveryTable_1 = require("./components/DeliveryTable");
const FireEvent_1 = require("./components/FireEvent");
function App() {
    const { queues, connected } = (0, useMetrics_1.useMetrics)();
    const [refreshKey, setRefreshKey] = (0, react_1.useState)(0);
    const totalDelivered = queues.reduce((a, q) => a + q.completed, 0);
    const totalFailed = queues.reduce((a, q) => a + q.failed, 0);
    const totalActive = queues.reduce((a, q) => a + q.active, 0);
    return ((0, jsx_runtime_1.jsxs)("div", { style: { minHeight: "100vh", background: "var(--bg)" }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,.015) 2px, rgba(255,255,255,.015) 4px)",
                    pointerEvents: "none", zIndex: 999,
                } }), (0, jsx_runtime_1.jsxs)("header", { style: {
                    borderBottom: "1px solid var(--border)",
                    padding: "0 32px",
                    display: "flex",
                    alignItems: "center",
                    height: 56,
                    position: "sticky",
                    top: 0,
                    background: "var(--bg)",
                    zIndex: 100,
                }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontFamily: "var(--mono)", fontSize: 16, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }, children: "NOTIFY" }), (0, jsx_runtime_1.jsx)("div", { style: { width: 1, height: 16, background: "var(--border2)" } }), (0, jsx_runtime_1.jsx)("div", { style: { fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)" }, children: "event pipeline" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 20 }, children: [[
                                { label: "delivered", val: totalDelivered, color: "var(--green)" },
                                { label: "failed", val: totalFailed, color: "var(--red)" },
                                { label: "active", val: totalActive, color: "var(--blue)" },
                            ].map(s => ((0, jsx_runtime_1.jsxs)("div", { style: { textAlign: "right" }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontFamily: "var(--mono)", fontSize: 16, fontWeight: 700, color: s.color, lineHeight: 1 }, children: s.val }), (0, jsx_runtime_1.jsx)("div", { style: { fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", letterSpacing: "0.1em", textTransform: "uppercase" }, children: s.label })] }, s.label))), (0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                            width: 6, height: 6, borderRadius: "50%",
                                            background: connected ? "var(--green)" : "var(--red)",
                                            animation: connected ? "pulse 2s infinite" : "none",
                                        } }), (0, jsx_runtime_1.jsx)("span", { style: { fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)" }, children: connected ? "live" : "offline" })] })] })] }), (0, jsx_runtime_1.jsxs)("main", { style: { padding: "32px", maxWidth: 1400, margin: "0 auto" }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }, children: "queue status \u2014 updates every 3s" }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: 32 }, children: (0, jsx_runtime_1.jsx)(QueueCards_1.QueueCards, { queues: queues }) }), (0, jsx_runtime_1.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }, children: "delivery logs" }), (0, jsx_runtime_1.jsx)(DeliveryTable_1.DeliveryTable, {}, refreshKey)] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }, children: "test" }), (0, jsx_runtime_1.jsx)(FireEvent_1.FireEvent, { onFired: () => setTimeout(() => setRefreshKey(k => k + 1), 800) })] })] })] })] }));
}
