"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDeliveryLogs = useDeliveryLogs;
const react_1 = require("react");
function useDeliveryLogs(status) {
    const [logs, setLogs] = (0, react_1.useState)([]);
    const [total, setTotal] = (0, react_1.useState)(0);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [page, setPage] = (0, react_1.useState)(1);
    const fetch_ = (0, react_1.useCallback)(async () => {
        setLoading(true);
        const params = new URLSearchParams({ page: String(page) });
        if (status)
            params.set("status", status);
        const res = await fetch(`/api/v1/delivery-logs?${params}`);
        const data = await res.json();
        setLogs(data.logs);
        setTotal(data.total);
        setLoading(false);
    }, [page, status]);
    (0, react_1.useEffect)(() => { fetch_(); }, [fetch_]);
    return { logs, total, loading, page, setPage, refetch: fetch_ };
}
