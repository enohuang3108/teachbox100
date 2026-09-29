import { expect, test, type Page } from "@playwright/test";

import { hubs, pages } from "../app/pages.config";

/**
 * 靜態頁的視覺回歸：首頁、兩個分類頁，以及每個單元的介紹頁與設定頁。
 *
 * 只收純 DOM/CSS 的畫面。遊戲本體（轉盤、扭蛋機、一番賞、大富翁）由 canvas 與
 * requestAnimationFrame 驅動，`animations: "disabled"` 關不掉，截圖不可能穩定，
 * 一律不進來 —— 它們的行為由既有的 e2e 與單元測試保護。
 *
 * 這批測試保護的是跨單元的版型一致：麵包屑、大標、說明段落、FAQ 與設定站的排版
 * 在 21 個單元之間長得一樣，桌機與手機都讀得完。
 */

/** 介紹頁上那顆 CTA 的文字；`setup` 指按下去會不會開設定 Dialog。 */
const UNITS: Record<string, { start: string; setup: boolean }> = {
  // 按下「噓」會叫麥克風、計時器與認識新臺幣直接進工具，三者沒有設定站
  "coin-introduction": { start: "開始認識", setup: false },
  timer: { start: "開始使用", setup: false },
  noise: { start: "噓", setup: false },

  "coin-equivalent": { start: "開始練習", setup: true },
  "coin-value": { start: "開始練習", setup: true },
  "coin-pay": { start: "開始練習", setup: true },
  "coin-buy": { start: "開始練習", setup: true },
  "coin-change": { start: "開始練習", setup: true },
  "clock-current-time": { start: "開始練習", setup: true },
  memory: { start: "開始使用", setup: true },
  wheel: { start: "開始使用", setup: true },
  gacha: { start: "開始使用", setup: true },
  ichiban: { start: "開始使用", setup: true },
  monopoly: { start: "開始遊戲", setup: true },
  scoreboard: { start: "開始使用", setup: true },
  multiplication: { start: "開始使用", setup: true },
  "quiz-territory": { start: "開始使用", setup: true },
  "quiz-morris": { start: "開始使用", setup: true },
  "ultimate-password": { start: "開始使用", setup: true },
  ladder: { start: "開始使用", setup: true },
  dice: { start: "開始使用", setup: true },
};

// 新增單元卻沒補上面這張表，就不會有基準線 —— 在這裡擋下來，而不是悄悄少拍一張
test("這支 spec 涵蓋 pages.config 的每一個單元", () => {
  expect(Object.keys(UNITS).sort()).toEqual(Object.keys(pages).sort());
});

/** 等到畫面不會再自己變動為止：字體載完、每張圖都下載完。 */
async function settle(page: Page) {
  // Next 的開發工具徽章會蓋在角落，內容隨編譯狀態變動
  await page.addStyleTag({ content: "nextjs-portal { display: none !important }" });
  await page.evaluate(async () => {
    // next/image 的 lazy 圖不進視窗就不下載，fullPage 會拍到半張；改成 eager 直接抓完
    for (const image of document.images) image.loading = "eager";
    await document.fonts.ready;
  });
  // 404 的圖 complete 也是 true，不會卡在這裡；真的卡住時訊息會指出是哪張
  await expect
    .poll(
      () =>
        page.evaluate(() =>
          [...document.images].filter((image) => !image.complete).map((image) => image.src),
        ),
      { timeout: 30_000 },
    )
    .toEqual([]);
}

test.describe("靜態頁視覺回歸", () => {
  // dev server 是冷編譯，每個路由第一次進去要等 webpack；預設 30 秒不夠
  test.describe.configure({ timeout: 120_000 });

  const hubPaths = Object.values(hubs).map((hub) => hub.path);

  for (const path of ["/", ...hubPaths]) {
    test(`卡牆 ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await settle(page);
      await expect(page).toHaveScreenshot(`hub-${path === "/" ? "home" : path.slice(1)}.png`, {
        fullPage: true,
      });
    });
  }

  for (const [key, unit] of Object.entries(UNITS)) {
    test(`${key} 介紹頁`, async ({ page }) => {
      await page.goto(pages[key].path);
      await expect(page.getByRole("button", { name: unit.start, exact: true })).toBeVisible();
      await settle(page);
      await expect(page).toHaveScreenshot(`intro-${key}.png`, { fullPage: true });
    });

    if (!unit.setup) continue;

    test(`${key} 設定頁`, async ({ page }) => {
      await page.goto(pages[key].path);
      await page.getByRole("button", { name: unit.start, exact: true }).click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await settle(page);
      await expect(dialog).toHaveScreenshot(`setup-${key}.png`);
    });
  }
});
