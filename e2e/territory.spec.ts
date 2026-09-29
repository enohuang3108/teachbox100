import { expect, test } from "@playwright/test";

test("領地戰可選小場地與 5 秒倒數，兩隊準備後才出題", async ({ page }) => {
  test.slow(); // 5 秒倒數加上正式版資源載入，慢機器仍要等完整出題
  await page.route(/\/(?:ingest|monitoring)(?:\/|$|\?)/, (route) => route.fulfill({ status: 204 }));
  await page.goto("/quiz/territory", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "開始使用", exact: true }).click();
  await page.getByRole("button", { name: "下一步", exact: true }).click();

  await page.locator('[id="場地大小-small"]').click();
  await page.locator('[id="每題倒數-5"]').click();
  await expect(page.locator('[id="場地大小-small"]')).toBeChecked();
  await expect(page.locator('[id="每題倒數-5"]')).toBeChecked();
  await page.getByRole("button", { name: "開始比賽", exact: true }).click();

  const board = page.locator("[data-territory-board]");
  await expect(board.getByText("READY?", { exact: true })).toBeVisible();
  const cells = await board.locator(":scope > div.grid > div").count();
  expect(cells).toBeGreaterThanOrEqual(12);
  expect(cells).toBeLessThanOrEqual(15); // 小場地的目標是 12 格，排版最多補到 125%
  await page.getByRole("button", { name: "藍隊準備好了", exact: true }).click();
  await expect(board.getByText("READY?", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "紅隊準備好了", exact: true }).click();

  await expect(board.getByText("5", { exact: true })).toBeVisible();
  await expect(board.getByText(/分題$/)).toBeVisible();
  await expect(board.getByText("READY?", { exact: true })).toHaveCount(0);
  await expect(board.getByRole("button", { name: /藍隊選/ }).first()).toBeVisible({
    timeout: 15_000,
  });
});
