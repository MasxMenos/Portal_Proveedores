// src/pages/PagosPage.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import EntidadPage from "../../layouts/EntityPage";
import datosPagos from "../../data/payments";
import { useTheme } from "../../components/ThemeContext";

export default function PagosPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [selectedButton, setSelectedButton] = useState(null);

  const extras = [
    t("entity.payments.buttons.egressTransferCertificate"),
    t("entity.payments.buttons.receivablesReclassification"),
  ];

  return (
    <EntidadPage
      tipo="pagos"
      titulo={t("sidebar.payments")}
      encabezado={t("sidebar.payments")}
      datos={datosPagos}
      onNavigateBase="pagos"
      botonesExtra={extras}
      selectedButton={selectedButton}
      onSelectButton={setSelectedButton}
    />
  );
}
