"use client";

import { useEffect } from "react";
import { toast } from "sonner";

// 存過的版本，避免每次開 App 都重抓 20MB。讀寫都可能被瀏覽器擋掉（無痕、關站台資料），
// 所以一律包起來——抓不到就當沒存過，最多多抓一次
const DONE_KEY = "offline-assets-version";
const readDone = () => {
  try {
    return localStorage.getItem(DONE_KEY);
  } catch {
    return null;
  }
};
const writeDone = (v: string) => {
  try {
    localStorage.setItem(DONE_KEY, v);
  } catch {
    /* 存不了就算了，下次再抓一遍 */
  }
};

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  // iOS 主畫面 App 沒有 display-mode，只有這個非標準屬性
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

/**
 * 裝成 App 之後，第一次打開時把全部教材素材抓進裝置，抓完跳 toast（Toaster 在 root layout）。
 *
 * 素材刻意不放在 service worker 的 precache 裡：那會讓只是來看一眼的訪客
 * 也在背景付掉 20MB。清單由 next.config.js 在建置時產生。
 */
export const OfflineReadyToast = () => {
  useEffect(() => {
    if (!isStandalone() || !("caches" in window)) return;

    let alive = true;

    (async () => {
      const res = await fetch("/offline-assets.json");
      const { version, urls }: { version: string; urls: string[] } =
        await res.json();
      if (readDone() === version) return;

      const cache = await caches.open("offline-assets");
      // addAll 是全有全無：中途斷線就不寫版本號，下次開 App 會整包重來
      await cache.addAll(urls);
      writeDone(version);

      if (alive) toast.success("教材存好了，沒網路也能用");
    })().catch(() => {
      /* 下載失敗就安靜跳過，老師照樣能用，只是沒有離線 */
    });

    return () => {
      alive = false;
    };
  }, []);

  return null;
};
