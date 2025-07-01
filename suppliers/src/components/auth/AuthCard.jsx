// src/components/AuthCard.jsx
import React from "react";
import { useTheme } from "../ThemeContext";
import { Logo } from "./Logo";

export function AuthCard({ title, subtitle, children }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`w-full max-w-md rounded-2xl shadow-lg p-8 space-y-6 relative transition-colors duration-300
      ${isDark ? "bg-[#111] text-gray-200" : "bg-white text-gray-900 border border-gray-200"}`}>
      <Logo />
      <h1 className="text-center text-2xl font-semibold">{title}</h1>
      {subtitle && <p className={`text-center text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{subtitle}</p>}
      {children}
    </div>
  );
}
