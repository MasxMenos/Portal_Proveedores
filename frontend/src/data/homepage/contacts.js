const data_contact_category = {
    'GENERAL' : {
        'name': 'Francisco Minorta'
        ,'email': 'francisco.minorta@mxm.com.co'
        ,'note': 'Temas de compras generales o coordinación con proveedores.'
    },
    'SISTEMAS' : {
        'name': 'Sistemas'
        ,'email': 'auxiliar.sistemas3@mxm.com.co'
        ,'note': 'Soporte de sistemas.'
    },
    'ASEO' : {
        'name': 'Frank Uribe'
        ,'email': 'frank.uribe@mxm.com.co'
        ,'note': 'Festión de pedidos en la línea de compra de ASEO.'
    }
    ,'LICORES Y HOGAR'  : {
        'name': 'Reynel Forero'
        ,'email': 'david.forero@mxm.com.co'
        ,'note': 'Festión de pedidos en la línea de compra de LICORES Y HOGAR.'
    }
    ,'COMPRAS DIARIAS'  : {
        'name': 'Camilo Rangel'
        ,'email': 'camilo.rangel@mxm.com.co'
        ,'note': 'Festión de pedidos en la línea de COMPRAS DIARIAS.'
    }
}

export async function fetchCategorySupplier({ nit, origin = window.location.origin, path = "/api/homepage/category_supplier" }) {
  if (!nit) return [];
  const url = new URL(path, origin);
  url.searchParams.set("nit", nit);
  const res = await fetch(url.toString(), {
    method: "GET",
  });

  if (!res.ok) {
    console.error(`[category-supplier] HTTP ${res.status}`);
    return res.status;
  }
  let data_return = [data_contact_category['GENERAL']]
  try {
    const data = await res.json();
    if (data_contact_category[data[0].lineaCompra]){
        data_return.push(data_contact_category[data[0].lineaCompra])
    }
    return data_return
  } catch (err) {
    console.error("[category-supplier] Error parseando JSON", err);
    return err;
  }
}
