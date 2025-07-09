// src/pages/EntidadPage.jsx
import React from "react";
import { useState } from "react";
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

export default function EntidadPage({ tipo, titulo, encabezado, datos, onNavigateBase, botonesExtra = [], }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const activePage = useActivePage(titulo);
  const navigate = useNavigate();
  const handleNavClick = (path) => navigate(path);
  

  const { start: fechaInicio, end: fechaFin, onStartChange, onEndChange } = useDateRange();
  const { currentPage, totalPages, paginatedData, setCurrentPage } = usePagination(datos, 10);
  const onRowClick = useRowAction(tipo, onNavigateBase);
  const [selectedButton, setSelectedButton] = useState(null);


  return (
    <div className={`flex flex-col md:flex-row min-h-screen ${isDark ? "bg-black text-white" : "bg-white text-black"}`}>
      <Sidebar activePage={activePage} onNavClick={handleNavClick} />

<main className="flex-1 p-6 md:ml-64 space-y-6 overflow-auto">
  <HeaderSuperior activePage={encabezado} title={`${titulo}`} onToggleTheme={toggleTheme} />

  {botonesExtra.length > 0 && (
    <div className="flex flex-wrap gap-2 mb-4" id="botones_consulta">
      {botonesExtra.map((label) => (
        <button
          key={label}
          onClick={() => setSelectedButton(label)}
          className={`px-4 py-2 rounded transition-colors duration-200 ${
            selectedButton === label
              ? isDark
                ? "bg-[#111416] text-white"
                : "bg-gray-300 text-black"
              : isDark
              ? "bg-[#0A0D0F] hover:bg-[#111416] text-white"
              : "bg-gray-200 hover:bg-gray-300 text-black"
          }` }
        >
          {label}
        </button>
      ))}
    </div>
  )}

  <EntidadFilters isDark={isDark} fechaInicio={fechaInicio} fechaFin={fechaFin} onStartChange={onStartChange} onEndChange={onEndChange} onConsultar={() => console.log("Consultar")} />
  <EntidadDownloadButton isDark={isDark} />
  <EntidadTable isDark={isDark} tipo={tipo} paginatedData={paginatedData} onRowClick={onRowClick} totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />
</main>

    </div>
  );
}
