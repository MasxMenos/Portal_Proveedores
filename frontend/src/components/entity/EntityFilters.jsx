// src/components/entidad/EntidadFilters.jsx
import React from "react";
import { useTranslation } from "react-i18next";


export default function EntidadFilters({
  isDark,
  fechaInicio,
  fechaFin,
  onStartChange,
  onEndChange,
  onConsultar,
}) {
  const { t } = useTranslation();

  return (
    <div
      className="flex flex-col md:flex-row gap-4 mb-4"
      id="botones-filtrar"
    >
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        <label
          className={`text-sm ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {t("entity.filters.startDate")}
        </label>
        <input
          type="date"
          value={fechaInicio}
          onChange={onStartChange}
          className={`px-3 py-2 rounded focus:outline-none flex-1 ${
            isDark ? "bg-[#111] text-white" : "bg-gray-200 text-black"
          }`}
        />
      </div>

      <div className="flex items-center space-x-2 flex-1 min-w-0">
        <label
          className={`text-sm ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {t("entity.filters.endDate")}
        </label>
        <input
          type="date"
          value={fechaFin}
          onChange={onEndChange}
          className={`px-3 py-2 rounded focus:outline-none flex-1 ${
            isDark ? "bg-[#111] text-white" : "bg-gray-200 text-black"
          }`}
        />
      </div>

      <button
        onClick={onConsultar}
        className="ml-auto bg-[#0d6efd] hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        {t("entity.filters.consult")}
      </button>

    
    </div>
  );
}
