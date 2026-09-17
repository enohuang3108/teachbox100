import { expect, test, type Page } from "@playwright/test";

/** 蒐集某一頁卡牆上的單元連結，去重後排序 */
async function unitHrefs(page: Page, selector: string) {
  const hrefs = await page
    .locator(selector)
    .evaluateAll((links) =>
      [...new Set(links.map((link) => link.getAttribute("href")))].filter(
        (href): href is string => Boolean(href),
      ),
    );
  return hrefs.sort();
}

/**
 * 這不是逐像素快照，而是全站教材入口的合約：老師從首頁出發，兩步之內到得了每一個單元。
 * 首頁只露分類入口（抽籤、認識金錢），子單元收在分類頁裡，所以合約分兩段驗。
 * 若新增單元卻漏掛，或任何連結變成壞路徑，這個測試會失敗。
 */
test("首頁列出分類與獨立單元，分類頁列出旗下所有單元", async ({ page }) => {
  // 一個測試裡冷編譯三個路由；全套平行跑時 dev server 同時在編別的頁，30 秒不夠
  test.slow();
  // 路由是否可編譯由 pnpm build 保護；這裡只驗證公開入口。
  // 不逐頁導航進每個單元，避免 Next 開發伺服器第一次編譯所有路由時，
  // 讓測試把編譯時間誤判成產品失敗。
  await page.goto("/");
  expect(await unitHrefs(page, '#games a[href^="/"]')).toEqual([
    "/clock/current-time",
    "/coin",
    "/draw",
    "/memory",
    "/monopoly",
    "/multiplication",
    "/noise",
    "/scoreboard",
    "/timer",
  ]);

  await page.goto("/draw");
  expect(await unitHrefs(page, "main ul a[href^=\"/draw/\"]")).toEqual([
    "/draw/gacha",
    "/draw/ichiban",
    "/draw/wheel",
  ]);

  await page.goto("/coin");
  expect(await unitHrefs(page, "main ol a[href^=\"/coin/\"]")).toEqual([
    "/coin/buy",
    "/coin/change",
    "/coin/equivalent",
    "/coin/introduction",
    "/coin/pay",
    "/coin/value",
  ]);
});
