// src/components/detail/DraggableLine.jsx
import React, { forwardRef } from "react";
import Draggable from "react-draggable";
import { ChevronDown, ChevronRight, Download } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useTranslation } from "react-i18next";

/**
 * Tarjeta hija draggable.
 * Soporta:
 *  • Movimientos en dos formatos (legacy / nuevo)
 *  • Tabla de retenciones (opcional)
 *  • Checkbox de revisión (sincronizado y persistente)
 */
const DraggableLine = forwardRef(
  (
    {
      line,
      idx,
      expanded,
      setExpanded,
      onDrag,
      onStop,
      movementsPaginados,
      totalPaginas,
      paginaActual,
      setPaginaActual,
      isChecked,
      onToggleChecked,
      totalLines,            // ← número total de cartas hijas
      masterDocumento,
    },
    ref
  ) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const isDark = theme === "dark";

    const defaultX = 360;
    const defaultY = idx * 180 + 40;


    const STORAGE_KEY = `checks-payments-${masterDocumento}`;

    // Estado local del checkbox
    const [localChecked, setLocalChecked] = React.useState(isChecked);

    // 1) Inicializar o actualizar total y checked[] en storage
   // Inicializa total y lista checked en storage (sólo al montar)
    React.useEffect(() => {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ total: totalLines, checked: [] })
        );
      }
    // sólo en el primer render
    }, []); 

    // 2) Escuchar cambios de storage (otras pestañas)
    React.useEffect(() => {
      const handler = (e) => {
        if (e.key !== STORAGE_KEY) return;
        const state = JSON.parse(e.newValue || "{}");
        const isNow = state.checked.includes(line.id);
        setLocalChecked(isNow);
        onToggleChecked(isNow);
      };
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    }, [STORAGE_KEY, line.id]);

    // 3) Cuando toggles, persiste en storage
    const handleCheckbox = (checked) => {
      setLocalChecked(checked);
      onToggleChecked(checked);

      const state = JSON.parse(localStorage.getItem(STORAGE_KEY));
      const arr = new Set(state.checked);
      if (checked) arr.add(line.id);
      else arr.delete(line.id);

      state.checked = Array.from(arr);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    };

    /* -------------------------------------------------- */
    /* Helpers                                            */
    /* -------------------------------------------------- */
    const renderMovementsTable = () => {
      if (!movementsPaginados.length) return null;
      const sample = movementsPaginados[0];

      // 🔀 Formato antiguo (reg / cuenta / desc)
      if ("reg" in sample) {
        return (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400">
                <th className="py-1 text-left">{t("detail.master.CO", "CO")}</th>
                <th className="py-1 text-left">{t("detail.movements.reg", "Reg")}</th>
                <th className="py-1 text-left">{t("detail.movements.accountCode", "Cuenta")}</th>
                <th className="py-1 text-left">{t("detail.movements.accountDescription", "Descripción")}</th>
              </tr>
            </thead>
            <tbody>
              {movementsPaginados.map((m) => (
                <tr key={m.reg} className={`border-t ${isDark ? "border-[#222]" : "border-gray-300"}`}>
                  <td className="py-1">{m.CO}</td>
                  <td className="py-1">{m.reg}</td>
                  <td className="py-1">{m.cuenta}</td>
                  <td className="py-1">{m.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }

      // 🔀 Formato nuevo (Documento / Débitos / Créditos)
      return (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400">
              <th className="py-1 text-left">{t("detail.master.CO", "CO")}</th>
              <th className="py-1 text-left">{t("detail.movements.document", "Documento")}</th>
              <th className="py-1 text-left">{t("detail.movements.debits", "Débitos")}</th>
              <th className="py-1 text-left">{t("detail.movements.credits", "Créditos")}</th>
            </tr>
          </thead>
          <tbody>
            {movementsPaginados.map((m, i) => (
              <tr key={i} className={`border-t ${isDark ? "border-[#222]" : "border-gray-300"}`}>
                <td className="py-1">{m.CO}</td>
                <td className="py-1">{m.Documento ?? "-"}</td>
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
                  <td className="py-1">${r.Total_Retencion.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      );
    };

    /* -------------------------------------------------- */
    /* Render                                             */
    /* -------------------------------------------------- */
    return (
      <Draggable
        nodeRef={ref}
        defaultPosition={{ x: defaultX, y: defaultY }}
        bounds="parent"
        onDrag={onDrag}
        onStop={onStop}
      >
        <div
          ref={ref}
          className={`child-${line.documento} absolute p-4 md:p-6 rounded-lg w-[90vw] max-w-[700px] left-[5vw] md:left-[300px] cursor-move z-10 ${
            isDark ? "bg-[#111] text-gray-200" : "bg-white text-gray-800 border border-gray-300"
          }`}
        >
          {/* Encabezado */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 child-header">
            {/* Acciones */}
            <div className="flex items-center gap-3">
              <Download
                size={18}
                className="text-gray-400"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log(`Descargar documento: ${line.documento}`);
                }}
              />
             <input
               type="checkbox"
               checked={localChecked}
               onChange={(e) => handleCheckbox(e.target.checked)}
                className="w-4 h-4 accent-brand-500 cursor-pointer"
                title={t("detail.checkboxTooltip", "Marcar como revisado")}
              />
            </div>

            {/* Info básica */}
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
                <div className="hidden md:block">${line.debitos.toLocaleString()}</div>
                <div className="hidden md:block">${line.creditos.toLocaleString()}</div>
              </div>
            </div>

            {/* Toggle expand */}
            <div
              className="self-start md:self-center cursor-pointer"
              onClick={() => setExpanded((p) => ({ ...p, [line.id]: !p[line.id] }))}
            >
              {expanded[line.id] ? (
                <ChevronDown size={18} className="text-gray-400" />
              ) : (
                <ChevronRight size={18} className="text-gray-400" />
              )}
            </div>
          </div>

          {/* Detalle expandible */}
          {expanded[line.id] && (
            <div
              className={`mt-4 p-4 border-t-2 border-dashed rounded-b-lg overflow-x-hidden ${
                isDark ? "bg-[#111] border-gray-600" : "bg-gray-100 border-gray-300"
              }`}
            >
              <h3 className="text-sm font-semibold mb-2">{t("detail.movementsTitle", "Movimientos")}</h3>

              {renderMovementsTable()}

              {/* Paginación movimientos */}
              {totalPaginas > 1 && (
                <div className="flex justify-center items-center space-x-2 py-2">
                  {Array.from({ length: totalPaginas }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPaginaActual(i + 1)}
                      className={`px-2 py-1 rounded text-sm ${
                        paginaActual === i + 1
                          ? "bg-[#203159] text-white"
                          : isDark
                          ? "bg-[#222] text-gray-300"
                          : "bg-gray-300 text-gray-700"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}

              {/* Retenciones */}
              {renderRetenciones()}
            </div>
          )}
        </div>
      </Draggable>
    );
  }
);

export default DraggableLine;
