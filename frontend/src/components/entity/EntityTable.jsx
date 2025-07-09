// src/components/entidad/EntidadTable.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { PlusCircle, Download as DownloadIcon } from "lucide-react";

export default function EntidadTable({
  isDark,
  tipo,
  paginatedData,
  onRowClick,
  totalPages,
  currentPage,
  setCurrentPage,
}) {
  const { t } = useTranslation();
  // obtenemos la lista de cabeceras como arreglo
  const headers = t("entity.table.headers", { returnObjects: true });
  const viewLabel = t("entity.table.view");

  return (
    <div
      className={`entity-table overflow-auto rounded-lg ${
        isDark ? "bg-[#111]" : "bg-gray-100"
      }`}
    >
      <table className="min-w-full text-sm">
        <thead>
          <tr className={isDark ? "bg-[#222]" : "bg-gray-200"}>
            {headers.map((h, idx) => (
              <th
                key={idx}
                className={`px-4 py-2 text-left ${
                  isDark ? "text-gray-400" : "text-gray-700"
                }`}
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
                isDark
                  ? "border-[#222] hover:bg-[#1a1a1a]"
                  : "border-gray-300 hover:bg-gray-100"
              }`}
            >
              <td className="px-4 py-3">{item.co}</td>
              <td className="px-4 py-3">{item.documento}</td>
              <td className="px-4 py-3">{item.fechaProveedor}</td>
              <td className="px-4 py-3">{item.fechaVencimiento}</td>
              <td className="px-4 py-3">{item.valorPago}</td>
              <td className="px-4 py-3">{item.saldo}</td>
              <td className="px-4 py-3">
                <span
                  className="cursor-pointer"
                  title={viewLabel}
                  onClick={() => onRowClick(item.documento)}
                >
                  {tipo === "certificados" ? (
                    <DownloadIcon size={18} color="#203259" />
                  ) : (
                    <PlusCircle size={18} color="#203259" />
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 py-4">
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx}
              className={`px-3 py-1 rounded ${
                currentPage === idx + 1
                  ? "bg-[#203159] text-white"
                  : isDark
                  ? "bg-[#222] text-gray-300"
                  : "bg-gray-300 text-gray-700"
              }`}
              onClick={() => setCurrentPage(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
