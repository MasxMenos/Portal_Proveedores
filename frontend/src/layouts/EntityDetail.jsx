// src/layouts/EntityDetail.jsx
import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "../components/MainSidebar";
import HeaderSuperior from "../components/MainHeader";
import {
  ArrowLeftCircle,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useTheme } from "../components/ThemeContext";
import { useActivePage } from "../hooks/useActivePage";
import { useMasterLines } from "../hooks/useMasterLines";
import { useChecks }     from "../hooks/useChecks";
import { useContainerRect } from "../hooks/useContainerRect";
import { useMeasurePositions } from "../hooks/useMeasurePositions";
import DraggableLine from "../components/detail/DraggableLine";
import EntityMaster from "../components/detail/EntityMaster";
import { motion, AnimatePresence } from "framer-motion";


export default function EntityDetail({ tipo }) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const { documentoId } = useParams();
const [tipoDocto, csc] = useMemo(() => {
  if (!documentoId) return [null, null];

  const [td, ...rest] = documentoId.split('-');
  return [
    td ?? null,
    rest.length ? rest.join('-') : null,
  ];
}, [documentoId]);

  
  const { state } = useLocation();
  const masterFromTable = state?.master;
  const activePage = useActivePage(tipo);
  const navigate = useNavigate();

  const label = t(`sidebar.${tipo}`);

  /** Refs y estados básicos **/
  const containerRef = useRef(null);
  const masterRef = useRef(null);
  const childRefs = useRef({});

  const [expanded, setExpanded] = useState({});
  const CHECK_KEY = `checks:${tipo}:${documentoId}`;
  const [checks, toggleCheck] = useChecks(tipo, documentoId);

  const [paginationStates, setPaginationStates] = useState({});
  const [cardsPage, setCardsPage] = useState(1);
  const [positions, setPositions] = useState({ master: null, children: {} });
  
  const CARDS_PER_PAGE = 5;
  const MAX_ICONS = 15;

  /** Datos de maestro + líneas **/
  const {
  master: fetchedMaster,
  lines,
  loading,
  error,
} = useMasterLines({ tipo, documentoId: csc, tipoDocto });
  const master = masterFromTable || fetchedMaster;


  /** Métricas del contenedor y función para medir líneas → SVG **/
  const containerRect = useContainerRect(containerRef);
  const measurePositions = useMeasurePositions(
    masterRef,
    containerRect,
    lines,
    childRefs,
    setPositions
  );

  /** Re-measure cuando cambian contenedor o página **/
  useLayoutEffect(() => {
    measurePositions();
  }, [measurePositions, containerRect, cardsPage]);

  /** Pequeño scroll forzado para repaint (fix Safari) **/
  useEffect(() => {
    window.scrollBy({ top: 1, behavior: "smooth" });
  }, [lines]);

  useEffect(() => {
    localStorage.setItem(CHECK_KEY, JSON.stringify(checks));
  }, [checks]);

  if (!master) return null;

useEffect(() => {
  if (lines && lines.length && documentoId) {
    const key = `checks:payments:${documentoId}`;
    let stored = {};
    try {
      stored = JSON.parse(localStorage.getItem(key) || '{}');
    } catch { /* nada */ }
    if (stored.__total !== lines.length) {
      stored.__total = lines.length;
      localStorage.setItem(key, JSON.stringify(stored));
    }
  }
}, [lines, documentoId]);



  /** Líneas visibles paginadas (memo para evitar refs nuevas) **/
