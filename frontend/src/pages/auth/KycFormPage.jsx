// frontend/src/pages/auth/KycFormPage.jsx
import {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../components/ThemeContext";
import { AuthCard } from "../../components/auth/AuthCard";
import { InputField } from "../../components/auth/InputField";
import { CheckboxWithLabel } from "../../components/auth/CheckboxWithLabel";
import { PrimaryButton } from "../../components/auth/PrimaryButton";

import { getChecked, isTrue } from "../../hooks/booleans";
import BoolRadio from "../../components/kyc/BoolRadio";
import KycDocumentsUploader from "../../components/kyc/KycDocumentsUploader";

const getSafeReturnPath = (loc) => {
  const from = loc?.state?.from?.pathname;
  // evita volver a /login o vacío
  if (!from || from === "/login" || from.startsWith("/login")) {
    return "/inicio";
  }
  return from;
};

// ---- helpers dinero ----
const onlyLetters = (s = "") =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]/g, "");

const DIAN_AUTH_CODE = "AUT_DIAN";


const nf = new Intl.NumberFormat("es-CO");
const onlyDigits = (s) => (s || "").replace(/[^\d]/g, "");
const toNumberOrNull = (s) => {
  const clean = onlyDigits(s);
  if (!clean) return null;
  try {
    return Number(clean);
  } catch {
    return null;
  }
};

// Etiqueta con * rojo
const RequiredLabel = ({ children }) => (
  <label className="text-xs block mb-1">
    {children} <span className="text-red-500">*</span>
  </label>
);

