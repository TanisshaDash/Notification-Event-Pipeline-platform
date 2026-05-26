import { useState, useEffect, useCallback } from "react";

export type DeliveryLog = {
  id:          string;
  eventId:     string;
  channel:     string;
  status:      string;
  provider:    string;
  attempts:    number;
  error:       string | null;
  sentAt:      string | null;
  createdAt:   string;
  event:       { type: string };
};

export function useDeliveryLogs(status?: string) {
  const [logs, setLogs]     = useState<DeliveryLog[]>([]);
  const [total, setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage]     = useState(1);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.set("status", status);
    const res  = await fetch(`/api/v1/delivery-logs?${params}`);
    const data = await res.json();
    setLogs(data.logs);
    setTotal(data.total);
    setLoading(false);
  }, [page, status]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { logs, total, loading, page, setPage, refetch: fetch_ };
}