import { expect, test } from "@playwright/test";
import { pages } from "../app/pages.config";

// 認識新臺幣與噪音計沒有遊戲設定面板。
const units = Object.entries(pages).filter(([key]) => !["coin-introduction", "noise"].includes(key));

for (const [key, unit] of units) {
  test(`${key} 設定提供注音選項`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(unit.path);
    await page.getByRole("button", { name: /^開始(使用|練習|遊戲)$/ }).click();
    if (key === "quiz-territory") {
      await expect(page.getByRole("switch", { name: "顯示注音", exact: true })).toHaveCount(0);
      await page.getByRole("dialog").getByRole("button", { name: "下一步", exact: true }).click();
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
  await expect.poll(() => page.evaluate(() => document.fonts.check('24px "Bpmf Iansui"', "學習國語"))).toBe(true);
  await page.getByRole("dialog").getByRole("button", { name: "開始練習", exact: true }).click();
  await expect.poll(() => page.locator("#game-stage").evaluate((el) => getComputedStyle(el).fontFamily)).toContain("Bpmf Iansui");
  await page.reload();
  await page.getByRole("button", { name: "開始練習", exact: true }).click();
  await expect(toggle).toBeChecked();
  await page.goto("/coin/value");
  await page.getByRole("button", { name: "開始練習", exact: true }).click();
  await expect(toggle).not.toBeChecked();
  await expect.poll(() => page.locator("body").evaluate((el) => getComputedStyle(el).fontFamily)).not.toContain("Bpmf Iansui");
  await page.goto("/coin/equivalent");
  await page.getByRole("button", { name: "開始練習", exact: true }).click();
  await expect(toggle).toBeChecked();
  await toggle.click();
  await expect(toggle).not.toBeChecked();
});

test("字型下載失敗保留一般字體，老師可重試", async ({ page }) => {
  await page.route("**/BpmfIansui-Regular.woff2", (route) => route.abort());
  await page.goto("/coin/equivalent");
  await page.getByRole("button", { name: "開始練習", exact: true }).click();
  const toggle = page.getByRole("switch", { name: "顯示注音", exact: true });
  await toggle.click();
  await expect(page.getByRole("alert")).toContainText("注音字型載入失敗");
  await expect(toggle).not.toBeChecked();
  await expect(toggle).toBeEnabled();
  await page.unroute("**/BpmfIansui-Regular.woff2");
  await toggle.click();
  await expect(toggle).toBeChecked();
});
