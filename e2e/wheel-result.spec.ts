import { expect, test } from "@playwright/test";

test("抽籤轉盤轉完會顯示名單中的結果", async ({ page }) => {
  await page.goto("/draw/wheel", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "開始使用", exact: true }).click();
  await page.getByRole("textbox", { name: "名單，一行一個" }).fill("小明\n小華");
  await page.getByRole("button", { name: "下一步", exact: true }).click();
  await page.getByRole("button", { name: "開始", exact: true }).click();
  await page.getByRole("button", { name: "轉動轉盤" }).click();
  const result = page.getByText("抽到了", { exact: true }).locator("..");
  await expect(result).toContainText(/小明|小華/, { timeout: 15_000 });
  await expect(page.getByRole("complementary", { name: "已抽出的名單" }).locator("li")).toHaveCount(1);
});
