// src/components/detail/EntityMaster.jsx
import React, { forwardRef } from "react";
import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDocumentDownload } from "../../hooks/useDocumentDownload";

const EntityMaster = forwardRef(({ isDark, master, tipo }, ref) => {
  const { t } = useTranslation();

  const headers = t(`entity.table.${tipo}.headers`, { returnObjects: true });
  const fields  = t(`entity.table.${tipo}.fields`,  { returnObjects: true });

  const primaryIndex   = 1; // documento
  const secondaryIndex = 2; // CO
  const docField  = fields[primaryIndex];
  const docHeader = headers[primaryIndex];
  const coField   = fields[secondaryIndex];

  const restFields  = fields.filter((_f, idx) => idx !== primaryIndex);
  const restHeaders = headers.filter((_h, idx) => idx !== primaryIndex);

  const handleDownload = useDocumentDownload(null, null);

  // El master se alinea con el mismo offset que las hijas. NO dibuja líneas aquí.
  const wrapperStyle = {
    marginLeft: "--card-offset calc(var(--rail-x, 48px) + var(--connector, 28px) + 8px)",
    maxWidth: "280px",
  };

  return (
    <div ref={ref} className="relative" style={wrapperStyle}>
      <div
        className={`rounded-lg border shadow-sm p-7  ${
          isDark ? "bg-[#111] border-[#2a2a2a] text-white" : "bg-white border-gray-300 text-black"
        }`}
      >
        {/* Encabezado con etiqueta para el documento */}
        <div className="mb-4 flex items-center justify-between">
          <span className="font-medium">{docHeader}</span>
          <Download
            size={20}
            onClick={() =>
              handleDownload({ documento: master[docField], co: master[coField] })
            }
            className="text-gray-400 cursor-pointer"
          />
        </div>

        {/* Valor del documento en grande */}
        <div className="text-xl font-bold mb-4">{master[docField]}</div>

        {/* Resto de campos */}
        <div className="space-y-1 text-sm">
          {restFields.map((fieldKey, idx) => (
            <div key={fieldKey} className="flex justify-between">
              <span className="text-gray-400">{restHeaders[idx]}</span>
              <span>{master[fieldKey]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default EntityMaster;
