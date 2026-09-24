import { expect, test } from "@playwright/test";

// GamePageTemplate 的共用合約：介紹頁 → 設定 Dialog → 出題，頂列才出現設定類按鈕
const pages = [
  "/coin/equivalent",
  "/coin/value",
  "/coin/pay",
  "/coin/buy",
  "/coin/change",
  "/clock/current-time",
  "/ultimate-password",
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

test("/ultimate-password 先選題庫與難度，再答題縮小範圍並顯示答案", async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0.11; });
  await page.goto("/ultimate-password");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/ultimate-password$/,
  );
  await page.getByRole("button", { name: "開始練習" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("要用哪份題庫？")).toBeVisible();
  await expect(dialog.getByText("選擇題目難度")).toBeVisible();
  await dialog.getByRole("button", { name: "開始練習" }).click();
  await expect(page.getByRole("heading", { name: "一打雞蛋有幾顆？" })).toBeVisible();
  await expect(page.getByText("目前密碼範圍：1 到 100")).toBeVisible();
  await page.getByRole("button", { name: "12", exact: true }).click();
  await page.getByRole("button", { name: "確認密碼" }).click();
  await expect(page.getByText("目前密碼範圍：1 到 49")).toBeVisible();
  await page.getByRole("button", { name: "12", exact: true }).click();
  const slider = page.getByRole("slider", { name: "選擇數字" });
  await expect(slider).toHaveAttribute("aria-valuemin", "1");
  await expect(slider).toHaveAttribute("aria-valuemax", "100");
  await expect(slider).toHaveAttribute("aria-valuenow", "50");
  await page.getByRole("button", { name: "確認密碼" }).click();
  await expect(page.getByText("目前密碼範圍：1 到 49")).toBeVisible();
  await page.getByRole("button", { name: "12", exact: true }).click();
  await slider.press("Home");
  for (let i = 0; i < 11; i++) await slider.press("ArrowRight");
  await expect(slider).toHaveAttribute("aria-valuenow", "12");
  await page.getByRole("button", { name: "確認密碼" }).click();
  await expect(page.getByLabel("數字答案 12")).toBeVisible();
});
