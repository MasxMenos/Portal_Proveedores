// src/components/format/CetPdfDocument.jsx
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

// devuelve el primer texto no vacío entre varias claves
const pick = (obj, keys, fallback = "-") => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== "") return String(v);
  }
  return fallback;
};

// devuelve número si es válido (acepta string/number)
const toNum = (v, fallback = null) => {
  if (v === null || v === undefined || v === "") return fallback;
  const n = Number(String(v).replace(/[^0-9.-]/g, ""));
  return Number.isNaN(n) ? fallback : n;
};

const BASE_FONT_SIZE = 8;

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: BASE_FONT_SIZE, lineHeight: 1.1, color: "#000" },

  // Header
  headerWrapper: { marginBottom: 8 },
  spacerAfterHeader: { height: 2 },

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

  // Caja genérica con borde exterior
  box: {
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 6,
  },

  // 1×2 (Proveedor) — separador interno vertical
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

  // Tabla 3×2 (Cuenta | Cuenta bancaria | Valor consignado)
  table3: {
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 6,
  },
  table3Header: {
    flexDirection: "row",
    backgroundColor: "#000",
  },
  table3Row: { flexDirection: "row" },
  table3Cell: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderRightColor: "#000",
    fontSize: BASE_FONT_SIZE,
  },
  table3CellLast: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontSize: BASE_FONT_SIZE,
  },
  table3HeaderText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: BASE_FONT_SIZE,
  },
  // anchos 3 columnas
  colCta: { width: "30%" },
  colCtaBanc: { width: "40%" },
  colVal: { width: "30%" },

  // Detalle (sólo borde exterior)
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

  // Anchos columnas detalle (CET)
  colAux:  { width: "12%" },
  colCO:   { width: "6%"  },
  colUN:   { width: "6%"  },
  colTer:  { width: "12%" },
  colRz:   { width: "26%" },
  colRef:  { width: "14%" },
  colDb:   { width: "12%" },
  colCr:   { width: "12%" },

  // Totales al final, sin caja
  totalsRight: {
    marginTop: 8,
    alignSelf: "flex-end",
  },
  totalLine: { fontSize: BASE_FONT_SIZE, marginBottom: 3, textAlign: "right" },
  strong: { fontWeight: "bold" },
});

