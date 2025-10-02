// src/components/entidad/EntidadTable.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { PlusCircle, Download as DownloadIcon } from "lucide-react";
import { useDocumentDownload } from "../../hooks/useDocumentDownload";
import Paginator from "../detail/Paginator";

export default function EntidadTable({
  isDark,
  tipo,
  paginatedData,
  onRowClick,
  currencyFields = [],
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
  const handleAction = useDocumentDownload(tipo, onRowClick);

  // Formateador de moneda (ajusta locale y currency según necesites)
  const currencyFormatter = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 2,
  });

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
              {fields.map((fieldKey, idx) => {
                let value = item[fieldKey];
                // Si este campo está en currencyFields y es number, lo formateamos
                if (currencyFields.includes(fieldKey) && typeof value === "number") {
                  value = currencyFormatter.format(value);
                }
                return (
                  <td key={idx} className="px-4 py-3 text-center">
                    {value}
                  </td>
                );
              })}

              {/* Acción (ver/descargar) */}
              <td className="px-4 py-3 text-center">
                <span
                  className="cursor-pointer inline-flex items-center justify-center"
                  title={viewLabel}
                  onClick={() => handleAction(item, item.co)}
                >
                  {tipo === "payments" ? (
                    <PlusCircle size={18} color="#003789" />
                  ) : (
                    <DownloadIcon size={18} color="#003789" />
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación (componente reutilizable) */}
      <Paginator
        currentPage={currentPage}
        totalPages={totalPages}
        pageNumbers={pageNumbers}
        hasPrevGroup={hasPrevGroup}
        hasNextGroup={hasNextGroup}
        prevGroupPage={prevGroupPage}
        nextGroupPage={nextGroupPage}
        onSetPage={setCurrentPage}
        isDark={isDark}
        labels={{
          prev: t("pagination.prev", "Anterior"),
          next: t("pagination.next", "Siguiente"),
          prevGroup: t("pagination.prevGroup", "Grupo anterior"),
          nextGroup: t("pagination.nextGroup", "Grupo siguiente"),
        }}
        className="mb-4"
      />
    </div>
  );
}
