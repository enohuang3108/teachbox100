import { expect, test } from "@playwright/test";

const title = "QA共用題庫";

async function openBank(page: import("@playwright/test").Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /^開始(使用|遊戲)$/ }).click();
  await expect(page.getByRole("radiogroup", { name: "題庫", exact: true })).toBeVisible();
}

test("瀏覽器建立題庫後四個遊戲共用，取消編輯與取消刪除不改資料", async ({ page }) => {
  test.slow();
  await openBank(page, "/quiz/territory");
  await page.getByRole("button", { name: "在瀏覽器出題", exact: true }).click();
  const editor = page.getByRole("dialog", { name: "編輯題庫" });
  await editor.getByRole("textbox", { name: /^題庫名稱/ }).fill(title);
  await editor.getByRole("button", { name: "儲存", exact: true }).click();
  const library = page.getByRole("radiogroup", { name: "題庫", exact: true });
  await expect(library.getByRole("radio", { name: title })).toBeChecked();

  for (const path of ["/quiz/morris", "/ultimate-password", "/monopoly"]) {
    await openBank(page, path);
    await expect(library.getByRole("radio", { name: title })).toBeVisible();
    await expect(library.getByRole("radio", { name: "內建題庫" })).toBeChecked();
    await page.getByRole("button", { name: `編輯${title}`, exact: true }).click();
    await editor.getByRole("textbox", { name: "第 1 題題目", exact: true }).fill("取消後不可留下這句");
    await editor.getByRole("button", { name: "刪除這份題庫", exact: true }).click();
    await expect(editor.getByRole("button", { name: "再按一次確定刪除", exact: true })).toBeVisible();
    await editor.getByRole("button", { name: "取消", exact: true }).click();
    await page.getByRole("button", { name: `編輯${title}`, exact: true }).click();
    await expect(editor.getByRole("textbox", { name: "第 1 題題目", exact: true })).toHaveValue("台灣最高的山是？");
    await editor.getByRole("button", { name: "取消", exact: true }).click();
  }
  await openBank(page, "/quiz/territory");
  await expect(library.getByRole("radio", { name: title })).toBeChecked();
});

test("題庫編輯器擋空名稱、全不選及空題目；不執行輸入的 HTML", async ({ page }) => {
  test.slow();
  await openBank(page, "/quiz/territory");
  await page.getByRole("button", { name: "在瀏覽器出題", exact: true }).click();
  const editor = page.getByRole("dialog", { name: "編輯題庫" });
  await editor.getByRole("button", { name: "儲存", exact: true }).click();
  await expect(editor.getByText("題庫名稱還沒填", { exact: true })).toBeVisible();
  await editor.getByRole("textbox", { name: /^題庫名稱/ }).fill(title);
  await editor.getByRole("checkbox", { name: "全選", exact: true }).click();
  await editor.getByRole("button", { name: "儲存", exact: true }).click();
  await expect(editor.getByText("至少勾選一題", { exact: true })).toBeVisible();
  await editor.getByRole("checkbox", { name: "全選", exact: true }).click();
  await editor.getByRole("textbox", { name: "第 1 題題目", exact: true }).fill("");
  await editor.getByRole("button", { name: "儲存", exact: true }).click();
  await expect(editor.getByRole("alert")).toHaveText("題目還沒填");
  const payload = '<img src=x onerror="window.__qaXss=1">';
  await editor.getByRole("textbox", { name: "第 1 題題目", exact: true }).fill(payload);
  await editor.getByRole("checkbox", { name: "使用第 2 題", exact: true }).click();
  await editor.getByRole("button", { name: "儲存", exact: true }).click();
  await page.getByRole("button", { name: `編輯${title}`, exact: true }).click();
  await expect(editor.getByRole("textbox", { name: "第 1 題題目", exact: true })).toHaveValue(payload);
  await editor.getByRole("button", { name: "取消", exact: true }).click();
  await page.getByRole("button", { name: "下一步", exact: true }).click();
  await page.getByRole("button", { name: "下一步", exact: true }).click();
  await page.getByRole("button", { name: "開始比賽", exact: true }).click();
  await page.getByRole("button", { name: "藍隊準備好了", exact: true }).click();
  await page.getByRole("button", { name: "紅隊準備好了", exact: true }).click();
  await expect(page.locator("#game-stage").getByText(payload)).toBeVisible();
  await expect(page.locator('#game-stage img[src="x"]')).toHaveCount(0);
  expect(await page.evaluate(() => (window as Window & { __qaXss?: number }).__qaXss)).toBeUndefined();
});
