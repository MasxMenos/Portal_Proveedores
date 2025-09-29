// src/layouts/EntityDetail.jsx
import React, { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } from "react";
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
import { useChecks } from "../hooks/useChecks";
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
    const [td, ...rest] = documentoId.split("-");
    return [td ?? null, rest.length ? rest.join("-") : null];
  }, [documentoId]);

  const { state } = useLocation();
  const masterFromTable = state?.master;
  const activePage = useActivePage(tipo);
  const navigate = useNavigate();
  const label = t(`sidebar.${tipo}`);

  /** Refs / estado **/
  const scrollAreaRef = useRef(null);
  const containerRef = useRef(null);
  const masterRef = useRef(null);
  const childRefs = useRef({});

  const [expanded, setExpanded] = useState({});
  const [paginationStates, setPaginationStates] = useState({});
  const [cardsPage, setCardsPage] = useState(1);

  const CARDS_PER_PAGE = 5;
  const MAX_ICONS = 15;

  /** Datos maestro + líneas **/
  const { master: fetchedMaster, lines, loading, error } = useMasterLines({
    tipo,
    documentoId: csc,
    tipoDocto,
  });
  const master = masterFromTable || fetchedMaster;
  if (!master) return null;

  /** Checks **/
  const [checks, toggleCheck] = useChecks(tipo, documentoId);

  /** Paginación visual de cards hijas **/
  const visibleLines = useMemo(
    () => lines.slice((cardsPage - 1) * CARDS_PER_PAGE, cardsPage * CARDS_PER_PAGE),
    [lines, cardsPage]
  );

  const totalPages = Math.ceil(lines.length / CARDS_PER_PAGE);
  const groupIndex = Math.floor((cardsPage - 1) / MAX_ICONS);
  const startPage = groupIndex * MAX_ICONS + 1;
  const endPage = Math.min(startPage + MAX_ICONS - 1, totalPages);

  /** Parámetros visuales **/
  const RAIL_X = 64;
  const CONNECTOR = 28;
  const CARD_GAP = "16px";
  const CARD_OFFSET = `calc(${RAIL_X}px + ${CONNECTOR}px + 8px)`;

  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches;

  // Mantén el riel igual; solo acerca las hijas en móvil
  const CHILD_INDENT = isMobile ? "4px" : "56px";


  /** Geometría para el dibujo **/
  const [geo, setGeo] = useState({
    ready: false,
    railXAbs: 0,
    masterX: 0,
    masterY: 0,
    yStart: 0,
    yEnd: 0,
    children: [], // [{ id, x, y }]
    svgW: 0,
    svgH: 0,
  });

  /** Util: obtener rect relativo al contenedor **/
  const getRectRelativeTo = (rect, containerRect) => {
    const left = rect.left - containerRect.left;
    const top = rect.top - containerRect.top;
    return {
      left,
      top,
      width: rect.width,
      height: rect.height,
      centerY: top + rect.height / 2,
    };
  };

  // Throttle por frame para scroll/resize
  const rafId = useRef(null);
  const schedule = (fn) => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(fn);
  };

  /** Medición (el SVG se desplaza junto al contenido, NO sticky) **/
  const recompute = useCallback(() => {
    const containerEl = containerRef.current;
    const masterEl = masterRef.current;
    if (!containerEl || !masterEl) {
      setGeo((g) => ({ ...g, ready: false }));
      return;
    }

    // Dimensiones del contenedor y contenido
    const containerRect = containerEl.getBoundingClientRect();
    

    // Master
    const masterRectAbs = masterEl.getBoundingClientRect();
    const masterRect = getRectRelativeTo(masterRectAbs, containerRect);

    // Hijas visibles
    const childPoints = [];
    for (const line of visibleLines) {
      const r = childRefs.current[line.id]?.current;
      if (!r) continue;
      const rectAbs = r.getBoundingClientRect();
      const rect = getRectRelativeTo(rectAbs, containerRect);
      childPoints.push({
        id: line.id,
        x: rect.left,
        y: rect.centerY,
      });
    }

    const railXAbs = RAIL_X;

    // El riel va desde el centro del master hasta la última hija visible
    const yStart = masterRect.centerY;
    const yEnd = childPoints.length ? childPoints[childPoints.length - 1].y : yStart;

    setGeo({
      ready: true,
      railXAbs,
      masterX: masterRect.left,
      masterY: masterRect.centerY,
      yStart,
      yEnd,
      children: childPoints,
      svgW: "100%",
      svgH: "100%",
    });
  }, [visibleLines]);

  /** Recalcular ante cambios de layout/estado relevante **/
  useLayoutEffect(() => {
    schedule(recompute);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardsPage, expanded, paginationStates, visibleLines.length, isDark]);

  /** Recalcular tras primer paint y cuando cambian los datos **/
  useEffect(() => {
    schedule(recompute);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines]);

  /** Recalcular al redimensionar y al hacer scroll **/
  useEffect(() => {
    const onResize = () => schedule(recompute);
    const onScroll = () => schedule(recompute);

    window.addEventListener("resize", onResize, { passive: true });
    const mainEl = scrollAreaRef.current;
    if (mainEl) mainEl.addEventListener("scroll", onScroll, { passive: true });
    if (containerRef.current) containerRef.current.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      if (mainEl) mainEl.removeEventListener("scroll", onScroll);
      if (containerRef.current) containerRef.current.removeEventListener("scroll", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recompute]);

  return (
    <div
      className={`flex flex-col md:flex-row min-h-screen ${
        isDark ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <Sidebar activePage={activePage} />

      <main ref={scrollAreaRef} className="flex-1 p-6 md:ml-64 space-y-4 overflow-auto">
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

        {/* CONTENEDOR DE DETALLE (relative para posicionar el SVG encima) */}
        <div
          ref={containerRef}
          className="relative p-4 md:p-8 overflow-hidden"
          style={{
            "--rail-x": `${RAIL_X}px`,
            "--connector": `${CONNECTOR}px`,
            "--card-gap": CARD_GAP,
            "--card-offset": CARD_OFFSET,
            "--child-indent": CHILD_INDENT,
          }}
        >
          {/* SVG: absoluto y desplazándose con el contenido */}
          {geo.ready && (
            <svg
              className="absolute inset-0 pointer-events-none z-0"
              width={geo.svgW}
              height={geo.svgH}
            >
              {/* Rail vertical desde el MASTER hasta la última hija visible */}
              <line
                x1={geo.railXAbs}
                y1={geo.yStart}
                x2={geo.railXAbs}
                y2={geo.yEnd}
                stroke={isDark ? "#333" : "#d1d5db"}
                strokeWidth="2"
              />

              {/* Conector horizontal MASTER -> rail */}
              <line
                x1={geo.railXAbs}
                y1={geo.masterY}
                x2={geo.masterX}
                y2={geo.masterY}
                stroke={isDark ? "#4b5563" : "#94a3b8"}
                strokeWidth="2"
              />

              {/* Conectores horizontales rail -> cada hija visible */}
              {geo.children.map((pt) => (
                <line
                  key={`h-${pt.id}`}
                  x1={geo.railXAbs}
                  y1={pt.y}
                  x2={pt.x}
                  y2={pt.y}
                  stroke={isDark ? "#4b5563" : "#94a3b8"}
                  strokeWidth="2"
                />
              ))}
            </svg>
          )}

          {/* MASTER */}
          <div style={{ marginBottom: "var(--card-gap)" }}>
            <EntityMaster
              isDark={isDark}
              tipo={tipo}
              master={master}
              ref={masterRef}
            />
          </div>

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
                    onClick={() => setCardsPage((groupIndex - 1) * MAX_ICONS + 1)}
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
                    <button key={p} onClick={() => setCardsPage(p)} className="p-1">
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
                    onClick={() => setCardsPage((groupIndex + 1) * MAX_ICONS + 1)}
                    className="p-1"
                  >
                    <ChevronDown size={18} />
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* HIJAS */}
          {loading && !lines.length && (
            <div className="flex justify-center items-center h-40 text-gray-400">
              {t("detail.loading", "Cargando...")}
            </div>
          )}

          {!loading && error && (!lines || lines.length === 0) && (
            <div className="flex justify-center items-center h-40 text-red-500 text-lg">
              <span>{"Siesa presenta caida en este momento, intente de nuevo más tarde"}</span>
            </div>
          )}

          {!loading &&
            (!error || (lines && lines.length > 0)) &&
            visibleLines.map((line) => {
              if (!childRefs.current[line.id]) {
                childRefs.current[line.id] = React.createRef();
              }

              const MOVS_PER_PAGE = 5;
              const currentPage = paginationStates[line.id] || 1;
              const start = (currentPage - 1) * MOVS_PER_PAGE;
              const paginatedMovs = line.movements.slice(start, start + MOVS_PER_PAGE);

              return (
                <div key={line.id} style={{ marginBottom: "var(--card-gap)" }}>
                  <DraggableLine
                    ref={childRefs.current[line.id]}
                    line={line}
                    expanded={expanded}
                    setExpanded={setExpanded}
                    movementsPaginados={paginatedMovs}
                    totalPaginas={Math.ceil(line.movements.length / MOVS_PER_PAGE)}
                    paginaActual={currentPage}
                    setPaginaActual={(page) =>
                      setPaginationStates((prev) => ({ ...prev, [line.id]: page }))
                    }
                    isChecked={!!checks[line.id]}
                    onToggleChecked={(val) => toggleCheck(line.id, val)}
                    tipo={tipo}
                  />
                </div>
              );
            })}
        </div>
      </main>
    </div>
  );
}
