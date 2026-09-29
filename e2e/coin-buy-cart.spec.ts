import { expect, test } from "@playwright/test";

test("桌機拖放、手機點選商品都加入購物車並更新總金額", async ({ page }, testInfo) => {
  await page.goto("/coin/buy", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "開始練習", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "開始練習", exact: true }).click();
  const product = page.getByRole("button", { name: /^選擇商品：/ }).first();
  await expect(product).toBeVisible();
  const label = (await product.getAttribute("aria-label"))!;
  const match = label.match(/^選擇商品：(.+)，價格 (\d+) 元$/);
  expect(match).not.toBeNull();
  const [, name, price] = match!;
  const cart = page.getByRole("region", { name: "購物車放置區域" });
  if (testInfo.project.name === "mobile") {
    await product.tap();
  } else {
    await product.dragTo(cart);
  }
  await expect(cart.getByRole("heading", { name, exact: true })).toBeVisible();
  await expect(page.getByText("總金額").locator("..")).toContainText(price);
});
