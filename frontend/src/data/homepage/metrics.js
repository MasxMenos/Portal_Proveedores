const formatCurrency = (n) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(Math.trunc(n));

const formatNumber = (n) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(Math.trunc(n));

export const initialMetrics = {
  servicio: "Cargando...",
  ventas: "Cargando...",
  productos: "Cargando...",
  crecimiento: "Cargando...",
};

const CONFIG_METRICS = {
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
    path: "/api/homepage/total_sales/products",
    param: "nit",
    map: (data) =>
      Array.isArray(data) && data.length > 0
        ? `${formatNumber(data[0].quantity)}`
        : "No aplica.",
  },
  // crecimiento: {
  //   path: "/api/homepage/total_sales_products",
  //   param: "nit",
  //   map: (data) =>
  //     Array.isArray(data) && data.length > 0
  //       ? `${formatNumber(data[0].quantity)}`
  //       : "No aplica.",
  // },
};

export async function fetchAllMetrics({ nit, token, origin = window.location.origin }) {
  if (!nit) return initialMetrics;

  const keys = Object.keys(CONFIG_METRICS);

  const results = await Promise.all(
    keys.map(async (key) => {
      const { path, param, map } = CONFIG_METRICS[key];

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