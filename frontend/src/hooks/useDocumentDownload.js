// src/hooks/useDocumentDownload.js
import { useCallback } from "react";

export function useDocumentDownload(tipo, onRowClick) {
  return useCallback(
    async (item) => {
      // Si es payments, navegamos sólo si onRowClick es función
      if (tipo === "payments") {
        if (typeof onRowClick === "function") {
          onRowClick(item);
        }
        return;
      }

      // Para otros tipos (descarga de PDF)
      const rawDoc = item.documento || "";
      const [before, after = ""] = rawDoc.split("-", 2);
      const lettersOnly = before.replace(/[^A-Za-z]/g, "");
      const merged = lettersOnly + after.replace(/-/g, "");
      const m = merged.match(/[A-Z]{3}\d+/i);
      if (!m) {
        alert("No pude extraer el código del documento");
        return;
      }
      const code = m[0].toUpperCase();

      try {
        const res = await fetch(`/api/documentos/${code}/`);
        if (!res.ok) throw new Error();
        const { url } = await res.json();
        window.open(url, "_blank");
      } catch {
        alert("Documento no encontrado");
      }
    },
    [tipo, onRowClick]
  );
}
