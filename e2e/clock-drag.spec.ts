import { expect, test } from "@playwright/test";

test("右下角時間滑桿跨越 12 點後，時針與題目時間前進一小時", async ({ page }) => {
  await page.goto("/clock/current-time", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "開始練習", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "下一步" }).click();
  await dialog.getByRole("button", { name: "開始練習", exact: true }).click();
  const slider = page.getByRole("slider");
  await slider.focus();
  // 1439 → 往下 72 個 PageDown（Radix 一次 10 步）到 719，再 4 步到 11:55
  await slider.press("End");
  for (let i = 0; i < 72; i += 1) await slider.press("PageDown");
  for (let i = 0; i < 4; i += 1) await slider.press("ArrowDown");
  await expect(slider).toHaveAttribute("aria-valuenow", "715");

  const hands = page.locator("#clock > div");
  await expect.poll(async () => hands.nth(1).getAttribute("style")).toContain("rotate(330deg)");
  const hourBefore = await hands.nth(0).getAttribute("style");

  for (let i = 0; i < 10; i += 1) await slider.press("ArrowUp");
  await expect(slider).toHaveAttribute("aria-valuenow", "725");
  await expect.poll(async () => hands.nth(1).getAttribute("style")).toContain("rotate(30deg)");
  await expect.poll(async () => hands.nth(0).getAttribute("style")).not.toBe(hourBefore);
  await expect(page.locator("#clock")).toContainText("下午");
});
