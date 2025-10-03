// src/components/common/UnderConstructionPage.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/MainSidebar";
import HeaderSuperior from "../components/MainHeader";
import { useTheme } from "../components/ThemeContext";
import { Hammer, AlertTriangle } from "lucide-react";

/**
 * Página "Zona en construcción" reutilizable.
 * La idea es que el contenedor ya traiga Sidebar + HeaderSuperior para que
 * desde cada página solo se use <UnderConstructionPage ... /> y listo.
 *
 * Props:
 * - activePageKey: i18n key para resaltar y titular (ej: "sidebar.certificates")
 * - titleKey     : i18n key del título (default "construction.title")
 * - subtitleKey  : i18n key del subtítulo (default "construction.subtitle")
 * - goHomeKey    : i18n key del botón "Volver al inicio"
 * - retryKey     : i18n key del botón "Reintentar"
 * - className    : clases extra para el card container (opcional)
 */
export default function UnderConstructionPage({
  activePageKey = "construction.active",
  titleKey = "construction.title",
  subtitleKey = "construction.subtitle",
  goHomeKey = "construction.goHome",
  retryKey = "construction.retry",
  className = "",
}) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();

  const title = t(activePageKey, "Sección");

  const btnClasses = (variant = "solid") => {
    const base = "px-4 py-2 rounded transition-colors duration-200";
    if (variant === "ghost") {
      return isDark
        ? `${base} bg-[#0A0D0F] hover:bg-[#111416] text-white`
        : `${base} bg-gray-200 hover:bg-gray-300 text-black`;
    }
    return isDark
      ? `${base} bg-[#111416] hover:bg-[#0A0D0F] text-white`
      : `${base} bg-gray-300 hover:bg-gray-200 text-black`;
  };

  return (
    <div className={`flex flex-col md:flex-row min-h-screen ${isDark ? "bg-black text-white" : "bg-white text-black"}`}>
      {/* Sidebar */}
      <Sidebar activePage={title} />

      {/* Main */}
      <main className="flex-1 p-6 md:ml-64 space-y-6 overflow-auto">
        <HeaderSuperior
          activePage={title}
          title={title}
          onToggleTheme={toggleTheme}
        />

        {/* Contenido centrado */}
        <section className="w-full flex items-center justify-center">
          <div
            className={[
              "w-full max-w-2xl rounded-xl border",
              isDark ? "bg-[#111] border-[#2a2a2a] text-gray-200" : "bg-white border-gray-200 text-gray-800",
              "px-6 py-10 text-center shadow-sm",
              className,
            ].join(" ")}
          >
            <div className="mx-auto mb-4 flex items-center justify-center gap-3">
              <span
                className="inline-flex items-center justify-center w-12 h-12 rounded-full"
                style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}
              >
                <Hammer size={22} className={isDark ? "text-gray-300" : "text-gray-700"} />
              </span>
              <AlertTriangle size={28} className={isDark ? "text-gray-400" : "text-gray-500"} />
            </div>

            <h1 className="text-xl font-semibold mb-2">
              {t(titleKey, "Zona en construcción")}
            </h1>

            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              {t(subtitleKey, "Estamos trabajando para habilitar esta sección. Vuelve más tarde.")}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                className={btnClasses("solid")}
                onClick={() => navigate("/inicio")}
              >
                {t(goHomeKey, "Volver al inicio")}
              </button>

              <button
                className={btnClasses("ghost")}
                onClick={() => window.location.reload()}
              >
                {t(retryKey, "Reintentar")}
              </button>
            </div>

            <div className="mt-6 text-xs">
              <span className={isDark ? "text-gray-500" : "text-gray-500"}>
                {t("construction.note", "Gracias por tu paciencia.")}
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
