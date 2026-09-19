import { describe, expect, it } from "vitest";

import { hubs, pages } from "../app/pages.config";
import { pageSeo } from "./seo-content";

const pageKeys = Object.keys(pages);
const hubKeys = Object.keys(hubs);
const routableKeys = new Set([...pageKeys, ...hubKeys]);
const seoKeys = Object.keys(pageSeo);

/** 半形當量：中日韓字元佔兩倍寬度，長度上限用這個量才有意義。 */
function width(text: string): number {
  return [...text].reduce(
    (total, char) => total + (/[⺀-￯]/.test(char) ? 2 : 1),
    0,
  );
}

describe("每頁都有 SEO 文案", () => {
  it("教材頁與分類頁都在 pageSeo 裡", () => {
    expect(
      [...pageKeys, ...hubKeys].filter((key) => !(key in pageSeo)),
    ).toEqual([]);
  });

  it("pageSeo 沒有指向不存在頁面的條目", () => {
    expect(seoKeys.filter((key) => !routableKeys.has(key))).toEqual([]);
  });
});

describe("分類頁的學習順序", () => {
  // steps[].pageKey 的型別是 string，改路徑或刪單元時 TS 不會攔。
  it("每個 step 都指向真實存在的頁面", () => {
    const broken = seoKeys.flatMap((key) =>
      (pageSeo[key].steps ?? [])
        .filter((step) => !routableKeys.has(step.pageKey))
        .map((step) => `${key} → ${step.pageKey}`),
    );

    expect(broken).toEqual([]);
  });
});

describe("標題與描述", () => {
  it("title 全站唯一", () => {
    const titles = seoKeys.map((key) => pageSeo[key].title);

    expect(titles.filter((title, index) => titles.indexOf(title) !== index)).toEqual([]);
  });

  it("description 全站唯一", () => {
    const descriptions = seoKeys.map((key) => pageSeo[key].description);

    expect(
      descriptions.filter((text, index) => descriptions.indexOf(text) !== index),
    ).toEqual([]);
  });

  // 漂移防線，不是 SEO 最佳值：站名後綴「 | TeachBox100 台灣互動學習平台」
  // 本身就吃掉 31 半形當量，現有標題加上它已經超過 Google 桌機的截斷寬度。
  // 這裡只擋「貼進一整段文字」這種量級的走鐘。
  it("title 與 description 的長度在合理範圍", () => {
    const outOfRange = seoKeys.filter((key) => {
      const titleWidth = width(pageSeo[key].title);
      const descriptionWidth = width(pageSeo[key].description);

      return (
        titleWidth > 44 || descriptionWidth < 60 || descriptionWidth > 180
      );
    });

    expect(outOfRange).toEqual([]);
  });
});

describe("FAQ", () => {
  // 遊戲本體全是 client component，server HTML 裡 intro 與 faq 是唯一能被爬到的實質文字。
  it("每頁至少兩條，問與答都不是空白", () => {
    const thin = seoKeys.filter(
      (key) =>
        pageSeo[key].faq.length < 2 ||
        pageSeo[key].faq.some((item) => !item.q.trim() || !item.a.trim()),
    );

    expect(thin).toEqual([]);
  });

  it("teaches 不是空白", () => {
    expect(seoKeys.filter((key) => !pageSeo[key].teaches.trim())).toEqual([]);
  });
});
