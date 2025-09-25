// src/pages/InicioPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Sidebar from "../components/MainSidebar";
import HeaderSuperior from "../components/MainHeader";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

import { metrics, totalSalesData, topProductsData, contacts } from "../data/homepage";
import { useTheme } from "../components/ThemeContext";

export default function InicioPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  // Estado descripción de usuario
  const [descripcion, setDescripcion] = useState("");
  const token = localStorage.getItem("accessToken")?.trim();

  useEffect(() => {
    // traer perfil
    (async () => {
      try {
        const res = await fetch("/api/users/profile/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setDescripcion(data.descripcion || "");
        }
      } catch {
        // silencio en falla
      }
    })();
  }, [token]);

  // Sidebar
  const [activePage, setActivePage] = useState(t("sidebar.home"));
  const handleNavClick = (path) => {
    const key = path.slice(1) || "home";
    setActivePage(t(`sidebar.${key}`));
    navigate(path);
  };

  // clases según tema
  const bgClass = isDark ? "bg-black text-white" : "bg-white text-black";
  const cardClass = isDark ? "bg-[#111] text-[#9DA0A5]" : "bg-gray-100 text-gray-800";
  const sectionTitleClass = isDark ? "text-gray-400" : "text-gray-600";
  const tableHeaderClass = isDark ? "text-[#CCD0D5]" : "text-gray-700";
  const tableRowClass = isDark ? "text-[#999B9E] border-[#222]" : "text-gray-600 border-gray-300";

  return (
    <div className={`flex flex-col md:flex-row min-h-screen ${bgClass}`}>
      <Sidebar activePage={activePage} onNavClick={handleNavClick} />

      <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        <HeaderSuperior
          activePage={t("sidebar.home")}
          title={t("homepage.welcome")}
          onToggleTheme={toggleTheme}
        />

        {/* DESCRIPCIÓN DEL USUARIO */}
        {descripcion && (
          <div className="px-4 mb-6 text-lg font-medium">
            {descripcion}
          </div>
        )}

        <div id="inicio-metricas" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Object.entries(metrics).map(([key, value]) => (
            <div key={key} className={`rounded-lg p-4 flex flex-col ${cardClass}`}>
              <span className="text-lg text-gray-400 capitalize">
                {t(`homepage.metrics.${key}`)}
              </span>
              <span className="text-4xl font-semibold mt-1">{value}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2 flex flex-col" id="inicio-ventas-chart">
            <h2 className={`${sectionTitleClass} text-base sm:text-lg mb-2`}>
              {t("homepage.totalSales")}
            </h2>
            <div className={`flex-1 rounded-lg p-4 min-h-[16rem] sm:min-h-[20rem] ${cardClass}`}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={totalSalesData}>
                  <CartesianGrid stroke={isDark ? "#333" : "#ccc"} />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#000" : "#fff",
                      border: "none",
                      color: isDark ? "#fff" : "#000",
                    }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#36a2eb" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col" id="inicio-ventas-top">
            <h2 className={`${sectionTitleClass} text-base sm:text-lg mb-2`}>
              {t("homepage.topProducts")}
            </h2>
            <div className={`flex-1 rounded-lg p-4 min-h-[16rem] sm:min-h-[20rem] ${cardClass}`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsData} layout="vertical">
                  <CartesianGrid stroke={isDark ? "#333" : "#ccc"} horizontal={false} />
                  <XAxis type="number" stroke="#888" />
                  <YAxis dataKey="name" type="category" stroke="#888" width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#000" : "#fff",
                      border: "none",
                      color: isDark ? "#fff" : "#000",
                    }}
                  />
                  <Bar dataKey="value" fill="#36a2eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div id="inicio-contactos" className={`rounded-lg p-4 overflow-auto ${cardClass}`}>
          <h2 className={`mb-2 ${tableHeaderClass}`}>{t("homepage.contacts.title")}</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className={`text-left ${tableHeaderClass}`}>
                <th className="py-1">{t("homepage.contacts.tipo")}</th>
                <th className="py-1">{t("homepage.contacts.email")}</th>
                <th className="py-1">{t("homepage.contacts.nota")}</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.email} className={`border-t ${tableRowClass}`}>
                  <td className="py-2">{c.tipo}</td>
                  <td className="py-2">{c.email}</td>
                  <td className="py-2">{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
