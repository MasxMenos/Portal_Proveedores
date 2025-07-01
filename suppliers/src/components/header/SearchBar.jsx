// src/components/header/SearchBar.jsx
import React from "react";
import { Search } from "lucide-react";

export default function SearchBar({ isDark, onSearch }) {
  return (
    <div className="relative hidden sm:block">
      <Search
        size={22}
        className={`absolute left-2 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
      />
      <input
        type="text"
        placeholder="Buscar"
        onChange={(e) => onSearch(e.target.value)}
        className={`
          pl-10 pr-4 py-1 rounded text-base focus:outline-none w-52 h-10
          ${isDark ? "bg-zinc-900 text-white" : "bg-gray-200 text-black"}
        `}
      />
    </div>
  );
}
