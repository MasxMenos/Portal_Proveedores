// src/components/sidebar/SidebarHeader.jsx
import React from "react";
import mylogo from "../../static/Logo.svg";
import { X } from "lucide-react";

export default function SidebarHeader({ isDark, onClose }) {
  return (
    <div className="relative p-4 mb-10 mt-8">
      {/* Logo centrado */}
      <img src={mylogo} alt="Logo" className="mx-auto w-40 h-auto" />
    </div>
  );
}