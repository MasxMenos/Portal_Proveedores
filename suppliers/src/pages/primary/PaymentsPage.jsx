// src/pages/FacturasPage.jsx
import React from "react";
import EntidadPage from "../../layouts/EntityPage";
import datosPagos from "../../data/payments";
const PagosPage = () => {

  return (
    <EntidadPage
      tipo="pagos"
      titulo="Pagos"
      encabezado="Pagos"
      datos={datosPagos}
      onNavigateBase="pagos"
    />
  );
};

export default PagosPage;