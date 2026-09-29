import { hubs, pages } from "@/app/pages.config";
import { SITE_URL } from "@/lib/seo";
import { MetadataRoute } from "next";

// 內容實際更動時再改這個日期。用 new Date() 會讓每次爬取都宣稱「剛更新」，
// 是假訊號，反而降低 lastmod 的可信度。
const LAST_MODIFIED = new Date("2026-09-16");
// 之後才新增或改過內容的頁，各自記自己的日期
const UPDATED: Record<string, Date> = {
  "/": new Date("2026-09-29"),
  "/draw/wheel": new Date("2026-09-29"),
  "/ultimate-password": new Date("2026-09-24"),
  "/draw": new Date("2026-09-29"),
  "/draw/ladder": new Date("2026-09-29"),
  "/dice": new Date("2026-09-29"),
};
const lastModified = (path: string) => UPDATED[path] ?? LAST_MODIFIED;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: lastModified("/"),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    ...Object.values(hubs).map((hub) => ({
      url: `${SITE_URL}${hub.path}`,
      lastModified: lastModified(hub.path),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...Object.values(pages).map((page) => ({
      url: `${SITE_URL}${page.path}`,
      lastModified: lastModified(page.path),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
