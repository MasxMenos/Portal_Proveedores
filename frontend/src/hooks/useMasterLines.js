// src/hooks/useMasterLines.js
import { useState, useEffect } from "react";

/**
 * Hook que trae maestro + líneas desde el backend **y** los guarda en localStorage
 * para que al recargar la vista aparezcan al instante sin parpadeo.
 *
 * @param {Object}   params
 * @param {string}   params.tipo         payments | invoices | returns …
 * @param {string}   params.documentoId  CSC / id del documento a consultar
 * @param {string=}  params.tipoDocto    RCP / FVE … (opcional)
 */
export function useMasterLines({ tipo, documentoId, tipoDocto }) {
  const cacheKey = `detail:${tipo}:${documentoId}`;

  // ───────────────────────── cache → estado inicial ─────────────────────────
  const [master, setMaster] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
      return cached?.master ?? null;
    } catch {
      return null;
    }
  });

  const [lines, setLines] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
      return cached?.lines ?? [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // Helper para timeout en fetch
  function fetchWithTimeout(resource, options = {}) {
    const { timeout = 30000 } = options; // 60s default
    return Promise.race([
      fetch(resource, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("La petición tardó demasiado. Intenta de nuevo.")), timeout)
      )
    ]);
  }

  // ───────────────────────── fetch + cache ────────────────────────────────
  useEffect(() => {
    if (!tipo || !documentoId) return;

    // Si ya tenemos líneas, evitamos mostrar spinner de carga
    if (!lines.length) setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (tipoDocto) params.append("tipoDocto", tipoDocto);
    params.append("csc", documentoId);

    // ⏰ Usa fetchWithTimeout
    fetchWithTimeout(`/api/${tipo}/detail/?${params.toString()}`, { timeout: 30000 })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data) || !data.length) {
          setMaster(null);
          setLines([]);
          localStorage.removeItem(cacheKey);
          return;
        }

        const [first, ...rest] = data;
        const newLines = [first, ...rest].map((item, idx) => ({ id: idx + 1, ...item }));

        setMaster({ ...first });
        setLines(newLines);

        // 🔒 Guardar en cache
        localStorage.setItem(cacheKey, JSON.stringify({ master: { ...first }, lines: newLines }));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    // Sólo refetch si cambia el documento o tipo
  }, [tipo, documentoId, tipoDocto]);

  return { master, lines, loading, error };
}
