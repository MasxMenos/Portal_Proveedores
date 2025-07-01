// src/pages/FacturasPage.jsx
import React from "react";
import EntidadPage from "../../layouts/EntityPage";
import datosFacturas from "../../data/invoices";
const FacturasPage = () => {

  return (
    <EntidadPage
      tipo="facturas"
      titulo="Facturas"
      encabezado="Facturas"
      datos={datosFacturas}
      onNavigateBase="facturas"
    />
  );
};

export default FacturasPage;
