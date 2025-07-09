// src/pages/FacturasPage.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import EntidadPage from "../../layouts/EntityPage";
import datosFacturas from "../../data/invoices";

export default function FacturasPage() {
  const { t } = useTranslation();

  return (
    <EntidadPage
      tipo="facturas"
      titulo={t("sidebar.invoices")}
      encabezado={t("sidebar.invoices")}
      datos={datosFacturas}
      onNavigateBase="facturas"
      botonesExtra={[
        t("entity.invoices.buttons.electronicInvoices"),
        t("entity.invoices.buttons.commercialAgreementNotes"),
        t("entity.invoices.buttons.electronicCreditNotes"),
      ]}
    />
  );
}
