import { expect, test } from "@playwright/test";

test("點球、取消、打開揭曉、放回與再抽一顆", async ({ page }) => {
  await page.goto("/draw/lottery");
  await page.getByRole("textbox", { name: "名單，一行一個" }).fill("小明\n小華");
  await page.getByRole("button", { name: "開始", exact: true }).click();

  const box = page.getByRole("button", { name: "扭蛋機，點一顆扭蛋或按 Enter 開始抽籤" });
  await box.press("Enter");
  await expect(page.getByRole("button", { name: "打開", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "取消", exact: true }).click();
  await expect(box).toBeVisible();

  await box.press("Enter");
  await page.getByRole("button", { name: "打開", exact: true }).click();
  await expect(page.getByTestId("lottery-result")).toHaveText("小明");
  await page.getByRole("button", { name: "放回去", exact: true }).click();
  await expect(page.getByText("還剩 2 / 2 顆")).toBeVisible();

  await box.press("Enter");
  await page.getByRole("button", { name: "打開", exact: true }).click();
  await page.getByRole("button", { name: "再抽一顆", exact: true }).click();
  await expect(page.getByText("還剩 1 / 2 顆")).toBeVisible();
  await page.getByRole("button", { name: "全部放回", exact: true }).first().click();
  await expect(page.getByText("還剩 2 / 2 顆")).toBeVisible();
});
