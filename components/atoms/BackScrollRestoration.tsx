"use client";

import {
  installBackNavigationFix,
  type BackNavigationController,
  type BackNavigationHost,
} from "@/lib/back-navigation";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

// 接管上一頁／下一頁的捲動還原，原因看 lib/back-navigation.ts。
// 這裡只負責：掛上去、以及在新頁面 commit 之後 paint 之前把捲動位置放回去。
export const BackScrollRestoration = () => {
  const pathname = usePathname();
  const controller = useRef<BackNavigationController | null>(null);

  useEffect(() => {
    controller.current = installBackNavigationFix({
      navigation: (window as unknown as BackNavigationHost).navigation,
      history: window.history,
      get scrollY() {
        return window.scrollY;
      },
      root: document.documentElement,
    });
    return () => {
      controller.current?.dispose();
      controller.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    const y = controller.current?.takePendingScroll();
    if (y !== null && y !== undefined) window.scrollTo(0, y);
  }, [pathname]);

  return null;
};
