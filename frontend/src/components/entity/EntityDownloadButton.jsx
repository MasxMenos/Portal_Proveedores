// src/components/entidad/EntidadDownloadButton.jsx
import React from "react";

export default function EntidadDownloadButton({ isDark }) {
  return (
    <button className="hover:underline text-sm" style={{ color: isDark ? "#FFFFFF" : "#203159" }}>
      Descargar XLSX
    </button>
  );
}
