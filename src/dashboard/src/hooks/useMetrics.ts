import { useState, useEffect } from "react";

export type QueueStat = {
  name:      string;
  waiting:   number;
  active:    number;
  completed: number;
  failed:    number;
};

export function useMetrics() {
  const [queues, setQueues]   = useState<QueueStat[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const es = new EventSource("/api/v1/metrics/stream");

    es.onopen    = () => setConnected(true);
    es.onerror   = () => setConnected(false);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setQueues(data.queues);
        setConnected(true);
      } catch {}
    };

    return () => es.close();
  }, []);

  return { queues, connected };
}