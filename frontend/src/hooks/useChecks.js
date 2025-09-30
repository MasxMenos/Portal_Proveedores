// src/hooks/useChecks.js
import { useEffect, useRef, useState, useCallback } from "react";

export function useChecks(tipo, documento) {
  const CACHE_KEY = `checks:${tipo}:${documento}`;

  const [checks, setChecks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    } catch {
      return {};
    }
  });

  const wsRef = useRef(null);
  const retryRef = useRef(0);
  const aliveRef = useRef(true);
  const sendQueueRef = useRef([]); // mensajes pendientes si aún no hay OPEN

  // Helpers
  const persist = useCallback((obj) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
    } catch {}
  }, [CACHE_KEY]);

  const mergeIncoming = useCallback((payload) => {
    // payload esperado: { id: bool } o { __total: n, id: bool, ... }
    setChecks((prev) => {
      const merged = { ...prev, ...payload };
      persist(merged);
      return merged;
    });
  }, [persist]);

  const openUrl = useCallback(() => {
    const scheme = window.location.protocol === "https:" ? "wss" : "ws";
    // Tu endpoint original:
    return `${scheme}://${window.location.host}/ws/checks/${tipo}/${documento}/`;
  }, [tipo, documento]);

  // Enviar (con cola si no está OPEN)
  const send = useCallback((dataObj) => {
    const frame = JSON.stringify(dataObj);
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(frame);
    } else {
      sendQueueRef.current.push(frame);
    }
  }, []);

  const drainQueue = useCallback(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    while (sendQueueRef.current.length) {
      ws.send(sendQueueRef.current.shift());
    }
  }, []);

  // Toggle preservando __total (igual que tu implementación)
  const toggle = useCallback((linea_id, checked) => {
    setChecks((prev) => {
      const { __total, ...rest } = prev || {};
      const next = { ...rest, [linea_id]: checked };
      if (__total !== undefined) next.__total = __total;
      persist(next);
      return next;
    });
    send({ [linea_id]: checked });
  }, [persist, send]);

  useEffect(() => {
    if (!tipo || !documento) return;
    aliveRef.current = true;

    let pingId = null;

    const connect = () => {
      const ws = new WebSocket(openUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        retryRef.current = 0;
        drainQueue();
      };

      ws.onmessage = (evt) => {
        // Algunos proxies/liberías envían frames tipo 'o', 'h', etc.
        if (evt.data === "o" || evt.data === "h") return;

        try {
          const msg = JSON.parse(evt.data);

          // Admite varios formatos:
          // 1) { id1: true, id2: false, __total: 5 }
          if (msg && !msg.type) {
            mergeIncoming(msg);
            return;
          }

          // 2) { type: 'bulk', data: { ... } }
          if (msg?.type === "bulk" && msg?.data && typeof msg.data === "object") {
            mergeIncoming(msg.data);
            return;
          }

          // 3) { type: 'check:update', id, value }
          if (msg?.type === "check:update" && "id" in msg && "value" in msg) {
            mergeIncoming({ [msg.id]: msg.value });
            return;
          }
        } catch {
          // Si llega algo no JSON, ignoramos
        }
      };

      ws.onclose = () => {
        if (!aliveRef.current) return;
        // Backoff exponencial simple
        const delay = Math.min(1000 * Math.pow(2, retryRef.current++), 15000);
        setTimeout(connect, delay);
      };

      ws.onerror = () => {
        try { ws.close(); } catch {}
      };
    };

    connect();

    // Keepalive ping (algunos backends lo ignoran, pero ayuda con LB/Proxies)
    pingId = setInterval(() => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        try { ws.send(JSON.stringify({ type: "ping", ts: Date.now() })); } catch {}
      }
    }, 25000);

    // Limpieza al desmontar o cambiar documento
    return () => {
      aliveRef.current = false;
      clearInterval(pingId);
      try { wsRef.current?.close(); } catch {}
      wsRef.current = null;
      sendQueueRef.current = [];
    };
  }, [tipo, documento, openUrl, drainQueue, mergeIncoming]);

  // Si cambia tipo/documento, actualiza el estado desde cache correspondiente
  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
      setChecks(cached);
    } catch {
      setChecks({});
    }
  }, [CACHE_KEY]);

  return [checks, toggle];
}
