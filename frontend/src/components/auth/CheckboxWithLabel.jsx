// src/components/CheckboxWithLabel.jsx
import React from "react";
import { useTheme } from "../ThemeContext";

export function CheckboxWithLabel({ id, children }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <label htmlFor={id} className="flex items-center space-x-2 cursor-pointer select-none">
      <input
        id={id}
        type="checkbox"
        className={`h-4 w-4 rounded focus:ring-red-600 transition-colors duration-300
          ${isDark ? "border-gray-600 bg-gray-700" : "border-gray-400 bg-white"}`}
      />
      <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{children}</span>
    </label>
  );
}
