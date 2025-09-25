// src/components/entidad/EntidadDownloadButton.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function EntidadDownloadButton({
  isDark,
  tipo,
  data = [],          // array completo de registros
}) {
  const { t } = useTranslation();

  const handleDownload = async () => {
    // 1) headers traducidos y keys
    const headers = t(`entity.table.${tipo}.headers`, { returnObjects: true });
    const fields  = t(`entity.table.${tipo}.fields`,  { returnObjects: true });

    // 2) crea workbook + worksheet
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(tipo);

    // 3) añade fila de encabezados
    ws.addRow(headers);

    // 4) añade cada registro (sin la columna de acción)
    data.forEach(item => {
      const row = fields.map(key => item[key]);
      ws.addRow(row);
    });

    // 5) auto-ajusta anchos (opcional)
    ws.columns.forEach((col, i) => {
      let max = 10;
      col.eachCell(cell => {
        const len = cell.value ? cell.value.toString().length : 0;
        if (len > max) max = len;
      });
      col.width = Math.min(max + 2, 50);
    });

    // 6) genera buffer y dispara descarga
    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${tipo}-export.xlsx`);
  };

  return (
    <button
      className="hover:underline text-sm"
      style={{ color: isDark ? "#FFF" : "#0d6efd" }}
      onClick={handleDownload}
    >
      {t("entity.downloadXLSX")}
    </button>
  );
}
