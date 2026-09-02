/** @type {import('next').NextConfig} */
import withSerwistInit from "@serwist/next";
import { createHash, randomUUID } from "node:crypto";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";

// 所有 app router 頁面路徑 —— 拿來 precache，讓老師裝了 PWA（或只是逛過首頁）
// 之後，離線也能直接開任何一個單元，不必事先逐頁點過。
const pageUrls = readdirSync("app", { recursive: true })
  .filter((f) => /(^|\/)page\.tsx$/.test(f))
  .map((f) => "/" + f.replace(/\/?page\.tsx$/, ""));

// service worker 自己、next-pwa 時代留下的殘骸、macOS 垃圾檔，都不要進 precache。
// precache 是全有全無：清單裡只要有一個抓不到，整包都不會存。
const PUBLIC_SKIP =
  /(^|\/)(sw\.js|workbox-.*\.js|fallback-.*\.js|offline-assets\.json|\..*)$/;

// public/ 底下的教材素材（3D 模型、硬幣圖、音效、Lottie）約 20MB。
//
// 這些「不」放進 precache：precache 是 service worker 一裝好就全部抓，
// 只是來看一眼的訪客會替一個他不會用到的離線功能付掉整包頻寬。
// 改成寫一份清單出來，裝成 App 的裝置才由 OfflineReadyToast 主動抓（見 app/sw.ts 的
// offline-assets 快取）。一般瀏覽的人則是開到哪抓到哪，走同一個快取。
const publicAssets = readdirSync("public", { recursive: true })
  .filter((f) => !PUBLIC_SKIP.test(f) && statSync(`public/${f}`).isFile())
  .map((f) => `/${f}`);

// version 用全部檔案的 hash 再 hash 一次：素材沒動就不會叫裝置重抓一次 20MB
const assetsVersion = createHash("md5")
  .update(publicAssets.map((u) => readFileSync(`public${u}`)).join(""))
  .digest("hex")
  .slice(0, 12);

writeFileSync(
  "public/offline-assets.json",
  JSON.stringify({ version: assetsVersion, urls: publicAssets }),
);

const isDev = process.env.NODE_ENV === "development";

// next-pwa（不支援 Next 15）已換成現役維護的 @serwist/next。
// 快取策略改由 app/sw.ts 內的 defaultCache 提供；dev 停用避免 HMR 衝突。
const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: isDev,
  // 全站頁面 + 離線 fallback 頁一起 precache。revision 每次 build 換一次，
  // 部署後 service worker 會重抓，不會卡在舊 HTML。
  // 注意：這個參數是「取代」public/ 的預設 glob，不是附加（見 @serwist/next 的 index.mjs）。
  // 這裡只放頁面 HTML —— 素材刻意留在外面，見上面 publicAssets 的說明。
  additionalPrecacheEntries: pageUrls.map((url) => ({
    url,
    revision: randomUUID(),
  })),
});

const nextConfig = {
  // 讓驗證用的 build 可以輸出到別的目錄，不會蓋掉正在跑的 next dev 的 .next
  distDir: process.env.NEXT_DIST_DIR || ".next",
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  compress: true,
  poweredByHeader: false,
  images: {
    // 素材本來就是手工壓好的 webp，再過一手 /_next/image 只會讓網址帶上寬度參數，
    // 沒辦法 precache（precache 認的是 /images/xxx.webp 這種固定路徑）。
    // 關掉最佳化換來「圖片能離線」，對教室情境划算。
    unoptimized: true,
  },
  async rewrites() {
    // Only enable PostHog rewrites if we have a PostHog key
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      return [];
    }

    const posthogHost =
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
    const posthogStaticHost =
      process.env.NEXT_PUBLIC_POSTHOG_STATIC_HOST ||
      "https://us-assets.i.posthog.com";

    return [
      {
        source: "/ingest/static/:path*",
        destination: `${posthogStaticHost}/static/:path*`,
      },
      {
        source: "/ingest/:path*",
        destination: `${posthogHost}/:path*`,
      },
      {
        source: "/ingest/decide",
        destination: `${posthogHost}/decide`,
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default withSerwist(nextConfig);
