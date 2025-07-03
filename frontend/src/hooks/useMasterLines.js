// src/hooks/useMasterLines.js
import { useEffect, useState } from "react";
import { masterTemplate, linesTemplate } from "../data/documents";

export function useMasterLines(documentoId) {
  const [master, setMaster] = useState(null);
  const [lines, setLines] = useState([]);

  useEffect(() => {
    setMaster({
      ...masterTemplate,
      documento: documentoId,
    });

    setLines(
      [...Array(3)].map((_, idx) => ({
        id: idx + 1,
        documento: documentoId,
        ...linesTemplate[0], // usa la plantilla base y extiéndela
      }))
    );
  }, [documentoId]);

  return { master, lines };
}
