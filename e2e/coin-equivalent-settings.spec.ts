import { expect, test } from "@playwright/test";

test("金錢等值換算記住關閉的硬幣面額", async ({ page }) => {
  await page.goto("/coin/equivalent");
  await page.getByRole("button", { name: "開始練習", exact: true }).click();

  const coin = page.getByRole("dialog").getByRole("img", { name: "1元硬幣" }).locator("xpath=ancestor::button[1]");
  await coin.click();
  await expect(coin).toHaveClass(/grayscale/);
  await page.getByRole("dialog").getByRole("button", { name: "開始練習" }).click();

  await page.reload();
  await page.getByRole("button", { name: "開始練習", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("img", { name: "1元硬幣" }).locator("xpath=ancestor::button[1]")).toHaveClass(/grayscale/);
});
