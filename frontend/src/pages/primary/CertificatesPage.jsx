// src/pages/CertificadosPage.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import EntidadPage from "../../layouts/EntityPage";
import datosCertificados from "../../data/certificates";
import { useTheme } from "../../components/ThemeContext";

export default function CertificadosPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  // Estado para el botón seleccionado
  const [selectedButton, setSelectedButton] = useState(null);

  // Labels traducidos para los botones extra
  const extras = [
    t("entity.certificates.buttons.icaRetention"),
    t("entity.certificates.buttons.sourceRetention"),
    t("entity.certificates.buttons.vatRetention"),
  ];

  return (
    <EntidadPage
      tipo="certificates"
      titulo={t("sidebar.certificates")}
      encabezado={t("sidebar.certificates")}
      datos={datosCertificados}
      onNavigateBase="certificados"
      botonesExtra={extras}
      selectedButton={selectedButton}
      onSelectButton={setSelectedButton}
    />
  );
}
