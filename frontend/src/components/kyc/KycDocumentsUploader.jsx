// frontend/src/pages/auth/kyc/components/KycDocumentsUploader.jsx
import React, { useMemo, useRef, useState } from "react";

// Catálogo base (coincidir con backend)
const DOC_TYPES = [
  { code: "RUT",         label: "Copia del RUT (No superior a 30 días)", dateLabel: "Fecha del RUT" },
  { code: "CERT_CUENTA", label: "Certificado de cuenta bancaria (No superior a 30 días)", dateLabel: "Fecha del certificado" },
  { code: "REF_COMERCIAL", label: "Una (1) Referencia Comercial (No mayor a 30 días)", dateLabel: "Fecha de expedición" },
  { code: "CC",          label: "Fotocopia de cédula de ciudadanía" },
  { code: "AUT_DIAN",    label: "Autorización de facturación DIAN vigente" },
];

export default function KycDocumentsUploader({
  token,
  // submissionId  // <- NO se usa en modo diferido
  requiredCodes = [],
  missingCodes = [],
  isDark,
  onUploaded,          // se usa solo en modo immediate (opcional)
  mode = "immediate",  // NEW: "immediate" | "deferred"
  queue,               // NEW: { [code]: { file, date } }
  onQueueChange,       // NEW
}) {
  // Mostrar SOLO los tipos requeridos si te interesa. Si quieres mostrar todos, usa DOC_TYPES sin filtrar.
  const typesToShow = useMemo(() => {
    if (!requiredCodes || requiredCodes.length === 0) return DOC_TYPES;
    const requiredSet = new Set(requiredCodes);
    return DOC_TYPES.filter(dt => requiredSet.has(dt.code));
  }, [requiredCodes]);

  const [files, setFiles] = useState({});   // code -> File (selección local)
  const [dates, setDates] = useState({});   // code -> 'YYYY-MM-DD'
  const [busy, setBusy] = useState(null);   // code en acción
  const [msg, setMsg] = useState({});       // code -> mensaje

  // refs a inputs ocultos por código
  const inputRefs = useRef({});

  const pickFile = (code) => {
    if (!inputRefs.current[code]) return;
    inputRefs.current[code].click();
  };

  const onFileChange = (code, file) => {
    setFiles(m => ({ ...m, [code]: file || null }));
    setMsg(m => ({ ...m, [code]: "" }));
  };

  const onDateChange = (code, value) => {
    setDates(m => ({ ...m, [code]: value || "" }));
    setMsg(m => ({ ...m, [code]: "" }));
  };

    const addToQueue = (code) => {
    const cfg = typesToShow.find(t => t.code === code);
    const needDate = !!cfg?.dateLabel;
    const file = files[code] || null;
    const date = dates[code] || "";
    if (!file) { setMsg(m => ({ ...m, [code]: "Selecciona un archivo." })); return; }
    if (needDate && !date) { setMsg(m => ({ ...m, [code]: "Debes indicar la fecha." })); return; }
    const current = queue || {};
    const next = { ...current, [code]: { file, date: needDate ? date : undefined } };
    onQueueChange && onQueueChange(next);
    setMsg(m => ({ ...m, [code]: "Agregado a la cola. Se subirá al guardar." }));
  };

  const uploadOneImmediate = async (code) => {
    setMsg(m => ({ ...m, [code]: "" }));
    const cfg = typesToShow.find(t => t.code === code);
    const needDate = !!cfg?.dateLabel;

    const file = files[code] || null;
    const date = dates[code] || "";

    if (!file) {
      setMsg(m => ({ ...m, [code]: "Selecciona un archivo." }));
      return;
    }
    if (needDate && !date) {
      setMsg(m => ({ ...m, [code]: "Debes indicar la fecha." }));
      return;
    }

    const formData = new FormData();
    formData.append("tipo", code);
    formData.append("file", file);
    if (needDate) formData.append("fecha", date);

    setBusy(code);
    try {
      const res = await fetch("/api/kyc/submissions/documents/upload/", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || `Error HTTP ${res.status}`);

      // limpiar selección para ese code
      setFiles(m => ({ ...m, [code]: null }));
      // notificar OK
      setMsg(m => ({ ...m, [code]: "Subido correctamente." }));
      // avisa al padre para que refresque status
      onUploaded && onUploaded();
    } catch (e) {
      setMsg(m => ({ ...m, [code]: e.message }));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5">
      {typesToShow.map((dt) => {
        const needDate = !!dt.dateLabel;
        const file = files[dt.code] || null;
        const date = dates[dt.code] || "";
        const disableUpload = !file || (needDate && !date) || !!busy;
        const required = (requiredCodes || []).includes(dt.code);
        const missing  = (missingCodes || []).includes(dt.code);

        return (
          <div key={dt.code} className={`rounded-lg p-3 ${isDark ? "bg-[#0f0f0f] border border-zinc-800" : "bg-gray-50 border border-gray-200"}`}>
            <p className="text-sm font-medium mb-2">
             {dt.label}
 {required && (
   <span
     className={
       "ml-2 text-xs px-2 py-0.5 rounded " +
       (missing
         ? "bg-red-100 text-red-700"
         : (isDark ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-700"))
     }
   >
     Requerido{!missing ? " ✓" : ""}
   </span>
 )}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              {needDate && (
                <div>
                  <label className="text-xs block mb-1">{dt.dateLabel}</label>
                  <input
                    type="date"
                    className={`w-full border rounded px-3 py-2 bg-transparent ${isDark ? "border-zinc-700" : "border-gray-300"}`}
                    value={date}
                    onChange={(e) => onDateChange(dt.code, e.target.value)}
                  />
                </div>
              )}

              {/* input file oculto */}
              <input
                ref={(el) => (inputRefs.current[dt.code] = el)}
                type="file"
                className="hidden"
                onChange={(e) => onFileChange(dt.code, e.target.files?.[0] || null)}
              />

              <div className={needDate ? "" : "md:col-span-2"}>
                <label className="text-xs block mb-1">Archivo</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => pickFile(dt.code)}
                    className={`px-3 py-2 rounded text-sm border ${isDark ? "border-zinc-700 hover:bg-zinc-900 text-white" : "border-gray-300 hover:bg-gray-100"}`}
                  >
                    Seleccionar…
                  </button>
                  <span className="text-xs truncate max-w-[240px]">{file ? file.name : "Ningún archivo seleccionado"}</span>
                </div>
              </div>
              <div className="flex items-center md:justify-end">
                {mode === "deferred" ? (
                  <button
                    type="button"
                    onClick={() => addToQueue(dt.code)}
                    disabled={disableUpload}
                    className={`px-4 py-2 rounded text-sm ${disableUpload ? "opacity-50 cursor-not-allowed" : (isDark ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-gray-900 hover:bg-black text-white")}`}
                  >
                    Agregar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => uploadOneImmediate(dt.code)}
                    disabled={disableUpload}
                    className={`px-4 py-2 rounded text-sm ${disableUpload ? "opacity-50 cursor-not-allowed" : (isDark ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-gray-900 hover:bg-black text-white")}`}
                  >
                    {busy === dt.code ? "Subiendo…" : "Subir"}
                  </button>
                )}
              </div>
            </div>

            {!!(msg[dt.code]) && (
              <p className={`text-xs mt-2 ${/correctamente|cola/i.test(msg[dt.code]) ? (isDark ? "text-green-400" : "text-green-600") : (isDark ? "text-red-400" : "text-red-600")}`}>
                {msg[dt.code]}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
