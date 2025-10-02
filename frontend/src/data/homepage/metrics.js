const formatCurrency = (n) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(Math.trunc(n));

const formatNumber = (n) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(Math.trunc(n));

export const initialMetrics = {
  servicio: "Cargando...",
  ventas: "Cargando...",
  productos: "Cargando...",
  crecimiento: "Cargando..."
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
  crecimiento: {
    path: "/api/homepage/growth_porcent",
    param: [],
    map: (data) =>
      Array.isArray(data) && data.length > 0
        ? `${data[0].porcent}`
        : "No aplica.",
  }
};

export async function fetchAllMetrics({ nit,pastDateStart=undefined,pastDateEnd=undefined,currDateStart=undefined,currDateEnd=undefined, origin = window.location.origin }) {
  if (!nit) return initialMetrics;

  const keys = Object.keys(CONFIG_METRICS);

  const results = await Promise.all(
    keys.map(async (key) => {
      const { path, param, map } = CONFIG_METRICS[key];

      try {
        const url = new URL(path, origin);
        if (param instanceof Array){
          url.searchParams.set('pastDateStart', pastDateStart);
          url.searchParams.set('pastDateEnd', pastDateEnd);
          url.searchParams.set('currDateStart', currDateStart);
          url.searchParams.set('currDateEnd', currDateEnd);
          url.searchParams.set('nit', nit);
        }else{

          url.searchParams.set(param, nit);
        }

        const res = await fetch(url.toString(), {
          method: "GET",
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


export function getGrowth(data) {
    
    let finallyGrowth =  Number.parseFloat(((data[data.length-1].value/data[0].value)-1)*100) ;
    return finallyGrowth.toFixed(2) + '%';
}