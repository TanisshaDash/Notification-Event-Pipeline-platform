"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMetrics = useMetrics;
const react_1 = require("react");
function useMetrics() {
    const [queues, setQueues] = (0, react_1.useState)([]);
    const [connected, setConnected] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        const es = new EventSource("/api/v1/metrics/stream");
        es.onopen = () => setConnected(true);
        es.onerror = () => setConnected(false);
        es.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                setQueues(data.queues);
                setConnected(true);
            }
            catch { }
        };
        return () => es.close();
    }, []);
    return { queues, connected };
}
