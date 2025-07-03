// src/hooks/useContainerRect.js
import { useState, useCallback, useLayoutEffect } from "react";

export function useContainerRect(containerRef) {
  const [containerRect, setContainerRect] = useState(null);

  const updateContainerRect = useCallback(() => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    setContainerRect({ x: r.left, y: r.top, width: r.width, height: r.height });
  }, [containerRef]);

  useLayoutEffect(() => {
    updateContainerRect();
    window.addEventListener("resize", updateContainerRect);
    window.addEventListener("scroll", updateContainerRect);
    return () => {
      window.removeEventListener("resize", updateContainerRect);
      window.removeEventListener("scroll", updateContainerRect);
    };
  }, [updateContainerRect]);

  return containerRect;
}
