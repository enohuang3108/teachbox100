import { expect, test } from "@playwright/test";

const FACES = ["跳三下", "拍手五下", "唱首歌", "學動物叫", "原地轉圈", "再擲一次"];

test("設定三顆文字骰，擲出後每顆都是骰面上的字", async ({ page }) => {
  await page.goto("/dice");
  await page.getByRole("button", { name: "開始使用" }).click();
  await page.getByText("3 顆", { exact: true }).click();
  await page.getByText("文字骰", { exact: true }).click();
  await page.getByRole("button", { name: "下一步" }).click();
  await expect(page.getByRole("textbox", { name: "第 1 面" })).toHaveValue(FACES[0]);
  await page.getByRole("button", { name: "開始", exact: true }).click();

  await page.getByRole("button", { name: "擲骰" }).click();
  const result = page.getByTestId("dice-result");
  await expect(result).toBeVisible({ timeout: 15_000 });
  const labels = await result.locator("span").allInnerTexts();
  expect(labels).toHaveLength(3);
  for (const label of labels) expect(FACES).toContain(label);
});

test("數字骰擲兩顆會顯示總和", async ({ page }) => {
  await page.goto("/dice");
  await page.getByRole("button", { name: "開始使用" }).click();
  await page.getByText("2 顆", { exact: true }).click();
  await page.getByText("數字骰", { exact: true }).click();
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("button", { name: "開始", exact: true }).click();

  await page.getByRole("button", { name: "擲骰" }).click();
  const result = page.getByTestId("dice-result");
  await expect(result).toBeVisible({ timeout: 15_000 });
  const values = (await result.locator("span").allInnerTexts()).map(Number);
  expect(values).toHaveLength(2);
  for (const v of values) expect([1, 2, 3, 4, 5, 6]).toContain(v);
  await expect(page.getByText(`總和 ${values[0] + values[1]}`)).toBeVisible();
});
