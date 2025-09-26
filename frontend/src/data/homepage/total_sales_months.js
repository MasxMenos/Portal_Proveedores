
const formatNumber = (n) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(Math.trunc(n));

const parseYYYYMM = (yyyymm) => {
  const year = Number(yyyymm.slice(0, 4));
  const monthIndex = Number(yyyymm.slice(4, 6));
  return new Date(Date.UTC(year, monthIndex, 1)); // UTC para evitar desfases
};

export const formatMonthLabel = (date, { withYear = false } = {}) => {
  const month = new Intl.DateTimeFormat("es-CO", { month: "short" }).format(date);
  const clean = (month.charAt(0).toUpperCase() + month.slice(1)).replace(/\.$/, "");
  return withYear ? `${clean} ${date.getUTCFullYear()}` : clean; // ← aquí se omite el año
};

export function mapSalesSeries(apiData, { withYear = false } = {}) {
  if (!Array.isArray(apiData)) return [];

  const bucket = new Map();
  for (const row of apiData) {
    if (!row?.month) continue;
    const key = String(row.month);
    const val = Number(row.value ?? 0);
    bucket.set(key, (bucket.get(key) ?? 0) + (isFinite(val) ? val : 0));
  }

  const entries = [...bucket.entries()]
    .map(([yyyymm, total]) => {
      const date = parseYYYYMM(yyyymm);
      return { yyyymm, date, value: total };
    })
    .sort((a, b) => a.date - b.date);
  const data_final = entries.map(({ date, value }) => ({
    month: formatMonthLabel(date, { withYear }),
    value,
  }))
  return data_final;
}

export async function fetchTotalSalesSeries({ nit, origin = window.location.origin, path = "/api/homepage/total_sales/months" }) {
  if (!nit) return [];

  const url = new URL(path, origin);
  url.searchParams.set("nitProveedor", nit);

  const res = await fetch(url.toString(), {
    method: "GET",
  });

  if (!res.ok) {
    console.error(`[sales-months] HTTP ${res.status}`);
    return [];
  }

  try {
    const data = await res.json();
    return mapSalesSeries(data, { withYear: false }); 
  } catch (err) {
    console.error("[sales-months] Error parseando JSON", err);
    return [];
  }
}
