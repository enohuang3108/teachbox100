"use client";

import { useEffect, useState } from "react";

const VISIBLE_MS = 5000;
// 退場比進場快：系統回應要果斷，跟 Sonner 同一套邏輯
const EXIT_MS = 200;

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
 * 裝成 App 之後，第一次打開時把全部教材素材抓進裝置，抓完跳一顆藥丸。
 *
 * 素材刻意不放在 service worker 的 precache 裡：那會讓只是來看一眼的訪客
 * 也在背景付掉 20MB。清單由 next.config.js 在建置時產生。
 */
export const OfflineReadyToast = () => {
  const [phase, setPhase] = useState<"hidden" | "enter" | "exit">("hidden");

  useEffect(() => {
    if (!isStandalone() || !("caches" in window)) return;

    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];

    (async () => {
      const res = await fetch("/offline-assets.json");
      const { version, urls }: { version: string; urls: string[] } =
        await res.json();
      if (readDone() === version) return;

      const cache = await caches.open("offline-assets");
      // addAll 是全有全無：中途斷線就不寫版本號，下次開 App 會整包重來
      await cache.addAll(urls);
      writeDone(version);

      if (!alive) return;
      setPhase("enter");
      timers.push(setTimeout(() => setPhase("exit"), VISIBLE_MS));
      timers.push(setTimeout(() => setPhase("hidden"), VISIBLE_MS + EXIT_MS));
    })().catch(() => {
      /* 下載失敗就安靜跳過，老師照樣能用，只是沒有離線 */
    });

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      // polite：這是完成通知，不需要打斷老師正在做的事
      role="status"
      aria-live="polite"
      data-visible={phase === "enter"}
      className={[
        "fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-50",
        "bg-brand-blue flex items-center gap-3 rounded-full py-3 pr-2.5 pl-5",
        // 陰影帶一點藥丸自己的藍，比純黑陰影服貼
        "shadow-[0_8px_30px_rgb(2_86_155/0.30)]",
        // 只動 transform 跟 opacity，兩者都在 GPU 上跑
        "opacity-0 [transform:translate(-50%,calc(100%+1.5rem))]",
        "transition-[transform,opacity] duration-[420ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
        "data-[visible=true]:opacity-100 data-[visible=true]:[transform:translate(-50%,0)]",
        // 退場收短一點
        "data-[visible=false]:duration-200",
        // 會暈車的人只留淡入淡出，不要位移
        "motion-reduce:[transform:translate(-50%,0)] motion-reduce:transition-opacity",
      ].join(" ")}
    >
      <span className="text-paper text-sm font-semibold whitespace-nowrap">
        資料下載完成，可供離線使用
      </span>
      <button
        type="button"
        onClick={() => setPhase("exit")}
        aria-label="關閉通知"
        className="text-paper/60 hover:text-paper grid size-7 shrink-0 cursor-pointer place-items-center rounded-full transition-[transform,color] duration-150 ease-out select-none active:scale-[0.92]"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
};
