// src/data/homepage/metrics.js

const formatCurrency = (n) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(Math.trunc(n));

const formatNumber = (n) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(Math.trunc(n));

// Normaliza números que pueden venir como string con separadores latinos
const toNumberSafe = (v) => {
  if (v == null) return 0;
  const s = String(v)
    .replace(/\./g, "")       // quita separador de miles
    .replace(/,/g, ".")       // coma -> punto decimal
    .replace(/[^\d.-]/g, ""); // deja solo dígitos, punto y signo
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

export const initialMetrics = {
  servicio: "Cargando...",
  ventas: "Cargando...",
  productos: "Cargando...",
  crecimiento: "Cargando...",
};

// Config depende del NIT para cambiar el endpoint de "servicio"
function getConfigMetrics(nit) {
  const isAdmin = String(nit).toLowerCase() === "admin";

  return {
    servicio: {
      // admin => /visits (sin params)
      // proveedor => /service_level?nitProveedor=...
      path: isAdmin ? "/api/homepage/visits" : "/api/homepage/service_level",
      param: isAdmin ? null : "nitProveedor",
      map: (data) => {
        if (isAdmin) {
          const value = toNumberSafe(data?.visits);
          return formatNumber(value);
        }
        // proveedor: array con f420_cumplimiento
        return Array.isArray(data) && data.length > 0
          ? `${data[0].f420_cumplimiento}%`
          : "No aplica.";
      },
    },
    ventas: {
      path: "/api/homepage/total_sales",
      param: "nit",
      map: (data) => {
        if (!Array.isArray(data) || data.length === 0) return "No aplica.";
        const val = toNumberSafe(data[0].ventas);
        return `$${formatCurrency(val)}`;
      },
    },
    productos: {
      path: "/api/homepage/total_sales/products",
      param: "nit",
      map: (data) => {
        if (!Array.isArray(data) || data.length === 0) return "No aplica.";
        const val = toNumberSafe(data[0].quantity);
        return `${formatNumber(val)}`;
      },
    },
    crecimiento: {
      path: "/api/homepage/growth_porcent",
      // arreglo => agregamos rangos de fecha y nit abajo
      param: [],
      map: (data) =>
        Array.isArray(data) && data.length > 0
          ? `${data[0].porcent}`
          : "No aplica.",
    },
  };
}

export async function fetchAllMetrics({
  nit,
  pastDateStart = undefined,
  pastDateEnd = undefined,
  currDateStart = undefined,
  currDateEnd = undefined,
  origin = window.location.origin,
}) {
  if (!nit) return initialMetrics;

  const CONFIG_METRICS = getConfigMetrics(nit);
  const keys = Object.keys(CONFIG_METRICS);

  const results = await Promise.all(
    keys.map(async (key) => {
      const { path, param, map } = CONFIG_METRICS[key];

      try {
        const url = new URL(path, origin);

        if (Array.isArray(param)) {
          // endpoints que aceptan ventana de fechas
          if (pastDateStart !== undefined) url.searchParams.set("pastDateStart", pastDateStart);
          if (pastDateEnd !== undefined)   url.searchParams.set("pastDateEnd",   pastDateEnd);
          if (currDateStart !== undefined) url.searchParams.set("currDateStart", currDateStart);
          if (currDateEnd !== undefined)   url.searchParams.set("currDateEnd",   currDateEnd);
          url.searchParams.set("nit", nit);
        } else if (typeof param === "string" && param) {
          // endpoints con un único parámetro
          url.searchParams.set(param, nit);
        }
        // si param es null/undefined (admin/visits), no añadimos nada

        const res = await fetch(url.toString(), { method: "GET" });

        if (!res.ok) {
          console.error(`[metrics] ${key}: HTTP ${res.status}`);
          return [key, "No aplica."];
        }

        // Todos los endpoints (incluido /visits) devuelven JSON
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

export function getGrowth(data) {
  const finallyGrowth = Number.parseFloat(((data[data.length - 1].value / data[0].value) - 1) * 100);
  return finallyGrowth.toFixed(2) + "%";
}
