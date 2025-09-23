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

// Primer texto no vacío entre varias claves
const firstText = (row, keys, fallback = "-") => {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && row[k] !== "") {
      return String(row[k]);
    }
  }
  return fallback;
};

// Primer numérico válido entre varias claves (soporta strings con separadores)
const firstNumeric = (row, keys) => {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && row[k] !== "") {
      const n = Number(String(row[k]).replace(/[^0-9.-]/g, ""));
      if (!Number.isNaN(n)) return n;
    }
  }
  return null;
};

const safe = (v, fallback = "-") =>
  v === null || v === undefined || v === "" ? fallback : v;

const BASE_FONT_SIZE = 8;

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: BASE_FONT_SIZE, lineHeight: 1.1, color: "#000" },

  // Header fijo
  headerWrapper: {
    marginBottom: 8,
  },
  spacerAfterHeader: {
    height: 2,
  },

  headTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  logoBox: { width: 110, height: 42, justifyContent: "center" },
  logo: { width: 110, height: 42 },

  headCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  headTitle: { fontSize: BASE_FONT_SIZE, textAlign: "center", fontWeight: "bold" },
  headLine: { fontSize: BASE_FONT_SIZE, textAlign: "center", marginTop: 1, fontWeight: "bold" },

  headRight: {
    width: 120,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  headRightText: { fontSize: BASE_FONT_SIZE },

  headThinRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  thinItem: { fontSize: BASE_FONT_SIZE },
  thinItemBold: { fontSize: BASE_FONT_SIZE, fontWeight: "bold" },

  // Box genérico
  box: {
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 6,
  },

  // 1×2 proveedor (con separador interno)
  table12Row: { flexDirection: "row" },
  table12ColLeft: {
    flex: 1,
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: "#000",
  },
  table12ColRight: { flex: 1, padding: 6 },

  labelLine: { fontSize: BASE_FONT_SIZE, marginBottom: 3 },
  label: { color: "#333", fontWeight: "bold" },
  value: { fontWeight: "normal" },

  // Detalle (borde exterior, head negro)
  detailBox: {
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 6,
  },
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
  td: {
    fontSize: BASE_FONT_SIZE,
    paddingVertical: 4,
    paddingHorizontal: 4,
    textAlign: "center",
  },

  // Anchos columnas del detalle NAC
  colCCosto: { width: "16%" },
  colDesc:   { width: "36%" },
  colTasa:   { width: "8%"  },
  colImp:    { width: "10%" },
  colDescV:  { width: "10%" },
  colUnd:    { width: "10%"  },
  colTotal:  { width: "10%" },

  // 1×2 resumen final (debajo del detalle) con separador interno
  boxSecond: {
    borderWidth: 1,
    borderColor: "#000",
    marginTop: 6,
  },
  secondRow: { flexDirection: "row" },
  secondColLeft: {
    flex: 1.2,
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: "#000",
  },
  secondColRight: { flex: 1, padding: 6 },

  notesTitle: { fontSize: BASE_FONT_SIZE, marginTop: 4, fontWeight: "bold" },
  notesText: { fontSize: BASE_FONT_SIZE, marginTop: 2 },
  totalLine: { fontSize: BASE_FONT_SIZE, marginBottom: 3 },
  strong: { fontWeight: "bold" },
});

