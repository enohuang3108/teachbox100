"use client";

import { useZhuyinPreferences } from "@/lib/zhuyin";
import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

/** 記錄當前單元偏好；只有標記的題目與作答選項套用字體。 */
export function ZhuyinFontController() {
  const path = usePathname();
  const enabled = useZhuyinPreferences((state) => state.units[path] ?? false);

  useLayoutEffect(() => {
    document.documentElement.toggleAttribute("data-zhuyin", enabled);
    return () => document.documentElement.removeAttribute("data-zhuyin");
  }, [enabled, path]);

  return null;
}
