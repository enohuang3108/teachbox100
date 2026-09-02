import { SITE_URL } from "@/lib/seo";
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /offline 是 PWA 離線 fallback，內容極薄，不應進索引
        disallow: ["/offline"],
      },
      // 明示允許 AI 檢索爬蟲：這是免費教學資源，被 AI 引用等同曝光
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-User",
          "PerplexityBot",
          "Perplexity-User",
          "Google-Extended",
          "Applebot-Extended",
          "CCBot",
        ],
        allow: "/",
        disallow: ["/offline"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
