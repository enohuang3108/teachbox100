import { useEffect, useState } from "react";

/**
 * 老師調過的設定留在這台裝置（unit-page「設定會記住」）。
 * 先用預設值渲染、掛載後才讀 localStorage，避免 hydration mismatch。
 */
export function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) setValue(JSON.parse(saved) as T);
    } catch {}
  }, [key]);

  const update = (next: T) => {
    setValue(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
  };

  return [value, update] as const;
}
