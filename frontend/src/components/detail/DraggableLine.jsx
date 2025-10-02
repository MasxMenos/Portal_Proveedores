// src/components/detail/DraggableLine.jsx
import React, { forwardRef, useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useTranslation } from "react-i18next";
import Paginator from "../detail/Paginator";

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
    },
    ref
  ) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const isDark = theme === "dark";

    // ---- tablas auxiliares ----
    const renderMovementsTable = () => {
      if (!movementsPaginados.length) return null;
      return (
        <div className="overflow-x-auto -mx-2 md:mx-0">
          <table className="w-full text-sm md:text-[15px] leading-relaxed">
            <thead>
              <tr className={isDark ? "text-gray-400" : "text-gray-500"}>
                <th className="py-2 px-2 text-left">{t("detail.master.CO", "CO")}</th>
                <th className="py-2 px-2 text-left">{t("detail.movements.description", "Descripción")}</th>
                <th className="py-2 px-2 text-left">{t("detail.movements.debits", "Débitos")}</th>
                <th className="py-2 px-2 text-left">{t("detail.movements.credits", "Créditos")}</th>
              </tr>
            </thead>
            <tbody>
              {movementsPaginados.map((m, i) => (
                <tr key={i} className={`border-t ${isDark ? "border-[#222]" : "border-gray-300"}`}>
                  <td className="py-2 px-2 align-top">{m.CO}</td>
                  <td className="py-2 px-2 align-top break-words">{m.Descripcion ?? "-"}</td>
                  <td className="py-2 px-2 align-top">${(m.Debitos ?? 0).toLocaleString()}</td>
                  <td className="py-2 px-2 align-top">${(m.Creditos ?? 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };

    const renderRetenciones = () => {
      if (!line?.retencion?.length) return null;
      return (
        <>
          <h4 className="text-sm md:text-[15px] font-semibold mt-5 mb-2">
            {t("detail.retentionTitle", "Retenciones")}
          </h4>
          <div className="overflow-x-auto -mx-2 md:mx-0">
            <table className="w-full text-sm md:text-[15px] leading-relaxed">
              <thead>
                <tr className={isDark ? "text-gray-400" : "text-gray-500"}>
                  <th className="py-2 px-2 text-left">{t("detail.master.CO", "CO")}</th>
                  <th className="py-2 px-2 text-left">{t("detail.retention.clase", "Clase")}</th>
                  <th className="py-2 px-2 text-left">{t("detail.retention.description", "Descripción")}</th>
                  <th className="py-2 px-2 text-left">{t("detail.retention.total", "Total")}</th>
                </tr>
              </thead>
              <tbody>
                {line.retencion.map((r, i) => (
                  <tr key={i} className={`border-t ${isDark ? "border-[#222]" : "border-gray-300"}`}>
                    <td className="py-2 px-2 align-top">{r.CO}</td>
                    <td className="py-2 px-2 align-top">{r.Clase}</td>
                    <td className="py-2 px-2 align-top break-words">{r.Descripcion}</td>
                    <td className="py-2 px-2 align-top">${(r.Total_Retencion ?? 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );
    };

    // Alineado de la card con el rail
    const wrapperStyle = useMemo(
      () => ({
        marginLeft:
          "calc(var(--card-offset, calc(var(--rail-x, 48px) + var(--connector, 28px) + 8px)) + var(--child-indent, 0px))",
      }),
      []
    );

    // === Calcular datos para Paginator (movimientos) ===
    const blockSize = 4;
    const blockIndex = Math.floor((paginaActual - 1) / blockSize);
    const start = blockIndex * blockSize + 1;
    const end = Math.min(start + blockSize - 1, totalPaginas);

    const pageNumbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    const hasPrevGroup = blockIndex > 0;
    const hasNextGroup = (blockIndex + 1) * blockSize < totalPaginas;
    const prevGroupPage = hasPrevGroup ? (blockIndex - 1) * blockSize + 1 : null;
    const nextGroupPage = hasNextGroup ? (blockIndex + 1) * blockSize + 1 : null;

    const labelClass = isDark ? "text-gray-400" : "text-gray-500";

    return (
      <div className="relative" style={wrapperStyle}>
        <div
          ref={ref}
          className={[
            "relative rounded-lg border shadow-sm",
            // padding normal; reservamos carril derecho solo para el toggle
            "pl-6 md:pl-8 pr-12 md:pr-14",
            isDark ? "bg-[#111] border-[#2a2a2a] text-gray-200" : "bg-white border-gray-200 text-gray-800",
          ].join(" ")}
        >
          {/* ===== Header (solo contenido, sin checkbox) ===== */}
          <div className="relative">
            {/* Botón expandir: fijo a la derecha y centrado vertical en desktop */}
            <button
              type="button"
              onClick={() => setExpanded((p) => ({ ...p, [line.id]: !p[line.id] }))}
              aria-expanded={!!expanded[line.id]}
              className="hidden lg:flex items-center justify-center absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded hover:bg-black/5 dark:hover:bg-white/10"
              title={expanded[line.id] ? t("detail.collapse", "Contraer") : t("detail.expand", "Expandir")}
            >
              {expanded[line.id] ? (
                <ChevronDown size={18} className="text-gray-400" />
              ) : (
                <ChevronRight size={18} className="text-gray-400" />
              )}
            </button>

            {/* Contenido (sin columna de checkbox) */}
            <div
              className={[
                "py-4 md:py-5",
                "max-h-[62vh] md:max-h-[68vh] overflow-y-auto",
                "lg:overflow-visible lg:max-h-none",
              ].join(" ")}
            >
              {/* xs/sm/md: label + value con scroll-x si se desborda */}
              <div className="lg:hidden overflow-x-auto">
                <div className="grid grid-cols-1 gap-y-2 min-w-[420px]">
                  {[
                    { label: t("detail.master.CO", "CO"), value: line.CO, mono: true },
                    { label: t("detail.master.labelDocumento", "Documento"), value: line.documento },
                    { label: t("detail.master.providerDate", "Fecha proveedor"), value: line.fecha },
                    { label: t("detail.movements.debits", "Débitos"), value: (line.debitos ?? 0).toLocaleString() },
                    { label: t("detail.movements.credits", "Créditos"), value: (line.creditos ?? 0).toLocaleString() },
                  ].map(({ label, value, mono }, i) => (
                    <div key={i} className="flex items-baseline gap-2 min-w-0">
                      <span className={`shrink-0 ${labelClass}`}>{label}</span>
                      <span
                        className={["min-w-0", mono ? "font-mono" : "", "truncate break-words"].join(" ")}
                        title={value ?? ""}
                      >
                        {value ?? "-"}
                      </span>
                    </div>
                  ))}

                  {/* Botón expandir debajo en sm/md */}
                  <div className="pt-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10"
                      onClick={() => setExpanded((p) => ({ ...p, [line.id]: !p[line.id] }))}
                      aria-expanded={!!expanded[line.id]}
                    >
                      {expanded[line.id] ? (
                        <>
                          <ChevronDown size={18} className="text-gray-500" />
                          <span className="text-sm">{t("detail.collapse", "Contraer")}</span>
                        </>
                      ) : (
                        <>
                          <ChevronRight size={18} className="text-gray-500" />
                          <span className="text-sm">{t("detail.expand", "Expandir")}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* lg+: grid 5 columnas */}
              <div className="hidden lg:grid w-full grid-cols-5 gap-x-8 gap-y-1 items-center text-sm">
                {/* labels */}
                <div className={labelClass}>{t("detail.master.CO", "CO")}</div>
                <div className={labelClass}>{t("detail.master.labelDocumento", "Documento")}</div>
                <div className={labelClass}>{t("detail.master.providerDate", "Fecha proveedor")}</div>
                <div className={labelClass}>{t("detail.movements.debits", "Débitos")}</div>
                <div className={labelClass}>{t("detail.movements.credits", "Créditos")}</div>
                {/* valores */}
                <div className="min-w-0 font-mono truncate break-words">{line.CO}</div>
                <div className="min-w-0 truncate break-words">{line.documento}</div>
                <div className="min-w-0 truncate break-words">{line.fecha}</div>
                <div className="min-w-0 truncate break-words">
                  ${ (line.debitos ?? 0).toLocaleString() }
                </div>
                <div className="min-w-0 truncate break-words">
                  ${ (line.creditos ?? 0).toLocaleString() }
                </div>
              </div>
            </div>
          </div>

          {/* ===== Detalle expandible ===== */}
          {expanded[line.id] && (
            <div
              className={[
                "px-3 pb-4 md:px-6 md:pb-6 border-t-2 border-dashed rounded-b-lg",
                isDark ? "bg-[#111] border-gray-600" : "bg-gray-50 border-gray-300",
              ].join(" ")}
            >
              <h3 className="text-sm md:text-[15px] font-semibold mt-2 mb-3">
                {t("detail.movementsTitle", "Movimientos")}
              </h3>

              {renderMovementsTable()}

              {totalPaginas > 1 && (
                <Paginator
                  currentPage={paginaActual}
                  totalPages={totalPaginas}
                  pageNumbers={pageNumbers}
                  hasPrevGroup={hasPrevGroup}
                  hasNextGroup={hasNextGroup}
                  prevGroupPage={prevGroupPage}
                  nextGroupPage={nextGroupPage}
                  onSetPage={setPaginaActual}
                  isDark={isDark}
                  className="mb-3"  // ligera separación inferior
                  labels={{
                    prevGroup: t("pagination.prevGroup", "Grupo anterior"),
                    nextGroup: t("pagination.nextGroup", "Grupo siguiente"),
                  }}
                />
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
