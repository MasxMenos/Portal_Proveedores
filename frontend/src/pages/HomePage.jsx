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

import { contacts } from "../data/homepage";
import { initialMetrics, fetchAllMetrics } from "../data/homepage/metrics";
import { fetchTotalSalesSeries } from "../data/homepage/total_sales_months";
import { fetchTopProducts } from "../data/homepage/top_products";
import { fetchCategorySupplier } from "../data/homepage/contacts";
import { useTheme } from "../components/ThemeContext";

function mergeByMonth(currYear, lastYear) {
  const map = new Map();
  for (const { month, value } of currYear) {
    map.set(month, { month, valueCurrent: value, valueLastYear: 0 });
  }
  for (const { month, value } of lastYear) {
    const prev = map.get(month) ?? { month, valueCurrent: 0, valueLastYear: 0 };
    prev.valueLastYear = value;
    map.set(month, prev);
  }
  const MONTH_INDEX = new Map(
    ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sept","Oct","Nov","Dic"].map((m,i)=>[m,i+1])
  );
  const ALIAS = { Sep: "Sept" };
  const idx = (m) => MONTH_INDEX.get(ALIAS[m] ?? m) ?? 99;
  return Array.from(map.values()).sort((a,b)=>idx(a.month)-idx(b.month));
}

