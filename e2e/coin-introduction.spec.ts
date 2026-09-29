import { expect, test } from "@playwright/test";

test("認識新臺幣列出九種面額，每種都能開圖文介紹", async ({ page }) => {
  await page.goto("/coin/introduction");
  await page.getByRole("button", { name: "開始認識", exact: true }).click();
  await expect(page.getByRole("button", { name: "全螢幕" })).toBeVisible();

  for (const value of [1, 5, 10, 50, 100, 200, 500, 1000, 2000]) {
    await page.getByText(`${value} 元`, { exact: true }).click();
    const dialog = page.getByRole("dialog", { name: `${value} 元 硬幣介紹` });
    await expect(dialog).toBeVisible();
    const front = dialog.getByRole("img", { name: `${value}元 正面` });
    await expect.poll(() => front.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    await dialog.getByRole("button", { name: "Close" }).click();
  }
});
