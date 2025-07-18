// src/components/entidad/EntidadTable.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { PlusCircle, Download as DownloadIcon } from "lucide-react";

export default function EntidadTable({
  isDark,
  tipo,
  paginatedData,
  onRowClick,

  /* paginación */
  currentPage,
  totalPages,
  pageNumbers,
  hasPrevGroup,
  hasNextGroup,
  prevGroupPage,
  nextGroupPage,
  setCurrentPage,
}) {
  const { t } = useTranslation();
  const headers   = t(`entity.table.${tipo}.headers`, { returnObjects: true });
  const fields    = t(`entity.table.${tipo}.fields`,  { returnObjects: true });
  const viewLabel = t("entity.view");

  const handleAction = (item) => {
    if (tipo === "payments") {
      onRowClick(item);
    } else {
      const link = document.createElement("a");
      link.href = "/blank.pdf";
      link.download = `${documento}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className={`entity-table overflow-auto rounded-lg ${isDark ? "bg-[#111]" : "bg-gray-100"}`}>
      <table className="min-w-full text-sm">
        <thead>
          <tr className={isDark ? "bg-[#222]" : "bg-gray-200"}>
            {headers.map((h, idx) => (
              <th
                key={idx}
                className={`px-4 py-2 text-center ${isDark ? "text-gray-400" : "text-gray-700"}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((item, i) => (
            <tr
              key={i}
              className={`border-t ${
                isDark ? "border-[#222] hover:bg-[#1a1a1a]" : "border-gray-300 hover:bg-gray-100"
              }`}
            >
              {fields.map((fieldKey, idx) => (
                <td key={idx} className="px-4 py-3 text-center">
                  {item[fieldKey]}
                </td>
              ))}

              <td className="px-4 py-3 text-center">
                <span
                  className="cursor-pointer inline-flex items-center justify-center"
                  title={viewLabel}
                  onClick={() => handleAction(item)}
                >
                  {tipo === "payments" ? (
                    <PlusCircle size={18} color="#203259" />
                  ) : (
                    <DownloadIcon size={18} color="#203259" />
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="flex justify-center items-center space-x-2 py-4">
        {hasPrevGroup && (
          <button
            className={`px-2 py-1 rounded ${isDark ? "bg-[#222] text-gray-300" : "bg-gray-300 text-gray-700"}`}
            onClick={() => setCurrentPage(prevGroupPage)}
          >
            «
          </button>
        )}
        {currentPage > 1 && (
          <button
            className={`px-2 py-1 rounded ${isDark ? "bg-[#222] text-gray-300" : "bg-gray-300 text-gray-700"}`}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            ‹
          </button>
        )}
        {pageNumbers.map((p) => (
          <button
            key={p}
            className={`px-3 py-1 rounded ${
              p === currentPage
                ? "bg-[#203159] text-white"
                : isDark
                ? "bg-[#222] text-gray-300"
                : "bg-gray-300 text-gray-700"
            }`}
            onClick={() => setCurrentPage(p)}
          >
            {p}
          </button>
        ))}
        {currentPage < totalPages && (
          <button
            className={`px-2 py-1 rounded ${isDark ? "bg-[#222] text-gray-300" : "bg-gray-300 text-gray-700"}`}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            ›
          </button>
        )}
        {hasNextGroup && (
          <button
            className={`px-2 py-1 rounded ${isDark ? "bg-[#222] text-gray-300" : "bg-gray-300 text-gray-700"}`}
            onClick={() => setCurrentPage(nextGroupPage)}
          >
            »
          </button>
        )}
      </div>
    </div>
  );
}
