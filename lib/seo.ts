import { hubs, pages } from "@/app/pages.config";
import { pageSeo } from "@/lib/seo-content";
import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://teachbox100.com";

/**
 * 產生單一教材頁的 metadata。
 * 站名後綴由 root layout 的 title.template 補上，這裡只給頁面自己的標題。
 * og:image 由各路由的 opengraph-image.tsx 自動掛上，不需在此指定。
 */
export function buildMetadata(pageKey: string): Metadata {
  const seo = pageSeo[pageKey];
  // 分類頁不在 pages 裡，退而查 hubs
  const path = (pages[pageKey] ?? hubs[pageKey]).path;

  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: path },
    openGraph: {
      title: `${seo.title} | TeachBox100`,
      description: seo.description,
      url: path,
      siteName: "TeachBox100",
      type: "website",
      locale: "zh_TW",
    },
    twitter: {
      card: "summary_large_image",
      title: `${seo.title} | TeachBox100`,
      description: seo.description,
    },
  };
}