export const NacPdfDocument = ({ data = {} }) => {
  // Encabezado (compañía)
  const cia     = safe(data.Header_Cia);
  const nitCia  = safe(data.Header_Nit_Cia);
  const dirCia  = safe(data.Header_Direccion_Cia);

  const fechaImp = safe(data.Header_Fecha_Impresion);
  const documento = safe(data.Header_Documento);
  const fechaDoc  = safe(data.Header_Fecha_Doc);
  const fechaVec  = safe(data.Header_Fecha_Vec);

  // Proveedor
  const razon   = safe(data.Header_Razon_Social);
  const nit     = safe(data.Header_Nit);
  const ciudad  = safe(data.Header_Ciudad);
  const correo  = safe(data.Header_Correo, "No Especificado");
  const tel     = safe(data.Header_Telefono, "No Especificado");

  // Footer / totales
  const vendedor         = safe(data.Footer_Vendedor);
  const baseRetencion    = typeof data.Footer_BaseRetencion    === "number" ? data.Footer_BaseRetencion    : 0;
  const valorRetencion   = typeof data.Footer_ValorRetencion   === "number" ? data.Footer_ValorRetencion   : 0;
  const observaciones    = safe(data.Footer_Observaciones, "Sin observaciones");
  const ventaTotal       = typeof data.Footer_VentaTotal       === "number" ? data.Footer_VentaTotal       : 0;
  const iva              = typeof data.Footer_Iva              === "number" ? data.Footer_Iva              : 0;
  const retencion        = typeof data.Footer_Retencion        === "number" ? data.Footer_Retencion        : 0;
  const netoPagar        = typeof data.Footer_NetoPagar        === "number" ? data.Footer_NetoPagar        : 0;

  // Detalle: puede venir como array o como string JSON; tolera claves Detail_*
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
              <Text>{documento}</Text>
            </Text>
            <Text style={styles.thinItem}>
              <Text style={styles.thinItemBold}>Fecha Doc: </Text>
              <Text>{fechaDoc}</Text>
            </Text>
            <Text style={styles.thinItem}>
              <Text style={styles.thinItemBold}>Fecha Venc: </Text>
              <Text>{fechaVec}</Text>
            </Text>
          </View>
        </View>

        {/* separador para que nada se meta bajo el header */}
        <View style={styles.spacerAfterHeader} />

        {/* 1x2 Proveedor */}
        <View style={styles.box}>
          <View style={styles.table12Row}>
            <View style={styles.table12ColLeft}>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>NIT: </Text>
                <Text style={styles.value}>{nit}</Text>
              </Text>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>Sres: </Text>
                <Text style={styles.value}>{razon}</Text>
              </Text>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>Ciudad: </Text>
                <Text style={styles.value}>{ciudad}</Text>
              </Text>
            </View>

            <View style={styles.table12ColRight}>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>Email: </Text>
                <Text style={styles.value}>{correo}</Text>
              </Text>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>Tels: </Text>
                <Text style={styles.value}>{tel}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* DETALLE de la NAC (ítems) */}
        <View style={styles.detailBox}>
          <View style={styles.detailHeadRow}>
            <Text style={[styles.th, styles.colCCosto]}>Centro Costo</Text>
            <Text style={[styles.th, styles.colDesc]}>Descripción</Text>
            <Text style={[styles.th, styles.colTasa]}>Tasa</Text>
            <Text style={[styles.th, styles.colImp]}>Impuesto</Text>
            <Text style={[styles.th, styles.colDescV]}>Descuento</Text>
            <Text style={[styles.th, styles.colUnd]}>Valor Und</Text>
            <Text style={[styles.th, styles.colTotal]}>Valor Total</Text>
          </View>

          {detalle.map((row, i) => {
            const ccosto = firstText(row, ["Detail_Centro_Costo", "CentroCosto"]);
            const desc   = firstText(row, ["Detail_Descripcion_Articulo", "DescripcionArticulo"]);
            const tasa   = firstNumeric(row, ["Detail_Tasa", "Tasa"]);
            const imp    = firstNumeric(row, ["Detail_ValorImpuesto", "ValorImpuesto"]);
            const descv  = firstNumeric(row, ["Detail_ValorDescuento", "ValorDescuento"]);
            const vund   = firstNumeric(row, ["Detail_ValorUnd", "ValorUnd"]);
            const vtot   = firstNumeric(row, ["Detail_ValorTotal", "ValorTotal"]);

            return (
              <View style={styles.tr} key={i}>
                <Text style={[styles.td, styles.colCCosto]}>{ccosto}</Text>
                <Text style={[styles.td, styles.colDesc]}>{desc}</Text>
                <Text style={[styles.td, styles.colTasa]}>{tasa === null ? "-" : fmtMoney(tasa)}</Text>
                <Text style={[styles.td, styles.colImp]}>{imp === null ? "-" : fmtMoney(imp)}</Text>
                <Text style={[styles.td, styles.colDescV]}>{descv === null ? "-" : fmtMoney(descv)}</Text>
                <Text style={[styles.td, styles.colUnd]}>{vund === null ? "-" : fmtMoney(vund)}</Text>
                <Text style={[styles.td, styles.colTotal]}>{vtot === null ? "-" : fmtMoney(vtot)}</Text>
              </View>
            );
          })}
        </View>


        {/* 1x2 Proveedor */}
        <View style={styles.box}>
          <View style={styles.table12Row}>
            <View style={styles.table12ColLeft}>
                <Text style={styles.totalLine}>
                <Text style={styles.strong}>Base de Retención en la fuente: </Text>
                {fmtMoney(baseRetencion)}
              </Text>
              </View>

            <View style={styles.table12ColRight}>
              <Text style={styles.totalLine}>
                <Text style={styles.strong}>Valor de Retención en la fuente: </Text>
                {fmtMoney(valorRetencion)}
              </Text>
            </View>
          </View>
        </View>


        {/* Resumen final 1×2 */}
        <View style={styles.boxSecond}>
          <View style={styles.secondRow}>
            <View style={styles.secondColLeft}>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>Vendedor: </Text>
                <Text style={styles.value}>{vendedor}</Text>
              </Text>
              <Text style={styles.notesTitle}>Observaciones:</Text>
              <Text style={styles.notesText}>{observaciones}</Text>
            </View>

            <View style={styles.secondColRight}>
              <Text style={styles.totalLine}>
                <Text style={styles.strong}>Venta Total: </Text>
                {fmtMoney(ventaTotal)}
              </Text>
              <Text style={styles.totalLine}>
                <Text style={styles.strong}>IVA: </Text>
                {fmtMoney(iva)}
              </Text>
              <Text style={styles.totalLine}>
                <Text style={styles.strong}>Retención: </Text>
                {fmtMoney(retencion)}
              </Text>
              <Text style={styles.totalLine}>
                <Text style={styles.strong}>Neto a Pagar: </Text>
                {fmtMoney(netoPagar)}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
