import { expect, test } from "@playwright/test";

test("點一顆扭蛋直接揭曉，繼續抽會收進紀錄，全部放回", async ({ page }) => {
  await page.goto("/draw/gacha");
  await page.getByRole("button", { name: "開始使用" }).click();
  await page.getByRole("textbox", { name: "名單，一行一個" }).fill("小明\n小華");
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("button", { name: "開始", exact: true }).click();
  await expect(page.getByText("還剩 2 / 2 顆")).toBeVisible();

  // canvas 上的球位置不固定，走讀螢幕器用的替代按鈕，確定抽到第一顆
  await page.getByRole("button", { name: "抽第 1 顆扭蛋" }).press("Enter");
  await expect(page.getByTestId("gacha-result")).toHaveText("小明");
  await page.getByRole("button", { name: "繼續抽", exact: true }).click();
  await expect(page.getByText("還剩 1 / 2 顆")).toBeVisible();

  await page.getByRole("button", { name: "全部放回", exact: true }).first().click();
  await expect(page.getByText("還剩 2 / 2 顆")).toBeVisible();
});
