// src/components/auth/CheckboxWithLabel.jsx
import React from "react";

export function CheckboxWithLabel({ id, checked, onChange, children, className = "" }) {
  return (
    <label htmlFor={id} className={`inline-flex items-center gap-2 cursor-pointer select-none ${className}`}>
      <input
        id={id}
        name={id}
        type="checkbox"
        // Forzamos control
        checked={!!checked}
        onChange={(e) => {
          // Propagamos SIEMPRE el booleano real
          onChange?.(e);
        }}
      />
      <span className="text-sm">{children}</span>
    </label>
  );
}
