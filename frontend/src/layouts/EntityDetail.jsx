// src/layouts/EntityDetail.jsx
import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useCallback,
} from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "../components/MainSidebar";
import HeaderSuperior from "../components/MainHeader";
import { ArrowLeftCircle } from "lucide-react";
import { useTheme } from "../components/ThemeContext";
import { useActivePage } from "../hooks/useActivePage";
import { useMasterLines } from "../hooks/useMasterLines";
import { useChecks } from "../hooks/useChecks";
import DraggableLine from "../components/detail/DraggableLine";
import EntityMaster from "../components/detail/EntityMaster";
import { usePagination } from "../hooks/usePagination";
import Paginator from "../components/detail/Paginator";
import SearchBar from "../components/header/SearchBar";

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

  // Refs / estado
  const scrollAreaRef = useRef(null);
  const containerRef = useRef(null);
  const masterRef = useRef(null);
  const childRefs = useRef({});
  const [expanded, setExpanded] = useState({});
  const [paginationStates, setPaginationStates] = useState({});

  const CARDS_PER_PAGE = 10;

  // Datos maestro + líneas
  const { master: fetchedMaster, lines, loading, error } = useMasterLines({
    tipo,
    documentoId: csc,
    tipoDocto,
  });
  const master = masterFromTable || fetchedMaster;
  if (!master) return null;

  // Checks
  const [checks, toggleCheck] = useChecks(tipo, documentoId);

  // Búsqueda sobre hijas
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLines = useMemo(() => {
    if (!searchTerm) return lines;

    const q = searchTerm.toLowerCase().trim();
    const flatten = (obj) => {
      const acc = [];
      const visit = (v) => {
        if (v == null) return;
        if (Array.isArray(v)) return v.forEach(visit);
        if (typeof v === "object") return Object.values(v).forEach(visit);
        acc.push(String(v));
      };
      visit(obj);
      return acc;
    };

    return (lines || []).filter((line) => {
      const base = [
        line.documento,
        line.fecha,
        line.debitos,
        line.creditos,
        line.CO || line.co,
      ]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase());

      const movs = flatten(line.movements || []).map((s) => s.toLowerCase());
      const rets = flatten(line.retencion || []).map((s) => s.toLowerCase());

      return [...base, ...movs, ...rets].some((s) => s.includes(q));
    });
  }, [lines, searchTerm]);

  // Paginación sobre filtrado
  const {
    currentPage,
    totalPages,
    paginatedData: visibleLines,
    pageNumbers,
    hasPrevGroup,
    hasNextGroup,
    prevGroupPage,
    nextGroupPage,
    setCurrentPage,
  } = usePagination(filteredLines, CARDS_PER_PAGE);

  // Parámetros visuales
  const RAIL_X = 64;
  const CONNECTOR = 28;
  const CARD_GAP = "16px";
  const CARD_OFFSET = `calc(${RAIL_X}px + ${CONNECTOR}px + 8px)`;
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 640px)").matches;
  const CHILD_INDENT = isMobile ? "4px" : "56px";

  // Geometría para el dibujo
  const [geo, setGeo] = useState({
    ready: false,
    railXAbs: 0,
    masterX: 0,
    masterY: 0,
    yStart: 0,
    yEnd: 0,
    children: [],
    svgW: 0,
    svgH: 0,
  });

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

  const rafId = useRef(null);
  const schedule = (fn) => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(fn);
  };

  const recompute = useCallback(() => {
    const containerEl = containerRef.current;
    const masterEl = masterRef.current;
    if (!containerEl || !masterEl) {
      setGeo((g) => ({ ...g, ready: false }));
      return;
    }

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
      childPoints.push({ id: line.id, x: rect.left, y: rect.centerY });
    }

    const railXAbs = RAIL_X;
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

  useLayoutEffect(() => {
    schedule(recompute);
  }, [currentPage, expanded, paginationStates, visibleLines.length, isDark]); // eslint-disable-line

  useEffect(() => {
    schedule(recompute);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [filteredLines]); // eslint-disable-line

  useEffect(() => {
    const onResize = () => schedule(recompute);
    const onScroll = () => schedule(recompute);

    window.addEventListener("resize", onResize, { passive: true });
    const mainEl = scrollAreaRef.current;
    if (mainEl) mainEl.addEventListener("scroll", onScroll, { passive: true });
    if (containerRef.current)
      containerRef.current.addEventListener("scroll", onScroll, {
        passive: true,
      });

    return () => {
      window.removeEventListener("resize", onResize);
      if (mainEl) mainEl.removeEventListener("scroll", onScroll);
      if (containerRef.current)
        containerRef.current.removeEventListener("scroll", onScroll);
    };
  }, [recompute]); // eslint-disable-line

  return (
    <div
      className={`flex flex-col md:flex-row min-h-screen ${
        isDark ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <Sidebar activePage={activePage} />

      <main
        ref={scrollAreaRef}
        className="flex-1 p-6 md:ml-64 space-y-4 overflow-auto"
      >
        <HeaderSuperior
          activePage={label}
          title={label}
          onToggleTheme={toggleTheme}
        />

        {/* Fila superior alineada a la derecha (justo debajo del título) */}
        
          <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
            <SearchBar
              isDark={isDark}
              onSearch={(v) => {
                setSearchTerm(v);
                setCurrentPage(1);
              }}
            />
          </div>
      

        {/* CONTENEDOR DE DETALLE */}
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
          {/* Botón atrás alineado a la izquierda, bajo el buscador */}
          <div className="mb-4">
            <button
              className="flex items-center gap-2 text-gray-400 hover:underline cursor-pointer"
              onClick={() => navigate(-1)}
            >
              <ArrowLeftCircle size={20} /> {t("buttons.back")}
            </button>
          </div>

          {/* SVG */}
          {geo.ready && (
            <svg
              className="absolute inset-0 pointer-events-none z-0"
              width={geo.svgW}
              height={geo.svgH}
            >
              <line
                x1={geo.railXAbs}
                y1={geo.yStart}
                x2={geo.railXAbs}
                y2={geo.yEnd}
                stroke={isDark ? "#333" : "#d1d5db"}
                strokeWidth="2"
              />
              <line
                x1={geo.railXAbs}
                y1={geo.masterY}
                x2={geo.masterX}
                y2={geo.masterY}
                stroke={isDark ? "#4b5563" : "#94a3b8"}
                strokeWidth="2"
              />
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
          <div id="card-payments-detail" style={{ marginBottom: "var(--card-gap)" }}>
            <EntityMaster isDark={isDark} tipo={tipo} master={master} ref={masterRef} />
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

          {!loading && !error && filteredLines && filteredLines.length === 0 && (
            <div className="flex justify-center items-center h-40 text-gray-400">
              {t("detail.noResults", "Sin resultados para tu búsqueda.")}
            </div>
          )}

          {!loading &&
            (!error || (filteredLines && filteredLines.length > 0)) &&
            visibleLines.map((line) => {
              if (!childRefs.current[line.id]) {
                childRefs.current[line.id] = React.createRef();
              }

              const MOVS_PER_PAGE = 5;
              const currentLinePage = paginationStates[line.id] || 1;
              const start = (currentLinePage - 1) * MOVS_PER_PAGE;
              const paginatedMovs = line.movements.slice(
                start,
                start + MOVS_PER_PAGE
              );

              return (
                <div key={line.id} style={{ marginBottom: "var(--card-gap)" }}>
                  <DraggableLine
                    ref={childRefs.current[line.id]}
                    line={line}
                    expanded={expanded}
                    setExpanded={setExpanded}
                    movementsPaginados={paginatedMovs}
                    totalPaginas={Math.ceil(line.movements.length / MOVS_PER_PAGE)}
                    paginaActual={currentLinePage}
                    setPaginaActual={(page) =>
                      setPaginationStates((prev) => ({ ...prev, [line.id]: page }))
                    }
                    tipo={tipo}
                  />
                </div>
              );
            })}

          {/* Paginación inferior */}
          <Paginator
            currentPage={currentPage}
            totalPages={totalPages}
            pageNumbers={pageNumbers}
            hasPrevGroup={hasPrevGroup}
            hasNextGroup={hasNextGroup}
            prevGroupPage={prevGroupPage}
            nextGroupPage={nextGroupPage}
            onSetPage={setCurrentPage}
            isDark={isDark}
            labels={{
              prev: t("pagination.prev", "Anterior"),
              next: t("pagination.next", "Siguiente"),
              prevGroup: t("pagination.prevGroup", "Grupo anterior"),
              nextGroup: t("pagination.nextGroup", "Grupo siguiente"),
            }}
          />
        </div>
      </main>
    </div>
  );
}
