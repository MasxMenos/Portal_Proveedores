// src/components/header/ProfileMenu.jsx
import React, { useState, useRef } from "react";
import { User, UserCog, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ProfileMenu({ isDark }) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef(null);
  const closeTimer = useRef(null);
  const navigate = useNavigate();

  const toggleMenu = () => {
    clearTimeout(closeTimer.current);
    setMenuOpen(open => !open);
  };

  const handleMouseEnter = () => clearTimeout(closeTimer.current);
  const handleMouseLeave = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenuOpen(false), 2000);
  };

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={toggleMenu}
        className={`p-2 rounded transition-colors duration-200 ${
          isDark ? "hover:bg-zinc-800" : "hover:bg-gray-300"
        }`}
      >
        <User size={22} className={isDark ? "text-gray-400" : "text-gray-600"} />
      </button>

      {menuOpen && (
        <div
          className={`absolute right-0 mt-2 w-64 rounded-lg shadow-lg z-50 ${
            isDark
              ? "bg-zinc-950 text-gray-200 border border-zinc-800"
              : "bg-white text-gray-800 border border-gray-200"
          }`}
        >
          <button
            onClick={() => navigate("/configuracion_perfil")}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded transition-colors ${
              isDark ? "hover:bg-zinc-800" : "hover:bg-gray-100"
            }`}
          >
            <UserCog size={22} className={isDark ? "text-gray-400" : "text-gray-600"} />
            <span>{t("header.profile")}</span>
          </button>
          <button
            onClick={() => navigate("/configuracion")}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded transition-colors ${
              isDark ? "hover:bg-zinc-800" : "hover:bg-gray-100"
            }`}
          >
            <Settings size={22} className={isDark ? "text-gray-400" : "text-gray-600"} />
            <span>{t("header.configuration")}</span>
          </button>
          <button
            onClick={() => navigate("/login")}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded transition-colors ${
              isDark ? "hover:bg-zinc-800" : "hover:bg-gray-100"
            }`}
          >
            <LogOut size={22} className={isDark ? "text-gray-400" : "text-gray-600"} />
            <span>{t("header.signOut")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
