import { expect, test } from "@playwright/test";

test("翻牌配對以有效預設牌組開始，會顯示盤面與翻牌次數", async ({ page }) => {
  await page.goto("/memory");
  await page.getByRole("button", { name: "開始遊戲" }).click();

  await expect(page.getByText("翻牌 0 次")).toBeVisible();
  const cards = page.getByRole("button", { name: "蓋著的牌" });
  await expect(cards).toHaveCount(8);
  await cards.nth(0).click();
  await cards.nth(1).click();
  await expect(page.getByText("翻牌 1 次")).toBeVisible();
});

test("轉盤與抽籤機以老師輸入的名單開始", async ({ page }) => {
  await page.goto("/draw/wheel");
  await page.getByRole("textbox", { name: "名單，一行一個" }).fill("小明\n小華");
  await page.getByRole("button", { name: "開始", exact: true }).click();
  await expect(page.getByRole("button", { name: "轉動轉盤" })).toBeVisible();

  await page.goto("/draw/lottery");
  await page.getByRole("textbox", { name: "名單，一行一個" }).fill("小明\n小華");
  await page.getByRole("button", { name: "開始", exact: true }).click();
  await expect(page.getByText("還剩 2 / 2 顆")).toBeVisible();
});

test("九九乘法選好範圍後開始，會出現第一題與四個答案", async ({ page }) => {
  await page.goto("/multiplication");
  await page.getByRole("button", { name: "開始練習" }).click();

  await expect(page.getByText("第 1 / 20 題")).toBeVisible();
  await expect(page.locator("button").filter({ hasText: /^\d+$/ })).toHaveCount(4);
});

test("大富翁用預設題庫可開始遊戲並進入第一位玩家回合", async ({ page }) => {
  await page.goto("/monopoly");
  await page.getByRole("button", { name: /使用預設題庫開始遊戲/ }).click();

  await expect(page.getByRole("button", { name: "擲骰子" })).toBeVisible();
});
