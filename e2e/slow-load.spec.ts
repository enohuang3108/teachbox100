import { expect, test } from "@playwright/test";

test("介紹頁載入腳本前，開始鈕停用；載入後能開設定", async ({ page }) => {
  test.slow();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.stack ?? error.message));
  await page.route("**/_next/static/**/*.js", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 4_000));
    await route.continue();
  });

  await page.goto("/clock/current-time", { waitUntil: "domcontentloaded" });
  const start = page.getByRole("button", { name: "開始練習", exact: true });
  await expect(start).toBeVisible();
  await expect(start).toBeDisabled();
  await expect(start).toBeEnabled({ timeout: 30_000 });
  await start.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(errors).toEqual([]);
});
