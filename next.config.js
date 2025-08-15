/** @type {import('next').NextConfig} */
import pwa from "next-pwa";

const isDev = process.env.NODE_ENV === "development";

const withPWA = pwa({
  dest: "public",
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  disable: isDev,
  cacheStartUrl: true,
  dynamicStartUrl: false,
  fallbacks: {
    document: "/offline",
  },
  additionalManifestEntries: [
    { url: "/", revision: null },
    { url: "/offline", revision: null },
  ],
  runtimeCaching: [
    {
      urlPattern: /^\/$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "start-url",
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        },
        networkTimeoutSeconds: 3,
      },
    },
    {
      urlPattern: /\/offline/,
      handler: "CacheFirst",
      options: {
        cacheName: "offline-page",
        expiration: {
          maxEntries: 1,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff2?|ttf|eot|otf|mp4|webm|mp3|wav)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "assets-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /^\/_next\/static\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-resources",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
  ],
});

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
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
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://us.i.posthog.com/decide",
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default withPWA(nextConfig);
