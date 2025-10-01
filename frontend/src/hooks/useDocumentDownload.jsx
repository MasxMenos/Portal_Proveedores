// src/hooks/useDocumentDownload.jsx
import React from "react";
import { useCallback } from "react";
import { pdf } from "@react-pdf/renderer";
import { RccPdfDocument } from "../components/format/RccPdfDocument";
import { NacPdfDocument } from "../components/format/NacPdfDocument";
import { RetPdfDocument } from "../components/format/RetPdfDocument";
import { CetPdfDocument } from "../components/format/CetPdfDocument";





export function useDocumentDownload(tipo, onRowClick) {
  return useCallback(
    async (item) => {
      // 1) Pagos genéricos
      if (tipo === "payments") {
        if (typeof onRowClick === "function") onRowClick(item);
        return;
      }

      const generarPDF = async (tipo, csc, ComponentePDF, apiGroup, endpoint, co = null) => {
        try {
          let url = `/api/${apiGroup}/${endpoint}/?csc=${encodeURIComponent(csc)}`;
          if (co) {
            url += `&co=${encodeURIComponent(co)}`;
          }

          const res = await fetch(url);
          if (!res.ok) throw new Error();
          const data = await res.json();

          if (typeof data.Detalle === "string") {
            try {
              data.Detalle = JSON.parse(data.Detalle);
            } catch {
              data.Detalle = [];
            }
          }
          const blob = await pdf(<ComponentePDF data={data} />, { embedFonts: false }).toBlob();

          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `${tipo}_${after}.pdf`;
          document.body.appendChild(link);
          link.click();
          link.remove();
        } catch (err) {
          console.error(err);
          alert(`No se pudo generar el PDF ${tipo}`);
        }
      };


      // 2) Extraer código del documento
      const rawDoc = item.documento || "";
      const [before, after = ""] = rawDoc.split("-", 2);
      const lettersOnly = before.replace(/[^A-Za-z]/g, "");
      const merged = lettersOnly + after.replace(/-/g, "");
      const m = merged.match(/[A-Z]{3}\d+/i);
      
      if (!m) {
        alert("No pude extraer el código del documento");
        return;
      }
      const code = m[0].toUpperCase();

      // 3) Si es RCC, formatear y descargar PDF
      const tipoDocumento = lettersOnly.toUpperCase();

      if (tipoDocumento === "RCC") {
        await generarPDF("RCC", after, RccPdfDocument, "payments", "rcc-format");
        return;
      } 
      else if (tipoDocumento === "CET") {
        await generarPDF("CET", after, CetPdfDocument, "payments", "cet-format");
        return;
      } 
      else if (tipoDocumento === "NAC") {
        await generarPDF("NAC", after, NacPdfDocument, "invoices", "nac-format");
        return;
      } 

      else if (tipoDocumento === "DPA") {
        await generarPDF("DPA", after, RetPdfDocument, "returns", "dpa-format", item.co);
        return;
      } 
      else if (tipoDocumento === "DPC") {
        await generarPDF("DPC", after, RetPdfDocument, "returns", "dpc-format", item.co);
        return;
      } 


      // 4) Lógica genérica para otros tipos
      try {
        const res2 = await fetch(`/api/documentos/${code}/`);
        if (!res2.ok) throw new Error();
        const { url } = await res2.json();
        window.open(url, "_blank");
      } catch {
        alert("Documento no encontrado");
      }
    },
    [tipo, onRowClick]
  );
}
