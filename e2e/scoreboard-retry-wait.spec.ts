import { expect, test } from "@playwright/test";

/** 斷線後學生會想馬上按重新連線，打斷自動重連；鈕要倒數 10 秒才能按。 */
test("學生連不上老師時，重新連線鈕倒數 10 秒才可按", async ({ page }) => {
  await page.clock.install();
  await page.setViewportSize({ width: 393, height: 852 });
  // 不存在的房號：永遠等不到老師，停在「正在連上老師」
  await page.goto("/scoreboard/join#ZZZZ");
  await page.getByRole("textbox", { name: "你的名字" }).fill("小明");
  await page.getByRole("button", { name: "加入" }).click();

  const retry = page.getByRole("button", { name: /重新連線/ });
  await expect(retry).toHaveText("10 秒後可重新連線");
  await expect(retry).toBeDisabled();

  await page.clock.runFor(10_000);
  await expect(retry).toHaveText("重新連線");
  await expect(retry).toBeEnabled();
});
