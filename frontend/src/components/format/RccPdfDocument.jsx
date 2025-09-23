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

// Devuelve el primer texto no vacío entre varias claves
const firstText = (row, keys, fallback = "-") => {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && row[k] !== "") {
      return String(row[k]);
    }
  }
  return fallback;
};

// Devuelve el primer valor numérico válido entre varias claves
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

  // Wrapper del header (FIJO)
  headerWrapper: {
    // todo el bloque de header (logo + títulos + fila fina)
    marginBottom: 8,
  },

  // Spacer para que el contenido no se meta debajo del header fijo
  spacerAfterHeader: {
    height: 2,
  },

  // Header (contenido)
  headTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  // Logo al doble
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

  // Tabla 1×2 (proveedor) — con separador interno
  table12Row: {
    flexDirection: "row",
  },
  table12ColLeft: {
    flex: 1,
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: "#000",
  },
  table12ColRight: {
    flex: 1,
    padding: 6,
  },
  labelLine: { fontSize: BASE_FONT_SIZE, marginBottom: 3 },
  label: { color: "#333", fontWeight: "bold" },
  value: { fontWeight: "normal" },

  // Detalle (solo borde externo)
  detailBox: {
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 6,
  },
  detailHeadRow: {
    flexDirection: "row",
    backgroundColor: "#000",
  },
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

  // Anchos columnas detalle
  colAux: { width: "14%" },
  colRazon: { width: "26%" },
  colCO: { width: "8%" },
  colTer: { width: "14%" },
  colDoc: { width: "18%" },
  colDb: { width: "10%" },
  colCr: { width: "10%" },

  // Segunda tabla 1×2 (debajo del detalle), una sola caja con separador interno
  boxSecond: {
    borderWidth: 1,
    borderColor: "#000",
    marginTop: 6,
  },
  secondRow: {
    flexDirection: "row",
  },
  secondColLeft: {
    flex: 1.4,
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: "#000",
  },
  secondColRight: {
    flex: 1,
    padding: 6,
  },
  notesTitle: { fontSize: BASE_FONT_SIZE, marginTop: 4, fontWeight: "bold" },
  notesText: { fontSize: BASE_FONT_SIZE, marginTop: 2 },
  totalLine: { fontSize: BASE_FONT_SIZE, marginBottom: 3 },
  strong: { fontWeight: "bold" },
});

