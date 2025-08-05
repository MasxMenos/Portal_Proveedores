// src/components/detail/EntityMaster.jsx
import React, { forwardRef } from "react";
import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDocumentDownload } from "../../hooks/useDocumentDownload";

const EntityMaster = forwardRef(({ isDark, master, tipo }, ref) => {
  const { t } = useTranslation();

  // Obtenemos dinámicamente los headers y fields según el tipo de entidad
  const headers = t(`entity.table.${tipo}.headers`, { returnObjects: true });
  const fields  = t(`entity.table.${tipo}.fields`,  { returnObjects: true });

  // Índice del campo primario (documento) es 1
  const primaryIndex = 1;
  const docField  = fields[primaryIndex];
  const docHeader = headers[primaryIndex];

  // Campos restantes, excluyendo el índice primario
  const restFields  = fields.filter((_f, idx) => idx !== primaryIndex);
  const restHeaders = headers.filter((_h, idx) => idx !== primaryIndex);
  let onRowClick =null
  const handleDownload = useDocumentDownload(tipo=null, onRowClick=null);

  return (
    <div
      ref={ref}
      className={`master absolute top-1/5 left-2 md:left-8 transform -translate-y-1/2 p-6 rounded-lg z-5 w-[90vw] max-w-[300px] ${
        isDark
          ? "bg-[#111] text-white"
          : "bg-white text-black border border-gray-300"
      }`}
    >
      {/* Encabezado con etiqueta para el documento */}
      <div className="flex justify-between items-center mb-4">
        <span className="font-medium">{docHeader}</span>
        <Download size={20} onClick={() =>
            // Aquí llamas directo al hook:
            handleDownload({ documento: master[docField] })
                }
                className="text-gray-400 cursor-pointer" />
      </div>

      {/* Valor del documento en grande */}
      <div className="text-xl font-bold mb-4">
        {master[docField]}
      </div>

      {/* Resto de campos en orden original, saltando el primario */}
      <div className="space-y-1 text-sm">
        {restFields.map((fieldKey, idx) => (
          <div key={fieldKey} className="flex justify-between">
            <span className="text-gray-400">{restHeaders[idx]}</span>
            <span>{master[fieldKey]}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default EntityMaster;
