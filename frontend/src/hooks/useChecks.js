import { useEffect, useState, useRef } from "react";

export function useChecks(tipo, documento) {
  const CACHE_KEY = `checks:${tipo}:${documento}`;
  const [checks, setChecks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    } catch {
      return {};
    }
  });
  const wsRef = useRef(null);

  useEffect(() => {
    if (!tipo || !documento) return;

    const ws = new WebSocket(
      `${window.location.protocol === "https:" ? "wss" : "ws"}://` +
      `${window.location.host}/ws/checks/${tipo}/${documento}/`
    );

    ws.onmessage = (evt) => {
      if (evt.data === 'o' || evt.data === 'h') return;
      try {
        const data = JSON.parse(evt.data);  // { id: bool }
        setChecks(prev => {
          // Si llega __total por WebSocket, lo dejamos
          const merged = { ...prev, ...data };
          localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
          return merged;
        });
      } catch { console.warn('WS frame ignorado', evt.data); }
    };

    wsRef.current = ws;
    return () => ws.close();
  }, [tipo, documento]);

  // toggle preservando __total
  const toggle = (linea_id, checked) => {
    setChecks(prev => {
      // Preserva el campo __total si ya existe
      const { __total, ...rest } = prev;
      const next = { ...rest, [linea_id]: checked };
      if (__total !== undefined) next.__total = __total;
      localStorage.setItem(CACHE_KEY, JSON.stringify(next));  // cache
      return next;
    });
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ [linea_id]: checked }));
    }
  };

  return [checks, toggle];
}
