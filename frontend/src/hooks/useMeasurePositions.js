// src/hooks/useMeasurePositions.js
import { useCallback } from "react";

export function useMeasurePositions(masterRef, containerRect, lines, childRefs, setPositions) {
  return useCallback(() => {
    if (!masterRef.current || !containerRect) return;
    const rm = masterRef.current.getBoundingClientRect();
    const masterPos = { x: rm.left + rm.width, y: rm.top + rm.height / 2 };
    const childPos = {};
    lines.forEach((line) => {
      const ref = childRefs.current[line.id];
      if (ref?.current) {
        const headerEl = ref.current.querySelector(".child-header");
        if (!headerEl) return;
        const rc = headerEl.getBoundingClientRect();
        
        childPos[line.id] = { x: rc.left - 30, y: rc.top + rc.height / 2 };
      }
    });
    setPositions({ master: masterPos, children: childPos });
  }, [masterRef, containerRect, lines, childRefs, setPositions]);
}
