// src/components/sidebar/SidebarHeader.jsx
import React from "react";
import mylogo from "../../static/Logo.svg";
import { X } from "lucide-react";

export default function SidebarHeader({ isDark, onClose }) {
  return (
    <div className="flex items-center mb-10 mt-8 justify-center p-4">
      <img src={mylogo} alt="Logo" className="w-40 h-auto" />
      <button
        onClick={onClose}
        className={`md:hidden p-1 rounded ${isDark ? "bg-zinc-900" : "bg-gray-100"}`}
      >
        <X size={24} className={isDark ? "text-white" : "text-black"} />
      </button>
    </div>
  );
}
