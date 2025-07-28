import { useEffect, useState, useRef } from "react";

export function useChecks(tipo, documento) {
  /* ── cache local ─────────────────────── */
  const CACHE_KEY = `checks:${tipo}:${documento}`;
  const [checks, setChecks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    } catch {
      return {};
    }
  });
  const wsRef = useRef(null);

  // 1· estado inicial desde WebSocket (primer mensaje)
  useEffect(() => {
    if (!tipo || !documento) return;

    const ws = new WebSocket(
      `${window.location.protocol === "https:" ? "wss" : "ws"}://` +
      `${window.location.host}/ws/checks/${tipo}/${documento}/`
    );

    ws.onmessage = (evt) => {
      /* SockJS frames “o” (open) y “h” (heartbeat) */
      if (evt.data === 'o' || evt.data === 'h') return;
      try {
        const data = JSON.parse(evt.data);  // { id: bool }
        setChecks(p => ({ ...p, ...data }));
        /* cache inmediato */
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ...checks, ...data }));
      } catch { console.warn('WS frame ignorado', evt.data); }
    };

    wsRef.current = ws;
    return () => ws.close();
  }, [tipo, documento]);

  // 2· toggle wrapper
  const toggle = (linea_id, checked) => {
    setChecks(p => {
      const next = { ...p, [linea_id]: checked };
      localStorage.setItem(CACHE_KEY, JSON.stringify(next));  // cache
      return next;
    });
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ [linea_id]: checked }));
    }};

  return [checks, toggle];
}
