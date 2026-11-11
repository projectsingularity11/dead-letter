import { useEffect, useRef, useCallback } from "react";
import type { Dispatch } from "react";
import type { Event } from "./reducer";
/** Only active, monotonic elapsed time. Flush before a discrete game event. */
export function useActiveTimer(active: boolean, dispatch: Dispatch<Event>) {
  const last = useRef<number | null>(null);
  const flush = useCallback(() => {
    if (last.current === null) return;
    const now = performance.now();
    dispatch({ type: "TICK", elapsed: now - last.current });
    last.current = now;
  }, [dispatch]);
  useEffect(() => {
    if (!active) {
      last.current = null;
      return;
    }
    last.current = performance.now();
    const t = setInterval(flush, 100);
    return () => {
      clearInterval(t);
      flush();
      last.current = null;
    };
  }, [active, flush]);
  return flush;
}
