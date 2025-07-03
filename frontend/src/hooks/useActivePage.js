import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useActivePage(defaultLabel = "Inicio") {
  const [activePage, setActivePage] = useState(defaultLabel);
  const { pathname } = useLocation();

  useEffect(() => {
    const page = pathname.split("/")[1] || defaultLabel;
    setActivePage(page[0].toUpperCase() + page.slice(1));
  }, [pathname, defaultLabel]);

  return activePage;
}
