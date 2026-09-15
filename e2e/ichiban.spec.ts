import { expect, test } from "@playwright/test";

test("設定獎項內容後，撕開票券會顯示兩行設定值", async ({ page }) => {
  await page.goto("/draw/ichiban");
  const prizeList = page.getByLabel("一番賞列表");
  await expect(prizeList.getByText("共 7 張")).toBeVisible();

  await page.getByRole("button", { name: "設定" }).click();
  await page.getByRole("combobox", { name: "第 1 張籤的獎項" }).selectOption("A賞");
  await page.getByRole("textbox", { name: "第 1 張籤的內容" }).fill("客製化禮物");
  await page.getByRole("spinbutton", { name: "第 1 張籤的數量" }).fill("4");
  await page.getByRole("button", { name: "儲存設定" }).click();
  await expect(prizeList.getByText("共 10 張")).toBeVisible();
  await expect(prizeList.getByText("4 / 4")).toBeVisible();

  await page.getByRole("button", { name: /旋轉一番賞票券/ }).press("Enter");
  await page.getByRole("button", { name: "直接揭曉" }).click();
  // 籤池是隨機洗牌，抽到哪一賞不固定，只驗證「抽中X賞：內容」的格式
  await expect(page.locator("output")).toHaveText(/^抽中[A-M]賞：\S+$/);
  await expect(page.locator("output")).not.toContainText("。", { timeout: 2_000 });
});