const visibleLines = useMemo(
  () => lines.slice(
      (cardsPage - 1) * CARDS_PER_PAGE,
      cardsPage * CARDS_PER_PAGE
    ),
  [lines, cardsPage]
);


  const totalPages = Math.ceil(lines.length / CARDS_PER_PAGE);
  const groupIndex = Math.floor((cardsPage - 1) / MAX_ICONS);
  const startPage = groupIndex * MAX_ICONS + 1;
  const endPage = Math.min(startPage + MAX_ICONS - 1, totalPages);

  return (
    <div
      className={`flex flex-col md:flex-row min-h-screen ${
        isDark ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <Sidebar activePage={activePage} />

      <main className="flex-1 p-6 md:ml-64 space-y-6 overflow-auto">
        <HeaderSuperior
          activePage={label}
          title={label}
          onToggleTheme={toggleTheme}
        />

        <button
          className="flex items-center gap-2 text-gray-400 hover:underline cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftCircle size={20} /> {t("buttons.back")}
        </button>

        <div
          ref={containerRef}
          className="relative min-w-[200vw] h-[150vh] p-4 md:p-8"
        >
          {/* SVG de líneas entre maestro e hijos */}
          {containerRect && positions.master && (
            <svg
              className="absolute inset-0 pointer-events-none z-0"
              width={containerRect.width}
              height={containerRect.height}
            >
              {visibleLines.map((line) => {
                const childPos = positions.children[line.id];
                if (!childPos) return null;

                const { x: x1, y: y1 } = positions.master;
                const { x: x2, y: y2 } = childPos;
                const midX = x1 + (x2 - x1) / 2;

                const sx = x1 - containerRect.x;
                const sy = y1 - containerRect.y;
                const ex = x2 - containerRect.x;
                const ey = y2 - containerRect.y;

                return (
                  <polyline
                    key={line.id}
                    points={`${sx},${sy} ${midX - containerRect.x},${sy} ${
                      midX - containerRect.x
                    },${ey} ${ex},${ey}`}
                    fill="none"
                    stroke="#888"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                );
              })}
            </svg>
          )}

          {/* Tarjeta maestra */}
          <EntityMaster
            isDark={isDark}
            tipo={tipo}
            master={master}
            ref={masterRef}
          />

          {/* Índice lateral (15 íconos máx.) */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={groupIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex flex-col items-center space-y-1"
              >
                {groupIndex > 0 && (
                  <button
                    onClick={() =>
                      setCardsPage((groupIndex - 1) * MAX_ICONS + 1)
                    }
                    className="p-1"
                  >
                    <ChevronUp size={18} />
                  </button>
                )}

                {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                  const p = startPage + i;
                  const first = (p - 1) * CARDS_PER_PAGE;
                  const done = lines
                    .slice(first, first + CARDS_PER_PAGE)
                    .every((l) => checks[l.id]);
                  const Icon = done ? CheckCircle2 : HelpCircle;
                  return (
                    <button
                      key={p}
                      onClick={() => setCardsPage(p)}
                      className="p-1"
                    >
                      <Icon
                        size={18}
                        className={
                          p === cardsPage
                            ? "text-brand-500"
                            : done
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      />
                    </button>
                  );
                })}

                {groupIndex < Math.floor((totalPages - 1) / MAX_ICONS) && (
                  <button
                    onClick={() =>
                      setCardsPage((groupIndex + 1) * MAX_ICONS + 1)
                    }
                    className="p-1"
                  >
                    <ChevronDown size={18} />
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

{/* Líneas hijas paginadas y arrastrables */}
{loading && !lines.length && (
  <div className="flex justify-center items-center h-40 text-gray-400">
    {t("detail.loading", "Cargando...")}
  </div>
)}

{/* Bloque de error visible */}
{!loading && error && (!lines || lines.length === 0) && (
  <div className="flex justify-center items-center h-40 text-red-500 text-lg">
    <span>
      {"Ocurrió un error inesperado, intente de nuevo más tarde"}
    </span>
  </div>
)}

{!loading && (!error || (lines && lines.length > 0)) && visibleLines.map((line, idx) => {
  if (!childRefs.current[line.id]) {
    childRefs.current[line.id] = React.createRef();
  }

  const MOVS_PER_PAGE = 5;
  const currentPage = paginationStates[line.id] || 1;
  const start = (currentPage - 1) * MOVS_PER_PAGE;
  const paginatedMovs = line.movements.slice(
    start,
    start + MOVS_PER_PAGE
  );

  return (
    <DraggableLine
      key={line.id}
      ref={childRefs.current[line.id]}
      line={line}
      idx={idx}
      expanded={expanded}
      setExpanded={setExpanded}
      onDrag={measurePositions}
      onStop={measurePositions}
      movementsPaginados={paginatedMovs}
      totalPaginas={Math.ceil(line.movements.length / MOVS_PER_PAGE)}
      paginaActual={currentPage}
      setPaginaActual={(page) =>
        setPaginationStates((prev) => ({ ...prev, [line.id]: page }))
      }
      isChecked={!!checks[line.id]}
      onToggleChecked={(val) => toggleCheck(line.id, val)}
    />
  );
})}
        </div>
      </main>
    </div>
  );
}
