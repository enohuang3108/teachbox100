import { hubs, pages } from "@/app/pages.config";
import { SITE_URL } from "@/lib/seo";
import { MetadataRoute } from "next";

// 內容實際更動時再改這個日期。用 new Date() 會讓每次爬取都宣稱「剛更新」，
// 是假訊號，反而降低 lastmod 的可信度。
const LAST_MODIFIED = new Date("2026-09-02");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...Object.values(hubs).map((hub) => ({
      url: `${SITE_URL}${hub.path}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...Object.values(pages).map((page) => ({
      url: `${SITE_URL}${page.path}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
