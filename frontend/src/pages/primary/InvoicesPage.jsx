// src/pages/invoicesPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import EntidadPage from "../../layouts/EntityPage";
import { useDateRange } from "../../hooks/useDateRange";
import { useTheme } from "../../components/ThemeContext";

export default function invoicesPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // 1) botones extra con su tipo de documento asociado
  const botones = [
    { label: t("entity.invoices.buttons.electronicInvoices"),        tipo: "FVE" },
    { label: t("entity.invoices.buttons.commercialAgreementNotes"),   tipo: "NAC" },
    { label: t("entity.invoices.buttons.electronicCreditNotes"),      tipo: "NCE" },
  ];

  // 2) estado de selección del botón
  const [selectedIndex, setSelectedIndex] = useState(0);
  // 3) datos y loading
  const [datos, setDatos]     = useState([]);
  const [loading, setLoading] = useState(false);

  // 4) filtros de fecha (rango)
  const {
    start: fechaInicio,
    end:   fechaFin,
    onStartChange,
    onEndChange,
  } = useDateRange();

  // 5) función de fetch parametrizada
  const fetchInvoices = useCallback(
    async (tipoDocto) => {
      setLoading(true);
      try {
        // Parámetros base
        const params = new URLSearchParams({
          tipoDocto,
          nit: "891300382",
        });
        // Solo agregamos fechas al query (el backend no las requiere)
        if (fechaInicio) params.set("from", fechaInicio);
        if (fechaFin)   params.set("to",   fechaFin);

        const res = await fetch(`/api/invoices/?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = await res.json();

        // Filtrado extra en frontend por FechaProveedor
        const filtrados = raw.filter(item => {
          const f = new Date(item.FechaProveedor);
          if (fechaInicio && f < new Date(fechaInicio)) return false;
          if (fechaFin   && f > new Date(fechaFin))   return false;
          return true;
        });

        setDatos(filtrados);
      } catch (err) {
        console.error("Error cargando devoluciones:", err);
        setDatos([]);
      } finally {
        setLoading(false);
      }
    },
    [fechaInicio, fechaFin]
  );

  // 6) ARRANQUE: consultamos “FVE” por defecto
  useEffect(() => {
    fetchInvoices(botones[0].tipo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // solo al mount

  // 7) manejador al click en un botón extra
  const handleButtonClick = (idx) => {
    setSelectedIndex(idx);
    fetchInvoices(botones[idx].tipo);
  };

  return (
    <EntidadPage
      tipo="invoices"
      titulo={t("sidebar.invoices")}
      encabezado={t("sidebar.invoices")}
      datos={datos}
      onNavigateBase="invoices"
      botonesExtra={botones.map(b => b.label)}
      extraFilters={{
        fechaInicio,
        fechaFin,
        onStartChange,
        onEndChange,
        onConsultar: () => fetchInvoices(botones[selectedIndex].tipo),
      }}
      loading={loading}
      selectedButtonIndex={selectedIndex}
      onSelectButton={handleButtonClick}
    />
  );
}
