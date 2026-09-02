import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { CacheFirst, Serwist } from "serwist";

// Serwist service worker（取代 next-pwa）。__SW_MANIFEST 由建置時注入。
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // 教材素材（3D 模型、圖、音效、Lottie）統一放這個快取。
    // 兩條路都會進來：一般瀏覽是開到哪抓到哪，裝成 App 則由 OfflineReadyToast
    // 一次 cache.addAll 全抓。用同一個 cacheName，兩邊才讀得到彼此存的東西。
    // ponytail: 不設 maxEntries —— 直接 addAll 寫進來的項目不會被 ExpirationPlugin
    // 記錄到，混用會讓它把沒過期的東西當成過期。素材改名多次後快取會長大，
    // 真的變成問題再換成按 version 清舊快取。
    {
      matcher: ({ sameOrigin, url }) =>
        sameOrigin &&
        /^\/(images|3d_model|sounds|lottie|icons|fonts)\//.test(url.pathname),
      handler: new CacheFirst({ cacheName: "offline-assets" }),
    },
    ...defaultCache,
  ],
  // 文件型請求（導頁）離線時回退到 /offline 頁
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
