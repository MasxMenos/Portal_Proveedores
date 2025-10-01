// src/pages/EntidadPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/MainSidebar";
import HeaderSuperior from "../components/MainHeader";
import EntidadFilters from "../components/entity/EntityFilters";
import EntidadDownloadButton from "../components/entity/EntityDownloadButton";
import EntidadTable from "../components/entity/EntityTable";
import SearchBar from "../components/header/SearchBar";

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
  error = null,
  selectedButtonIndex,   // índice controlado por el padre (opcional)
  onSelectButton,        // callback del padre para cambiar selección (opcional)
}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const onRowClick = useRowAction(tipo, onNavigateBase);
  const [progressRefresh, setProgressRefresh] = useState(0);
  const { t } = useTranslation();
  const activePage = useActivePage(titulo);

  // ────────────────────────────── persistencia del botón extra ──────────────────────────────
  const storageKey = `EntidadPage:${titulo}:filterIndex`;
  const [localSelected, _setLocalSelected] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) {
      const idx = parseInt(saved, 10);
      if (!isNaN(idx)) return idx;
    }
    return selectedButtonIndex ?? 0;
  });
  // cuando cambie selectedButtonIndex desde padre, sobreescribimos
  useEffect(() => {
    if (selectedButtonIndex != null) {
      _setLocalSelected(selectedButtonIndex);
      localStorage.setItem(storageKey, selectedButtonIndex);
    }
  }, [selectedButtonIndex]);
  const selected = selectedButtonIndex != null ? selectedButtonIndex : localSelected;

  const setLocalSelected = (idx) => {
    _setLocalSelected(idx);
    localStorage.setItem(storageKey, idx);
  };
  const handleSelect = (idx) => {
    if (onSelectButton) onSelectButton(idx);
    else setLocalSelected(idx);
  };

  // ────────────────────────────── filtros de fecha ──────────────────────────────
  const {
    start: fechaInicio,
    end:   fechaFin,
    onStartChange,
    onEndChange,
    onConsultar,
  } = extraFilters || useDateRange();

  // ────────────────────────────── búsqueda global ──────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const filteredDatos = useMemo(() => {
    if (!searchTerm) return datos;
    const q = searchTerm.toLowerCase();
    const matches = datos.filter(item =>
      Object.values(item).some(v =>
        v != null && v.toString().toLowerCase().includes(q)
      )
    );
    return matches.sort((a, b) => {
      const rank = vals => {
        if (vals.some(v => v === q))      return 0;
        if (vals.some(v => v.startsWith(q))) return 1;
        return 2;
      };
      const ra = rank(Object.values(a).map(v => String(v).toLowerCase()));
      const rb = rank(Object.values(b).map(v => String(v).toLowerCase()));
      return ra - rb;
    });
  }, [datos, searchTerm]);

  // ────────────────────────────── paginación ──────────────────────────────
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

  // reset página al cambiar filtro, búsqueda o tipo
  useEffect(() => setCurrentPage(1), [selected, searchTerm, setCurrentPage]);

  // ────────────────────────────── progreso ──────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key && e.key.startsWith(`checks:${tipo}:`)) {
        setProgressRefresh(v => v + 1);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [tipo]);

  const progressData = useMemo(() => {
    const prog = {};
    filteredDatos.forEach(item => {
      const key = `checks:${tipo}:${item.documento}`;
      const checksObj = JSON.parse(localStorage.getItem(key) || "{}");
      const total      = checksObj.__total || item.totalLineas || 0;
      const checkedCnt = Object.entries(checksObj)
        .filter(([k,v]) => !k.startsWith("__") && v === true).length;
      prog[item.documento] = total > 0 ? (checkedCnt / total) : 0;
    });
    return prog;
  }, [filteredDatos, progressRefresh, tipo]);

  return (
    <div className={`flex flex-col md:flex-row min-h-screen ${
      isDark ? "bg-black text-white" : "bg-white text-black"
    }`}>
      <Sidebar activePage={activePage} onNavClick={navigate} />

      <main className="flex-1 p-6 md:ml-64 space-y-6 overflow-auto">
        <HeaderSuperior
          activePage={encabezado}
          title={titulo}
          onToggleTheme={toggleTheme}
          onSearch={setSearchTerm}
        />

        {/* ─── Botones extra ─────────────────── */}
        {botonesExtra.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4" id="botones_consulta">
            {botonesExtra.map((label, idx) => (
              <button
                key={label}
                onClick={() => handleSelect(idx)}
                className={`px-4 py-2 rounded transition-colors duration-200 ${
                  selected === idx
                    ? (isDark ? "bg-[#111416] text-white" : "bg-gray-300 text-black")
                    : (isDark
                        ? "bg-[#0A0D0F] hover:bg-[#111416] text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-black")
                }`}
              >
                {label}
              </button>
            ))}
            
          </div>
        )}

      <SearchBar isDark={isDark} onSearch={setSearchTerm} />

        {/* ─── Filtros de fecha ─────────────────── */}
        <EntidadFilters
          isDark={isDark}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          onStartChange={onStartChange}
          onEndChange={onEndChange}
          onConsultar={onConsultar}
        />

        

        {/* ─── Exportar XLSX ─────────────────── */}
        <EntidadDownloadButton
          isDark={isDark}
          tipo={tipo}
          data={filteredDatos}
        />

        {/* ─── Contenido ─────────────────── */}
        {loading ? (
          <div className="text-center py-8">
            <span className={isDark ? "text-gray-300" : "text-gray-700"}>
              {t("buttons.loading", "Cargando...")}
            </span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <span className="text-red-500 text-lg">
              {typeof error === "string"
                ? error
                : t("errors.timeout", "La consulta tardó demasiado.")}
            </span>
          </div>
        ) : (
          <EntidadTable
            isDark={isDark}
            tipo={tipo}
            paginatedData={paginatedData}
            onRowClick={onRowClick}
            progressData={progressData}
            filterTerm={searchTerm}
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
