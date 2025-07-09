// src/components/entidad/EntidadDownloadButton.jsx
import React from "react";
import { useTranslation } from "react-i18next";

export default function EntidadDownloadButton({ isDark }) {
  const { t } = useTranslation();
  return (
    <button
      className="hover:underline text-sm"
      style={{ color: isDark ? "#FFFFFF" : "#203159" }}
    >
      {t("entity.downloadXLSX")}
    </button>
  );
}
