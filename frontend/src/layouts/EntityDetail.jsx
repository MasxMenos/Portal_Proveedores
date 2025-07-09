// src/layouts/EntityDetail.jsx
import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "../components/MainSidebar";
import HeaderSuperior from "../components/MainHeader";
import { ArrowLeftCircle } from "lucide-react";
import { useTheme } from "../components/ThemeContext";
import { useActivePage } from "../hooks/useActivePage";
import { useMasterLines } from "../hooks/useMasterLines";
import { useContainerRect } from "../hooks/useContainerRect";
import { useMeasurePositions } from "../hooks/useMeasurePositions";
import DraggableLine from "../components/detail/DraggableLine";
import EntityMaster from "../components/detail/EntityMaster";

export default function EntidadDetail({ tipo }) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const { documentoId } = useParams();
  const activePage = useActivePage(tipo);
  const navigate = useNavigate();

  // Usamos solo la etiqueta del sidebar para el título
  const label = t(`sidebar.${tipo}`);

  // Refs y estados para dibujar líneas…
  const containerRef = useRef(null);
  const masterRef = useRef(null);
  const childRefs = useRef({});
  const [expanded, setExpanded] = useState({});
  const [positions, setPositions] = useState({ master: null, children: {} });
  const [paginationStates, setPaginationStates] = useState({});

  const { master, lines } = useMasterLines(documentoId);
  const containerRect = useContainerRect(containerRef);
  const measurePositions = useMeasurePositions(
    masterRef,
    containerRect,
    lines,
    childRefs,
    setPositions
  );

  useLayoutEffect(() => {
    measurePositions();
  }, [measurePositions]);

  useEffect(() => {
    window.scrollBy({ top: 1, behavior: "smooth" });
  }, [lines]);

  if (!master) return null;

  return (
    <div
      className={`flex flex-col md:flex-row min-h-screen ${
        isDark ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <Sidebar activePage={activePage} />

      <main className="flex-1 p-6 md:ml-64 space-y-6 overflow-auto">
        {/* Ahora title y activePage solo con el tipo */}
        <HeaderSuperior
          activePage={label}
          title={label}
          onToggleTheme={toggleTheme}
        />

        <button
          className="flex items-center gap-2 text-gray-400 hover:underline cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftCircle size={20} /> {t("detail.back")}
        </button>

        <div
          ref={containerRef}
          className="relative w-full h-[150vh] p-4 md:p-8"
        >
          {containerRect && positions.master && (
            <svg
              className="absolute inset-0 pointer-events-none z-0"
              width={containerRect.width}
              height={containerRect.height}
            >
              {Object.entries(positions.children).map(([id, pos]) => {
                const { x: x1, y: y1 } = positions.master;
                const { x: x2, y: y2 } = pos;
                const midX = x1 + (x2 - x1) / 2;
                const sx = x1 - containerRect.x;
                const sy = y1 - containerRect.y;
                const ex = x2 - containerRect.x;
                const ey = y2 - containerRect.y;
                return (
                  <polyline
                    key={id}
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

          <EntityMaster isDark={isDark} master={master} ref={masterRef} />

          {lines.map((line, idx) => {
            if (!childRefs.current[line.id]) {
              childRefs.current[line.id] = React.createRef();
            }
            const itemsPerPage = 5;
            const currentPage = paginationStates[line.id] || 1;
            const start = (currentPage - 1) * itemsPerPage;
            const paginatedData = line.movements.slice(
              start,
              start + itemsPerPage
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
                movementsPaginados={paginatedData}
                totalPaginas={Math.ceil(line.movements.length / itemsPerPage)}
                paginaActual={currentPage}
                setPaginaActual={(page) =>
                  setPaginationStates((p) => ({ ...p, [line.id]: page }))
                }
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}
