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

import {contacts } from "../data/homepage";
import { initialMetrics, fetchAllMetrics, getGrowth } from"../data/homepage/metrics"; 
import { fetchTotalSalesSeries } from"../data/homepage/total_sales_months"; 
import { fetchTopProducts } from"../data/homepage/top_products"; 
import { fetchCategorySupplier } from"../data/homepage/contacts"; 
import { useTheme } from "../components/ThemeContext";

export default function InicioPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const formatCOP = (v) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(Math.trunc(Number(v) || 0));

  // Estado descripción de usuario
  const [descripcion, setDescripcion] = useState("");
  const [nit, setNit] = useState("");
  const token = localStorage.getItem("accessToken")?.trim();
  const [metrics, setMetrics] = useState(initialMetrics)
  const [totalSalesData, setTotalSalesMonths] = useState('')
  const [categorySupplier, setCategorySupplier] = useState('')
  const [topProductsData, setTopProducts] = useState()
    
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
          setNit(data.usuario||"");
        }
      } catch {
        // silencio en falla
      }
    })();
  }, [token]);
  
  useEffect(() => {
      if (!nit) return;

      let cancelled = false;

      (async () => {
        try {
          const loaded = await fetchAllMetrics({nit});
          if (!cancelled) setMetrics(loaded);
        } catch (e) {
          console.error("Error cargando métricas:", e);
        }
      })();

      return () => { cancelled = true; };
    }, [nit]);
  useEffect(() => {
      if (!nit) return;

      let cancelled = false;

      (async () => {
        try {
          const loaded = await fetchTotalSalesSeries({nit});
          if (!cancelled) setTotalSalesMonths(loaded);
        } catch (e) {
          console.error("Error cargando ventas mensuales:", e);
        }
      })();

      return () => { cancelled = true; };
    }, [nit]);

    useEffect(() => {
      if (!nit) return;
      let cancelled = false;

      (async () => {
        try {
          const loaded = await fetchTopProducts({nit});
          if (!cancelled) setTopProducts(loaded);
        } catch (e) {
          console.error("Error cargando top-products:", e);
        }
      })();

      return () => { cancelled = true; };
    }, [nit]);

    useEffect(() => {
      if (!nit) return;
      let cancelled = false;

      (async () => {
        try {
          const loaded = await fetchCategorySupplier({nit});
          if (!cancelled) setCategorySupplier(loaded);
        } catch (e) {
          console.error("Error cargando la categoria del proveedor:", e);
        }
      })();

      return () => { cancelled = true; };
    }, [nit]);
    
    

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
        {(!totalSalesData?.length && !topProductsData?.length) && (
            <div className="px-4 mb-4">
              <div
                role="alert"
                aria-live="polite"
                className="flex items-start gap-2 rounded-md bg-yellow-100 border border-yellow-300 p-3 text-yellow-900"
              >
                <span className="text-xl leading-none">⚠️</span>
                <span className="text-sm font-medium">
                  Se está presentando una novedad con la conexión a Siesa o no eres un proveedor activo.
                </span>
              </div>
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
          {/* {growth &&
            <div key="crecimiento" className={`rounded-lg p-4 flex flex-col ${cardClass}`}>
              <span className="text-lg text-gray-400 capitalize">
                {t("homepage.metrics.crecimiento")}
              </span>
              <span className="text-4xl font-semibold mt-1">{growth}</span>
            </div>
          } */}
        </div>

        <div className="grid lg:grid-cols-3 md:grid-cols-1 gap-4 mb-6">
          <div className="lg:col-span-2 md:col-span-1 flex flex-col" id="inicio-ventas-chart">
            <h2 className={`${sectionTitleClass} text-base sm:text-lg mb-2`}>
              {t("homepage.totalSales.title")}
            </h2>
            {totalSalesData &&
            <div className={`flex-1 rounded-lg p-4 min-h-[16rem] sm:min-h-[20rem] ${cardClass}`}>
                <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={totalSalesData}
                margin={{  left: 30 }}
              >
                <CartesianGrid stroke={isDark ? "#333" : "#ccc"} />
                <XAxis dataKey="month" stroke="#888" />

                <YAxis
                  type="number"
                  stroke="#888"
                  width={100}
                  tick={{ fontSize: 15 }}
                  tickFormatter={formatCOP}   // ← mismo formateador
                  allowDecimals={false}
                />

                <Tooltip
                  formatter={(value) => [formatCOP(value), t("homepage.totalSales.graphiqueLabel")]}
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
            } 
          </div>

          <div className="flex flex-col" id="inicio-ventas-top">
            <h2 className={`${sectionTitleClass} text-base sm:text-lg mb-2`}>
              {t("homepage.topProducts.title")}
            </h2>
            <div className={`flex-1 rounded-lg p-4 min-h-[16rem] sm:min-h-[20rem] ${cardClass}`}>
              {topProductsData && 
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topProductsData}
                    layout="vertical"                 // ← barras horizontales
                    barSize={25}                      // ← más delgadas
                    barCategoryGap="50%"              // ← separación entre barras
                    // espacio para labels
                  >
                    <CartesianGrid stroke={isDark ? "#333" : "#ccc"} />

                    {/* Eje de valores */}
                    <XAxis
                      type="number"
                      stroke="#888"
                      tickFormatter={(v) =>
                        new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(Math.trunc(v))
                      }
                    />


                    {/* Eje de categorías (nombres largos a la izquierda, multilínea) */}
                    <YAxis
                      dataKey="descripcion"
                      type="category"
                      stroke="#888"
                      width={110}          // ancho reservado para las etiquetas
                      tickMargin={4}
                      tick={({ x, y, payload }) => {
                        const text = String(payload?.value ?? "");

                        // wrap por palabras, con corte duro si una palabra es muy larga
                        const wrap = (str, max = 18) => {
                          const words = str.split(" ");
                          const lines = [];
                          let line = "";
                          for (let w of words) {
                            if ((line + (line ? " " : "") + w).length <= max) {
                              line = line ? line + " " + w : w;
                            } else {
                              if (line) lines.push(line);
                              while (w.length > max) { lines.push(w.slice(0, max)); w = w.slice(max); }
                              line = w;
                            }
                          }
                          if (line) lines.push(line);
                          return lines;
                        };

                        const lines = wrap(text, 18);

                        return (
                          <text
                            x={x - 6} y={y} fill="#888" fontSize={10}
                            textAnchor="end" dominantBaseline="middle"
                          >
                            {lines.map((ln, i) => (
                              <tspan key={i} x={x - 6} dy={i === 0 ? 0 : 12}>{ln}</tspan>
                            ))}
                          </text>
                        );
                      }}
                    />

                    <Tooltip
                      formatter={(value) => [new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(Math.trunc(value)), t("homepage.topProducts.graphiqueLabel")]}
                      contentStyle={{
                        backgroundColor: isDark ? "#000" : "#fff",
                        border: "none",
                        color: isDark ? "#fff" : "#000",
                      }}
                    />
                    <Bar dataKey="quantity" fill="#36a2eb" />
                  </BarChart>
                </ResponsiveContainer>
              }
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

              {categorySupplier?.length && categorySupplier.map((c) => (
                <tr key={c.email} className={`border-t ${tableRowClass}`}>
                  <td className="py-2">{c.name}</td>
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
