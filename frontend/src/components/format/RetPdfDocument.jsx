import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

import mylogo from "../../static/Logo.png";

// Helpers
const fmtMoney = (n) =>
  typeof n === "number"
    ? n.toLocaleString("es-CO", { minimumFractionDigits: 2 })
    : "-";

const safe = (v, fallback = "-") =>
  v === null || v === undefined || v === "" ? fallback : v;

// Si una propiedad puede venir con nombre alterno, toma la primera disponible
const pick = (obj, keys, fallback = "-") => {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
  }
  return fallback;
};

const toNum = (v, d = 0) => {
  if (v === null || v === undefined || v === "") return d;
  const n = Number(String(v).replace(/[^0-9.-]/g, ""));
  return Number.isNaN(n) ? d : n;
};

const BASE_FONT_SIZE = 8;

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: BASE_FONT_SIZE, lineHeight: 1.1, color: "#000" },

  // Header fijo
  headerWrapper: { marginBottom: 8 },
  spacerAfterHeader: { height: 2 },

  headTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  logoBox: { width: 110, height: 42, justifyContent: "center" },
  logo: { width: 110, height: 42, objectFit: "contain" },

  headCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  headTitle: { fontSize: BASE_FONT_SIZE, textAlign: "center", fontWeight: "bold" },
  headLine: { fontSize: BASE_FONT_SIZE, textAlign: "center", marginTop: 1, fontWeight: "bold" },

  headRight: { width: 120, alignItems: "flex-end", justifyContent: "center" },
  headRightText: { fontSize: BASE_FONT_SIZE },

  headThinRow: { flexDirection: "row", justifyContent: "space-between" },
  thinItem: { fontSize: BASE_FONT_SIZE },
  thinItemBold: { fontSize: BASE_FONT_SIZE, fontWeight: "bold" },

  // Box genérico
  box: { borderWidth: 1, borderColor: "#000", marginBottom: 6 },

  // 1×2 con separador interno
  row12: { flexDirection: "row" },
  colLeft: { flex: 1, padding: 6, borderRightWidth: 1, borderRightColor: "#000" },
  colRight: { flex: 1, padding: 6 },

  labelLine: { fontSize: BASE_FONT_SIZE, marginBottom: 3 },
  label: { color: "#333", fontWeight: "bold" },
  value: { fontWeight: "normal" },

  // Detalle (borde exterior, head negro)
  detailBox: { borderWidth: 1, borderColor: "#000", marginBottom: 6 },
  detailHeadRow: { flexDirection: "row", backgroundColor: "#000" },
  th: {
    color: "#fff",
    fontSize: BASE_FONT_SIZE,
    textAlign: "center",
    fontWeight: "bold",
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tr: { flexDirection: "row" },
  td: { fontSize: BASE_FONT_SIZE, 
    paddingVertical: 4,
    paddingHorizontal: 4,
    textAlign: "center" },

    tdLeft: { textAlign: "left" },
    tdRight: { textAlign: "right" },

  // Anchos columnas del detalle DPC
    // Anchos columnas detalle (suman 100%)
    colCod:   { width: "12%" },  // Código
    colDesc:  { width: "18%" },  // Descripción
    colRec:   { width: "8%"  },  // Recibido
    colPCos:  { width: "8%"  },  // P. Costo
    colD1:    { width: "4%"  },  // D1
    colD2:    { width: "4%"  },  // D2
    colIVA:   { width: "5%"  },  // IVA %
    colIBUA:  { width: "6%"  },  // IBUA
    colICUI:  { width: "6%"  },  // ICUI
    colIPOL:  { width: "6%"  },  // IPOLIC
    colSubT:  { width: "11%" },  // Subtotal
    colObs:   { width: "12%"  },  // Observaciones
   

  // Resumen final 1×2 con separador interno
  boxSecond: { borderWidth: 1, borderColor: "#000", marginTop: 6 },
  secondRow: { flexDirection: "row" },
  secondColLeft: { flex: 1.2, padding: 6, borderRightWidth: 1, borderRightColor: "#000" },
  secondColRight:{ flex: 1, padding: 6 },
  totalLine: { fontSize: BASE_FONT_SIZE, marginBottom: 3 },
  strong: { fontWeight: "bold" },
});

