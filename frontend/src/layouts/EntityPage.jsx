// src/pages/EntidadPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/MainSidebar";
import HeaderSuperior from "../components/MainHeader";
import EntidadFilters from "../components/entity/EntityFilters";
import EntidadDownloadButton from "../components/entity/EntityDownloadButton";
import EntidadTable from "../components/entity/EntityTable";

import { useTheme } from "../components/ThemeContext";
import { usePagination } from "../hooks/usePagination";
import { useDateRange } from "../hooks/useDateRange";
import { useActivePage } from "../hooks/useActivePage";
import { useRowAction } from "../hooks/useRowAction";
import { useTranslation } from "react-i18next";

export default function EntidadPage({
  tipo,
  titulo,
  encabezado,
  datos,
  onNavigateBase,
  botonesExtra = [],
  extraFilters,          // { start, end, onStartChange, onEndChange, onConsultar }
  loading = false,
  selectedButtonIndex,   // índice controlado por el padre (opcional)
  onSelectButton,        // callback del padre para cambiar selección (opcional)
}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const activePage    = useActivePage(titulo);
  const navigate      = useNavigate();
  const handleNavClick = (path) => navigate(path);
  const onRowClick    = useRowAction(tipo, onNavigateBase);

  // filtros de fecha
  const {
    start: fechaInicio,
    end:   fechaFin,
    onStartChange,
    onEndChange,
    onConsultar,
  } = extraFilters || useDateRange();

  // ─────────────────────────────────────
  // 1) estado y filtrado global de búsqueda
  const [searchTerm, setSearchTerm] = useState("");

const filteredDatos = useMemo(() => {
  if (!searchTerm) return datos;
  const q = searchTerm.toLowerCase();

  // 1) Primero filtramos solo los que contengan q en algún campo
  const matches = datos.filter(item =>
    Object.values(item).some(v => 
      v != null && v.toString().toLowerCase().includes(q)
    )
  );

  // 2) Ahora ordenamos según tres niveles de prioridad:
  //    nivel 0 = algún campo **igual** a q
  //    nivel 1 = algún campo **empieza** con q
  //    nivel 2 = algún campo **contiene** q en otra posición
  return matches.sort((a, b) => {
    const aVals = Object.values(a).map(v => String(v).toLowerCase());
    const bVals = Object.values(b).map(v => String(v).toLowerCase());

    const rank = vals => {
      if (vals.some(v => v === q)) return 0;
      if (vals.some(v => v.startsWith(q))) return 1;
      return 2;
    };

    const ra = rank(aVals);
    const rb = rank(bVals);
    if (ra !== rb) return ra - rb;
    return 0; // mismo rango: mantenemos orden original
  });
}, [datos, searchTerm]);



  // 2) paginación sobre filteredDatos
  const {
    currentPage,
    totalPages,
    paginatedData,
    pageNumbers,
    hasPrevGroup,
    hasNextGroup,
    prevGroupPage,
    nextGroupPage,
    setCurrentPage,
  } = usePagination(filteredDatos, 10);

  // reset página al cambiar filtro o tipo
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedButtonIndex, setCurrentPage, searchTerm]);

  // selección de botones extra
  const [localSelected, setLocalSelected] = useState(null);
  const selected = selectedButtonIndex ?? localSelected;
  const selectFn = onSelectButton || setLocalSelected;
  // ─────────────────────────────────────

  // 3) Calcular progreso desde localStorage
  const progressData = useMemo(() => {
    const prog = {};
    filteredDatos.forEach((item) => {
      const key = `checks-payments-${item.documento}`;
      const stored = JSON.parse(localStorage.getItem(key) || "{}");
      const total   = stored.total   || 0;
      const checked = Array.isArray(stored.checkedIds) ? stored.checkedIds : [];
      prog[item.documento] = total > 0 ? checked.length / total : 0;
    });
    return prog;
  }, [filteredDatos]);

  return (
    <div className={`flex flex-col md:flex-row min-h-screen ${
      isDark ? "bg-black text-white" : "bg-white text-black"
    }`}>
      <Sidebar activePage={activePage} onNavClick={handleNavClick} />

      <main className="flex-1 p-6 md:ml-64 space-y-6 overflow-auto">
        {/* ahora le paso setSearchTerm */}
        <HeaderSuperior
          activePage={encabezado}
          title={titulo}
          onToggleTheme={toggleTheme}
          onSearch={setSearchTerm}
        />

        {botonesExtra.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4" id="botones_consulta">
            {botonesExtra.map((label, idx) => (
              <button
                key={label}
                onClick={() => selectFn(idx)}
                className={`px-4 py-2 rounded transition-colors duration-200 ${
                  selected === idx
                    ? (isDark ? "bg-[#111416] text-white" : "bg-gray-300 text-black")
                    : (isDark ? "bg-[#0A0D0F] hover:bg-[#111416] text-white" : "bg-gray-200 hover:bg-gray-300 text-black")
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <EntidadFilters
          isDark={isDark}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          onStartChange={onStartChange}
          onEndChange={onEndChange}
          onConsultar={onConsultar}
        />

        <EntidadDownloadButton
          isDark={isDark}
          tipo={tipo}
          data={filteredDatos}    // exporta _todos_ los registros sin paginar
        />


        {loading ? (
          <div className="text-center py-8">
            <span className={isDark ? "text-gray-300" : "text-gray-700"}>Cargando...</span>
          </div>
        ) : (
          <EntidadTable
            isDark={isDark}
            tipo={tipo}
            paginatedData={paginatedData}
            onRowClick={onRowClick}
            progressData={progressData}
            filterTerm={searchTerm}        // ← pasamos el término al table
            /* paginación */
            currentPage={currentPage}
            totalPages={totalPages}
            pageNumbers={pageNumbers}
            hasPrevGroup={hasPrevGroup}
            hasNextGroup={hasNextGroup}
            prevGroupPage={prevGroupPage}
            nextGroupPage={nextGroupPage}
            setCurrentPage={setCurrentPage}
            currencyFields={[
              "descuentos",
              "valorPago",
              "valorDebito",
              "valorCredito",
              "saldo",
              "valorBase",
              "valorRetencion",
            ]}
          />
        )}
      </main>
    </div>
  );
}
