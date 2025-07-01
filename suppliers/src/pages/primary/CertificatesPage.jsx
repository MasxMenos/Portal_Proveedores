import React, { useState } from "react";
import EntidadPage from "../../layouts/EntityPage";
import datosCertificados from "../../data/certificates";
import { useTheme } from "../../components/ThemeContext";

const CertificadosPage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Estado para el botón seleccionado
  const [selectedButton, setSelectedButton] = useState(null);

  return (
    <EntidadPage
      tipo="certificados"
      titulo="Certificados"
      encabezado="Certificados"
      datos={datosCertificados}
      onNavigateBase="certificados"
      extraContent={
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            "Retención I.C.A",
            "Retención en la fuente",
            "Retención IVA",
          ].map((label) => (
            <button
              key={label}
              onClick={() => setSelectedButton(label)}
              className={`px-4 py-2 rounded transition-colors duration-200 ${
                selectedButton === label
                  ? isDark
                    ? "bg-[#111416] text-white"
                    : "bg-gray-300 text-black"
                  : isDark
                  ? "bg-[#0A0D0F] hover:bg-[#111416] text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-black"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      }
    />
  );
};

export default CertificadosPage;
