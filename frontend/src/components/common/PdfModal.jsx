import React, { useEffect, useRef } from "react";

export default function PdfModal({
  isOpen,
  onClose,
  src = "../documentos/MANUAL/Portal_de_proveedores.pdf",
  title = "Manual de Portal de Proveedores",
}) {
  const overlayRef = useRef(null);

  // Cerrar con ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Cerrar si hace click fuera del modal
  const onOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={onOverlayClick}
      className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-semibold">{title}</h3>
          <div className="flex items-center gap-2">
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              className="text-xs px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-100"
              title="Abrir en pestaña nueva"
            >
              Abrir en nueva pestaña
            </a>
            <a
              href={src}
              download
              className="text-xs px-3 py-1.5 rounded bg-gray-900 text-white hover:bg-black"
              title="Descargar PDF"
            >
              Descargar
            </a>
            <button
              onClick={onClose}
              className="ml-1 text-xs px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-100"
              title="Cerrar"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Visor PDF */}
        <div className="w-full h-[80vh] bg-gray-50">
          {/* Iframe suele funcionar bien para PDFs; si no, se puede usar <object> como fallback */}
          <iframe
            title={title}
            src={src}
            className="w-full h-full"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
