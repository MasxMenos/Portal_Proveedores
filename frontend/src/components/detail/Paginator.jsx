// src/components/ui/Paginator.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Paginador reutilizable con estética consistente a EntidadPage.
 *
 * Props esperadas (compatibles con usePagination):
 * - currentPage, totalPages
 * - pageNumbers (bloque visible)
 * - hasPrevGroup, hasNextGroup
 * - prevGroupPage, nextGroupPage
 * - onSetPage: (num) => void
 * - labels?: { prevGroup?: string, nextGroup?: string }
 * - isDark?: boolean
 * - className?: string
 * - size?: "md" | "sm"
 *
 * Comportamiento extra:
 * - Sin botones "Anterior/Siguiente".
 * - Si el usuario hace click en el último número del bloque y existe una página siguiente,
 *   se avanza directamente a la siguiente página (primer click).
 */
export default function Paginator({
  currentPage,
  totalPages,
  pageNumbers,
  hasPrevGroup,
  hasNextGroup,
  prevGroupPage,
  nextGroupPage,
  onSetPage,
  labels = {},
  isDark = false,
  className = "",
  size = "md",
}) {
  if (!totalPages || totalPages <= 1) return null;

  const L = {
    prevGroup: labels.prevGroup || "Grupo anterior",
    nextGroup: labels.nextGroup || "Grupo siguiente",
  };

  const pad = size === "sm" ? "px-3 py-1.5" : "px-4 py-2";

  const btnClasses = ({ active = false, disabled = false } = {}) => {
    const base = `${pad} rounded transition-colors duration-200`;
    const disabledCls = "opacity-50 cursor-not-allowed";
    const activeLight = "bg-gray-300 text-black";
    const activeDark = "bg-[#111416] text-white";
    const normalLight = "bg-gray-200 hover:bg-gray-300 text-black";
    const normalDark = "bg-[#0A0D0F] hover:bg-[#111416] text-white";
    const tone = active ? (isDark ? activeDark : activeLight) : (isDark ? normalDark : normalLight);
    return [base, tone, disabled ? disabledCls : ""].join(" ");
  };

  const lastInBlock = pageNumbers[pageNumbers.length - 1];

  const handleNumberClick = (p) => {
    if (p === lastInBlock && p < totalPages) {
      onSetPage(p + 1);
      return;
    }
    onSetPage(p);
  };

  const goPrevGroup = () => hasPrevGroup && onSetPage(prevGroupPage);
  const goNextGroup = () => hasNextGroup && onSetPage(nextGroupPage);

  return (
    <div className={`mt-6 flex items-center justify-center gap-2 ${className}`}>
      {/* « Grupo anterior */}
      <button
        disabled={!hasPrevGroup}
        onClick={goPrevGroup}
        className={btnClasses({ disabled: !hasPrevGroup })}
        aria-label={L.prevGroup}
        title={L.prevGroup}
      >
        «
      </button>

      {/* Números del bloque visible */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`block-${pageNumbers[0]}-${lastInBlock}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
          className="flex items-center gap-2"
        >
          {pageNumbers.map((p) => (
            <button
              key={p}
              onClick={() => handleNumberClick(p)}
              className={btnClasses({ active: p === currentPage })}
              aria-current={p === currentPage ? "page" : undefined}
            >
              {p}
            </button>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* » Grupo siguiente */}
      <button
        disabled={!hasNextGroup}
        onClick={goNextGroup}
        className={btnClasses({ disabled: !hasNextGroup })}
        aria-label={L.nextGroup}
        title={L.nextGroup}
      >
        »
      </button>
    </div>
  );
}