export const RccPdfDocument = ({ data = {} }) => {
  // Generales
  const cia = safe(data.Header_Cia);
  const nitCia = safe(data.Header_Nit_Cia);
  const dirCia = safe(data.Header_Direccion_Cia);

  const nro = safe(data.Header_Nro);
  const fechaImp = safe(data.Header_Fecha_Impresion);
  const fechaDoc = safe(data.Header_Fecha_Doc);

  const razon = safe(data.Header_Razon_Social);
  const nitProv = safe(data.Header_Nit_Proveedor || data.Header_Nit);
  const ciudad = safe(data.Header_Ciudad);
  const dirProv = safe(data.Header_Dir);
  const correo = safe(data.Header_Correo, "No Especificado");
  const tel = safe(data.Header_Telefono, "No Especificado");

  const notas = safe(data.Footer_Notas, "Sin Notas");
  const totalDb =
    typeof data.Footer_Total_Db === "number"
      ? data.Footer_Total_Db
      : (data.Footer_VentaTotal ?? 0);
  const totalCr =
    typeof data.Footer_Total_Cr === "number"
      ? data.Footer_Total_Cr
      : (data.Footer_VentaTotal ?? 0);

  // Detalle: acepta array directo o string JSON
  const detalle = Array.isArray(data.Detalle)
    ? data.Detalle
    : (typeof data.Detalle === "string" ? JSON.parse(data.Detalle || "[]") : []);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* HEADER (FIJO) */}
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
              <Text style={styles.thinItemBold}>Nro: </Text>
              <Text>{nro}</Text>
            </Text>
            <Text style={styles.thinItem}>
              <Text style={styles.thinItemBold}>Fecha Doc: </Text>
              <Text>{fechaDoc}</Text>
            </Text>
          </View>
        </View>

        {/* Evita que el contenido choque con el header fijo */}
        <View style={styles.spacerAfterHeader} />

        {/* 1×2 Proveedor */}
        <View style={styles.box}>
          <View style={styles.table12Row}>
            <View style={styles.table12ColLeft}>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>Sres: </Text>
                <Text style={styles.value}>{razon}</Text>
              </Text>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>Dir: </Text>
                <Text style={styles.value}>{dirProv}</Text>
              </Text>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>Ciudad: </Text>
                <Text style={styles.value}>{ciudad}</Text>
              </Text>
            </View>

            <View style={styles.table12ColRight}>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>Nit: </Text>
                <Text style={styles.value}>{nitProv}</Text>
              </Text>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>Tels: </Text>
                <Text style={styles.value}>{tel}</Text>
              </Text>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>Email: </Text>
                <Text style={styles.value}>{correo}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* DETALLE */}
        <View style={styles.detailBox}>
          <View style={styles.detailHeadRow}>
            <Text style={[styles.th, styles.colAux]}>Auxiliar</Text>
            <Text style={[styles.th, styles.colRazon]}>Razón Social</Text>
            <Text style={[styles.th, styles.colCO]}>C.O</Text>
            <Text style={[styles.th, styles.colTer]}>Tercero</Text>
            <Text style={[styles.th, styles.colDoc]}>Docto Cruce</Text>
            <Text style={[styles.th, styles.colDb]}>Débito</Text>
            <Text style={[styles.th, styles.colCr]}>Crédito</Text>
          </View>

          {detalle.map((row, i) => {
            const aux   = firstText(row, ["Auxiliar", "Detail_Auxiliar"]);
            const rz    = firstText(row, ["Razon_Social", "Detail_Razon_Social"]);
            const co    = firstText(row, ["CO", "Detail_CO"]);
            const terc  = firstText(row, ["Tercero", "Detail_Tercero"]);
            const cruce = firstText(row, ["Docto_Cruce", "Detail_Docto_Cruce"]);
            const deb   = firstNumeric(row, ["Debito", "Detail_Debito", "Detalle_Debito"]);
            const cre   = firstNumeric(row, ["Credito", "Detail_Credito", "Detalle_Credito"]);

            return (
              <View style={styles.tr} key={i}>
                <Text style={[styles.td, styles.colAux]}>{aux}</Text>
                <Text style={[styles.td, styles.colRazon]}>{rz}</Text>
                <Text style={[styles.td, styles.colCO]}>{co}</Text>
                <Text style={[styles.td, styles.colTer]}>{terc}</Text>
                <Text style={[styles.td, styles.colDoc]}>{cruce}</Text>
                <Text style={[styles.td, styles.colDb]}>{deb === null ? "-" : fmtMoney(deb)}</Text>
                <Text style={[styles.td, styles.colCr]}>{cre === null ? "-" : fmtMoney(cre)}</Text>
              </View>
            );
          })}
        </View>

        {/* 1×2 DEBAJO DEL DETALLE */}
        <View style={styles.boxSecond}>
          <View style={styles.secondRow}>
            <View style={styles.secondColLeft}>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>Nro de registros: </Text>
                <Text style={styles.value}>{detalle.length}</Text>
              </Text>
              <Text style={styles.notesTitle}>Notas: </Text>
              <Text style={styles.notesText}>{safe(data.Footer_Notas, "Sin Notas")}</Text>
            </View>

            <View style={styles.secondColRight}>
              <Text style={styles.totalLine}>
                <Text style={styles.strong}>Total Débitos: </Text>
                {fmtMoney(totalDb)}
              </Text>
              <Text style={styles.totalLine}>
                <Text style={styles.strong}>Total Créditos: </Text>
                {fmtMoney(totalCr)}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
