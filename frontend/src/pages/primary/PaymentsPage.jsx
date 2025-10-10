// src/pages/payments/PaymentsPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import EntidadPage from "../../layouts/EntityPage";
import { useTheme } from "../../components/ThemeContext";
import { useDateRange } from "../../hooks/useDateRange";

export default function PaymentsPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const nit = user?.username || "";
  const isAdmin = !!user?.is_admin;

  const botones = useMemo(() => ([
    { label: t("entity.payments.buttons.egressTransferCertificate"), tipo: "CET" },
    { label: t("entity.payments.buttons.receivablesReclassification"), tipo: "RCC" },
  ]), [t]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    start: fechaInicio,
    end: fechaFin,
    onStartChange,
    onEndChange,
  } = useDateRange();

  // Admin provider picker
  const [provQuery, setProvQuery] = useState("");
  const [provOptions, setProvOptions] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    const ctrl = new AbortController();
    const h = setTimeout(async () => {
      try {
        const q = provQuery.trim();
        const url = new URL("/api/users/providers", window.location.origin);
        if (q) url.searchParams.set("q", q);
         const access = localStorage.getItem("accessToken");
         const res = await fetch(url.toString(), {
           signal: ctrl.signal,
           headers: access ? { Authorization: `Bearer ${access}` } : {},
         });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const list = await res.json();
        setProvOptions(Array.isArray(list) ? list : []);
      } catch (e) {
        if (e.name !== "AbortError") setProvOptions([]);
      }
    }, 300);
    return () => { clearTimeout(h); ctrl.abort(); };
  }, [provQuery, isAdmin]);

  const effectiveNit = isAdmin ? (selectedProvider?.usuario || "") : nit;

  const fetchPayments = useCallback(
    async (tipoDocto) => {
      if (!effectiveNit) { setDatos([]); return; }
      setLoading(true);
      try {
        const params = new URLSearchParams({ tipoDocto, nit: effectiveNit });
        if (fechaInicio) params.set("from", fechaInicio);
        if (fechaFin) params.set("to", fechaFin);

        const res = await fetch(`/api/payments/?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = await res.json();

        const filtrados = raw.filter((item) => {
          const fechaStr =
            item.fechaProveedor ?? item.FechaProveedor ?? item.fecha ?? item.Fecha ?? null;
          if (!fechaStr) return true;
          const f = new Date(fechaStr);
          if (fechaInicio && f < new Date(fechaInicio)) return false;
          if (fechaFin && f > new Date(fechaFin)) return false;
          return true;
        });

        setDatos(filtrados);
      } catch (err) {
        setDatos([]);
      } finally {
        setLoading(false);
      }
    },
    [effectiveNit, fechaInicio, fechaFin]
  );

  useEffect(() => {
    if (effectiveNit) fetchPayments(botones[0].tipo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveNit]);

  const handleButtonClick = (idx) => {
    setSelectedIndex(idx);
    fetchPayments(botones[idx].tipo);
  };

  const AdminProviderFilter = isAdmin ? (
    <div className="flex flex-col gap-2">
      <label className="text-sm opacity-80">Proveedor</label>
      <input
        className={`px-3 py-2 rounded ${isDark ? "bg-[#0b0f12] border-[#1c2329] text-white" : "bg-white border-gray-300"} border`}
        placeholder="Buscar por descripción…"
        value={provQuery}
        onChange={(e) => setProvQuery(e.target.value)}
      />
      {provOptions.length > 0 && (
        <ul className={`max-h-48 overflow-auto border rounded ${isDark ? "border-[#1c2329]" : "border-gray-300"}`}>
          {provOptions.map((p) => (
            <li
              key={p.usuario}
              className={`px-3 py-2 cursor-pointer hover:opacity-80 ${isDark ? "text-white" : "text-black"}`}
              onClick={() => {
                setSelectedProvider(p);
                setProvQuery(p.descripcion || p.usuario);
              }}
            >
              <div className="text-sm font-medium">{p.descripcion || "(Sin descripción)"}</div>
              <div className="text-xs opacity-70">{p.usuario}</div>
            </li>
          ))}
        </ul>
      )}
      {selectedProvider && (
        <div className="text-xs opacity-70">
          Seleccionado: <b>{selectedProvider.descripcion || selectedProvider.usuario}</b> ({selectedProvider.usuario})
        </div>
      )}
    </div>
  ) : null;

  return (
    <div className="space-y-4">
      <EntidadPage
        tipo="payments"
        titulo={t("sidebar.payments")}
        encabezado={t("sidebar.payments")}
        datos={datos}
        onNavigateBase="payments"
        botonesExtra={botones.map((b) => b.label)}
        extraFilters={{
          fechaInicio,
          fechaFin,
          onStartChange,
          onEndChange,
          onConsultar: () => fetchPayments(botones[selectedIndex].tipo),
          adminFilterSlot: AdminProviderFilter,
        }}
        loading={loading}
        selectedButtonIndex={selectedIndex}
        onSelectButton={handleButtonClick}
      />
    </div>
  );
}
