// src/components/PrimaryButton.jsx
import React from "react";

export function PrimaryButton({ children, fullWidth, ...props }) {
  const classes = `bg-red-600 hover:bg-red-700 transition-colors text-white font-semibold py-2 rounded-lg shadow-lg shadow-red-700/40 ${
    fullWidth ? "w-full" : "px-4"
  }`;
  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
