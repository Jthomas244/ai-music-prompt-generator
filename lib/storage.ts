"use client";

import { useEffect, useRef, useState } from "react";

/**
 * useState that survives reloads. Reads localStorage once after mount (so SSR markup matches),
 * then writes on every change. Storage failures (private mode, quota) degrade to in-memory state.
 * The read is guarded by a ref so StrictMode's double-invoked effects can't clobber updates
 * that landed between the two runs.
 */
export function useLocalStorage<T>(key: string, initial: T): [T, (next: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  const loadedKey = useRef<string | null>(null);

  useEffect(() => {
    if (loadedKey.current === key) return;
    loadedKey.current = key;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore — fall back to initial */
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value, hydrated]);

  return [value, setValue, hydrated];
}
