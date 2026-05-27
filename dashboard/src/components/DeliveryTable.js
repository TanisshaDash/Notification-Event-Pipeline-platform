"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryTable = DeliveryTable;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useDeliveryLogs_1 = require("../hooks/useDeliveryLogs");
const STATUS_COLORS = {
    DELIVERED: "var(--green)",
    SENT: "var(--blue)",
    QUEUED: "var(--amber)",
    FAILED: "var(--red)",
    DEAD: "var(--red)",
};
const FILTERS = ["ALL", "DELIVERED", "FAILED", "QUEUED", "DEAD"];
function DeliveryTable() {
    const [filter, setFilter] = (0, react_1.useState)("ALL");
    const { logs, total, loading, page, setPage, refetch } = (0, useDeliveryLogs_1.useDeliveryLogs)(filter === "ALL" ? undefined : filter);
    const retryJob = async (id) => {
        await fetch(`/api/v1/jobs/email/${id}/retry`, { method: "POST" });
        refetch();
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { animation: "fadeIn .5s ease both" }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }, children: [FILTERS.map(f => ((0, jsx_runtime_1.jsx)("button", { onClick: () => { setFilter(f); setPage(1); }, style: {
                            fontFamily: "var(--mono)",
                            fontSize: 11,
                            padding: "4px 12px",
                            background: filter === f ? "var(--text)" : "transparent",
                            color: filter === f ? "var(--bg)" : "var(--text2)",
                            border: "1px solid var(--border2)",
                            cursor: "pointer",
                            letterSpacing: "0.05em",
                        }, children: f }, f))), (0, jsx_runtime_1.jsx)("button", { onClick: refetch, style: {
                            marginLeft: "auto",
                            fontFamily: "var(--mono)",
                            fontSize: 11,
                            padding: "4px 12px",
                            background: "transparent",
                            color: "var(--text3)",
                            border: "1px solid var(--border)",
                            cursor: "pointer",
                        }, children: "\u21BB refresh" })] }), (0, jsx_runtime_1.jsx)("div", { style: { border: "1px solid var(--border)", overflow: "hidden" }, children: (0, jsx_runtime_1.jsxs)("table", { style: { width: "100%", borderCollapse: "collapse" }, children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsx)("tr", { style: { background: "var(--bg3)", borderBottom: "1px solid var(--border)" }, children: ["event type", "channel", "provider", "status", "attempts", "sent at", "action"].map(h => ((0, jsx_runtime_1.jsx)("th", { style: {
                                        padding: "10px 14px",
                                        textAlign: "left",
                                        fontFamily: "var(--mono)",
                                        fontSize: 10,
                                        color: "var(--text3)",
                                        letterSpacing: "0.1em",
                                        textTransform: "uppercase",
                                        fontWeight: 400,
                                    }, children: h }, h))) }) }), (0, jsx_runtime_1.jsx)("tbody", { children: loading ? ((0, jsx_runtime_1.jsx)("tr", { children: (0, jsx_runtime_1.jsx)("td", { colSpan: 7, style: { padding: 24, textAlign: "center", color: "var(--text3)", fontFamily: "var(--mono)", fontSize: 12 }, children: "loading..." }) })) : logs.length === 0 ? ((0, jsx_runtime_1.jsx)("tr", { children: (0, jsx_runtime_1.jsx)("td", { colSpan: 7, style: { padding: 24, textAlign: "center", color: "var(--text3)", fontFamily: "var(--mono)", fontSize: 12 }, children: "no records" }) })) : logs.map((log, i) => ((0, jsx_runtime_1.jsxs)("tr", { style: {
                                    borderBottom: "1px solid var(--border)",
                                    background: i % 2 === 0 ? "var(--bg2)" : "var(--bg)",
                                    animation: `fadeIn .3s ease ${i * 30}ms both`,
                                }, children: [(0, jsx_runtime_1.jsx)("td", { style: { padding: "10px 14px", fontFamily: "var(--mono)", fontSize: 12, color: "var(--text2)" }, children: log.event?.type ?? "—" }), (0, jsx_runtime_1.jsx)("td", { style: { padding: "10px 14px", fontFamily: "var(--mono)", fontSize: 12 }, children: log.channel }), (0, jsx_runtime_1.jsx)("td", { style: { padding: "10px 14px", fontSize: 12, color: "var(--text2)" }, children: log.provider }), (0, jsx_runtime_1.jsx)("td", { style: { padding: "10px 14px" }, children: (0, jsx_runtime_1.jsx)("span", { style: {
                                                fontFamily: "var(--mono)",
                                                fontSize: 11,
                                                padding: "2px 8px",
                                                background: `${STATUS_COLORS[log.status]}22`,
                                                color: STATUS_COLORS[log.status] ?? "var(--text)",
                                                border: `1px solid ${STATUS_COLORS[log.status] ?? "var(--border)"}44`,
                                            }, children: log.status }) }), (0, jsx_runtime_1.jsx)("td", { style: { padding: "10px 14px", fontFamily: "var(--mono)", fontSize: 12, textAlign: "center" }, children: log.attempts }), (0, jsx_runtime_1.jsx)("td", { style: { padding: "10px 14px", fontSize: 11, color: "var(--text3)" }, children: log.sentAt ? new Date(log.sentAt).toLocaleString() : "—" }), (0, jsx_runtime_1.jsx)("td", { style: { padding: "10px 14px" }, children: (log.status === "FAILED" || log.status === "DEAD") && ((0, jsx_runtime_1.jsx)("button", { onClick: () => retryJob(log.id), style: {
                                                fontFamily: "var(--mono)",
                                                fontSize: 10,
                                                padding: "3px 8px",
                                                background: "transparent",
                                                color: "var(--amber)",
                                                border: "1px solid var(--amber)44",
                                                cursor: "pointer",
                                            }, children: "retry" })) })] }, log.id))) })] }) }), (0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }, children: [(0, jsx_runtime_1.jsxs)("span", { style: { fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)" }, children: [total, " total"] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", gap: 8 }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setPage(p => Math.max(1, p - 1)), disabled: page === 1, style: {
                                    fontFamily: "var(--mono)", fontSize: 11, padding: "4px 10px",
                                    background: "transparent", color: "var(--text2)",
                                    border: "1px solid var(--border)", cursor: "pointer", opacity: page === 1 ? 0.3 : 1,
                                }, children: "\u2190 prev" }), (0, jsx_runtime_1.jsxs)("span", { style: { fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)", padding: "4px 8px" }, children: ["pg ", page] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setPage(p => p + 1), disabled: logs.length < 20, style: {
                                    fontFamily: "var(--mono)", fontSize: 11, padding: "4px 10px",
                                    background: "transparent", color: "var(--text2)",
                                    border: "1px solid var(--border)", cursor: "pointer", opacity: logs.length < 20 ? 0.3 : 1,
                                }, children: "next \u2192" })] })] })] }));
}