export const CetPdfDocument = ({ data = {} }) => {
  // Empresa / encabezado
  const cia   = safe(data.Header_Cia);
  const nit   = safe(data.Header_Nit_Cia);
  const dir   = safe(data.Header_Dir_Cia);

  const docNombre = safe(data.Header_Doc);
  const nroDoc    = safe(data.Header_Nro_Doc);
  const fechaAct  = safe(data.Header_Fecha_Act);
  const fechaDoc  = safe(data.Header_Fecha_Doc);
  const docRef    = safe(data.Header_Docto_Referencia);

  // Proveedor / Bancos
  const prov    = safe(data.Header_Prov);
  const dirProv = safe(data.Header_Dir_Prov);
  const telProv = safe(data.Header_Tel_Prov);
  const nitProv = safe(data.Header_Nit_Prov);
  const ciudad  = safe(data.Header_Ciudad);

  const banco   = safe(data.Header_Banco) || safe(data.Header_Cuenta_Bancaria);
  const cuenta  = safe(data.Header_Cuenta);
  const ctaBanc = safe(data.Header_Cuenta_Bancaria);
  const valorConsig = toNum(data.Header_Valor_Consignacion, 0);

  // Totales
  const totDB = toNum(data.Footer_SumaIgualDB, 0);
  const totCR = toNum(data.Footer_SumaIgualCR, 0);

  // Detalle
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
              <Text style={styles.headLine}>{nit}</Text>
              <Text style={styles.headLine}>{dir}</Text>
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
            <Text style={styles.thinItem}>{fechaAct}</Text>
            <Text style={styles.thinItem}>
              <Text style={styles.thinItemBold}>Nro: </Text>
              <Text>{nroDoc}</Text>
            </Text>
            <Text style={styles.thinItem}>
              <Text style={styles.thinItemBold}>Fecha Doc: </Text>
              <Text>{fechaDoc}</Text>
            </Text>
          </View>
        </View>

        {/* separador para el header fixed */}
        <View style={styles.spacerAfterHeader} />

        {/* 1×2 — IZQ: Proveedor, Dirección, Teléfono, NIT — DER: Banco, Ciudad, Doc. Ref. */}
        <View style={styles.box}>
          <View style={styles.table12Row}>
            {/* Columna izquierda */}
            <View style={styles.table12ColLeft}>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>Proveedor: </Text>
                <Text style={styles.value}>{prov}</Text>
              </Text>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>Dirección: </Text>
                <Text style={styles.value}>{dirProv}</Text>
              </Text>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>Teléfono: </Text>
                <Text style={styles.value}>{telProv}</Text>
              </Text>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>NIT: </Text>
                <Text style={styles.value}>{nitProv}</Text>
              </Text>
            </View>

            {/* Columna derecha */}
            <View style={styles.table12ColRight}>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>Banco: </Text>
                <Text style={styles.value}>{banco}</Text>
              </Text>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>Ciudad: </Text>
                <Text style={styles.value}>{ciudad}</Text>
              </Text>
              <Text style={styles.labelLine}>
                <Text style={styles.label}>Doc. Ref.: </Text>
                <Text style={styles.value}>{docRef}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* 3×2 — Encabezados y fila de datos: Cuenta | Cuenta bancaria | Valor consignado */}
        <View style={styles.table3}>
          {/* Header */}
          <View style={styles.table3Header}>
            <Text style={[styles.table3Cell, styles.colCta]}>
              <Text style={styles.table3HeaderText}>Cuenta</Text>
            </Text>
            <Text style={[styles.table3Cell, styles.colCtaBanc]}>
              <Text style={styles.table3HeaderText}>Cuenta bancaria</Text>
            </Text>
            <Text style={[styles.table3CellLast, styles.colVal]}>
              <Text style={styles.table3HeaderText}>Valor consignado</Text>
            </Text>
          </View>
          {/* Data */}
          <View style={styles.table3Row}>
            <Text style={[styles.table3Cell, styles.colCta]}>{safe(cuenta, "-")}</Text>
            <Text style={[styles.table3Cell, styles.colCtaBanc]}>{safe(ctaBanc || banco, "-")}</Text>
            <Text style={[styles.table3CellLast, styles.colVal]}>{fmtMoney(valorConsig)}</Text>
          </View>
        </View>

        {/* DETALLE */}
        <View style={styles.detailBox}>
          <View style={styles.detailHeadRow}>
            <Text style={[styles.th, styles.colAux]}>Auxiliar</Text>
            <Text style={[styles.th, styles.colCO]}>CO</Text>
            <Text style={[styles.th, styles.colUN]}>UN</Text>
            <Text style={[styles.th, styles.colTer]}>Tercero</Text>
            <Text style={[styles.th, styles.colRz]}>Razón Social</Text>
            <Text style={[styles.th, styles.colRef]}>D.Cruce/MPago</Text>
            <Text style={[styles.th, styles.colDb]}>Débitos</Text>
            <Text style={[styles.th, styles.colCr]}>Créditos</Text>
          </View>

          {detalle.map((row, i) => {
            const aux   = pick(row, ["Auxiliar"]);
            const co    = pick(row, ["CO"]);
            const un    = pick(row, ["UN"]);
            const terc  = pick(row, ["Tercero"]);
            const rz    = pick(row, ["RazonSocial"]);
            const ref   = pick(row, ["DCruce_MPago"]);
            const db    = toNum(row.Debitos, null);
            const cr    = toNum(row.Creditos, null);

            return (
              <View style={styles.tr} key={i}>
                <Text style={[styles.td, styles.colAux]}>{aux}</Text>
                <Text style={[styles.td, styles.colCO]}>{co}</Text>
                <Text style={[styles.td, styles.colUN]}>{un}</Text>
                <Text style={[styles.td, styles.colTer]}>{terc}</Text>
                <Text style={[styles.td, styles.colRz]}>{rz}</Text>
                <Text style={[styles.td, styles.colRef]}>{ref}</Text>
                <Text style={[styles.td, styles.colDb]}>{db === null ? "-" : fmtMoney(db)}</Text>
                <Text style={[styles.td, styles.colCr]}>{cr === null ? "-" : fmtMoney(cr)}</Text>
              </View>
            );
          })}
        </View>

        {/* TOTALES (sin caja), alineados a la derecha y abajo */}
        <View style={styles.totalsRight}>
          <Text style={styles.totalLine}>
            <Text style={styles.strong}>Total Débitos: </Text>
            {fmtMoney(totDB)}
          </Text>
          <Text style={styles.totalLine}>
            <Text style={styles.strong}>Total Créditos: </Text>
            {fmtMoney(totCR)}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
