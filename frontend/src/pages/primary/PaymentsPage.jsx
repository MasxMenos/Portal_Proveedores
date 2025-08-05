// src/pages/payments/PaymentsPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import EntidadPage from "../../layouts/EntityPage";
import { useTheme } from "../../components/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function PaymentsPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // --- NIT del usuario ---
  const stored = localStorage.getItem("user");
  const user   = stored ? JSON.parse(stored) : null;
  const nit    = user?.username || "";

  // ──────────────────────────────────────────────
  // 1) Botones extra (memoizados para mantener la misma referencia)
  const botones = useMemo(() => [
    { label: t("entity.payments.buttons.egressTransferCertificate"),      tipo: "CET" },
    { label: t("entity.payments.buttons.receivablesReclassification"),   tipo: "RCC" },
  ], [t]);

  // ──────────────────────────────────────────────
  // 2) Persistencia en localStorage de filtros
  const STORAGE_SEL  = "PaymentsPage:selectedIndex";
  const STORAGE_FROM = "PaymentsPage:fromDate";
  const STORAGE_TO   = "PaymentsPage:toDate";

  const [selectedIndex, setSelectedIndex] = useState(() => {
    const saved = localStorage.getItem(STORAGE_SEL);
    return saved !== null ? parseInt(saved, 10) : 0;
  });
  const [fechaInicio, setFechaInicio] = useState(() => localStorage.getItem(STORAGE_FROM) || "");
  const [fechaFin,    setFechaFin]    = useState(() => localStorage.getItem(STORAGE_TO)   || "");

  useEffect(() => { localStorage.setItem(STORAGE_SEL,  selectedIndex); }, [selectedIndex]);
  useEffect(() => { localStorage.setItem(STORAGE_FROM, fechaInicio);   }, [fechaInicio]);
  useEffect(() => { localStorage.setItem(STORAGE_TO,   fechaFin);      }, [fechaFin]);

  // ──────────────────────────────────────────────
  // 3) Estado de datos
  const [datos,   setDatos]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // ──────────────────────────────────────────────
  // 4) fetchPayments (memoizado)
  const fetchPayments = useCallback(
    async (tipoDocto) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ tipoDocto, nit });
        if (fechaInicio) params.set("from", fechaInicio);
        if (fechaFin)    params.set("to",   fechaFin);

        const res = await fetch(`/api/payments/?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = await res.json();

        // Filtrado adicional en frontend
        const filtrados = raw.filter(item => {
          const f = new Date(item.FechaProveedor);
          if (fechaInicio && f < new Date(fechaInicio)) return false;
          if (fechaFin   && f > new Date(fechaFin))   return false;
          return true;
        });

        setDatos(filtrados);
      } catch (err) {
        console.error("Error cargando pagos:", err);
        setError(err.message || t("errors.generic", "Error al cargar datos"));
        setDatos([]);
      } finally {
        setLoading(false);
      }
    },
    [nit, fechaInicio, fechaFin, t]
  );

  // ──────────────────────────────────────────────
  // 5) Carga inicial (solo al montar)
  useEffect(() => {
    fetchPayments(botones[selectedIndex].tipo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 6) Recarga al cambiar botón o fechas (sin incluir 'botones' en deps)
  useEffect(() => {
    fetchPayments(botones[selectedIndex].tipo);
  }, [selectedIndex, fetchPayments]);

  // ──────────────────────────────────────────────
  // 7) Handler de selección de botón
  const handleButtonClick = (idx) => {
    if (idx !== selectedIndex) {
      setSelectedIndex(idx);
    }
  };

  return (
    <EntidadPage
      tipo="payments"
      titulo={t("sidebar.payments")}
      encabezado={t("sidebar.payments")}
      datos={datos}
      onNavigateBase="payments"
      botonesExtra={botones.map(b => b.label)}
      extraFilters={{
        start: fechaInicio,
        end:   fechaFin,
        onStartChange: (v) => setFechaInicio(v),
        onEndChange:   (v) => setFechaFin(v),
        onConsultar:   () => fetchPayments(botones[selectedIndex].tipo),
      }}
      loading={loading}
      error={error}
      selectedButtonIndex={selectedIndex}
      onSelectButton={handleButtonClick}
    />
  );
}
