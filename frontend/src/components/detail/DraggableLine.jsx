// src/components/detail/DraggableLine.jsx
import React, { forwardRef } from "react";
import { ChevronDown, ChevronRight, Download } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useTranslation } from "react-i18next";
import { useDocumentDownload } from "../../hooks/useDocumentDownload";

const DraggableLine = forwardRef(
  (
    {
      line,
      expanded,
      setExpanded,
      movementsPaginados = [],
      totalPaginas = 1,
      paginaActual = 1,
      setPaginaActual,
      isChecked = false,
      onToggleChecked,
      tipo,
      onRowClick,
    },
    ref
  ) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const isDark = theme === "dark";
    const handleAction = useDocumentDownload(tipo, onRowClick);

    const renderMovementsTable = () => {
      if (!movementsPaginados.length) return null;
      return (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400">
              <th className="py-1 text-left">{t("detail.master.CO", "CO")}</th>
              <th className="py-1 text-left">{t("detail.movements.description", "Descripción")}</th>
              <th className="py-1 text-left">{t("detail.movements.debits", "Débitos")}</th>
              <th className="py-1 text-left">{t("detail.movements.credits", "Créditos")}</th>
            </tr>
          </thead>
          <tbody>
            {movementsPaginados.map((m, i) => (
              <tr key={i} className={`border-t ${isDark ? "border-[#222]" : "border-gray-300"}`}>
                <td className="py-1">{m.CO}</td>
                <td className="py-1">{m.Descripcion ?? "-"}</td>
                <td className="py-1">${(m.Debitos ?? 0).toLocaleString()}</td>
                <td className="py-1">${(m.Creditos ?? 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    };

    const renderRetenciones = () => {
      if (!line.retencion?.length) return null;
      return (
        <>
          <h4 className="text-sm font-semibold mt-4 mb-2">
            {t("detail.retentionTitle", "Retenciones")}
          </h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400">
                <th className="py-1 text-left">{t("detail.master.CO", "CO")}</th>
                <th className="py-1 text-left">{t("detail.retention.clase", "Clase")}</th>
                <th className="py-1 text-left">{t("detail.retention.description", "Descripción")}</th>
                <th className="py-1 text-left">{t("detail.retention.total", "Total")}</th>
              </tr>
            </thead>
            <tbody>
              {line.retencion.map((r, i) => (
                <tr key={i} className={`border-t ${isDark ? "border-[#222]" : "border-gray-300"}`}>
                  <td className="py-1">{r.CO}</td>
                  <td className="py-1">{r.Clase}</td>
                  <td className="py-1">{r.Descripcion}</td>
                  <td className="py-1">${(r.Total_Retencion ?? 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      );
    };

    // La card se alinea pegada al rail + conector; NO dibuja líneas aquí.
// src/components/detail/DraggableLine.jsx
    const wrapperStyle = {
      marginLeft:
        "calc(var(--card-offset, calc(var(--rail-x, 48px) + var(--connector, 28px) + 8px)) + var(--child-indent, 0px))",
      maxWidth: "980px",
    };



    return (
      <div className="relative" style={wrapperStyle}>
        <div
          ref={ref}
          className={`rounded-lg border shadow-sm ${
            isDark ? "bg-[#111] border-[#2a2a2a] text-gray-200" : "bg-white border-gray-200 text-gray-800"
          }`}
        >
          {/* Header */}
          <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <Download
                size={18}
                className="text-gray-400 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(line, line.CO ?? line.co ?? "");
                }}
                title={t("detail.downloadTooltip", "Descargar documento")}
              />
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => onToggleChecked(e.target.checked)}
                className="w-4 h-4 accent-brand-500 cursor-pointer"
                title={t("detail.checkboxTooltip", "Marcar como revisado")}
              />
            </div>

            <div className="flex-1 overflow-x-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-4 text-sm whitespace-nowrap min-w-max">
                <div className="text-gray-400">{t("detail.master.CO", "CO")}</div>
                <div className="text-gray-400">{t("detail.master.labelDocumento", "Documento")}</div>
                <div className="text-gray-400">{t("detail.master.providerDate", "Fecha")}</div>
                <div className="text-gray-400 hidden md:block">{t("detail.movements.debits", "Débitos")}</div>
                <div className="text-gray-400 hidden md:block">{t("detail.movements.credits", "Créditos")}</div>

                <div className="font-mono">{line.CO}</div>
                <div>{line.documento}</div>
                <div>{line.fecha}</div>
                <div className="hidden md:block">${(line.debitos ?? 0).toLocaleString()}</div>
                <div className="hidden md:block">${(line.creditos ?? 0).toLocaleString()}</div>
              </div>
            </div>

            <button
              type="button"
              className="self-start md:self-center cursor-pointer"
              onClick={() => setExpanded((p) => ({ ...p, [line.id]: !p[line.id] }))}
              aria-expanded={!!expanded[line.id]}
            >
              {expanded[line.id] ? (
                <ChevronDown size={18} className="text-gray-400" />
              ) : (
                <ChevronRight size={18} className="text-gray-400" />
              )}
            </button>
          </div>

          {/* Detalle */}
          {expanded[line.id] && (
            <div
              className={`px-4 pb-4 md:px-6 md:pb-6 border-t-2 border-dashed rounded-b-lg overflow-x-hidden ${
                isDark ? "bg-[#111] border-gray-600" : "bg-gray-50 border-gray-300"
              }`}
            >
              <h3 className="text-sm font-semibold mt-2 mb-2">
                {t("detail.movementsTitle", "Movimientos")}
              </h3>

              {renderMovementsTable()}

              {totalPaginas > 1 && (
                <div className="flex justify-center items-center space-x-2 py-2">
                  {Array.from({ length: totalPaginas }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPaginaActual(i + 1)}
                      className={`px-2 py-1 rounded text-sm transition-colors ${
                        paginaActual === i + 1
                          ? "bg-[#0d6efd] text-white"
                          : isDark
                          ? "bg-[#222] text-gray-300 hover:bg-[#2a2a2a]"
                          : "bg-gray-300 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}

              {renderRetenciones()}
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default DraggableLine;
