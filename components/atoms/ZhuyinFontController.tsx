"use client";

import { useZhuyinPreferences } from "@/lib/zhuyin";
import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

/** 掛在 layout，讓設定的 portal、遊戲、SVG 與 canvas 共用同一字體。 */
export function ZhuyinFontController() {
  const path = usePathname();
  const enabled = useZhuyinPreferences((state) => state.units[path] ?? false);

  useLayoutEffect(() => {
    document.documentElement.toggleAttribute("data-zhuyin", enabled);
    return () => document.documentElement.removeAttribute("data-zhuyin");
  }, [enabled, path]);

  return null;
}
