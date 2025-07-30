// src/components/MainHeader.jsx (HeaderSuperior)
import React, { useState, useEffect, useCallback } from "react";
import { Moon, Sun, HelpCircle, LanguagesIcon } from "lucide-react";
import { useTheme } from "./ThemeContext";
import SearchBar from "./header/SearchBar";
import ProfileMenu from "./header/ProfileMenu";
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";
import useTutorial from "../hooks/useTutorial";
import { useTranslation } from "react-i18next";

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

  // Idioma actual y visibilidad menú
  const [showLang, setShowLang] = useState(false);
  const [language, setLanguage] = useState(i18n.language || "es");

  // Cambia el idioma, persiste y cierra menú
  const handleChangeLang = (lng) => {
    setLanguage(lng);
    i18n.changeLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
    setShowLang(false);
  };

  // Control de visibilidad al hacer scroll/mousemove
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
          <span
            className={`text-sm sm:text-base ml-0 md:ml-64 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            / {activePage}
          </span>

          <div className="flex items-center space-x-3">
            {/* SearchBar dispara onSearch al presionar Enter */}
            <SearchBar isDark={isDark} onSearch={onSearch} />

            {/* Botón cambio de idioma */}
            <div className="relative">
              <button
                onClick={() => setShowLang((v) => !v)}
                className={`p-2 rounded transition-colors duration-200 flex items-center gap-1 ${
                  isDark ? "hover:bg-zinc-800" : "hover:bg-gray-300"
                }`}
                title={t("settings.general.preferredLanguage")}
              >
                <LanguagesIcon size={22} className={isDark ? "text-gray-400" : "text-gray-600"} />
                <span className="uppercase font-semibold text-xs">{language}</span>
              </button>
              {showLang && (
                <div className={`absolute right-0 mt-2 bg-white dark:bg-[#2a2a2a] rounded shadow border dark:border-zinc-800 z-50`}>
                  <button
                    className="block px-4 py-2 text-left w-full hover:bg-gray-100 dark:hover:bg-zinc-800"
                    onClick={() => handleChangeLang("es")}
                  >🇪🇸 {t("languages.es")}</button>
                  <button
                    className="block px-4 py-2 text-left w-full hover:bg-gray-100 dark:hover:bg-zinc-800"
                    onClick={() => handleChangeLang("en")}
                  >🇬🇧 {t("languages.en")}</button>
                  <button
                    className="block px-4 py-2 text-left w-full hover:bg-gray-100 dark:hover:bg-zinc-800"
                    onClick={() => handleChangeLang("fr")}
                  >🇫🇷 {t("languages.fr")}</button>
                </div>
              )}
            </div>

            {/* Modo oscuro/claro */}
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

            <button
              onClick={startTutorial}
              className={`p-2 rounded transition-colors duration-200 ${
                isDark ? "hover:bg-zinc-800" : "hover:bg-gray-300"
              }`}
            >
              <HelpCircle size={22} className={isDark ? "text-gray-400" : "text-gray-600"} />
            </button>

            <ProfileMenu isDark={isDark} />
          </div>
        </div>
      </header>

      <div className={headerHeight} />
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
