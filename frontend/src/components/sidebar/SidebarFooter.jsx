// src/components/sidebar/SidebarFooter.jsx
import React from "react";
import { AtSign } from "lucide-react";

export default function SidebarFooter({ isDark, providerName = "Freskaleche" }) {
  return (
    <div
      className={`flex items-center space-x-2 text-lg px-4 py-3 ${
        isDark ? "text-gray-400" : "text-gray-600"
      }`}
    >
      <AtSign size={20} className="text-red-600" />
      <span>{providerName}</span>
    </div>
  );
}