export const RetPdfDocument = ({ data = {} }) => {
  // Encabezado de compañía
  const cia    = safe(data.Header_Cia);
  const nitCia = safe(data.Header_Nit_Cia);
  const dirCia = safe(data.Header_Direccion_Cia);

  // Cabecera del documento (nombres según tu JSON de ejemplo)
  const fechaImp    = safe(data.Header_Date);                 // "2025-09-19 09:40:22"
  const nroDoc      = safe(data.Header_NroDocumento);         // "DPC-1000"
  const fechaDoc    = safe(data.Header_FechaDoc);             // "2025-01-27"
  const fechaEnt    = safe(data.Header_Fecha_Entrega);        // "2025-01-27"

  // Proveedor / PDV
  const provNombre  = safe(data.Header_Proveedor);
  const provNit     = safe(data.Header_Proveedor_Nit);
  const provDir     = safe(data.Header_Proveedor_Dir);
  const provTel     = safe(data.Header_Proveedor_Tel, "No especificado");
  const provCiudad  = safe(data.Header_Proveedor_Ciud);

  const pdvNombre   = safe(data.Header_Nombre_PDV);
  const pdvCod      = safe(data.Header_Cod_PDV);
  const pdvDir      = safe(data.Header_PDV_Dir);
  const pdvTel      = safe(data.Header_PDV_tel, "No especificado");
  const pdvCiudad   = safe(data.Header_PDV_Ciud);

  // Totales / footer
  const dsctoG1       = toNum(data.FooterDsctoGlobla1);
  const dsctoG2       = toNum(data.FooterDsctoGlobal2);
  const vlrComercial  = toNum(data.FooterVlrComercial);
  const dsctoCom      = toNum(data.FooterDsctoComercial);
  const totalImp      = toNum(data.FooterTotalImp);
  const totalNeto     = toNum(data.FooterTotalNeto);

  // Detalle: array o string JSON
  const detalle = Array.isArray(data.Detalle)
    ? data.Detalle
    : (typeof data.Detalle === "string" ? JSON.parse(data.Detalle || "[]") : []);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* HEADER (Fijo) */}
        <View style={styles.headerWrapper} fixed>
          <View style={styles.headTopRow}>
            <View style={styles.logoBox}>
              <Image src={mylogo} style={styles.logo} />
            </View>

            <View style={styles.headCenter}>
              <Text style={styles.headTitle}>{cia}</Text>
              <Text style={styles.headLine}>{nitCia}</Text>
              <Text style={styles.headLine}>{dirCia}</Text>
            </View>

            <View style={styles.headRight}>
              <Text
                style={styles.headRightText}
                render={({ pageNumber, totalPages }) =>
                  `Pág: ${pageNumber} de: ${totalPages}`
                }
              />
            </View>
          </View>

          <View style={styles.headThinRow}>
            <Text style={styles.thinItem}>{fechaImp}</Text>
            <Text style={styles.thinItem}>
              <Text style={styles.thinItemBold}>Doc: </Text>
              <Text>{nroDoc}</Text>
            </Text>
            <Text style={styles.thinItem}>
              <Text style={styles.thinItemBold}>Fecha Doc: </Text>
              <Text>{fechaDoc}</Text>
            </Text>
            <Text style={styles.thinItem}>
              <Text style={styles.thinItemBold}>Fecha Entrega: </Text>
              <Text>{fechaEnt}</Text>
            </Text>
          </View>
        </View>

        {/* Evita que el contenido choque con el header fijo */}
        <View style={styles.spacerAfterHeader} />

        {/* 1×2: Proveedor (izq) / PDV (der) */}
        <View style={styles.box}>
          <View style={styles.row12}>
            <View style={styles.colLeft}>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>Proveedor: </Text>
                <Text style={styles.value}>{provNombre}</Text>
              </Text>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>NIT: </Text>
                <Text style={styles.value}>{provNit}</Text>
              </Text>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>Dir: </Text>
                <Text style={styles.value}>{provDir}</Text>
              </Text>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>Tel: </Text>
                <Text style={styles.value}>{provTel}</Text>
              </Text>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>Ciudad: </Text>
                <Text style={styles.value}>{provCiudad}</Text>
              </Text>
            </View>

            <View style={styles.colRight}>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>PDV: </Text>
                <Text style={styles.value}>{pdvNombre} (Cod. {pdvCod})</Text>
              </Text>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>Dir PDV: </Text>
                <Text style={styles.value}>{pdvDir}</Text>
              </Text>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>Tel PDV: </Text>
                <Text style={styles.value}>{pdvTel}</Text>
              </Text>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>Ciudad PDV: </Text>
                <Text style={styles.value}>{pdvCiudad}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* DETALLE */}
        <View style={styles.detailBox}>
          <View style={styles.detailHeadRow}>
            <Text style={[styles.th, styles.colCod]}>Código</Text>
            <Text style={[styles.th, styles.colDesc]}>Descripción</Text>
            <Text style={[styles.th, styles.colRec]}>Recibido</Text>
            <Text style={[styles.th, styles.colPCos]}>P. Costo</Text>
            <Text style={[styles.th, styles.colD1]}>D1</Text>
            <Text style={[styles.th, styles.colD2]}>D2</Text>
            <Text style={[styles.th, styles.colIVA]}>IVA</Text>
            <Text style={[styles.th, styles.colIBUA]}>IBUA</Text>
            <Text style={[styles.th, styles.colICUI]}>ICUI</Text>
            <Text style={[styles.th, styles.colIPOL]}>IPOLIC</Text>
            <Text style={[styles.th, styles.colSubT]}>Subtotal</Text>
            <Text style={[styles.th, styles.colObs]}>Observaciones</Text>
          </View>


      {detalle.map((row, i) => {
        const cod   = safe(pick(row, ["Codigo"]));
        const desc  = safe(pick(row, ["Descripcion"]));
        const rec   = toNum(pick(row, ["Recibido"]), null);
        const pc    = toNum(pick(row, ["PCosto"]), null);
        const d1    = toNum(pick(row, ["D1"]), null);
        const d2    = toNum(pick(row, ["D2"]), null);
        const iva   = toNum(pick(row, ["Iva"]), null);
        const ibua  = toNum(pick(row, ["Ibua"]), null);
        const icui  = toNum(pick(row, ["Icui"]), null);
        const ipol  = toNum(pick(row, ["Ipolic"]), null);
        const subT  = toNum(pick(row, ["SubTotal"]), null);
        const obs   = safe(pick(row, ["Observaciones"]), "Sin notas");

        return (
          <View style={styles.tr} key={i}>
            <Text style={[styles.td, styles.colCod]}>{cod}</Text>
            <Text style={[styles.td, styles.colDesc, styles.tdLeft]}>{desc}</Text>
            <Text style={[styles.td, styles.colRec]}>{rec === null ? "-" : rec}</Text>
            <Text style={[styles.td, styles.colPCos]}>{pc === null ? "-" : fmtMoney(pc)}</Text>
            <Text style={[styles.td, styles.colD1]}>{d1 === null ? "-" : d1}</Text>
            <Text style={[styles.td, styles.colD2]}>{d2 === null ? "-" : d2}</Text>
            <Text style={[styles.td, styles.colIVA]}>{iva === null ? "-" : iva}</Text>

            <Text style={[styles.td, styles.colIBUA]}>{ibua === null ? "-" : fmtMoney(ibua)}</Text>
            <Text style={[styles.td, styles.colICUI]}>{icui === null ? "-" : fmtMoney(icui)}</Text>
            <Text style={[styles.td, styles.colIPOL]}>{ipol === null ? "-" : fmtMoney(ipol)}</Text>

            <Text style={[styles.td, styles.colSubT]}>{subT === null ? "-" : fmtMoney(subT)}</Text>
            <Text style={[styles.td, styles.colObs, styles.tdLeft]}>{obs}</Text>
          </View>
        );
      })}
        </View>

        {/* RESUMEN FINAL 1×2 */}
        <View style={styles.boxSecond}>
          <View style={styles.secondRow}>
            <View style={styles.secondColLeft}>
              <Text style={styles.totalLine}>
                <Text style={styles.strong}>Descuento Global 1: </Text>
                {fmtMoney(dsctoG1)}
              </Text>
              <Text style={styles.totalLine}>
                <Text style={styles.strong}>Descuento Global 2: </Text>
                {fmtMoney(dsctoG2)}
              </Text>
              <Text style={styles.totalLine}>
                <Text style={styles.strong}>Descuento Comercial: </Text>
                {fmtMoney(dsctoCom)}
              </Text>
            </View>

            <View style={styles.secondColRight}>
              <Text style={styles.totalLine}>
                <Text style={styles.strong}>Valor Comercial: </Text>
                {fmtMoney(vlrComercial)}
              </Text>
              <Text style={styles.totalLine}>
                <Text style={styles.strong}>Total Impuestos: </Text>
                {fmtMoney(totalImp)}
              </Text>
              <Text style={styles.totalLine}>
                <Text style={styles.strong}>Total Neto: </Text>
                {fmtMoney(totalNeto)}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
