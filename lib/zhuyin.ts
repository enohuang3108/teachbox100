"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ZhuyinPreferences {
  units: Record<string, boolean>;
  setEnabled: (path: string, enabled: boolean) => void;
}

/** 注音是裝置上的閱讀偏好，各單元獨立保存。 */
export const useZhuyinPreferences = create<ZhuyinPreferences>()(
  persist(
    (set) => ({
      units: {},
      setEnabled: (path, enabled) =>
        set((state) => ({ units: { ...state.units, [path]: enabled } })),
    }),
    { name: "teachbox-zhuyin" },
  ),
);

export async function loadZhuyinFont() {
  try {
    const fonts = await document.fonts.load('24px "Bpmf Iansui"', "學習國語");
    if (fonts.length) return;
  } catch {
    // CSS FontFace 下載失敗後會保留 error 狀態；建立新實例才能重試。
  }
  const font = new FontFace("Bpmf Iansui", 'url("/fonts/bpmf-iansui/BpmfIansui-Regular.woff2")');
  document.fonts.add(await font.load());
}
