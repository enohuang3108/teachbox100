import { expect, test } from "@playwright/test";

test("自訂結果：爬下一位揭曉一格，全部爬完每人對到不同結果", async ({ page }) => {
  // 開場洗格子 3 秒，加上爬線動畫
  test.slow();
  await page.goto("/draw/ladder");
  await page.getByRole("button", { name: "開始使用" }).click();
  await page.getByRole("textbox", { name: "名單，一行一個" }).fill("小明\n小華\n小美");
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("textbox", { name: "結果，一行一個" }).fill("掃地\n擦黑板");
  await expect(page.getByText("結果要跟名單一樣多（名單 3 個，結果 2 個）")).toBeVisible();
  await page.getByRole("textbox", { name: "結果，一行一個" }).fill("掃地\n擦黑板\n澆花");
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("button", { name: "開始", exact: true }).click();

  await page.getByRole("button", { name: "爬下一位" }).click();
  await expect(page.getByTestId("ladder-result")).toContainText("小明");
  await page.getByRole("button", { name: "同時進行" }).click();

  await expect(page.getByRole("list", { name: "結果" })).not.toContainText("？");
  // 爬過的路線都留在板子上
  await expect(page.locator("polyline[data-route]")).toHaveCount(3);
  const results = await page.getByRole("list", { name: "結果" }).locator("li").allInnerTexts();
  expect(results.sort()).toEqual(["掃地", "擦黑板", "澆花"].sort());

  // 點結果也能回頭看那個人的路線
  await page.getByRole("button", { name: "看 小華 的路線" }).click();
  await expect(page.getByRole("button", { name: "爬 小華 的路線" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("ladder-result")).toContainText("小華");
});

test("連點兩個名字，先出發的照樣爬完，兩個都揭曉", async ({ page }) => {
  test.slow();
  await page.goto("/draw/ladder");
  await page.getByRole("button", { name: "開始使用" }).click();
  await page.getByRole("textbox", { name: "名單，一行一個" }).fill("小明\n小華\n小美");
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("textbox", { name: "結果，一行一個" }).fill("掃地\n擦黑板\n澆花");
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("button", { name: "開始", exact: true }).click();

  await expect(page.getByRole("button", { name: "爬下一位" })).toBeEnabled();
  await page.getByRole("button", { name: "爬 小明 的路線" }).click();
  await page.getByRole("button", { name: "爬 小華 的路線" }).click();
  await expect(page.getByRole("button", { name: "看 小明 的路線" })).toBeVisible();
  await expect(page.getByRole("button", { name: "看 小華 的路線" })).toBeVisible();
  await expect(page.locator("polyline[data-route]")).toHaveCount(2);
});

test("分組：同時進行後結果列出每一組，人數最多差一人", async ({ page }) => {
  // 開場洗格子 3 秒，加上爬線動畫
  test.slow();
  await page.goto("/draw/ladder");
  await page.getByRole("button", { name: "開始使用" }).click();
  await page
    .getByRole("textbox", { name: "名單，一行一個" })
    .fill(Array.from({ length: 7 }, (_, i) => `學生${i + 1}`).join("\n"));
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("tab", { name: "分組" }).click();
  await page.getByText("3 組", { exact: true }).click();
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("button", { name: "開始", exact: true }).click();

  await page.getByRole("button", { name: "同時進行" }).click();
  await expect(page.getByRole("list", { name: "結果" })).not.toContainText("？");
  const labels = await page.getByRole("list", { name: "結果" }).locator("li").allInnerTexts();
  const sizes = Object.values(Object.groupBy(labels, (l) => l)).map((g) => g!.length);
  expect(sizes.sort()).toEqual([2, 2, 3]);
});
