// frontend/src/pages/auth/kyc/components/BoolRadio.jsx
import React from "react";

export default function BoolRadio({ id, label, value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-6">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input type="radio" name={id} checked={value === true} onChange={() => onChange(true)} />
          <span className="text-sm">Sí</span>
        </label>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input type="radio" name={id} checked={value === false} onChange={() => onChange(false)} />
          <span className="text-sm">No</span>
        </label>
      </div>
    </div>
  );
}
