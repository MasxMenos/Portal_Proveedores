  export const metrics = {
    // servicio: "1250",
    // ventas: "$152.345",
    // productos: "1250",
    crecimiento: "25%",
  };
  
  export const totalSalesData = [
    { month: "Ene", value: 50000 },
    { month: "Feb", value: 52000 },
    { month: "Mar", value: 58000 },
    { month: "Abr", value: 60000 },
    { month: "May", value: 63000 },
    { month: "Jun", value: 65000 },
  ];

  export const topProductsData = [
    { name: "Leche", value: 12 },
    { name: "Kumis", value: 11 },
    { name: "Avena", value: 10 },
    { name: "Queso", value: 8 },
    { name: "Alpinito", value: 5 },
  ];

  export const contacts = [
    { tipo: "Conciliaciones", email: "conciliaciones@mxm.com.co", note: "Para conciliaciones" },
    { tipo: "Comercial", email: "comercial@mxm.com.co", note: "Problemas de precios" },
    { tipo: "Facturación Comercial", email: "facturacion@mxm.com.co", note: "Error en factura electrónica" },
    { tipo: "Director de abastecimiento", email: "dir.abastecimiento@mxm.com.co", note: "Escribir si no hay orden de compra" },
    { tipo: "Líder de abastecimiento", email: "lider.abastecimiento@mxm.com.co", note: "Escribir si no hay orden de compra" },
  ];


// metrics.js

// Helpers (ajústalos si quieres otro formato)
const formatCurrency = (n) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(Math.trunc(n));

const formatNumber = (n) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(Math.trunc(n));

// Estado inicial (placeholders) para el render mientras carga
export const initialMetrics = {
  servicio: "Cargando...",
  ventas: "Cargando...",
  productos: "Cargando...",
};

// Config por métrica: endpoint, nombre del query param y cómo mapear la respuesta
const CONFIG = {
  servicio: {
    path: "/api/homepage/service_level",
    param: "nitProveedor",
    map: (data) =>
      Array.isArray(data) && data.length > 0
        ? `${data[0].f420_cumplimiento}%`
        : "No aplica.",
  },
  ventas: {
    path: "/api/homepage/total_sales",
    param: "nit",
    map: (data) =>
      Array.isArray(data) && data.length > 0
        ? `$${formatCurrency(data[0].ventas)}`
        : "No aplica.",
  },
  productos: {
    path: "/api/homepage/total_sales_products",
    param: "nit",
    map: (data) =>
      Array.isArray(data) && data.length > 0
        ? `${formatNumber(data[0].quantity)}`
        : "No aplica.",
  },
};

export async function fetchAllMetrics({ nit, token, origin = window.location.origin }) {
  if (!nit) return initialMetrics;

  const keys = Object.keys(CONFIG);

  const results = await Promise.all(
    keys.map(async (key) => {
      const { path, param, map } = CONFIG[key];

      try {
        const url = new URL(path, origin);
        url.searchParams.set(param, nit);

        const res = await fetch(url.toString(), {
          method: "GET",
          // headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (!res.ok) {
          console.error(`[metrics] ${key}: HTTP ${res.status}`);
          return [key, "No aplica."]; // o "—"
        }

        const data = await res.json();
        return [key, map(data)];
      } catch (err) {
        console.error(`[metrics] ${key}: error`, err);
        return [key, "No aplica."];
      }
    })
  );

  return Object.fromEntries(results);
}