// src/pages/FacturasPage.jsx
import React from "react";
import EntidadPage from "../../layouts/EntityPage";
import datosDevoluciones from "../../data/returns";
const DevolucionesPage = () => {

  return (
    <EntidadPage
      tipo="devoluciones"
      titulo="Devoluciones"
      encabezado="Devoluciones"
      datos={datosDevoluciones}
      onNavigateBase="devoluciones"
    />
  );
};

export default DevolucionesPage;