function CurrencyField({
  id,
  label,
  required = false,
  value,
  onChange,
  onBlur,
  placeholder = "0",
  isDark,
  error,
}) {
  const formatted = value ? nf.format(Number(onlyDigits(value))) : "";
  const [display, setDisplay] = useState(formatted);
  const lastProp = useRef(value);
  useEffect(() => {
    if (lastProp.current !== value) {
      lastProp.current = value;
      setDisplay(value ? nf.format(Number(onlyDigits(value))) : "");
    }
  }, [value]);
  const base =
    "w-full border rounded px-3 py-2 bg-transparent focus:outline-none";
  const border = isDark ? "border-zinc-700" : "border-gray-300";
  return (
    <div>
      {label &&
        (required ? (
          <RequiredLabel>{label}</RequiredLabel>
        ) : (
          <label className="text-xs block mb-1">{label}</label>
        ))}
      <input
        id={id}
        inputMode="numeric"
        className={`${base} ${border}`}
        placeholder={placeholder}
        value={display}
        onChange={(e) => {
          const raw = onlyDigits(e.target.value);
          setDisplay(raw ? nf.format(Number(raw)) : "");
          onChange({ target: { value: raw } });
        }}
        onBlur={() => {
          const raw = onlyDigits(display);
          setDisplay(raw ? nf.format(Number(raw)) : "");
          onBlur?.({ target: { id, value: raw } });
        }}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export default function KycFormPage() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("accessToken");
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  // ---------- estado ----------
  const [loading, setLoading] = useState(true);
  const [initialCheck, setInitialCheck] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");


  const [errors, setErrors] = useState({});

  // ---------- catálogos ----------
  const [idTypes, setIdTypes] = useState([]);
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [bankCountries, setBankCountries] = useState([]);
  const [banks, setBanks] = useState([]);

  // ---------- formulario ----------
  const [form, setForm] = useState({
    // Básica
    tipo_doc: "",
    nit_base: user?.username || "",
    nit_dv: "",
    primer_nombre: "",
    otros_nombres: "",
    primer_apellido: "",
    segundo_apellido: "",
    direccion_fiscal: "",
    country_id: undefined,
    region_id: undefined,
    city_id: undefined,
    telefono1: "",
    correo: "",
    activos_virtuales: null,
    // Contacto pedidos (opcionales)
    contacto_nombres: "",
    contacto_apellidos: "",
    contacto_tel_oficina: "",
    contacto_cel_corporativo: "",
    contacto_correo_pedidos: "",
    // PEP
    pep_actual: null,
    pep_ult2anios: null,
    pep_parentesco: null,
    pep_organizaciones_internacionales: null,
    pep_extranjero: null,
    // Financiera
    ingresos_anuales: "",
    egresos_anuales: "",
    otros_ingresos_anuales: "",
    concepto_otros_ingresos: "", // <- opcional
    activos: "",
    pasivos: "",
    patrimonio: "",
    // Fiscal
    ciiu_code: "",
    gran_contribuyente: null,
    gran_contribuyente_resolucion: null,
    autoretenedor_renta: null,
    autoretenedor_renta_resolucion: null,
    contribuyente_renta: null,
    regimen_esal: null,
    responsable_iva: null,
    regimen_simple: null,
    responsable_ica: null,
    ica_codigo: "",
    ica_tarifa_millar: "",
    ica_ciudad: "",
    gran_contribuyente_ica_bogota: null,
    obligado_fe: null,
    correo_fe: "",
    // Bancaria
    bank_country_id: undefined,
    bank_id: undefined,
    banco_cuenta_numero: "",
    banco_cuenta_titular: "",
    banco_cuenta_tipo: "",
    correo_tesoreria: "",
    // Origen y aceptaciones
    origen_recursos_desc: "",
    acepta_politicas: false,
    acepta_otras_declaraciones: false,
    acepta_veracidad_info: false,
    acepta_tratamiento_datos: false,
  });

  // ====== Documentos (modo diferido en memoria) ======
  const BASE_REQUIRED_DOCS = ["RUT", "CERT_CUENTA", "REF_COMERCIAL", "CC"];
  const [queuedDocs, setQueuedDocs] = useState({}); // { code: { file, date } }

  const conditionalRequired = isTrue(form.obligado_fe) ? [DIAN_AUTH_CODE] : [];
  const requiredDocCodes = useMemo(
    () => Array.from(new Set([...BASE_REQUIRED_DOCS, ...conditionalRequired])),
    [form.obligado_fe]
  );

  const missingCodes = useMemo(() => {
    const present = new Set(Object.keys(queuedDocs || {}));
    return requiredDocCodes.filter((c) => !present.has(c));
  }, [queuedDocs, requiredDocCodes]);

  const validateDocsBeforeSave = () => {
    const dateRequired = new Set(["RUT", "CERT_CUENTA", "REF_COMERCIAL"]);
    const missing = [];
    for (const code of requiredDocCodes) {
      const item = queuedDocs[code];
      if (!item?.file) { missing.push(code); continue; }
      if (dateRequired.has(code) && !item?.date) { missing.push(code); continue; }
    }
    return missing;
  };


  // ---------- utils ----------
  const toList = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  };

  const authFetch = async (url, options = {}) => {
    const headers = {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const res = await fetch(url, { ...options, headers });
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    if (!res.ok) {
      // mensaje más explícito
      const msg =
        (data && (data.detail || JSON.stringify(data))) || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return data ?? [];
  };

  // ---------- loaders ----------
  const loadIdTypes = async () => {
    const data = await authFetch("/api/kyc/id-types/");
    setIdTypes(toList(data));
  };
  const loadRegions = async (countryId) => {
    const data = await authFetch(`/api/kyc/regions/?country_id=${countryId}`);
    setRegions(toList(data));
  };
  const loadCities = async (regionId) => {
    const data = await authFetch(`/api/kyc/cities/?region_id=${regionId}`);
    setCities(toList(data));
  };
  const loadBanks = async (countryId, q = "") => {
    const url = q
      ? `/api/kyc/banks/?country_id=${countryId}&q=${encodeURIComponent(q)}`
      : `/api/kyc/banks/?country_id=${countryId}`;
    const data = await authFetch(url);
    setBanks(toList(data));
  };

  const setField = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const setBool = (field, evOrVal) =>
    setForm((f) => ({ ...f, [field]: getChecked(evOrVal) }));

  const handleChange = async (field, value) => {
    setField(field, value);
    setErrors((e) => ({ ...e, [field]: "" }));
    if (field === "country_id") {
      setRegions([]);
      setCities([]);
      setForm((f) => ({ ...f, region_id: undefined, city_id: undefined }));
      if (value) await loadRegions(value);
    }
    if (field === "region_id") {
      setCities([]);
      setForm((f) => ({ ...f, city_id: undefined }));
      if (value) await loadCities(value);
    }
    if (field === "bank_country_id") {
      setBanks([]);
      setForm((f) => ({ ...f, bank_id: undefined }));
      if (value) await loadBanks(value);
    }
  };

  // ---------- validación ----------
  const validateField = (name, value, full) => {
    const f = full ?? form;
    switch (name) {
      // Básica (obligatorios salvo los "(opcional)")
      case "tipo_doc":
        if (!value) return "Selecciona el tipo de documento";
        return "";
      case "nit_base":
        if (!value?.trim()) return "Número de identificación es obligatorio";
        return "";
      case "nit_dv":
        if (f.tipo_doc === "31" && !value?.toString().trim())
          return "Dígito de verificación es obligatorio para NIT";
        return "";
      case "primer_nombre":
        if (!value?.trim()) return "Primer nombre es obligatorio";
        return "";
      case "primer_apellido":
        if (!value?.trim()) return "Primer apellido es obligatorio";
        return "";
      case "direccion_fiscal":
        if (!value?.trim()) return "Dirección fiscal es obligatoria";
        return "";
      case "country_id":
        if (!value) return "Selecciona un país";
        return "";
      case "region_id":
        if (!value) return "Selecciona una región/departamento";
        return "";
      case "city_id":
        if (!value) return "Selecciona una ciudad";
        return "";
      case "telefono1":
        if (!value?.trim()) return "Número de teléfono es obligatorio";
        return "";
      case "correo":
        if (!value?.trim()) return "Correo electrónico es obligatorio";
        if (!emailRe.test(value)) return "Correo inválido";
        return "";
      case "activos_virtuales":
        if (value === null)
          return "Indica si realizas actividades con criptoactivos";
        return "";
      // Financiera (todo obligatorio excepto descripción)
      case "ingresos_anuales":
        if (!onlyDigits(value)) return "Obligatorio";
        return "";
      case "egresos_anuales":
        if (!onlyDigits(value)) return "Obligatorio";
        return "";
      case "otros_ingresos_anuales":
        if (!onlyDigits(value)) return "Obligatorio";
        return "";
      case "activos":
        if (!onlyDigits(value)) return "Obligatorio";
        return "";
      case "pasivos":
        if (!onlyDigits(value)) return "Obligatorio";
        return "";
      case "patrimonio":
        if (!onlyDigits(value)) return "Obligatorio";
        return "";
      // Fiscal (obligatorio razonable)
      case "ciiu_code":
        if (!value?.trim()) return "Código CIIU es obligatorio";
        return "";
      case "gran_contribuyente_resolucion":
        if (isTrue(f.gran_contribuyente) && !value?.trim())
          return "Resolución requerida";
        return "";
      case "autoretenedor_renta_resolucion":
        if (isTrue(f.autoretenedor_renta) && !value?.trim())
          return "Resolución requerida";
        return "";
      case "correo_fe":
        if (isTrue(f.obligado_fe)) {
          if (!value?.trim()) return "Correo requerido";
          if (!emailRe.test(value)) return "Correo inválido";
        }
        return "";
      case "ica_codigo":
      case "ica_tarifa_millar":
      case "ica_ciudad":
        if (isTrue(f.responsable_ica) && !String(value || "").trim())
          return "Obligatorio si responsable ICA";
        return "";
      // Bancaria (obligatorio todo)
      case "bank_country_id":
        if (!value) return "Selecciona país del banco";
        return "";
      case "bank_id":
        if (!value) return "Selecciona un banco";
        return "";
      case "banco_cuenta_numero":
        if (!value?.trim()) return "Número de cuenta obligatorio";
        return "";
      case "banco_cuenta_titular":
        if (!value?.trim()) return "Titular obligatorio";
        return "";
      case "banco_cuenta_tipo":
        if (!value?.trim()) return "Tipo de cuenta obligatorio";
        return "";
      case "correo_tesoreria":
        if (!value?.trim()) return "Correo de tesorería obligatorio";
        if (!emailRe.test(value)) return "Correo inválido";
        return "";
      // Origen y aceptaciones
      case "origen_recursos_desc": {
        const t = value || "";
        if (!t.trim() || t.trim().length < 5)
          return "Describe el origen de los recursos";
        return "";
      }
      case "acepta_politicas":
        if (!isTrue(value)) return "Debes aceptar la Declaración de Políticas";
        return "";
      case "acepta_otras_declaraciones":
        if (!isTrue(value)) return "Debes aceptar las Otras Declaraciones";
        return "";
      case "acepta_veracidad_info":
        if (!isTrue(value)) return "Debes aceptar la Declaración de Veracidad";
        return "";
      case "acepta_tratamiento_datos":
        if (!isTrue(value)) return "Debes aceptar el Tratamiento de Datos";
        return "";
      default:
        return "";
    }
  };

  const blurValidate = (name) => (e) => {
    const val = e?.target?.value !== undefined ? e.target.value : form[name];
    const msg = validateField(name, val, form);
    setErrors((old) => ({ ...old, [name]: msg }));
  };

  const validateAll = (f) => {
    const fields = [
      // Básica
      "tipo_doc",
      "nit_base",
      "nit_dv",
      "primer_nombre",
      "primer_apellido",
      "direccion_fiscal",
      "country_id",
      "region_id",
      "city_id",
      "telefono1",
      "correo",
      "activos_virtuales",
      // Financiera
      "ingresos_anuales",
      "egresos_anuales",
      "otros_ingresos_anuales",
      "activos",
      "pasivos",
      "patrimonio",
      // Fiscal
      "ciiu_code",
      "gran_contribuyente_resolucion",
      "autoretenedor_renta_resolucion",
      "correo_fe",
      "ica_codigo",
      "ica_tarifa_millar",
      "ica_ciudad",
      // Bancaria
      "bank_country_id",
      "bank_id",
      "banco_cuenta_numero",
      "banco_cuenta_titular",
      "banco_cuenta_tipo",
      "correo_tesoreria",
      // Origen + aceptaciones
      "origen_recursos_desc",
      "acepta_politicas",
      "acepta_otras_declaraciones",
      "acepta_veracidad_info",
      "acepta_tratamiento_datos",
    ];
    const newErrors = {};
    fields.forEach((k) => {
      const msg = validateField(k, f[k], f);
      if (msg) newErrors[k] = msg;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0
      ? ""
      : "Revisa los campos marcados en rojo.";
  };




  // ---------- prefill + catálogos ----------
useEffect(() => {
  (async () => {
    try {
      setLoading(true);
      await loadIdTypes();
      const countriesData = await authFetch("/api/kyc/countries/");
      const list = toList(countriesData);
      setCountries(list);
      setBankCountries(list);
      // NO: fetchStatus, NO: leer submission, NO: ensure
    } catch (err) {
      setError(err.message);
    } finally {
      setInitialCheck(false);
      setLoading(false);
    }
  })();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  // ---------- submit ----------
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  // 1) Validar formulario
  const msg = validateAll(form);
  if (msg) {
    setError(msg);
    const firstErrKey = Object.keys(errors)[0];
    if (firstErrKey)
      document.getElementById(firstErrKey)?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  // 2) Validar documentos requeridos en cola
  const missing = validateDocsBeforeSave();
  if (missing.length > 0) {
    setError("Faltan documentos requeridos por adjuntar: " + missing.join(", "));
    document.getElementById("docs-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  try {
    setSaving(true);
    // --- construir payload (idéntico al que ya tienes) ---
    const payload = {
      // Básica
      tipo_doc: form.tipo_doc,
      nit_base: form.nit_base?.trim(),
      nit_dv: form.tipo_doc === "31" ? String(form.nit_dv || "").trim() : null,
      primer_nombre: form.primer_nombre?.trim(),
      otros_nombres: form.otros_nombres?.trim(),
      primer_apellido: form.primer_apellido?.trim(),
      segundo_apellido: form.segundo_apellido?.trim(),
      direccion_fiscal: form.direccion_fiscal?.trim(),
      country_id: form.country_id,
      region_id: form.region_id,
      city_id: form.city_id,
      telefono1: form.telefono1?.trim(),
      correo: form.correo?.trim(),
      activos_virtuales: form.activos_virtuales,
      // Contacto
      contacto_nombres: form.contacto_nombres?.trim(),
      contacto_apellidos: form.contacto_apellidos?.trim(),
      contacto_tel_oficina: form.contacto_tel_oficina?.trim(),
      contacto_cel_corporativo: form.contacto_cel_corporativo?.trim(),
      contacto_correo_pedidos: form.contacto_correo_pedidos?.trim(),
      // PEP
      pep_actual: form.pep_actual,
      pep_ult2anios: form.pep_ult2anios,
      pep_parentesco: form.pep_parentesco,
      pep_organizaciones_internacionales: form.pep_organizaciones_internacionales,
      pep_extranjero: form.pep_extranjero,
      // Financiera
      ingresos_anuales: toNumberOrNull(form.ingresos_anuales),
      egresos_anuales: toNumberOrNull(form.egresos_anuales),
      otros_ingresos_anuales: toNumberOrNull(form.otros_ingresos_anuales),
      concepto_otros_ingresos: form.concepto_otros_ingresos?.trim() || null,
      activos: toNumberOrNull(form.activos),
      pasivos: toNumberOrNull(form.pasivos),
      patrimonio: toNumberOrNull(form.patrimonio),
      // Fiscal
      ciiu_code: form.ciiu_code?.trim() || null,
      gran_contribuyente: form.gran_contribuyente,
      gran_contribuyente_resolucion: isTrue(form.gran_contribuyente) ? form.gran_contribuyente_resolucion?.trim() || null : null,
      autoretenedor_renta: isTrue(form.autoretenedor_renta),
      autoretenedor_renta_resolucion: isTrue(form.autoretenedor_renta) ? form.autoretenedor_renta_resolucion?.trim() || null : null,
      contribuyente_renta: isTrue(form.contribuyente_renta),
      regimen_esal: isTrue(form.regimen_esal),
      responsable_iva: isTrue(form.responsable_iva),
      regimen_simple: isTrue(form.regimen_simple),
      responsable_ica: isTrue(form.responsable_ica),
      ica_codigo: isTrue(form.responsable_ica) ? form.ica_codigo?.trim() || null : null,
      ica_tarifa_millar: isTrue(form.responsable_ica) ? toNumberOrNull(form.ica_tarifa_millar) : null,
      ica_ciudad: isTrue(form.responsable_ica) ? form.ica_ciudad?.trim() || null : null,
      gran_contribuyente_ica_bogota: isTrue(form.gran_contribuyente_ica_bogota),
      obligado_fe: isTrue(form.obligado_fe),
      correo_fe: isTrue(form.obligado_fe) ? form.correo_fe?.trim() || null : null,
      // Bancaria
      bank_country_id: form.bank_country_id,
      bank_id: form.bank_id,
      banco_cuenta_numero: form.banco_cuenta_numero?.trim() || null,
      banco_cuenta_titular: form.banco_cuenta_titular?.trim() || null,
      banco_cuenta_tipo: form.banco_cuenta_tipo?.trim() || null,
      correo_tesoreria: form.correo_tesoreria?.trim() || null,
      // Origen + Aceptaciones
      origen_recursos_desc: form.origen_recursos_desc?.trim() || null,
      acepta_politicas: isTrue(form.acepta_politicas),
      acepta_otras_declaraciones: isTrue(form.acepta_otras_declaraciones),
      acepta_veracidad_info: isTrue(form.acepta_veracidad_info),
      acepta_tratamiento_datos: isTrue(form.acepta_tratamiento_datos),
    };
    // 3) Crear submission (aquí, no antes)
    const createRes = await authFetch("/api/kyc/submissions/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const newSubmissionId = createRes?.id || createRes?.submission_id;
    if (!newSubmissionId) throw new Error("No se recibió el id de la nueva submission.");
    // 4) Subir documentos de la cola
    for (const [code, { file, date }] of Object.entries(queuedDocs)) {
      const formData = new FormData();
      formData.append("submission_id", newSubmissionId);
      formData.append("tipo", code);
      formData.append("file", file);
      if (date) formData.append("fecha", date);
      const res = await fetch("/api/kyc/submissions/documents/upload/", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || `Error subiendo ${code}`);
    }
    // 5) Finalizar
    await authFetch(`/api/kyc/submissions/${newSubmissionId}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ finalize: true }),
    });
    navigate(getSafeReturnPath(location), { replace: true });
  } catch (err) {
    setError(err.message);
    document.getElementById("docs-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  } finally {
    setSaving(false);
  }
};

  // ---------- loading ----------
  if (initialCheck && loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-[#0d0d0d] text-white" : "bg-gray-100 text-black"
        }`}
      >
        <div className="animate-pulse opacity-70 text-sm">
          Verificando estado…
        </div>
      </div>
    );
  }

  const isNIT = form.tipo_doc === "31";

  return (
    <div
      className={`min-h-screen flex items-start md:items-center justify-center px-4 py-6 md:py-10 transition-colors duration-300 ${
        isDark ? "bg-[#0d0d0d] text-white" : "bg-gray-100 text-black"
      }`}
    >
      <button
        onClick={toggleTheme}
        className={`fixed md:absolute top-4 right-4 p-2 rounded transition-colors duration-200 ${
          isDark ? "hover:bg-zinc-800" : "hover:bg-gray-300"
        }`}
        aria-label="Cambiar tema"
      >
        {isDark ? (
          <Sun size={22} className="text-gray-400" />
        ) : (
          <Moon size={22} className="text-gray-600" />
        )}
      </button>

      <div className="w-full max-w-7xl mx-auto">
        <AuthCard
          size="2xl"
          className="mx-auto"
          contentClassName="px-4 md:px-8"
          title="Vinculación de Proveedor"
          subtitle="Completa tu información para continuar"

        >
          <form className="space-y-10" onSubmit={handleSubmit}>
            {/* ====== BÁSICA ====== */}
            <section>
              <h3 className="text-sm font-semibold mb-3 opacity-80">
                Información Básica Persona Natural
              </h3>

              {/* Fila 1: tipo_doc, nit_base, nit_dv */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <RequiredLabel>Tipo de Documento de Identidad</RequiredLabel>
                  <select
                    id="tipo_doc"
                    className={`w-full border rounded px-3 py-2 bg-transparent ${
                      isDark ? "border-zinc-700" : "border-gray-300"
                    }`}
                    value={form.tipo_doc || ""}
                    onChange={(e) => handleChange("tipo_doc", e.target.value)}
                    onBlur={blurValidate("tipo_doc")}
                  >
                    <option value="">Seleccione…</option>
                    {(Array.isArray(idTypes) ? idTypes : []).map((t) => (
                      <option key={t.code} value={t.code}>
                        {t.name || t.code}
                      </option>
                    ))}
                  </select>
                  {errors.tipo_doc && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.tipo_doc}
                    </p>
                  )}
                </div>

                <div>
                  <RequiredLabel>Número de identificación</RequiredLabel>
                  <InputField
                    id="nit_base"
                    label="" // usamos etiqueta propia arriba
                    value={form.nit_base || ""}
                    onChange={(e) => handleChange("nit_base", e.target.value)}
                    onBlur={blurValidate("nit_base")}
                    placeholder={isNIT ? "NIT sin DV" : "Número completo"}
                  />
                  {errors.nit_base && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.nit_base}
                    </p>
                  )}
                </div>

                <div>
                  <RequiredLabel>Dígito de verificación</RequiredLabel>
                  <InputField
                    id="nit_dv"
                    label=""
                    value={form.nit_dv}
                    onChange={(e) =>
                      handleChange("nit_dv", e.target.value.replace(/\D/g, ""))
                    }
                    onBlur={blurValidate("nit_dv")}
                    placeholder="DV"
                    disabled={!isNIT}
                  />
                  {errors.nit_dv && (
                    <p className="mt-1 text-xs text-red-500">{errors.nit_dv}</p>
                  )}
                </div>
              </div>

              {/* Fila 2: nombres/apellidos */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <RequiredLabel>Primer nombre</RequiredLabel>
                  <InputField
                    id="primer_nombre"
                    label=""
                    value={form.primer_nombre}
                    onChange={(e) =>
                      handleChange("primer_nombre", onlyLetters(e.target.value))
                    }
                    onBlur={blurValidate("primer_nombre")}
                  />
                  {errors.primer_nombre && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.primer_nombre}
                    </p>
                  )}
                </div>
                <InputField
                  id="otros_nombres"
                  label="Otros nombres (opcional)"
                  value={form.otros_nombres}
                  onChange={(e) =>
                    handleChange("otros_nombres", onlyLetters(e.target.value))
                  }
                />
                <div>
                  <RequiredLabel>Primer apellido</RequiredLabel>
                  <InputField
                    id="primer_apellido"
                    label=""
                    value={form.primer_apellido}
                    onChange={(e) =>
                      handleChange(
                        "primer_apellido",
                        onlyLetters(e.target.value)
                      )
                    }
                    onBlur={blurValidate("primer_apellido")}
                  />
                  {errors.primer_apellido && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.primer_apellido}
                    </p>
                  )}
                </div>
                <InputField
                  id="segundo_apellido"
                  label="Segundo apellido (opcional)"
                  value={form.segundo_apellido}
                  onChange={(e) =>
                    handleChange(
                      "segundo_apellido",
                      onlyLetters(e.target.value)
                    )
                  }
                />
              </div>

              {/* Fila 3: dirección */}
              <div className="mt-4">
                <RequiredLabel>Dirección Fiscal</RequiredLabel>
                <InputField
                  id="direccion_fiscal"
                  label=""
                  value={form.direccion_fiscal}
                  onChange={(e) =>
                    handleChange("direccion_fiscal", e.target.value)
                  }
                  onBlur={blurValidate("direccion_fiscal")}
                  placeholder="Dirección completa"
                />
                {errors.direccion_fiscal && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.direccion_fiscal}
                  </p>
                )}
              </div>

              {/* Fila 4: país / región / ciudad */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <RequiredLabel>País</RequiredLabel>
                  <select
                    id="country_id"
                    className={`w-full border rounded px-3 py-2 bg-transparent ${
                      isDark ? "border-zinc-700" : "border-gray-300"
                    }`}
                    value={form.country_id || ""}
                    onChange={async (e) => {
                      const v = e.target.value
                        ? Number(e.target.value)
                        : undefined;
                      await handleChange("country_id", v);
                    }}
                    onBlur={blurValidate("country_id")}
                  >
                    <option value="">Seleccione…</option>
                    {(Array.isArray(countries) ? countries : []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.country_id && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.country_id}
                    </p>
                  )}
                </div>

                <div>
                  <RequiredLabel>Región / Departamento</RequiredLabel>
                  <select
                    id="region_id"
                    className={`w-full border rounded px-3 py-2 bg-transparent ${
                      isDark ? "border-zinc-700" : "border-gray-300"
                    }`}
                    value={form.region_id || ""}
                    onChange={async (e) => {
                      const v = e.target.value
                        ? Number(e.target.value)
                        : undefined;
                      await handleChange("region_id", v);
                    }}
                    onBlur={blurValidate("region_id")}
                    disabled={!regions.length}
                  >
                    <option value="">Seleccione…</option>
                    {(Array.isArray(regions) ? regions : []).map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.code} - {r.name}
                      </option>
                    ))}
                  </select>
                  {errors.region_id && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.region_id}
                    </p>
                  )}
                </div>

                <div>
                  <RequiredLabel>Ciudad / Municipio</RequiredLabel>
                  <select
                    id="city_id"
                    className={`w-full border rounded px-3 py-2 bg-transparent ${
                      isDark ? "border-zinc-700" : "border-gray-300"
                    }`}
                    value={form.city_id || ""}
                    onChange={(e) =>
                      handleChange(
                        "city_id",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    onBlur={blurValidate("city_id")}
                    disabled={!cities.length}
                  >
                    <option value="">Seleccione…</option>
                    {(Array.isArray(cities) ? cities : []).map((ci) => (
                      <option key={ci.id} value={ci.id}>
                        {ci.name}
                      </option>
                    ))}
                  </select>
                  {errors.city_id && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.city_id}
                    </p>
                  )}
                </div>
              </div>

              {/* Fila 5: Teléfono / Correo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <RequiredLabel>Número de teléfono</RequiredLabel>
                  <InputField
                    id="telefono1"
                    label=""
                    value={form.telefono1}
                    onChange={(e) =>
                      handleChange("telefono1", onlyDigits(e.target.value))
                    }
                    onBlur={blurValidate("telefono1")}
                    placeholder="Ej: 6076370099"
                  />
                  {errors.telefono1 && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.telefono1}
                    </p>
                  )}
                </div>
                <div>
                  <RequiredLabel>Correo electrónico</RequiredLabel>
                  <InputField
                    id="correo"
                    label=""
                    value={form.correo}
                    onChange={(e) => handleChange("correo", e.target.value)}
                    onBlur={blurValidate("correo")}
                    placeholder="correo@dominio.com"
                  />
                  {errors.correo && (
                    <p className="mt-1 text-xs text-red-500">{errors.correo}</p>
                  )}
                </div>
              </div>

              {/* Fila 6: Criptoactivos */}
              <div className="mt-4">
                <RequiredLabel>
                  ¿Realiza actividades con activos virtuales (criptoactivos)?
                </RequiredLabel>
                <BoolRadio
                  id="activos_virtuales"
                  label="" // etiqueta propia arriba
                  value={form.activos_virtuales}
                  onChange={(v) => {
                    handleChange("activos_virtuales", v);
                    setErrors((e) => ({ ...e, activos_virtuales: "" }));
                  }}
                />
                {errors.activos_virtuales && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.activos_virtuales}
                  </p>
                )}
              </div>
            </section>

            {/* ====== CONTACTO PEDIDOS (opcionales) ====== */}
            <section>
              <h3 className="text-sm font-semibold mb-3 opacity-80">
                Información de Contacto Pedidos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InputField
                  id="contacto_nombres"
                  label="Nombres"
                  value={form.contacto_nombres}
                  onChange={(e) =>
                    handleChange(
                      "contacto_nombres",
                      onlyLetters(e.target.value)
                    )
                  }
                />
                <InputField
                  id="contacto_apellidos"
                  label="Apellidos"
                  value={form.contacto_apellidos}
                  onChange={(e) =>
                    handleChange(
                      "contacto_apellidos",
                      onlyLetters(e.target.value)
                    )
                  }
                />
                <InputField
                  id="contacto_tel_oficina"
                  label="Teléfono de oficina"
                  value={form.contacto_tel_oficina}
                  onChange={(e) =>
                    handleChange(
                      "contacto_tel_oficina",
                      onlyDigits(e.target.value)
                    )
                  }
                />
                <InputField
                  id="contacto_cel_corporativo"
                  label="Celular corporativo"
                  value={form.contacto_cel_corporativo}
                  onChange={(e) =>
                    handleChange(
                      "contacto_cel_corporativo",
                      onlyDigits(e.target.value)
                    )
                  }
                />
                <div className="md:col-span-2 lg:col-span-1">
                  <InputField
                    id="contacto_correo_pedidos"
                    label="Correo electrónico corporativo para pedidos"
                    value={form.contacto_correo_pedidos}
                    onChange={(e) =>
                      handleChange("contacto_correo_pedidos", e.target.value)
                    }
                  />
                </div>
              </div>
            </section>

            {/* ====== PEP ====== */}
            <section>
              <h3 className="text-sm font-semibold mb-3 opacity-80">
                Conocimiento de Personas Expuestas Políticamente (PEP)
              </h3>
              <p
                className={`text-xs leading-snug mb-4 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Conteste las siguientes preguntas y relacione si Usted, los
                representantes legales, miembros de la Junta directiva o
                accionistas de la sociedad o entidad, es una Persona Expuesta
                Políticamente (PEP*) o han ocupado cargos públicos o manejado
                recursos públicos en los últimos dos (2) años
              </p>
              <p
                className={`text-xs leading-snug mb-4 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                *PEP: servidores públicos, funcionarios públicos, políticos o
                particulares que ejerzan funciones públicas o maneja recursos
                públicos en entidades de caracter nacional, departamental,
                municipal o de una entidad pública Internacional o extranjera
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BoolRadio
                  id="pep_actual"
                  label="¿Actualmente usted o administradores ostentan calidad de PEP?"
                  value={form.pep_actual}
                  onChange={(v) => handleChange("pep_actual", v)}
                />
                <BoolRadio
                  id="pep_ult2anios"
                  label="¿Manejó recursos públicos en últimos 2 años o fue PEP?"
                  value={form.pep_ult2anios}
                  onChange={(v) => handleChange("pep_ult2anios", v)}
                />
                <BoolRadio
                  id="pep_parentesco"
                  label="¿Existe vínculo de parentesco con alguna PEP?"
                  value={form.pep_parentesco}
                  onChange={(v) => handleChange("pep_parentesco", v)}
                />
              </div>
              <p
                className={`text-xs leading-snug mb-4 mt-4 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                *PEP de Organizaciones Internacionales: son aquellas personas
                naturales que ejercen funciones directivas en una organización
                internacional, tales como la Organización de Naciones Unidas,
                Organización para la Cooperación y el Desarrollo Económicos, el
                Fondo de las Naciones Unidas para la Infancia (UNICEF) y la
                Organización de Estados Americanos, entre otros (vr.gr.
                directores, subdirectores, miembros de junta directiva
                ocualquier persona que ejerza una función equivalente). PEP
                Extranjeras: son aquellas personas naturales que desempeñan
                funciones públicas prominentes y destacadas en otro país.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BoolRadio
                  id="pep_organizaciones_internacionales"
                  label="¿PEP de Organizaciones Internacionales?"
                  value={form.pep_organizaciones_internacionales}
                  onChange={(v) =>
                    handleChange("pep_organizaciones_internacionales", v)
                  }
                />
                <BoolRadio
                  id="pep_extranjero"
                  label="¿PEP extranjero?"
                  value={form.pep_extranjero}
                  onChange={(v) => handleChange("pep_extranjero", v)}
                />
              </div>
            </section>

            {/* ====== FINANCIERA (COP) ====== */}
            <section>
              <h3 className="text-sm font-semibold mb-3 opacity-80">
                Información Financiera (COP)
              </h3>

              {/* Fila 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CurrencyField
                  id="ingresos_anuales"
                  label="Ingresos anuales"
                  required
                  value={form.ingresos_anuales}
                  onChange={(e) =>
                    handleChange("ingresos_anuales", e.target.value)
                  }
                  onBlur={blurValidate("ingresos_anuales")}
                  isDark={isDark}
                  error={errors.ingresos_anuales}
                />
                <CurrencyField
                  id="egresos_anuales"
                  label="Egresos anuales"
                  required
                  value={form.egresos_anuales}
                  onChange={(e) =>
                    handleChange("egresos_anuales", e.target.value)
                  }
                  onBlur={blurValidate("egresos_anuales")}
                  isDark={isDark}
                  error={errors.egresos_anuales}
                />
              </div>

              {/* Fila 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <CurrencyField
                  id="otros_ingresos_anuales"
                  label="Otros ingresos anuales"
                  required
                  value={form.otros_ingresos_anuales}
                  onChange={(e) =>
                    handleChange("otros_ingresos_anuales", e.target.value)
                  }
                  onBlur={blurValidate("otros_ingresos_anuales")}
                  isDark={isDark}
                  error={errors.otros_ingresos_anuales}
                />
                <InputField
                  id="concepto_otros_ingresos"
                  label="Descripción otros ingresos (opcional)"
                  value={form.concepto_otros_ingresos}
                  onChange={(e) =>
                    handleChange("concepto_otros_ingresos", e.target.value)
                  }
                  placeholder="Descripción"
                />
              </div>

              {/* Fila 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <CurrencyField
                  id="activos"
                  label="Activos"
                  required
                  value={form.activos}
                  onChange={(e) => handleChange("activos", e.target.value)}
                  onBlur={blurValidate("activos")}
                  isDark={isDark}
                  error={errors.activos}
                />
                <CurrencyField
                  id="pasivos"
                  label="Pasivos"
                  required
                  value={form.pasivos}
                  onChange={(e) => handleChange("pasivos", e.target.value)}
                  onBlur={blurValidate("pasivos")}
                  isDark={isDark}
                  error={errors.pasivos}
                />
              </div>

              {/* Fila 4 */}
              <div className="mt-4">
                <CurrencyField
                  id="patrimonio"
                  label="Total patrimonio"
                  required
                  value={form.patrimonio}
                  onChange={(e) => handleChange("patrimonio", e.target.value)}
                  onBlur={blurValidate("patrimonio")}
                  isDark={isDark}
                  error={errors.patrimonio}
                />
              </div>
            </section>

            {/* ====== FISCAL ====== */}
            <section>
              <h3 className="text-sm font-semibold mb-3 opacity-80">
                Información Fiscal / Tributaria
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-1">
                  <RequiredLabel>
                    Código de Actividad económica (CIIU)
                  </RequiredLabel>
                  <InputField
                    id="ciiu_code"
                    label=""
                    value={form.ciiu_code}
                    onChange={(e) =>
                      handleChange("ciiu_code", onlyDigits(e.target.value))
                    }
                    onBlur={blurValidate("ciiu_code")}
                  />
                  {errors.ciiu_code && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.ciiu_code}
                    </p>
                  )}
                </div>
                <div />
                {/* Conmutadores + condicionales */}
                <div className="grid grid-cols-1">
                  <BoolRadio
                    id="gran_contribuyente"
                    label="Gran Contribuyente"
                    value={form.gran_contribuyente}
                    onChange={(v) => {
                      handleChange("gran_contribuyente", v);
                      setErrors((e) => ({
                        ...e,
                        gran_contribuyente_resolucion: "",
                      }));
                    }}
                  />
                </div>
                <div className="grid grid-cols-1">
                  <label className="text-xs block mb-1">
                    Resolución No.{" "}
                    {isTrue(form.gran_contribuyente) && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <InputField
                    id="gran_contribuyente_resolucion"
                    label=""
                    value={form.gran_contribuyente_resolucion}
                    onChange={(e) =>
                      handleChange(
                        "gran_contribuyente_resolucion",
                        e.target.value
                      )
                    }
                    onBlur={blurValidate("gran_contribuyente_resolucion")}
                    placeholder={
                      isTrue(form.gran_contribuyente)
                        ? "Obligatorio si marcaste Sí"
                        : "Si aplica"
                    }
                  />
                  {errors.gran_contribuyente_resolucion && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.gran_contribuyente_resolucion}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1">
                  <BoolRadio
                    id="autoretenedor_renta"
                    label="Autoretenedor en impuesto a la renta"
                    value={form.autoretenedor_renta}
                    onChange={(v) => {
                      handleChange("autoretenedor_renta", v);
                      setErrors((e) => ({
                        ...e,
                        autoretenedor_renta_resolucion: "",
                      }));
                    }}
                  />
                </div>
                <div className="grid grid-cols-1">
                  <label className="text-xs block mb-1">
                    Resolución No.{" "}
                    {isTrue(form.autoretenedor_renta) && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <InputField
                    id="autoretenedor_renta_resolucion"
                    label=""
                    value={form.autoretenedor_renta_resolucion}
                    onChange={(e) =>
                      handleChange(
                        "autoretenedor_renta_resolucion",
                        e.target.value
                      )
                    }
                    onBlur={blurValidate("autoretenedor_renta_resolucion")}
                    placeholder={
                      isTrue(form.autoretenedor_renta)
                        ? "Obligatorio si marcaste Sí"
                        : "Si aplica"
                    }
                  />
                  {errors.autoretenedor_renta_resolucion && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.autoretenedor_renta_resolucion}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1">
                  <BoolRadio
                    id="contribuyente_renta"
                    label="Contribuyente impuesto a la renta y complementarios"
                    value={form.contribuyente_renta}
                    onChange={(v) => handleChange("contribuyente_renta", v)}
                  />
                </div>
                <div />

                <div className="grid grid-cols-1">
                  <BoolRadio
                    id="regimen_esal"
                    label="Régimen ESAL"
                    value={form.regimen_esal}
                    onChange={(v) => handleChange("regimen_esal", v)}
                  />
                </div>
                <div />

                <div className="grid grid-cols-1">
                  <BoolRadio
                    id="responsable_iva"
                    label="Responsable de IVA"
                    value={form.responsable_iva}
                    onChange={(v) => handleChange("responsable_iva", v)}
                  />
                </div>
                <div />

                <div className="grid grid-cols-1">
                  <BoolRadio
                    id="regimen_simple"
                    label="Régimen simple de tributación"
                    value={form.regimen_simple}
                    onChange={(v) => handleChange("regimen_simple", v)}
                  />
                </div>
                <div />

                <div className="grid grid-cols-1">
                  <BoolRadio
                    id="responsable_ica"
                    label="Responsable de Impuesto de Industria y Comercio"
                    value={form.responsable_ica}
                    onChange={(v) => {
                      handleChange("responsable_ica", v);
                      setErrors((e) => ({
                        ...e,
                        ica_codigo: "",
                        ica_tarifa_millar: "",
                        ica_ciudad: "",
                      }));
                    }}
                  />
                </div>
                <div />

                <div>
                  <label className="text-xs block mb-1">
                    Código de ICA No.{" "}
                    {isTrue(form.responsable_ica) && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <InputField
                    id="ica_codigo"
                    label=""
                    value={form.ica_codigo}
                    onChange={(e) => handleChange("ica_codigo", e.target.value)}
                    onBlur={blurValidate("ica_codigo")}
                  />
                  {errors.ica_codigo && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.ica_codigo}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs block mb-1">
                    Tarifa ICA (x 1000){" "}
                    {isTrue(form.responsable_ica) && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <InputField
                    id="ica_tarifa_millar"
                    label=""
                    value={form.ica_tarifa_millar}
                    onChange={(e) =>
                      handleChange(
                        "ica_tarifa_millar",
                        onlyDigits(e.target.value)
                      )
                    }
                    onBlur={blurValidate("ica_tarifa_millar")}
                  />
                  {errors.ica_tarifa_millar && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.ica_tarifa_millar}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs block mb-1">
                    Ciudad donde declara ICA{" "}
                    {isTrue(form.responsable_ica) && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <InputField
                    id="ica_ciudad"
                    label=""
                    value={form.ica_ciudad}
                    onChange={(e) => handleChange("ica_ciudad", e.target.value)}
                    onBlur={blurValidate("ica_ciudad")}
                  />
                  {errors.ica_ciudad && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.ica_ciudad}
                    </p>
                  )}
                </div>
                <div />

                <div className="grid grid-cols-1">
                  <BoolRadio
                    id="gran_contribuyente_ica_bogota"
                    label="Gran contribuyente de ICA en Bogotá"
                    value={form.gran_contribuyente_ica_bogota}
                    onChange={(v) =>
                      handleChange("gran_contribuyente_ica_bogota", v)
                    }
                  />
                </div>
                <div />

                <div className="grid grid-cols-1">
                  <BoolRadio
                    id="obligado_fe"
                    label="¿Está obligado a emitir factura electrónica?"
                    value={form.obligado_fe}
                    onChange={(v) => {
                      handleChange("obligado_fe", v);
                      setErrors((e) => ({ ...e, correo_fe: "" }));
                    }}
                  />
                </div>
                <div className="grid grid-cols-1">
                  <label className="text-xs block mb-1">
                    Correo electrónico para radicar factura electrónica{" "}
                    {isTrue(form.obligado_fe) && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <InputField
                    id="correo_fe"
                    label=""
                    value={form.correo_fe}
                    onChange={(e) => handleChange("correo_fe", e.target.value)}
                    onBlur={blurValidate("correo_fe")}
                    placeholder={
                      isTrue(form.obligado_fe)
                        ? "Obligatorio si marcaste Sí"
                        : "correo@factura.com"
                    }
                  />
                  {errors.correo_fe && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.correo_fe}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* ====== BANCARIA ====== */}
            <section>
              <h3 className="text-sm font-semibold mb-3 opacity-80">
                Información Bancaria
              </h3>

              {/* 1ª fila: Banco, País del banco, Titular */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <RequiredLabel>País del banco</RequiredLabel>
                  <select
                    id="bank_country_id"
                    className={`w-full border rounded px-3 py-2 bg-transparent ${
                      isDark ? "border-zinc-700" : "border-gray-300"
                    }`}
                    value={form.bank_country_id || ""}
                    onChange={async (e) => {
                      const v = e.target.value
                        ? Number(e.target.value)
                        : undefined;
                      await handleChange("bank_country_id", v);
                    }}
                    onBlur={blurValidate("bank_country_id")}
                  >
                    <option value="">Seleccione…</option>
                    {(Array.isArray(bankCountries) ? bankCountries : []).map(
                      (c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} - {c.name}
                        </option>
                      )
                    )}
                  </select>
                  {errors.bank_country_id && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.bank_country_id}
                    </p>
                  )}
                </div>

                <div>
                  <RequiredLabel>Banco</RequiredLabel>
                  <select
                    id="bank_id"
                    className={`w-full border rounded px-3 py-2 bg-transparent ${
                      isDark ? "border-zinc-700" : "border-gray-300"
                    }`}
                    value={form.bank_id || ""}
                    onChange={(e) =>
                      handleChange(
                        "bank_id",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    disabled={!form.bank_country_id || !banks.length}
                    onBlur={blurValidate("bank_id")}
                  >
                    <option value="">Seleccione…</option>
                    {(Array.isArray(banks) ? banks : []).map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  {errors.bank_id && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.bank_id}
                    </p>
                  )}
                </div>

                <div>
                  <RequiredLabel>Titular de la cuenta</RequiredLabel>
                  <InputField
                    id="banco_cuenta_titular"
                    label=""
                    value={form.banco_cuenta_titular}
                    onChange={(e) =>
                      handleChange(
                        "banco_cuenta_titular",
                        onlyLetters(e.target.value)
                      )
                    }
                    onBlur={blurValidate("banco_cuenta_titular")}
                    placeholder="Nombre completo del titular"
                  />
                  {errors.banco_cuenta_titular && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.banco_cuenta_titular}
                    </p>
                  )}
                </div>
              </div>

              {/* 2ª fila: Nº cuenta, Tipo cuenta, Correo tesorería */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <RequiredLabel>N° de cuenta bancaria</RequiredLabel>
                  <InputField
                    id="banco_cuenta_numero"
                    label=""
                    value={form.banco_cuenta_numero}
                    onChange={(e) =>
                      handleChange(
                        "banco_cuenta_numero",
                        onlyDigits(e.target.value)
                      )
                    }
                    onBlur={blurValidate("banco_cuenta_numero")}
                    placeholder="0000000"
                  />
                  {errors.banco_cuenta_numero && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.banco_cuenta_numero}
                    </p>
                  )}
                </div>
                <div>
                  <RequiredLabel>Tipo de cuenta</RequiredLabel>
                  <select
                    id="banco_cuenta_tipo"
                    className={`w-full border rounded px-3 py-2 bg-transparent ${
                      isDark ? "border-zinc-700" : "border-gray-300"
                    }`}
                    value={form.banco_cuenta_tipo || ""}
                    onChange={(e) =>
                      handleChange("banco_cuenta_tipo", e.target.value)
                    }
                    onBlur={blurValidate("banco_cuenta_tipo")}
                  >
                    <option value="">Seleccione…</option>
                    <option value="AHORROS">Ahorros</option>
                    <option value="CORRIENTE">Corriente</option>
                  </select>
                  {errors.banco_cuenta_tipo && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.banco_cuenta_tipo}
                    </p>
                  )}
                </div>
                <div>
                  <RequiredLabel>Correo de tesorería</RequiredLabel>
                  <InputField
                    id="correo_tesoreria"
                    label=""
                    value={form.correo_tesoreria}
                    onChange={(e) =>
                      handleChange("correo_tesoreria", e.target.value)
                    }
                    onBlur={blurValidate("correo_tesoreria")}
                    placeholder="tesoreria@empresa.com"
                  />
                  {errors.correo_tesoreria && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.correo_tesoreria}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* ====== ORIGEN/DESTINO ====== */}
            <section>
              <h3 className="text-sm font-semibold mb-3 opacity-80">
                Declaración voluntaria de origen y destino de fondos
              </h3>
              <p
                className={`text-xs leading-snug mb-4 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Yo, obrando en representación legal o en nombre propio, según
                los datos diligenciados en el presente formato, de manera
                voluntaria declaro bajo gravedad de juramento que: a) Que mis
                propios recursos y los recursos de la persona jurídica que
                represento, provienen de actividades lícitas que se originan o
                provienen de: (Describa a continuación el origen de los recusos)
              </p>
              <div className="mb-4">
                <RequiredLabel>
                  Descripción del origen de los recursos
                </RequiredLabel>
                <textarea
                  id="origen_recursos_desc"
                  className={`w-full border rounded px-3 py-2 bg-transparent min-h-[100px] ${
                    isDark ? "border-zinc-700" : "border-gray-300"
                  }`}
                  value={form.origen_recursos_desc}
                  onChange={(e) =>
                    handleChange("origen_recursos_desc", e.target.value)
                  }
                  onBlur={blurValidate("origen_recursos_desc")}
                  placeholder="Ej: Ingresos por arrendamientos…"
                />
                {errors.origen_recursos_desc && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.origen_recursos_desc}
                  </p>
                )}
                <p
                  className={`text-xs leading-snug mb-4 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Los recursos provenientes de mi actividad económica no
                  provienen de actividades ilícitas, ni actividades contempladas
                  en el Código Penal Colombiano o en cualquier norma que lo
                  modifique o accione. En tal sentido, se obliga expresamente a
                  no destinar sus recursos, y en particular aquellos recursos
                  recibidos en desarrollo de la eventual relación con La
                  Compañía, a ninguna actividad ilícita de las previstas en el
                  Código Penal Colombiano o actividades de financiación o apoyo
                  directo o indirecto del terrorismo nacional o internacional;
                  b) En caso de ser requerido por parte de la Compañía o de
                  algún organismo de investigación, vigilancia y control del
                  estado, estoy dispuesto a suministrar los soportes requeridos
                  que evidencian el origen o destino de los recursos. c) Eximo a
                  la Compañía de toda responsabilidad que se derive por
                  información errónea, falsa o inexacta que yo hubiere
                  suministrado en este documento o de la violación del mismo. d)
                  Certifico que la información suministrada es veraz y
                  verificable y me obligo a actualizarla por lo menos una (1)
                  vez al año, o cada vez que así lo solicite La Compañía,
                  suministrando la totalidad de los soportes documentales
                  exigidos. e) Autorizo para que esta información sea
                  verificada, contrastada y analizada con las fuentes que la
                  Compañía considere adecuadas para garantizar la gestión del
                  riesgo de LA/FT/FPADM de acuerdo con Sistema Anti-LA/FT/FPADM.
                </p>
              </div>
            </section>

            {/* ====== POLÍTICAS ====== */}
            <section>
              <h3 className="text-sm font-semibold mb-3 opacity-80">
                Declaración de Políticas
              </h3>
              <p
                className={`text-xs leading-snug mb-4 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Con la firma y envío de este documento confirmo que he leído y
                entendido El Código de ética, y la Política SAGRILAFT de la
                Compañía (las "Políticas"), a las cuales tengo acceso en la
                página web: https://info.mxm.com.co/politicas-tratamiento-datos/
                o me las suministrará directamente la Compañía, si así lo
                solicito. Además, declaro lo siguiente: a) que acepto cumplir
                con las Políticas y revisar su contenido antes de participar en
                cualquier actividad que involucre a la Compañía, y que
                eventualmente pudiera estar en contravía de las Políticas. Si
                tengo alguna duda o inquietud en relación con la aplicación de
                las Políticas, me pondré en contacto con el Oficial de
                Cumplimiento por medio de la Línea Ética, para solicitar su
                orientación y acompañamiento con el fin de garantizar la
                adecuada aplicación de las Políticas; b) Que he conducido mi
                operación en cumplimiento con, y/o no he incurrido en Conductas
                Prohibidas por, las Leyes Anticorrupción y SAGRILAFT; c) Tomo
                medidas para evitar introducir recursos provenientes del lavado
                de activos o se financie el terrorismo y la Proliferación de
                armas de destrucción masiva; d)No estoy relacionado o tengo
                vínculos con personas que realizan Lavado de Activos,
                Financiación del Terrorismo y el Financiamiento de la
                Proliferación de armas de destrucción masiva; e) En caso de
                identificar cualquier tipo de operación intentada u Operación
                Sospechosa relacionada con el Lavado de Activos, Financiación
                del Terrorismo y Financiamiento de la Proliferación de armas de
                destrucción masiva, o si tengo conocimiento de alguna conducta
                sospechosa, no ética o violación a las normas o de las
                Políticas, seguiré los procedimientos para utilizar los canales
                establecidos por la Compañía en la Línea Ética ingresando a{" "}
                <a
                  className="underline"
                  href="https://info.mxm.com.co/politicas-tratamiento-datos/"
                  target="_blank"
                  rel="noreferrer"
                >
                  https://info.mxm.com.co/politicas-tratamiento-datos/
                </a>
                .
              </p>
              <CheckboxWithLabel
                id="acepta_politicas"
                checked={!!form.acepta_politicas}
                onChange={(e) =>
                  handleChange("acepta_politicas", e.target.checked)
                }
                onBlur={blurValidate("acepta_politicas")}
              >
                Acepto la Declaración de Políticas{" "}
                <span className="text-red-500">*</span>
              </CheckboxWithLabel>
              {errors.acepta_politicas && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.acepta_politicas}
                </p>
              )}
            </section>

            {/* ====== OTRAS DECLARACIONES ====== */}
            <section>
              <h3 className="text-sm font-semibold mb-3 opacity-80">
                Otras Declaraciones
              </h3>
              <div
                className={`text-xs leading-snug space-y-3 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <p>
                  1. Que yo, o la compañía que represento no nos encontramos en
                  las prohibiciones o inhabilidades para contratar, señaladas en
                  las leyes colombianas vigentes aplicables.<br></br> 2. Que en
                  cada una de mis actuaciones o de las actuaciones de la
                  compañía se preserva la dignificación del trabajo y la no
                  discriminación y se aplican prácticas de seguridad y
                  protección en el trabajo, de remuneración de acuerdo a la ley,
                  de equidad de género, religión, raza y de eliminación del
                  trabajo infantil. <br></br>3. Que a la firma de este documento
                  confirmo que leído y entendido el Código de Ética de la
                  Compañía, al cual tengo acceso a través de la página web:
                  https://info.mxm.com.co/politicas-tratamiento-datos/, y, en
                  consecuencia, me comprometo a cumplirlos. Que yo, o la
                  compañía que represento no tienemos ningún conflicto de
                  interés para contratar, y que en caso de existir durante la
                  vigencia de la relación jurídica con Supermercados Mas por
                  Menos S.A.S, lo reportaré de inmediato. <br></br>4. Que yo, o
                  la compañía que represento fomentamos y desarrollamos
                  prácticas ambientales dentro de los procesos productivos en
                  cumplimiento de las normas ambientales de conformidad con las
                  leyes vigentes. <br></br>5. Que a la firma de este documento
                  confirmo que he leído y entendido la Política de prevención de
                  LA, FT, FPADM de Supermercados Mas por Menos S.A.S, y así
                  mismo que conozco el Programa de Transparencia y Ética
                  Empresarial (PTEE) de Supermercados Mas por Menos S.A.S, así
                  como las consecuencias de infringirlo. Las Políticas las puedo
                  encontrar en la página web:
                  https://info.mxm.com.co/politicas-tratamiento-datos/.{" "}
                  <br></br>6. Que yo, o la compañía que represento acepto y
                  declaro conocer la posibilidad que tiene Supermercados Mas por
                  Menos S.A.S de adelantar, procedimientos de Debida Diligencia.
                </p>
              </div>
              <div className="mt-3">
                <CheckboxWithLabel
                  id="acepta_otras_declaraciones"
                  checked={!!form.acepta_otras_declaraciones}
                  onChange={(e) =>
                    handleChange("acepta_otras_declaraciones", e.target.checked)
                  }
                  onBlur={blurValidate("acepta_otras_declaraciones")}
                >
                  Acepto las Otras Declaraciones{" "}
                  <span className="text-red-500">*</span>
                </CheckboxWithLabel>
                {errors.acepta_otras_declaraciones && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.acepta_otras_declaraciones}
                  </p>
                )}
              </div>
            </section>

            {/* ====== VERACIDAD ====== */}
            <section>
              <h3 className="text-sm font-semibold mb-3 opacity-80">
                Declaración de Veracidad de la Información
              </h3>
              <p
                className={`text-xs leading-snug mb-3 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Declaro que toda la información inscrita en el presente
                formulario y en los soportes que lo acompañan son veraces y
                autorizo a la Compañía para corroborar la información
                suministrada. Admito que cualquier falsedad, omisión inexactitud
                en la información podrá dar lugar al rechazo de mi inscripción
                como proveedor, cliente, acreedor o deudor de La Compañía y al
                cobro de la indemnización por los daños, que debidamente
                probados, llegue a causar a La Compañía.
              </p>
              <CheckboxWithLabel
                id="acepta_veracidad_info"
                checked={!!form.acepta_veracidad_info}
                onChange={(e) =>
                  handleChange("acepta_veracidad_info", e.target.checked)
                }
                onBlur={blurValidate("acepta_veracidad_info")}
              >
                Acepto la Declaración de Veracidad de la Información{" "}
                <span className="text-red-500">*</span>
              </CheckboxWithLabel>
              {errors.acepta_veracidad_info && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.acepta_veracidad_info}
                </p>
              )}
            </section>

            {/* ====== DATOS PERSONALES ====== */}
            <section>
              <h3 className="text-sm font-semibold mb-3 opacity-80">
                Autorización para el Tratamiento de Datos Personales Mas x Menos
                S.A.S
              </h3>
              <div
                className={`text-xs leading-snug space-y-3 mb-3 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <p>
                  Autorizo el tratamiento de los datos personales de manera
                  previa, expresa e informada a Supermercados Mas por Menos
                  S.A.S. con NIT 900119072-8 en adelante “la Compañía” con
                  domicilio principal en la ciudad de Bucaramanga. Colombia,
                  correo electrónico notificaciones.mxm@mxm.com.co y teléfono
                  (607) 6370099 Ext100, para capturar, almacenar, usar,
                  circular, suprimir, transmitir o transferir a Encargados o
                  Responsables, la información personal entregada o por
                  entregarse, para los siguientes fines:
                </p>
                <p>
                  <br></br> 1.Expedir o solicitar facturas, o información
                  relacionada con estas, certificados de retención en la fuente,
                  paz y salvos y cualquier otro documento necesario que se deba
                  suscribir en cuanto a la relación contractual o comercial del
                  tercero objeto de vinculación.<br></br> 2. Procesar pagos a mi
                  favor.
                  <br></br> 3. Contactar y/o compartir información de interés
                  general, para actividades de formación, encuestas, temas
                  comerciales, promocionales, de venta o servicios cuando la
                  Compañía lo considere pertinente a través de correo físico o
                  electrónico, vía mensaje de datos (SMS O MMS), vía WhatsApp,
                  llamadas telefónicas que podrán ser grabadas, o cualquier
                  medio análogo o digital permitido por la Ley creado o por
                  crearse.<br></br> 4. Conocer y tratar los datos personales de
                  los empleados y contratistas que emplee para la prestación de
                  los servicios o la adquisición de bienes.<br></br> 5. Evaluar
                  el cumplimiento de la prestación de los servicios contratados
                  o la adquisición de bienes.<br></br> 6. Realizar análisis
                  estadísticos y reportes de mercadeo.<br></br> 7. Transferir y
                  transmitir esta información a distintas áreas de la Compañía y
                  a sus entidades vinculadas y Encargados del tratamiento, para
                  evaluar la idoneidad del proveedor; o cuando ello sea
                  necesario para el desarrollo de sus operaciones.<br></br> 8.
                  Exigir el cumplimiento de los servicios contratados.<br></br>{" "}
                  9. Autorizar el ingreso de contratistas y empleados a mi
                  cargo, a las instalaciones de Compañía. <br></br> 10.
                  Implementar medidas de seguridad industrial adecuadas para el
                  ingreso a las instalaciones. <br></br> 11. Gestionar la
                  prestación médica de emergencias, de ser requerido. <br></br>{" "}
                  12. Realizar consultas y/o reportes de antecedentes
                  comerciales, reputacionales, financieros, antecedentes
                  disciplinarios, judiciales, eventuales riesgos de
                  relacionamientos asociados al Lavado de Activos y Financiación
                  del terrorismo, corrupción, soborno trasnacional, conflictos
                  de interés y otras actividades ilícitas, que permitan un
                  adecuado conocimiento y gestión de la contraparte.
                  <br></br> 13. Captar a través de cámaras de video vigilancia
                  imágenes y sonidos que serán almacenados por la Compañía para
                  la para la seguridad de sus visitantes y colaboradores.{" "}
                  <br></br> 14. Cualquier otra actividad de naturaleza similar a
                  las anteriormente descritas que sean necesarias para
                  desarrollar el objeto social de la Compañía, y las demás
                  finalidades contempladas en la Política de Tratamiento de
                  Datos Personales.
                </p>
                <p>
                  Manifiesto que estoy informado que el tratamiento de datos
                  sensibles pueden afectar la intimidad de una persona o su uso
                  indebido puede generar discriminación, por lo que se hace
                  necesario indicar que reconozco que no estoy obligado a
                  contestar o a brindar este tipo de información que se
                  considera como sensible, sin embargo, consciente de lo antes
                  mencionado en caso de requerirse alguno de estos datos
                  especialmente aquellos como los datos biométricos o de
                  geolocalización, autorizo de manera previa, expresa, e
                  informada, el tratamiento de estos datos.
                </p>
                <p>
                  Conozco que tengo derecho a acceder y/o consultar mi
                  información, actualizar, corregir, suprimir, solicitar prueba
                  o soporte del consentimiento y/o a recovar el mismo parcial o
                  totalmente, siempre que no exista una obligación contractual,
                  comercial, legal y/o regulatoria que lo impida, así como a
                  interponer reclamos ante la Superintendencia de industria y
                  Comercio (SIC) cuando considere que mis derechos no fueron
                  atendidos o fueron vulnerados.
                </p>
                <p>
                  La Política de tratamiento de información de Supermercados Mas
                  por Menos la encuentro para consulta en{" "}
                  <a
                    href="https://info.mxm.com.co/politicas-tratamiento-datos/"
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    https://info.mxm.com.co/politicas-tratamiento-datos/
                  </a>{" "}
                  y en ella encuentro los canales para el ejercicio de mis
                  derechos.
                </p>
              </div>
              <CheckboxWithLabel
                id="acepta_tratamiento_datos"
                checked={!!form.acepta_tratamiento_datos}
                onChange={(e) =>
                  handleChange("acepta_tratamiento_datos", e.target.checked)
                }
                onBlur={blurValidate("acepta_tratamiento_datos")}
              >
                Acepto la Autorización de Tratamiento de Datos Personales{" "}
                <span className="text-red-500">*</span>
              </CheckboxWithLabel>
              {errors.acepta_tratamiento_datos && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.acepta_tratamiento_datos}
                </p>
              )}
            </section>

            {/* ====== DOCUMENTOS (MODO DIFERIDO) ====== */}
            <section id="docs-section">
              <h3 className="text-sm font-semibold mb-3 opacity-80">Documentos para Vinculación</h3>
              {isTrue(form.obligado_fe) && (
                <p className={`text-xs mb-2 ${isDark ? "text-yellow-300" : "text-yellow-700"}`}>
                  Marcaste que estás obligado a emitir factura electrónica: debes subir la “Autorización de facturación DIAN vigente”.
                </p>
              )}
              <KycDocumentsUploader
                mode="deferred"
                isDark={isDark}
                token={token}
                requiredCodes={requiredDocCodes}
                missingCodes={missingCodes}
                queue={queuedDocs}
                onQueueChange={setQueuedDocs}
              />
              {missingCodes.length > 0 && (
                <p className={`text-xs mt-2 ${isDark ? "text-red-400" : "text-red-600"}`}>
                  Debes adjuntar todos los documentos obligatorios antes de enviar.
                </p>
              )}
            </section>


            {/* Errores globales */}
            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* Acciones */}
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => navigate("/inicio", { replace: true })}
                className={`px-4 py-2 rounded border text-sm ${
                  isDark
                    ? "border-zinc-700 hover:bg-zinc-800"
                    : "border-gray-300 hover:bg-gray-200"
                }`}
              >
                Salir
              </button>
              <PrimaryButton type="submit" disabled={saving}>
  {saving ? "Guardando…" : "Enviar"}
</PrimaryButton>

            </div>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}
