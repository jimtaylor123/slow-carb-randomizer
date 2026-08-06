"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reads client-only state (e.g. localStorage) after hydration and reports
 * when it is safe to render it.
 *
 * During SSR/static export `reader` is never called; the fallback is used so
 * server and client HTML match, then the real value is loaded once on mount.
 */
export function useHydrated<T>(reader: () => T, fallback: T): [T, boolean] {
  const readerRef = useRef(reader);

  const [value, setValue] = useState<T>(fallback);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setValue(readerRef.current());
    setMounted(true);
  }, []);

  return [value, mounted];
}
