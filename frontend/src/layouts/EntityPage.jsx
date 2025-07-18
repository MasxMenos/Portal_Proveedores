// src/pages/EntidadPage.jsx
import React, { useState, useEffect } from "react";
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

  // filtros: o los recibe el padre o crea los suyos
  const {
    start: fechaInicio,
    end:   fechaFin,
    onStartChange,
    onEndChange,
    onConsultar,
  } = extraFilters || useDateRange();

  // ** Aquí extraemos también pageNumbers, hasPrevGroup, etc. **
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
  } = usePagination(datos, 10);

    useEffect(() => {
    setCurrentPage(1);
  }, [selectedButtonIndex, setCurrentPage]);

  // selección de botones extra
  const [localSelected, setLocalSelected] = useState(null);
  const selected = selectedButtonIndex !== undefined
    ? selectedButtonIndex
    : localSelected;
  const selectFn = onSelectButton || setLocalSelected;

  return (
    <div className={`flex flex-col md:flex-row min-h-screen ${
      isDark ? "bg-black text-white" : "bg-white text-black"
    }`}>
      <Sidebar activePage={activePage} onNavClick={handleNavClick} />

      <main className="flex-1 p-6 md:ml-64 space-y-6 overflow-auto">
        <HeaderSuperior activePage={encabezado} title={titulo} onToggleTheme={toggleTheme} />

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

        {/* Filtros y botón consultar */}
        <EntidadFilters
          isDark={isDark}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          onStartChange={onStartChange}
          onEndChange={onEndChange}
          onConsultar={onConsultar}
        />

        <EntidadDownloadButton isDark={isDark} />

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
            
            /* paginación */
            currentPage={currentPage}
            totalPages={totalPages}
            pageNumbers={pageNumbers}
            hasPrevGroup={hasPrevGroup}
            hasNextGroup={hasNextGroup}
            prevGroupPage={prevGroupPage}
            nextGroupPage={nextGroupPage}
            setCurrentPage={setCurrentPage}
          />
        )}
      </main>
    </div>
  );
}
