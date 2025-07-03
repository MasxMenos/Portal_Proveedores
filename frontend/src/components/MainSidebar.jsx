// src/components/sidebar/Sidebar.jsx
import React, { useState } from "react";
import { Menu, Home, FileText, DollarSign, RotateCcw, Award } from "lucide-react";
import { useTheme } from "./ThemeContext";
import SidebarHeader from "./sidebar/SidebarHeader";
import SidebarNav from "./sidebar/SidebarNav";
import SidebarFooter from "./sidebar/SidebarFooter";

const navItems = [
  { label: "Inicio",        icon: <Home size={22}   color="#203259" />, path: "/inicio" },
  { label: "Facturas",      icon: <FileText size={22} color="#203259" />, path: "/facturas" },
  { label: "Pagos",         icon: <DollarSign size={22} color="#203259" />, path: "/pagos" },
  { label: "Devoluciones",  icon: <RotateCcw size={22}  color="#203259" />, path: "/devoluciones" },
  { label: "Certificados",  icon: <Award size={22}    color="#203259" />, path: "/certificados" },
];

export default function Sidebar({ activePage = "Inicio", onNavClick }) {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`md:hidden fixed top-4 left-4 z-50 p-2 ${isDark ? "bg-zinc-900" : "bg-gray-100"} rounded`}
      >
        <Menu size={24} className={isDark ? "text-white" : "text-black"} />
      </button>

      {open && (
        <div
          className={`fixed inset-0 ${isDark ? "bg-black bg-opacity-50" : "bg-gray-300 bg-opacity-30"} z-50 md:hidden`}
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-64 h-screen flex flex-col justify-between transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-200 ease-in-out z-50 ${
          isDark ? "bg-zinc-950 text-white" : "bg-white text-black"
        }`}
      >
        <div>
          <SidebarHeader isDark={isDark} onClose={() => setOpen(false)} />
          <SidebarNav navItems={navItems} isDark={isDark} onClose={() => setOpen(false)} />
        </div>
        <SidebarFooter isDark={isDark} providerName="Freskaleche" />

      </aside>
    </>
  );
}
