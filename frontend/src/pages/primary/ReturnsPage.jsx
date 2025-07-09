// src/pages/DevolucionesPage.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import EntidadPage from "../../layouts/EntityPage";
import datosDevoluciones from "../../data/returns";
import { useTheme } from "../../components/ThemeContext";

export default function DevolucionesPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [selectedButton, setSelectedButton] = useState(null);

  const extras = [
    t("entity.returns.buttons.damageReturn"),
    t("entity.returns.buttons.purchaseReturn"),
  ];

  return (
    <EntidadPage
      tipo="devoluciones"
      titulo={t("sidebar.returns")}
      encabezado={t("sidebar.returns")}
      datos={datosDevoluciones}
      onNavigateBase="devoluciones"
      botonesExtra={extras}
      selectedButton={selectedButton}
      onSelectButton={setSelectedButton}
    />
  );
}
