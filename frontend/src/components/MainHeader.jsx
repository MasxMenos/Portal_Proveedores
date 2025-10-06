// src/components/MainHeader.jsx (HeaderSuperior)
import React, { useState, useEffect, useCallback } from "react";
import { Moon, Sun, HelpCircle, LanguagesIcon } from "lucide-react";
import { useTheme } from "./ThemeContext";
//import SearchBar from "./header/SearchBar";
import ProfileMenu from "./header/ProfileMenu";
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";
import useTutorial from "../hooks/useTutorial";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

export default function HeaderSuperior({
  activePage,
  title = "",
  onSearch = () => {},
  onToggleTheme = () => {},
  onHelpClick = () => {},
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { startTutorial } = useTutorial();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const pathname = location.pathname || "/";
  //const isHome =pathname === "/" || pathname === "/inicio" || pathname.startsWith("/inicio/"); // por si hay subrutas
  
  // Para el breadcrumb, extraemos el posible detalle tras la primera ruta:
  const segments = location.pathname.split("/").filter(Boolean);
  const detailSlug = segments.length > 1 ? segments[1] : null;

  // Idioma actual y visibilidad menú
  const [showLang, setShowLang] = useState(false);
  const [language, setLanguage] = useState(i18n.language || "es");
  const handleChangeLang = (lng) => {
    setLanguage(lng);
    i18n.changeLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
    setShowLang(false);
  };

  // Mostrar/ocultar al hacer scroll o mover el ratón
  const [visible, setVisible] = useState(true);
  const [lastY, setLastY] = useState(0);
  const onScroll = useCallback(() => {
    const currentY = window.scrollY;
    setVisible(currentY < lastY || currentY < 50);
    setLastY(currentY);
  }, [lastY]);
  const onMouseMove = useCallback((e) => {
    if (e.clientY < 50) setVisible(true);
  }, []);
  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [onScroll, onMouseMove]);

  const headerHeight = "h-20 sm:h-28";

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-40 transform transition-transform duration-200
          ${visible ? "translate-y-0" : "-translate-y-full"} ${headerHeight}
          ${isDark ? "bg-[#0d0d0d] text-white" : "bg-white text-black"}
        `}
      >
        <div className="flex items-center justify-between h-full px-4">
          {/* Breadcrumb: primero activePage traducido, luego opcional detalle */}
          <span
            className={`text-sm sm:text-base ml-12 md:ml-64 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            / {activePage}
            {detailSlug && <> / {detailSlug}</>}
          </span>

          <div className="flex items-center space-x-3">
            {/*{!isHome && ( 
             <SearchBar isDark={isDark} onSearch={onSearch} />
            )}*/}

            {/* Selector de idioma */}
            <div className="relative">
              <button
                onClick={() => setShowLang((v) => !v)}
                className={`p-2 rounded transition-colors duration-200 flex items-center gap-1 ${
                  isDark ? "hover:bg-zinc-800" : "hover:bg-gray-300"
                }`}
                title={t("settings.general.preferredLanguage")}
              >
                <LanguagesIcon
                  size={22}
                  className={isDark ? "text-gray-400" : "text-gray-600"}
                />
                <span className="uppercase font-semibold text-xs">
                  {language}
                </span>
              </button>
              {showLang && (
                <div
                  className={`absolute right-0 mt-2 rounded shadow border z-50 ${
                    isDark
                      ? "bg-zinc-900 border-zinc-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <button
                    className="block px-4 py-2 w-full text-left hover:bg-gray-100 dark:hover:bg-zinc-800"
                    onClick={() => handleChangeLang("es")}
                  >
                    🇪🇸 {t("languages.es")}
                  </button>
                  <button
                    className="block px-4 py-2 w-full text-left hover:bg-gray-100 dark:hover:bg-zinc-800"
                    onClick={() => handleChangeLang("en")}
                  >
                    🇬🇧 {t("languages.en")}
                  </button>
                  <button
                    className="block px-4 py-2 w-full text-left hover:bg-gray-100 dark:hover:bg-zinc-800"
                    onClick={() => handleChangeLang("fr")}
                  >
                    🇫🇷 {t("languages.fr")}
                  </button>
                </div>
              )}
            </div>

            {/* Tema */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded transition-colors duration-200 ${
                isDark ? "hover:bg-zinc-800" : "hover:bg-gray-300"
              }`}
            >
              {isDark ? (
                <Sun size={22} className="text-gray-400" />
              ) : (
                <Moon size={22} className="text-gray-600" />
              )}
            </button>

            {/* Tutorial */}
            <button
              onClick={startTutorial}
              className={`hidden md:inline-flex p-2 rounded transition-colors duration-200 ${
                isDark ? "hover:bg-zinc-800" : "hover:bg-gray-300"
              }`}
              aria-label="Ayuda"
            >
              <HelpCircle
                size={22}
                className={isDark ? "text-gray-400" : "text-gray-600"}
              />
            </button>

            <ProfileMenu isDark={isDark} />
          </div>
        </div>
      </header>

      <div className={headerHeight} />

      {/* Título principal, igual que antes */}
      <h1
        className={`px-4 text-2xl sm:text-4xl font-semibold mb-6 ${
          isDark ? "text-[#9DA0A5]" : "text-gray-800"
        }`}
      >
        {title}
      </h1>
    </>
  );
}
