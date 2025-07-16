// src/hooks/useDateRange.js
import { useState, useCallback } from "react";

function formatISO(date) {
  return date.toISOString().substring(0, 10);
}

function getToday() {
  return new Date();
}

function getFirstDayLastMonth() {
  const today = getToday();
  return new Date(today.getFullYear(), today.getMonth() - 120, 1);
}

export function useDateRange() {
  // Calcula internamente los valores por defecto
  const defaultEnd   = formatISO(getToday());
  const defaultStart = formatISO(getFirstDayLastMonth());

  const [start, setStart] = useState(defaultStart);
  const [end, setEnd]     = useState(defaultEnd);

  const onStartChange = useCallback(e => setStart(e.target.value), []);
  const onEndChange   = useCallback(e => setEnd(e.target.value), []);

  return {
    start,
    end,
    onStartChange,
    onEndChange,
  };
}