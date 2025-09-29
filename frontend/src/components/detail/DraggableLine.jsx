// src/components/detail/DraggableLine.jsx
import React, { forwardRef, useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useTranslation } from "react-i18next";

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
    },
    ref
  ) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const isDark = theme === "dark";

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
{/* ===== Header (checkbox en su propia COLUMNA + contenido) ===== */}
<div className="relative">

  {/* Botón expandir: fijo a la derecha y centrado vertical en desktop */}
  <button
    type="button"
    onClick={() => setExpanded((p) => ({ ...p, [line.id]: !p[line.id] }))}
    aria-expanded={!!expanded[line.id]}
    className="hidden lg:flex items-center justify-center absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded hover:bg-black/5 dark:hover:bg-white/10"
    title={expanded[line.id] ? t('detail.collapse','Contraer') : t('detail.expand','Expandir')}
  >
    {expanded[line.id] ? (
      <ChevronDown size={18} className="text-gray-400" />
    ) : (
      <ChevronRight size={18} className="text-gray-400" />
    )}
  </button>

  {/* Grid con COLUMNA para checkbox (izq) y COLUMNA para contenido (der) */}
  <div
    className={[
      // 2 columnas: [checkbox | contenido]
      "grid grid-cols-[28px_1fr] md:grid-cols-[32px_1fr] lg:grid-cols-[40px_1fr] gap-x-3",
      // alturas/scroll: sm/md scrolleable; en lg+ sin límite
      "py-4 md:py-5",
      "max-h-[62vh] md:max-h-[68vh] overflow-y-auto",
      "lg:overflow-visible lg:max-h-none",
    ].join(" ")}
  >

    {/* Columna 1: checkbox (alineado cerca de 'CO' en sm/md, centrado vertical en lg+) */}
    <div className="flex">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={(e) => onToggleChecked(e.target.checked)}
        title={t('detail.checkboxTooltip','Marcar como revisado')}
        className={[
          "w-4 h-4 accent-brand-500 cursor-pointer",
          // en móvil/tablet, un poco más abajo para quedar a la altura de CO
          "mt-1 md:mt-1.5",
          // en desktop centrado vertical respecto al bloque derecho
          "lg:mt-0 lg:self-center",
        ].join(" ")}
      />
    </div>

    {/* Columna 2: contenido */}
    <div className="min-w-0">
      {(() => {
        const labelClass = isDark ? "text-gray-400" : "text-gray-500";
        const fields = [
          { label: t("detail.master.CO", "CO"), value: line.CO, mono: true },
          { label: t("detail.master.labelDocumento", "Documento"), value: line.documento },
          { label: t("detail.master.providerDate", "Fecha proveedor"), value: line.fecha },
          { label: t("detail.movements.debits", "Débitos"), value: (line.debitos ?? 0).toLocaleString() },
          { label: t("detail.movements.credits", "Créditos"), value: (line.creditos ?? 0).toLocaleString() },
        ];

        return (
          <>
            {/* xs/sm/md: label + value en una línea; habilita scroll-x si se desborda */}
            <div className="lg:hidden overflow-x-auto">
              <div className="grid grid-cols-1 gap-y-2 min-w-[420px]">
                {fields.map(({ label, value, mono }, i) => (
                  <div key={i} className="flex items-baseline gap-2 min-w-0">
                    <span className={`shrink-0 ${labelClass}`}>{label}</span>
                    <span
                      className={[
                        "min-w-0",
                        mono ? "font-mono" : "",
                        "truncate break-words",
                      ].join(" ")}
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
                        <span className="text-sm">{t("detail.collapse","Contraer")}</span>
                      </>
                    ) : (
                      <>
                        <ChevronRight size={18} className="text-gray-500" />
                        <span className="text-sm">{t("detail.expand","Expandir")}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* lg+: grid 5 columnas x 2 filas, a lo ancho de la card (uniforme) */}
            <div className="hidden lg:grid w-full grid-cols-5 gap-x-8 gap-y-1 items-center text-sm">
              {/* labels */}
              <div className={labelClass}>{t("detail.master.CO","CO")}</div>
              <div className={labelClass}>{t("detail.master.labelDocumento","Documento")}</div>
              <div className={labelClass}>{t("detail.master.providerDate","Fecha proveedor")}</div>
              <div className={labelClass}>{t("detail.movements.debits","Débitos")}</div>
              <div className={labelClass}>{t("detail.movements.credits","Créditos")}</div>
              {/* valores */}
              <div className="min-w-0 font-mono truncate break-words">{line.CO}</div>
              <div className="min-w-0 truncate break-words">{line.documento}</div>
              <div className="min-w-0 truncate break-words">{line.fecha}</div>
              <div className="min-w-0 truncate break-words">${(line.debitos ?? 0).toLocaleString()}</div>
              <div className="min-w-0 truncate break-words">${(line.creditos ?? 0).toLocaleString()}</div>
            </div>
          </>
        );
      })()}
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
                <div className="flex flex-wrap justify-center items-center gap-2 py-3">
                  {Array.from({ length: totalPaginas }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPaginaActual(i + 1)}
                      className="px-3 py-1.5 rounded text-sm md:text-[15px] transition-colors bg-gray-300 text-gray-700 hover:bg-gray-200"
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
