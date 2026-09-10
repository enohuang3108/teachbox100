import { expect, test } from "@playwright/test";

/**
 * 這不是逐像素快照，而是全站教材入口的合約：老師從首頁能到每一個單元。
 * 若新增單元卻漏掛首頁，或任何連結變成壞路徑，這個測試會失敗。
 */
test("首頁列出所有教材單元，且沒有漏掛或多掛的入口", async ({ page }) => {
  await page.goto("/");

  const unitLinks = page.locator('#games a[href^="/"]');
  const hrefs = await unitLinks.evaluateAll((links) =>
    [...new Set(links.map((link) => link.getAttribute("href")))].filter(
      (href): href is string => Boolean(href),
    ),
  );

  // 路由是否可編譯由 pnpm build 保護；這裡只驗證首頁這個公開入口。
  // 不逐頁導航，避免 Next 開發伺服器第一次編譯 15 條路由時，讓測試把編譯時間誤判成產品失敗。
  expect(hrefs.sort()).toEqual([
    "/clock/current-time",
    "/coin/buy",
    "/coin/change",
    "/coin/equivalent",
    "/coin/introduction",
    "/coin/pay",
    "/coin/value",
    "/draw/lottery",
    "/draw/wheel",
    "/memory",
    "/monopoly",
    "/multiplication",
    "/noise",
    "/scoreboard",
    "/timer",
  ]);
});
