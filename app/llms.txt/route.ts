import { appInfo, hubs, pages } from "@/app/pages.config";
import { SITE_URL } from "@/lib/seo";
import { pageSeo } from "@/lib/seo-content";

/**
 * /llms.txt — 給 AI 檢索爬蟲的純文字站點摘要。
 * 由 seo-content.ts 產生而非另存靜態檔，避免兩份內容各自漂移。
 */
export const dynamic = "force-static";

export function GET(): Response {
  const entries: [string, { path: string; title: string }][] = [
    ...Object.entries(hubs),
    ...Object.entries(pages),
  ];

  const sections = entries.map(([key, page]) => {
    const seo = pageSeo[key];
    const faq = seo.faq
      .map((item) => `- Q: ${item.q}\n  A: ${item.a}`)
      .join("\n");

    const steps = seo.steps
      ?.map((step, i) => `${i + 1}. ${pages[step.pageKey].title} — ${step.note}`)
      .join("\n");

    return [
      `## ${page.title}`,
      `URL: ${SITE_URL}${page.path}`,
      "",
      seo.intro,
      ...(steps ? ["", "### 建議的學習順序", steps] : []),
      "",
      "### 常見問題",
      faq,
    ].join("\n");
  });

  const body = [
    `# ${appInfo.title}`,
    "",
    `> ${appInfo.description}`,
    "",
    "TeachBox100 是免費的網頁教材，不需註冊、不需安裝，支援離線使用。",
    "內容以繁體中文（台灣）撰寫，面向學齡前至國小學生、家長與教師，也適用於特教班的生活技能課程。",
    "",
    ...sections,
    "",
    "## 授權",
    "內容可自由引用，引用時請標註來源網址。",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
