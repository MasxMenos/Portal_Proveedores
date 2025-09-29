

export async function fetchTopProducts({ nit, fechaIni=null, fechaFin=null, origin = window.location.origin, path = "/api/homepage/top_products" }) {
  if (!nit) return [];
  const url = new URL(path, origin);
  url.searchParams.set("nit", nit);
  if (fechaIni && fechaFin){
    url.searchParams.set("fechaIni", fechaIni) 
    url.searchParams.set("fechaFin", fechaFin);
  } 
  console.log("Fetching top products from URL:", url.toString());
  const res = await fetch(url.toString(), {
    method: "GET",
  });

  if (!res.ok) {
    console.error(`[top-products] HTTP ${res.status}`);
    return res.status;
  }

  try {
    const data = await res.json();
    return data
  } catch (err) {
    console.error("[top-products] Error parseando JSON", err);
    return err;
  }
}
