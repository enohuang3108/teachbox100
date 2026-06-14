/** @type {import('next').NextConfig} */
import withSerwistInit from "@serwist/next";
import { randomUUID } from "node:crypto";

const isDev = process.env.NODE_ENV === "development";

// next-pwa（不支援 Next 15）已換成現役維護的 @serwist/next。
// 快取策略改由 app/sw.ts 內的 defaultCache 提供；dev 停用避免 HMR 衝突。
const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: isDev,
  // 離線時 fallback 用的頁面先 precache（沿用既有 /offline 頁）
  additionalPrecacheEntries: [{ url: "/offline", revision: randomUUID() }],
});

const nextConfig = {
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
