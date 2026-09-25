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

test("/ultimate-password 先選題庫與難度，再答題縮小範圍並顯示答案", async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0.11; });
  await page.goto("/ultimate-password");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/ultimate-password$/,
  );
  await page.getByRole("button", { name: "開始使用" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("要用哪份題庫？")).toBeVisible();
  await dialog.getByRole("button", { name: "下一步" }).click();
  await expect(dialog.getByText("題目要多難？")).toBeVisible();
  await dialog.getByRole("button", { name: "開始遊戲" }).click();
  await expect(page.getByRole("heading", { name: "一打雞蛋有幾顆？" })).toBeVisible();
  await expect(page.getByText("目前密碼範圍：1 到 100")).toBeVisible();
  await page.getByRole("button", { name: "12", exact: true }).click();
  await expect(page.getByRole("status", { name: "答對了！正確答案：12" })).toBeVisible();
  await expect(page.getByText("正確答案：12")).toBeVisible();
  await expect(page.getByText("答對了，來猜密碼！")).toBeVisible();
  await page.getByRole("button", { name: "確認密碼" }).click();
  await expect(page.getByRole("status", { name: "沒猜中，密碼在 1 到 49 之間" })).toBeVisible();
  await expect(page.getByText("目前密碼範圍：1 到 49")).toBeVisible();
  await expect(page.getByText("正確答案：12")).toHaveCount(0);
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
  await expect(page.getByText("破解成功！", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "一打雞蛋有幾顆？" })).toHaveCount(0);
  await page.getByRole("button", { name: "再玩一局" }).click();
  await expect(page.getByText("目前密碼範圍：1 到 100")).toBeVisible();
});

test("/ultimate-password 答錯題目先揭曉正解，再換題", async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0.11; });
  await page.goto("/ultimate-password");
  await page.getByRole("button", { name: "開始使用" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "下一步" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "開始遊戲" }).click();
  await page.getByRole("button", { name: "10", exact: true }).click();
  await expect(page.getByRole("status", { name: "答錯了，正確答案：12" })).toBeVisible();
  await expect(page.getByRole("button", { name: "12", exact: true })).toBeVisible();
});

test("/ultimate-password 自訂題庫還沒匯入時擋住開始，難度重整後還記得", async ({ page }) => {
  await page.goto("/ultimate-password");
  await page.getByRole("button", { name: "開始使用" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("tab", { name: "自訂題庫" }).click();
  await dialog.getByRole("button", { name: "下一步" }).click();
  await expect(dialog.getByRole("button", { name: "開始遊戲" })).toBeDisabled();
  await dialog.getByRole("button", { name: "上一步" }).click();
  await dialog.getByRole("tab", { name: "內建題庫" }).click();
  await dialog.getByRole("button", { name: "下一步" }).click();
  await dialog.getByRole("radio", { name: "普通以下" }).click();
  await expect(dialog.getByRole("button", { name: "開始遊戲" })).toBeEnabled();

  await page.reload();
  await page.getByRole("button", { name: "開始使用" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "下一步" }).click();
  await expect(page.getByRole("dialog").getByRole("radio", { name: "普通以下" })).toBeChecked();
});

test("/ultimate-password 重新整理後接著玩，密碼與範圍都還在", async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0.11; });
  await page.goto("/ultimate-password");
  await page.getByRole("button", { name: "開始使用" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "下一步" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "開始遊戲" }).click();
  await page.getByRole("button", { name: "12", exact: true }).click();
  await page.getByRole("button", { name: "確認密碼" }).click();
  await expect(page.getByText("目前密碼範圍：1 到 49")).toBeVisible();

  await page.reload();
  await expect(page.getByRole("button", { name: "開始使用" })).toHaveCount(0);
  await expect(page.getByText("目前密碼範圍：1 到 49")).toBeVisible();
  await page.getByRole("button", { name: "12", exact: true }).click();
  await expect(page.getByText("答對了，來猜密碼！")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "確認密碼" })).toBeVisible();

  await page.getByRole("button", { name: "重新出題" }).click();
  await expect(page.getByText("目前密碼範圍：1 到 100")).toBeVisible();
});
