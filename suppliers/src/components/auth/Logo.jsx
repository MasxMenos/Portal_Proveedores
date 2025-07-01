// src/components/Logo.jsx
import React from "react";
import mylogo from "./../../static/Logo.svg";

export function Logo() {
  return (
    <div className="flex flex-col items-center space-y-2 select-none">
      <div className="flex space-x-1">
        <img src={mylogo} alt="Supermercados Logo" className="w-24 h-auto" />
      </div>
    </div>
  );
}
