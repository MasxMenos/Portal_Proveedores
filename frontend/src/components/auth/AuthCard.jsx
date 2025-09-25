// src/components/auth/AuthCard.jsx
import React from "react";
import { useTheme } from "../ThemeContext";
import { Logo } from "./Logo";

/**
 * Props nuevas:
 * - size: "sm" | "md" | "lg" | "xl" | "2xl" | "full"  (default: "md")
 * - className: clases extra para el contenedor externo de la card
 * - contentClassName: clases extra para el área interna (padding, etc.)
 */
export function AuthCard({
  title,
  subtitle,
  children,
  size = "md",
  className = "",
  contentClassName = "",
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const maxw = {
    sm:  "max-w-sm",
    md:  "max-w-md",
    lg:  "max-w-3xl",
    xl:  "max-w-5xl",
    "2xl": "max-w-6xl",
    full: "!max-w-none", // ocupa todo el ancho disponible del wrapper
  }[size] || "max-w-md";

  return (
    <div
      className={[
        "w-full", maxw, "rounded-2xl shadow-lg relative transition-colors duration-300",
        isDark ? "bg-[#111] text-gray-200" : "bg-white text-gray-900 border border-gray-200",
        className,
      ].join(" ")}
    >
      <div className={["p-6 md:p-8 space-y-6", contentClassName].join(" ")}>
        <Logo />
        <h1 className="text-center text-2xl font-semibold">{title}</h1>
        {subtitle && (
          <p className={`text-center text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