// Fechas constantes (no se tocan al cambiar NIT)
const now = new Date();
const lastYear = now.getFullYear() - 1;
const startLastDate = new Date(lastYear, 0, 1);
const endLastDate   = new Date(lastYear, 11, 31);

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

  // Sesión / perfil
  const [descripcion, setDescripcion] = useState("");
  const [baseNit, setBaseNit] = useState(""); // NIT del perfil (puede ser "admin")
  const token = localStorage.getItem("accessToken")?.trim();

  // NIT ACTIVO (el que se usa para TODAS las consultas)
  const [activeNit, setActiveNit] = useState(""); // "admin" o un proveedor

  // Control de admin y selector
  const isAdminUser = String(baseNit).toLowerCase() === "admin";
  const [provQuery, setProvQuery] = useState("");
  const [provOptions, setProvOptions] = useState([]); // [{usuario, descripcion}]
  const [selectedProvider, setSelectedProvider] = useState(null); // objeto proveedor

  // Datasets
  const [metrics, setMetrics] = useState(initialMetrics);
  const [totalSalesData, setTotalSalesMonths] = useState([]);        // año actual
  const [totalSalesLastYearData, setTotalSalesLastMonths] = useState([]); // año anterior
  const [categorySupplier, setCategorySupplier] = useState([]);
  const [topProductsData, setTopProducts] = useState([]);

  // Cargar perfil
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/users/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const perfilNit = (data.usuario || "").trim();
          setDescripcion(data.descripcion || "");
          setBaseNit(perfilNit);
          // Si es admin => arranca en "admin", si no => arranca en su NIT
          setActiveNit(String(perfilNit).toLowerCase() === "admin" ? "admin" : perfilNit);
        }
      } catch {
        // silencio en falla
      }
    })();
  }, [token]);

  // Autocomplete proveedores (solo admin)
  useEffect(() => {
    if (!isAdminUser) return;
    const ctrl = new AbortController();
    const h = setTimeout(async () => {
      try {
        const url = new URL("/api/users/providers", window.location.origin);
        const q = provQuery.trim();
        if (q) url.searchParams.set("q", q);
        const access = localStorage.getItem("accessToken");
        const res = await fetch(url.toString(), {
          signal: ctrl.signal,
          headers: access ? { Authorization: `Bearer ${access}` } : {},
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const list = await res.json();
        setProvOptions(Array.isArray(list) ? list : []);
      } catch (e) {
        if (e.name !== "AbortError") setProvOptions([]);
      }
    }, 300);
    return () => { clearTimeout(h); ctrl.abort(); };
  }, [provQuery, isAdminUser]);

  // Modo admin “global” si activeNit === "admin"
  const isAdminView = String(activeNit).toLowerCase() === "admin";

  // Refetch TOTAL al cambiar activeNit
  useEffect(() => {
    if (!activeNit) return;

    let cancelled = false;

    (async () => {
      try {
        // 1) Métricas (la card 1 será visits SOLO si activeNit === "admin")
        const m = await fetchAllMetrics({ nit: activeNit });
        if (!cancelled) setMetrics(m);

        // 2) Ventas por mes (año actual)
        const curr = await fetchTotalSalesSeries({ nit: activeNit });
        if (!cancelled) setTotalSalesMonths(curr || []);

        // 3) Ventas por mes (año anterior) — SIEMPRE con fechas constantes
        const prev = await fetchTotalSalesSeries({
          nit: activeNit,
          startDate: startLastDate,
          endDate: endLastDate,
        });
        if (!cancelled) setTotalSalesLastMonths(prev || []);

        // 4) Top productos
        const tops = await fetchTopProducts({ nit: activeNit });
        if (!cancelled) setTopProducts(tops || []);

        // 5) Categoría proveedor
        const cats = await fetchCategorySupplier({ nit: activeNit });
        if (!cancelled) setCategorySupplier(cats || []);
      } catch (e) {
        console.error("Error cargando datos del homepage:", e);
      }
    })();

    return () => { cancelled = true; };
  }, [activeNit]);

  // Sidebar
  const [activePage, setActivePage] = useState(t("sidebar.home"));
  const handleNavClick = (path) => {
    const key = path.slice(1) || "home";
    setActivePage(t(`sidebar.${key}`));
    navigate(path);
  };

  // clases
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

        {/* Descripción */}
        {descripcion && <div className="px-4 mb-6 text-lg font-medium">{descripcion}</div>}

        {/* Selector (solo admin) */}
        {isAdminUser && (
          <div className="px-4 mb-4">
            <div className={`rounded-md p-4 border ${isDark ? "border-[#222]" : "border-gray-300"}`}>
              <label className="block text-sm mb-2 opacity-80">Proveedor</label>

              <div className="flex gap-2">
                <input
                  className={`flex-1 px-3 py-2 rounded border ${
                    isDark ? "bg-[#0b0f12] border-[#1c2329] text-white" : "bg-white border-gray-300"
                  }`}
                  placeholder="Buscar por descripción…"
                  value={provQuery}
                  onChange={(e) => setProvQuery(e.target.value)}
                />
                {/* Botón para volver al modo global (admin) */}
                <button
                  type="button"
                  className={`px-3 py-2 rounded ${
                    isAdminView
                      ? (isDark ? "bg-[#111416] text-white" : "bg-gray-300 text-black")
                      : (isDark ? "bg-[#0A0D0F] hover:bg-[#111416] text-white" : "bg-gray-200 hover:bg-gray-300 text-black")
                  }`}
                  onClick={() => {
                    setSelectedProvider(null);
                    setProvQuery("global (admin)");
                    setActiveNit("admin"); // ← MODO GLOBAL
                  }}
                >
                  Global (admin)
                </button>
              </div>

              {(provOptions.length > 0) && (
                <ul className={`mt-2 max-h-56 overflow-auto border rounded ${isDark ? "border-[#1c2329]" : "border-gray-300"}`}>
                  {provOptions.map((p) => (
                    <li
                      key={p.usuario}
                      className={`px-3 py-2 cursor-pointer hover:opacity-80 ${isDark ? "text-white" : "text-black"}`}
                      onClick={() => {
                        setSelectedProvider(p);
                        setProvQuery(p.descripcion || p.usuario);
                        setActiveNit((p.usuario || "").trim()); // ← ACTIVA ESTE NIT
                      }}
                    >
                      <div className="text-sm font-medium">{p.descripcion || "(Sin descripción)"}</div>
                      <div className="text-xs opacity-70">{p.usuario}</div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="text-xs opacity-70 mt-2">
                {isAdminView
                  ? <>Modo actual: <b>global (admin)</b>.</>
                  : selectedProvider && <>Seleccionado: <b>{selectedProvider.descripcion || selectedProvider.usuario}</b> ({selectedProvider.usuario})</>}
              </div>
            </div>
          </div>
        )}

        {/* Mensaje conexión */}
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

        {/* Métricas */}
        <div id="inicio-metricas" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Object.entries(metrics).map(([key, value]) => {
            const title =
              key === "servicio" && isAdminView
                ? t("homepage.metrics.visitas") // admin => visitas
                : t(`homepage.metrics.${key}`); // proveedor => servicio
            return (
              <div id={key} key={key} className={`rounded-lg p-4 flex flex-col min-w-0 ${cardClass}`}>
                <span className="text-lg text-gray-400 capitalize">{title}</span>
                <span className="mt-1 font-semibold leading-tight break-all text-[clamp(1.25rem,4vw,2.25rem)]">
                  {value}
                </span>
              </div>
            );
          })}
        </div>

        {/* Gráfica líneas (ventas por mes) */}
        <div className="grid lg:grid-cols-3 md:grid-cols-1 gap-4 mb-6">
          <div className="lg:col-span-2 md:col-span-1 flex flex-col" id="inicio-ventas-chart">
            <h2 className={`${sectionTitleClass} text-base sm:text-lg mb-2`}>
              {t("homepage.totalSales.title")}
            </h2>

            {(totalSalesData?.length || totalSalesLastYearData?.length) ? (
              <div className={`flex-1 rounded-lg p-4 min-h-[16rem] sm:min-h-[20rem] ${cardClass}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mergeByMonth(totalSalesData ?? [], totalSalesLastYearData ?? [])} margin={{ left: 30 }}>
                    <CartesianGrid stroke={isDark ? "#333" : "#ccc"} />
                    <XAxis dataKey="month" stroke="#888" />
                    <YAxis
                      type="number"
                      stroke="#888"
                      width={100}
                      tick={{ fontSize: 15 }}
                      tickFormatter={formatCOP}
                      allowDecimals={false}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        formatCOP(value),
                        name === "valueCurrent"
                          ? t("homepage.totalSales.currentYear")
                          : t("homepage.totalSales.lastYear"),
                      ]}
                      contentStyle={{
                        backgroundColor: isDark ? "#000" : "#fff",
                        border: "none",
                        color: isDark ? "#fff" : "#000",
                      }}
                    />
                    <Line type="monotone" dataKey="valueCurrent" stroke="#36a2eb" strokeWidth={2} dot={false} name="valueCurrent" />
                    <Line type="monotone" dataKey="valueLastYear" stroke="#be0811" strokeWidth={2} dot={false} name="valueLastYear" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className={`flex-1 rounded-lg p-4 min-h-[16rem] sm:min-h-[20rem] ${cardClass} flex items-center justify-center`}>
                <span className="opacity-60 text-sm">Sin datos para el período.</span>
              </div>
            )}
          </div>

          {/* Top productos */}
          <div className="flex flex-col" id="inicio-ventas-top">
            <h2 className={`${sectionTitleClass} text-base sm:text-lg mb-2`}>
              {t("homepage.topProducts.title")}
            </h2>
            <div className={`flex-1 rounded-lg p-4 min-h-[16rem] sm:min-h-[20rem] ${cardClass}`}>
              {topProductsData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProductsData} layout="vertical" barSize={25} barCategoryGap="50%">
                    <CartesianGrid stroke={isDark ? "#333" : "#ccc"} />
                    <XAxis
                      type="number"
                      stroke="#888"
                      tickFormatter={(v) =>
                        new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(Math.trunc(v))
                      }
                    />
                    <YAxis
                      dataKey="descripcion"
                      type="category"
                      stroke="#888"
                      width={110}
                      tickMargin={4}
                      tick={({ x, y, payload }) => {
                        const text = String(payload?.value ?? "");
                        const wrap = (str, max = 18) => {
                          const words = str.split(" ");
                          const lines = [];
                          let line = "";
                          for (let w of words) {
                            if ((line + (line ? " " : "" ) + w).length <= max) {
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
                          <text x={x - 6} y={y} fill="#888" fontSize={10} textAnchor="end" dominantBaseline="middle">
                            {lines.map((ln, i) => (
                              <tspan key={i} x={x - 6} dy={i === 0 ? 0 : 12}>{ln}</tspan>
                            ))}
                          </text>
                        );
                      }}
                    />
                    <Tooltip
                      formatter={(value) => [
                        new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(Math.trunc(value)),
                        t("homepage.topProducts.graphiqueLabel"),
                      ]}
                      contentStyle={{
                        backgroundColor: isDark ? "#000" : "#fff",
                        border: "none",
                        color: isDark ? "#fff" : "#000",
                      }}
                    />
                    <Bar dataKey="quantity" fill="#36a2eb" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="opacity-60 text-sm">Sin datos para mostrar.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contactos + categorías */}
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

              {Array.isArray(categorySupplier) &&
                categorySupplier.map((c, idx) => (
                  <tr key={`cat-${idx}`} className={`border-t ${tableRowClass}`}>
                    <td className="py-2">Categoría</td>
                    <td className="py-2">—</td>
                    <td className="py-2">{c.lineaCompra}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
