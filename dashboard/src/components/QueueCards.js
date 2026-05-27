"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueCards = QueueCards;
const jsx_runtime_1 = require("react/jsx-runtime");
const styles = {
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
        textTransform: "uppercase",
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
const colors = {
    waiting: "var(--amber)",
    active: "var(--blue)",
    completed: "var(--green)",
    failed: "var(--red)",
};
function QueueCards({ queues }) {
    if (!queues.length)
        return ((0, jsx_runtime_1.jsx)("div", { style: { ...styles.card, color: "var(--text3)", fontFamily: "var(--mono)", fontSize: 12 }, children: "waiting for data..." }));
    return ((0, jsx_runtime_1.jsx)("div", { style: styles.grid, children: queues.map((q, i) => ((0, jsx_runtime_1.jsxs)("div", { style: { ...styles.card, animationDelay: `${i * 60}ms` }, children: [(0, jsx_runtime_1.jsx)("div", { style: styles.name, children: q.name }), ["waiting", "active", "completed", "failed"].map(k => ((0, jsx_runtime_1.jsxs)("div", { style: styles.statRow, children: [(0, jsx_runtime_1.jsx)("span", { style: styles.label, children: k }), (0, jsx_runtime_1.jsx)("span", { style: { ...styles.val, color: colors[k] }, children: q[k] })] }, k)))] }, q.name))) }));
}
