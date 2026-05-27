import { useState, useEffect } from "react";

export type QueueStat = {
  name:      string;
  waiting:   number;
  active:    number;
  completed: number;
  failed:    number;
};

export function useMetrics(token: string) {
  const [queues, setQueues]       = useState<QueueStat[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    // SSE doesn't support custom headers — fetch snapshot via polling instead
    const poll = async () => {
      try {
        const res = await fetch("/api/v1/metrics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setQueues(data.queues);
        setConnected(true);
      } catch {
        setConnected(false);
      }
    };

    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [token]);

  return { queues, connected };
}