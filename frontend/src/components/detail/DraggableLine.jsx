// src/components/detalle/DraggableLine.jsx
import React, { forwardRef } from "react";
import Draggable from "react-draggable";
import { ChevronDown, ChevronRight, Download } from "lucide-react";
import { useTheme } from "../ThemeContext";

const DraggableLine = forwardRef(
  ({ line, idx, expanded, setExpanded, onDrag, onStop, movementsPaginados, totalPaginas, paginaActual, setPaginaActual }, ref) => {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const defaultX = 360;
    const defaultY = idx * 180 + 40;

    return (
      <Draggable nodeRef={ref} defaultPosition={{ x: defaultX, y: defaultY }} bounds="parent" onDrag={onDrag} onStop={onStop}>
        <div
          ref={ref}
          className={`absolute p-4 md:p-6 rounded-lg w-[90vw] max-w-[700px] left-[5vw] md:left-[300px] cursor-move z-10 ${
            isDark ? "bg-[#111] text-gray-200" : "bg-white text-gray-800 border border-gray-300"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 child-header">
            <Download
              size={18}
              className="text-gray-400 md:mr-6"
              onClick={(e) => {
                e.stopPropagation();
                console.log(`Descargar documento: ${line.documento}`);
              }}
            />
            <div className="flex-1 overflow-x-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-4 text-sm whitespace-nowrap min-w-max">
                <div className="text-gray-400">CO</div>
                <div className="text-gray-400">Documento</div>
                <div className="text-gray-400">Fecha</div>
                <div className="text-gray-400 hidden md:block">Débitos</div>
                <div className="text-gray-400 hidden md:block">Créditos</div>
                <div className="font-mono">{line.CO}</div>
                <div>{line.documento}</div>
                <div>{line.fecha}</div>
                <div className="hidden md:block">${line.debitos.toLocaleString()}</div>
                <div className="hidden md:block">${line.creditos.toLocaleString()}</div>
              </div>
            </div>
            <div className="self-start md:self-center" onClick={() => setExpanded((p) => ({ ...p, [line.id]: !p[line.id] }))}>
              {expanded[line.id] ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
            </div>
          </div>

          {expanded[line.id] && (
            <div className={`mt-4 p-4 border-t-2 border-dashed rounded-b-lg overflow-x-hidden ${isDark ? "bg-[#111] border-gray-600" : "bg-gray-100 border-gray-300"}`}>
              <h3 className="text-sm font-semibold mb-2">Movimiento contable</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400">
                    <th className="py-1 text-left">Reg.</th>
                    <th className="py-1 text-left">Código cuenta</th>
                    <th className="py-1 text-left">DESCRIPCIÓN CUENTA</th>
                    <th className="py-1 text-left">CO</th>
                  </tr>
                </thead>
                <tbody>
                  {movementsPaginados.map((m) => (
                    <tr key={m.reg} className={`border-t ${isDark ? "border-[#222]" : "border-gray-300"}`}>
                      <td className="py-1">{m.reg}</td>
                      <td className="py-1">{m.cuenta}</td>
                      <td className="py-1">{m.desc}</td>
                      <td className="py-1">{m.CO}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

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
            </div>
          )}
        </div>
      </Draggable>
    );
  }
);

export default DraggableLine;
