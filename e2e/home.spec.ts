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
 * 例外：爬格子同時掛在抽籤分類與首頁。
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
    "/dice",
    "/draw",
    "/draw/ladder",
    "/memory",
    "/monopoly",
    "/multiplication",
    "/noise",
    "/quiz/morris",
    "/quiz/territory",
    "/scoreboard",
    "/timer",
    "/ultimate-password",
  ]);

  await page.goto("/draw");
  expect(await unitHrefs(page, 'main ul a[href^="/draw/"]')).toEqual([
    "/draw/gacha",
    "/draw/ichiban",
    "/draw/ladder",
    "/draw/wheel",
  ]);

  await page.goto("/coin");
  expect(await unitHrefs(page, 'main ol a[href^="/coin/"]')).toEqual([
    "/coin/buy",
    "/coin/change",
    "/coin/equivalent",
    "/coin/introduction",
    "/coin/pay",
    "/coin/value",
  ]);
});

test("首頁卡片依搜尋流量排序，高流量的單元在前", async ({ page }) => {
  await page.goto("/");
  const hrefs = await page
    .locator('#games a[href^="/"]')
    .evaluateAll((links) => [
      ...new Set(links.map((l) => l.getAttribute("href"))),
    ]);
  expect(hrefs.slice(0, 6)).toEqual([
    "/draw",
    "/noise",
    "/memory",
    "/coin",
    "/clock/current-time",
    "/monopoly",
  ]);
});

test("首頁教具箱一開始關著，點一下打開、再點一下關上，卡牆最後是意見卡", async ({
  page,
}) => {
  await page.goto("/");
  const box = page.getByRole("button", { name: "打開教具箱" });
  const hero = page.locator(".toolbox");
  await expect(hero).toHaveAttribute("data-state", "closed");
  await expect(page.getByAltText(/阿黃從打開的教具箱探出頭/)).toBeHidden();

  await box.click();
  await expect(hero).toHaveAttribute("data-state", "open");
  await expect(page.getByAltText(/阿黃從打開的教具箱探出頭/)).toBeVisible();

  await page.getByRole("button", { name: "關上教具箱" }).click();
  await expect(hero).toHaveAttribute("data-state", "closed");
  await expect(page.getByAltText(/阿黃從打開的教具箱探出頭/)).toBeHidden();
  await expect(box).toBeVisible();

  await expect(page.locator("#games li").last()).toContainText(
    "還缺哪一件教具？",
  );
});
