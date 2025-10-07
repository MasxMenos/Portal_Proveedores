// frontend/src/pages/auth/kyc/components/KycDocumentsUploader.jsx
import React, { useMemo, useRef, useState } from "react";

// Catálogo base (coincidir con backend)
const DOC_TYPES = [
  { code: "RUT",            label: "Copia del RUT (No mayor a 30 días)", dateLabel: "Fecha del RUT" },
  { code: "CERT_CUENTA",    label: "Certificado de cuenta bancaria (No mayor a 30 días)", dateLabel: "Fecha del certificado" },
  { code: "REF_COMERCIAL",  label: "Referencias Comerciales (No mayores a 30 días) -  Requeridas (mínimo 2)", dateLabel: "Fecha de expedición" },
  { code: "CC",             label: "Fotocopia de cédula de ciudadanía" },
  { code: "AUT_DIAN",       label: "Autorización de facturación DIAN vigente" },
];

export default function KycDocumentsUploader({
  token,
  requiredCodes = [],
  missingCodes = [],
  isDark,
  onUploaded,          // solo modo immediate (opcional)
  mode = "immediate",  // "immediate" | "deferred"
  queue,               // { [code]: { file,date } | { files:[{file,date}, ...] } }
  onQueueChange,
}) {
  const typesToShow = useMemo(() => {
    if (!requiredCodes || requiredCodes.length === 0) return DOC_TYPES;
    const requiredSet = new Set(requiredCodes);
    return DOC_TYPES.filter(dt => requiredSet.has(dt.code));
  }, [requiredCodes]);

  // Selección simple (todos los docs salvo REF_COMERCIAL)
  const [files, setFiles] = useState({});   // code -> File
  const [dates, setDates] = useState({});   // code -> 'YYYY-MM-DD'
  const [busy, setBusy] = useState(null);   // code en acción
  const [msg, setMsg] = useState({});       // code -> mensaje

  // Manejo especial multi para REF_COMERCIAL (lista local antes de “Agregar” a cola)
  const [refComList, setRefComList] = useState([]); // [{file, date}]
  const [refComTmpFile, setRefComTmpFile] = useState(null);
  const [refComTmpDate, setRefComTmpDate] = useState("");

  // refs a <input type="file"> ocultos por código
  const inputRefs = useRef({});
  const pickFile = (code) => inputRefs.current[code]?.click();

  const onFileChange = (code, file) => {
    setFiles(m => ({ ...m, [code]: file || null }));
    setMsg(m => ({ ...m, [code]: "" }));
  };
  const onDateChange = (code, value) => {
    setDates(m => ({ ...m, [code]: value || "" }));
    setMsg(m => ({ ...m, [code]: "" }));
  };

  // —— REF_COMERCIAL helpers ——
  const addTmpRef = () => {
    if (!refComTmpFile) {
      setMsg(m => ({ ...m, REF_COMERCIAL: "Selecciona un archivo." }));
      return;
    }
    if (!refComTmpDate) {
      setMsg(m => ({ ...m, REF_COMERCIAL: "Debes indicar la fecha." }));
      return;
    }
    setRefComList(list => [...list, { file: refComTmpFile, date: refComTmpDate }]);
    setRefComTmpFile(null);
    setRefComTmpDate("");
    setMsg(m => ({ ...m, REF_COMERCIAL: "" }));
  };

  const removeRefAt = (idx) => {
    setRefComList(list => list.filter((_, i) => i !== idx));
  };

  const addToQueueRefComercial = () => {
    if (refComList.length < 2) {
      setMsg(m => ({ ...m, REF_COMERCIAL: "Debes agregar mínimo 2 referencias comerciales." }));
      return;
    }
    const current = queue || {};
    const next = { ...current, REF_COMERCIAL: { files: refComList.slice() } };
    onQueueChange && onQueueChange(next);
    setMsg(m => ({ ...m, REF_COMERCIAL: "Agregadas a la cola. Se subirán al guardar." }));
  };

  const addToQueueSingle = (code) => {
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
    if (!file) { setMsg(m => ({ ...m, [code]: "Selecciona un archivo." })); return; }
    if (needDate && !date) { setMsg(m => ({ ...m, [code]: "Debes indicar la fecha." })); return; }

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
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || `Error HTTP ${res.status}`);

      setFiles(m => ({ ...m, [code]: null }));
      setMsg(m => ({ ...m, [code]: "Subido correctamente." }));
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
        const required = (requiredCodes || []).includes(dt.code);
        const missing  = (missingCodes || []).includes(dt.code);
        const needDate = !!dt.dateLabel;

        // —————————————— REF_COMERCIAL (multi) ——————————————
        if (dt.code === "REF_COMERCIAL" && mode === "deferred") {
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
                    Requerido{!missing ? " ✓" : ""} — mínimo 2 archivos
                  </span>
                )}
              </p>

              {/* Editor de ítems de referencia comercial */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                {/* Fecha */}
                <div>
                  <label className="text-xs block mb-1">{dt.dateLabel}</label>
                  <input
                    type="date"
                    className={`w-full border rounded px-3 py-2 bg-transparent ${isDark ? "border-zinc-700" : "border-gray-300"}`}
                    value={refComTmpDate}
                    onChange={(e) => setRefComTmpDate(e.target.value)}
                  />
                </div>

                {/* Input file oculto */}
                <input
                  ref={(el) => (inputRefs.current[dt.code] = el)}
                  type="file"
                  className="hidden"
                  onChange={(e) => setRefComTmpFile(e.target.files?.[0] || null)}
                />

                {/* Selector de archivo */}
                <div className="md:col-span-2">
                  <label className="text-xs block mb-1">Archivo</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => pickFile(dt.code)}
                      className={`px-3 py-2 rounded text-sm border ${isDark ? "border-zinc-700 hover:bg-zinc-900 text-white" : "border-gray-300 hover:bg-gray-100"}`}
                    >
                      Seleccionar…
                    </button>
                    <span className="text-xs truncate max-w-[240px]">
                      {refComTmpFile ? refComTmpFile.name : "Ningún archivo seleccionado"}
                    </span>
                    <button
                      type="button"
                      onClick={addTmpRef}
                      className={`ml-auto px-3 py-2 rounded text-sm ${isDark ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-gray-900 hover:bg-black text-white"}`}
                    >
                      Añadir a la lista
                    </button>
                  </div>
                </div>
              </div>

              {/* Lista de referencias agregadas localmente */}
              {refComList.length > 0 && (
                <div className="mt-3 space-y-2">
                  {refComList.map((it, idx) => (
                    <div key={idx} className={`flex items-center justify-between text-xs rounded px-3 py-2 ${isDark ? "bg-zinc-900" : "bg-white border border-gray-200"}`}>
                      <div className="truncate">
                        <span className="font-medium">{it.file?.name}</span>
                        {it.date ? <span className="ml-2 opacity-70">({it.date})</span> : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRefAt(idx)}
                        className={`px-2 py-1 rounded ${isDark ? "hover:bg-zinc-800" : "hover:bg-gray-100"}`}
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Agregar TODAS a la cola (mínimo 2) */}
              <div className="mt-3 flex items-center md:justify-end">
                <button
                  type="button"
                  onClick={addToQueueRefComercial}
                  disabled={refComList.length < 2}
                  className={`px-4 py-2 rounded text-sm ${refComList.length < 2 ? "opacity-50 cursor-not-allowed" : (isDark ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-gray-900 hover:bg-black text-white")}`}
                >
                  Agregar {refComList.length > 0 ? `(${refComList.length})` : ""}
                </button>
              </div>

              {!!msg.REF_COMERCIAL && (
                <p className={`text-xs mt-2 ${/cola|mínimo|Agregadas/i.test(msg.REF_COMERCIAL) ? (isDark ? "text-green-400" : "text-green-600") : (isDark ? "text-red-400" : "text-red-600")}`}>
                  {msg.REF_COMERCIAL}
                </p>
              )}
            </div>
          );
        }

        // —————————————— Resto de documentos (uno a uno) ——————————————
        const file = files[dt.code] || null;
        const date = dates[dt.code] || "";
        const disableUpload = !file || (needDate && !date) || !!busy;

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
                    onClick={() => addToQueueSingle(dt.code)}
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

            {!!msg[dt.code] && (
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
