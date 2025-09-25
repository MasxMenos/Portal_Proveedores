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
  const scrollAreaRef = useRef(null);   // para escuchar scroll (overflow del main)
  const containerRef = useRef(null);    // contenedor donde medimos y dibujamos
  const masterRef = useRef(null);
  const childRefs = useRef({});

  const [expanded, setExpanded] = useState({});
  const CHECK_KEY = `checks:${tipo}:${documentoId}`;
  const [checks, toggleCheck] = useChecks(tipo, documentoId);

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

  /** Líneas visibles paginadas **/
  const visibleLines = useMemo(
    () => lines.slice((cardsPage - 1) * CARDS_PER_PAGE, cardsPage * CARDS_PER_PAGE),
    [lines, cardsPage]
  );

  const totalPages = Math.ceil(lines.length / CARDS_PER_PAGE);
  const groupIndex = Math.floor((cardsPage - 1) / MAX_ICONS);
  const startPage = groupIndex * MAX_ICONS + 1;
  const endPage = Math.min(startPage + MAX_ICONS - 1, totalPages);

  /** Parámetros visuales compartidos **/
  const RAIL_X = 64;             // px desde el borde izquierdo del contenedor (mueve la LÍNEA)
  const CONNECTOR = 28;          // px del conector horizontal hacia la card
  const CARD_GAP = "3%";         // separación vertical entre master→1ª hija y entre hijas
  const CARD_OFFSET = `calc(${RAIL_X}px + ${CONNECTOR}px + 8px)`; // base para todas las cards
  const CHILD_INDENT = "56px";   // 👈 desplazamiento adicional SOLO para hijas

  /** Estado de posiciones para dibujar líneas **/
  const [geo, setGeo] = useState({
    ready: false,
    railXAbs: 0,
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

  /** Medición robusta sin hooks externos **/
  const recompute = () => {
    const containerEl = containerRef.current;
    const masterEl = masterRef.current;
    if (!containerEl || !masterEl) {
      setGeo((g) => ({ ...g, ready: false }));
      return;
    }

    const containerRect = containerEl.getBoundingClientRect();
    const masterRectAbs = masterEl.getBoundingClientRect();
    const masterRect = getRectRelativeTo(masterRectAbs, containerRect);

    // Hijas visibles (el borde izquierdo cambiará si sumas --child-indent en el componente)
    const childPoints = [];
    for (const line of visibleLines) {
      const r = childRefs.current[line.id]?.current;
      if (!r) continue;
      const rectAbs = r.getBoundingClientRect();
      const rect = getRectRelativeTo(rectAbs, containerRect);
      childPoints.push({
        id: line.id,
        x: rect.left,     // borde izquierdo exacto
        y: rect.centerY,  // centro vertical
      });
    }

    // Rail X en coords del SVG (posicionado sobre el contenedor)
    const railXAbs = RAIL_X;

    // Y inicio (centro del master) y Y fin (centro de la última hija visible)
    const yStart = masterRect.centerY;
    const yEnd = childPoints.length ? childPoints[childPoints.length - 1].y : yStart;

    // Dimensiones del SVG: cubrir el scroll del contenedor
    const svgW = Math.max(containerEl.clientWidth, containerEl.scrollWidth);
    const svgH = Math.max(containerEl.clientHeight, containerEl.scrollHeight);

    setGeo({
      ready: true,
      railXAbs,
      yStart,
      yEnd,
      children: childPoints,
      svgW,
      svgH,
    });
  };

  /** Recalcular cuando cambie layout/estado relevante **/
  useLayoutEffect(() => {
    recompute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardsPage, expanded, paginationStates, visibleLines.length, isDark]);

  /** Recalcular tras primer paint y cuando cambian los datos **/
  useEffect(() => {
    const id = requestAnimationFrame(recompute);
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines]);

  /** Recalcular al redimensionar y al hacer scroll **/
  useEffect(() => {
    const onResize = () => recompute();
    const onScroll = () => recompute();
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
  }, []);

  return (
    <div
      className={`flex flex-col md:flex-row min-h-screen ${
        isDark ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <Sidebar activePage={activePage} />

      <main ref={scrollAreaRef} className="flex-1 p-6 md:ml-64 space-y-6 overflow-auto">
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
          className="relative p-4 md:p-8"
          style={{
            // Variables globales para posicionamiento y separación
            "--rail-x": `${RAIL_X}px`,           // mueve la LÍNEA
            "--connector": `${CONNECTOR}px`,
            "--card-gap": CARD_GAP,
            "--card-offset": CARD_OFFSET,        // base de todas las cards (master + hijas)
            "--child-indent": CHILD_INDENT,      // 👈 desplazamiento extra SOLO para hijas
          }}
        >
          {/* SVG: UNA SOLA LÍNEA VERTICAL + conectores horizontales */}
          {geo.ready && (
            <svg
              className="absolute inset-0 pointer-events-none z-0"
              width={geo.svgW}
              height={geo.svgH}
            >
              {/* Rail vertical único desde el master hasta la última hija visible */}
              <line
                x1={geo.railXAbs}
                y1={geo.yStart}
                x2={geo.railXAbs}
                y2={geo.yEnd}
                stroke={isDark ? "#333" : "#d1d5db"}
                strokeWidth="2"
              />

              {/* Conectores horizontales: rail -> borde izquierdo de cada hija */}
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

          {/* MASTER con el mismo gap que entre hijas (NO suma --child-indent) */}
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

          {/* HIJAS (en flujo, con el mismo gap entre cards; aquí se usa --child-indent en DraggableLine) */}
          {loading && !lines.length && (
            <div className="flex justify-center items-center h-40 text-gray-400">
              {t("detail.loading", "Cargando...")}
            </div>
          )}

          {!loading && error && (!lines || lines.length === 0) && (
            <div className="flex justify-center items-center h-40 text-red-500 text-lg">
              <span>{"Ocurrió un error inesperado, intente de nuevo más tarde"}</span>
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
