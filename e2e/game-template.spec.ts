import { expect, test } from "@playwright/test";

// GamePageTemplate 的共用合約：介紹頁 → 設定 Dialog → 出題，頂列才出現設定類按鈕
const pages = [
  "/coin/equivalent",
  "/coin/value",
  "/coin/pay",
  "/coin/buy",
  "/coin/change",
  "/clock/current-time",
];

for (const path of pages) {
  test(`${path} 介紹頁按開始練習，設定後出題`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("button", { name: "設定", exact: true })).toHaveCount(0);

    await page.getByRole("button", { name: "開始練習" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "開始練習" }).click();

    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "設定", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "重新出題" })).toBeVisible();
  });
}
