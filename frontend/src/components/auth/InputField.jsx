// src/components/InputField.jsx
import React from "react";
import { useTheme } from "../ThemeContext";

export function InputField({ id, label, type = "text", ...props }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div>
      <label htmlFor={id} className={`block mb-1 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        className={`w-full rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 transition-colors duration-300
          ${isDark ? "bg-[#1a1a1a] border-[#333] text-white" : "bg-gray-100 border-gray-300 text-gray-900"}`}
        {...props}
      />
    </div>
  );
}
