import { expect, test } from "@playwright/test";
import { pages } from "../app/pages.config";

// 認識新臺幣與噪音計沒有遊戲設定面板。
const units = Object.entries(pages).filter(([key]) => !["coin-introduction", "noise"].includes(key));

for (const [key, unit] of units) {
  test(`${key} 設定提供注音選項`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(unit.path);
    await page.getByRole("button", { name: /^開始(使用|練習|遊戲)$/ }).click();
    // 出題遊戲的注音放在最後一步「輔助」
    if (["quiz-territory", "quiz-morris", "ultimate-password", "monopoly"].includes(key)) {
      await expect(page.getByRole("switch", { name: "顯示注音", exact: true })).toHaveCount(0);
      const next = page.getByRole("dialog").getByRole("button", { name: "下一步", exact: true });
      while (await next.isVisible()) await next.click();
    }
    await expect(page.getByRole("dialog").getByRole("switch", { name: "顯示注音", exact: true })).not.toBeChecked();
  });
}

test("注音實際載入、遊戲套用、重整保留並按單元獨立記憶", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/coin/equivalent");
  await page.getByRole("button", { name: "開始練習", exact: true }).click();
  const toggle = page.getByRole("switch", { name: "顯示注音", exact: true });
  await toggle.click();
  await expect(toggle).toBeChecked();
  await expect.poll(() => toggle.evaluate((el) => getComputedStyle(el).fontFamily)).not.toContain("Bpmf Zihi Sans");
  await expect.poll(() => page.evaluate(() => document.fonts.check('24px "Bpmf Zihi Sans"', "學習國語"))).toBe(true);
  await page.getByRole("dialog").getByRole("button", { name: "開始練習", exact: true }).click();
  await expect.poll(() => page.getByRole("heading", { name: "請挑選相同價值的硬幣或鈔票" }).evaluate((el) => getComputedStyle(el).fontFamily)).toContain("Bpmf Zihi Sans");
  await expect.poll(() => page.getByRole("button", { name: "確定", exact: true }).evaluate((el) => getComputedStyle(el).fontFamily)).not.toContain("Bpmf Zihi Sans");
  await page.reload();
  await page.getByRole("button", { name: "開始練習", exact: true }).click();
  await expect(toggle).toBeChecked();
  await page.goto("/coin/value");
  await page.getByRole("button", { name: "開始練習", exact: true }).click();
  await expect(toggle).not.toBeChecked();
  await expect.poll(() => page.locator("body").evaluate((el) => getComputedStyle(el).fontFamily)).not.toContain("Bpmf Zihi Sans");
  await page.goto("/coin/equivalent");
  await page.getByRole("button", { name: "開始練習", exact: true }).click();
  await expect(toggle).toBeChecked();
  await toggle.click();
  await expect(toggle).not.toBeChecked();
});

test("問答遊戲只有題目與作答選項顯示注音", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/ultimate-password");
  await page.getByRole("button", { name: "開始使用", exact: true }).click();
  await page.getByRole("button", { name: "下一步", exact: true }).click();
  await page.getByRole("button", { name: "下一步", exact: true }).click();
  await page.getByRole("switch", { name: "顯示注音", exact: true }).click();
  await expect(page.getByRole("switch", { name: "顯示注音", exact: true })).toBeChecked();
  await page.getByRole("button", { name: "開始遊戲", exact: true }).click();
  await expect.poll(() => page.locator("#game-stage h2").evaluate((el) => getComputedStyle(el).fontFamily)).toContain("Bpmf Zihi Sans");
  const answers = page.locator("#game-stage button.zhuyin-text");
  await expect(answers.first()).toBeVisible();
  for (const answer of await answers.all()) {
    expect(await answer.evaluate((el) => getComputedStyle(el).fontFamily)).toContain("Bpmf Zihi Sans");
  }
  await expect.poll(() => page.getByRole("button", { name: "設定", exact: true }).evaluate((el) => getComputedStyle(el).fontFamily)).not.toContain("Bpmf Zihi Sans");
});

test("字型下載失敗保留一般字體，老師可重試", async ({ page }) => {
  await page.route("**/BpmfZihiSans-*.woff2", (route) => route.abort());
  await page.goto("/coin/equivalent");
  await page.getByRole("button", { name: "開始練習", exact: true }).click();
  const toggle = page.getByRole("switch", { name: "顯示注音", exact: true });
  await toggle.click();
  await expect(page.getByRole("alert")).toContainText("注音字型載入失敗");
  await expect(toggle).not.toBeChecked();
  await expect(toggle).toBeEnabled();
  await page.unroute("**/BpmfZihiSans-*.woff2");
  await toggle.click();
  await expect(toggle).toBeChecked();
});
