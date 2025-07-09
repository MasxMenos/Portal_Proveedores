// src/components/sidebar/SidebarNav.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function SidebarNav({ navItems, isDark, onClose }) {
  const { t } = useTranslation();

  return (
    <>
      {/* Encabezado de la sección, ahora traducido */}
      <h2
        className={`px-4 mb-4 font-semibold text-lg ${
          isDark ? "text-gray-400" : "text-gray-600"
        }`}
      >
        {t("sidebar.providers")}
      </h2>

      <nav className="px-2 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-2 rounded transition-colors ${
                isActive
                  ? isDark
                    ? "bg-zinc-800"
                    : "bg-gray-200"
                  : isDark
                  ? "hover:bg-zinc-800"
                  : "hover:bg-gray-100"
              }`
            }
          >
            <span className="text-blue-400">{item.icon}</span>
            {/* La etiqueta ya viene traducida en navItems */}
            <span className="text-lg">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
