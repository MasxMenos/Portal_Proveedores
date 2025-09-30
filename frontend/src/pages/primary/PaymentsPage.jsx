// src/pages/payments/PaymentsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import EntidadPage from "../../layouts/EntityPage";
import { useTheme } from "../../components/ThemeContext";
import { useDateRange } from "../../hooks/useDateRange";

export default function PaymentsPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Usuario / NIT
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const nit = user?.username || "";

  // Botones (tipos de documento)
  const botones = [
    { label: t("entity.payments.buttons.egressTransferCertificate"), tipo: "CET" },
    { label: t("entity.payments.buttons.receivablesReclassification"), tipo: "RCC" },
  ];

  // Estado UI
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Rango de fechas (mismo hook/patrones que InvoicesPage)
  const {
    start: fechaInicio,
    end: fechaFin,
    onStartChange,
    onEndChange,
  } = useDateRange();

  // Fetch de pagos
  const fetchPayments = useCallback(
    async (tipoDocto) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ tipoDocto, nit });
        if (fechaInicio) params.set("from", fechaInicio);
        if (fechaFin) params.set("to", fechaFin);

        const res = await fetch(`/api/payments/?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = await res.json();

       
        const filtrados = raw.filter((item) => {
          const fechaStr =
            item.fechaProveedor ??
            item.FechaProveedor ??
            item.fecha ??
            item.Fecha ??
            null;

          if (!fechaStr) return true; // si no hay fecha, no filtramos ese ítem
          const f = new Date(fechaStr);
          if (fechaInicio && f < new Date(fechaInicio)) return false;
          if (fechaFin && f > new Date(fechaFin)) return false;
          return true;
        });

        setDatos(filtrados);
      } catch (err) {
        // console.error("Error cargando pagos:", err);
        setDatos([]);
      } finally {
        setLoading(false);
      }
    },
    [nit, fechaInicio, fechaFin]
  );

  // Arranque: consultar primer botón por defecto
  useEffect(() => {
    if (nit) {
      fetchPayments(botones[0].tipo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nit]);

  // Click en botón
  const handleButtonClick = (idx) => {
    setSelectedIndex(idx);
    fetchPayments(botones[idx].tipo);
  };

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
        }}
        loading={loading}
        selectedButtonIndex={selectedIndex}
        onSelectButton={handleButtonClick}
      />
    </div>
  );
}
