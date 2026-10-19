import { expect, test } from "@playwright/test";
import * as XLSX from "xlsx";

const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([
  { 題型: "是非", 題目: "太陽從東邊升起", 正確答案: "是", 難度: "簡單" },
  { 題型: "是非", 題目: "月亮會自己發光", 正確答案: "否", 難度: "簡單" },
  { 題型: "選擇", 題目: "哪個是行星？", 選項A: "地球", 選項B: "月球", 正確答案: "A", 難度: "普通" },
]), "題庫");
const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

for (const theme of ["light", "dark"]) {
  test(`題庫清單：匯入用檔名、鉛筆編輯與勾選、分享後對方看得到題庫名稱（${theme}）`, async ({ page, browser }, testInfo) => {
    await page.route(/\/(?:ingest|monitoring)(?:\/|$|\?)/, (route) => route.fulfill({ status: 204 }));
    await page.route("**/api/share", (route) => route.fulfill({ status: 503 }));
    await page.goto("/quiz/territory", { waitUntil: "domcontentloaded" });
    await page.evaluate((dark) => document.documentElement.classList.toggle("dark", dark), theme === "dark");
    await page.getByRole("button", { name: "開始使用", exact: true }).click();
    const list = page.getByRole("radiogroup", { name: "題庫" });
    await expect(list.getByRole("radio", { name: "內建題庫" })).toBeChecked();

    await page.locator('input[type="file"]').setInputFiles({ name: "三年級自然.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer });
    await expect(list.getByRole("radio", { name: "三年級自然" })).toBeChecked();
    await expect(list).toContainText("簡單 2");
    await expect(list).toContainText("普通 1");

    await page.getByRole("button", { name: "編輯三年級自然", exact: true }).click();
    const editor = page.getByRole("dialog", { name: "編輯題庫" });
    await editor.getByRole("checkbox", { name: "使用第 2 題" }).click();
    await editor.getByRole("textbox", { name: "第 1 題題目" }).fill("");
    await editor.getByRole("button", { name: "儲存", exact: true }).click();
    await expect(editor.getByRole("alert")).toHaveText("題目還沒填");
    await editor.getByRole("textbox", { name: "第 1 題題目" }).fill("太陽從東方升起");
    await editor.getByRole("button", { name: "新增題目", exact: true }).click();
    await editor.getByRole("textbox", { name: "第 4 題題目" }).fill("一年有幾個月？");
    await editor.getByRole("textbox", { name: "第 4 題選項 A" }).fill("10");
    await editor.getByRole("textbox", { name: "第 4 題選項 B" }).fill("12");
    await editor.getByRole("radio", { name: "第 4 題正確答案 B" }).check();
    await page.screenshot({ animations: "disabled", path: `/tmp/territory-bank-editor-${testInfo.project.name}-${theme}.png` });
    await editor.getByRole("button", { name: "儲存", exact: true }).click();
    await expect(editor).toHaveCount(0);
    await expect(list).toContainText("普通 2");
    await expect(list).toContainText("停用 1");
    await page.screenshot({ animations: "disabled", path: `/tmp/territory-bank-list-${testInfo.project.name}-${theme}.png` });

    await page.getByRole("button", { name: "下一步", exact: true }).click();
    await page.getByRole("button", { name: "下一步", exact: true }).click();
    await page.getByRole("button", { name: "分享設定", exact: true }).click();
    const long = page.getByRole("textbox", { name: "完整連結" });
    await expect(long).toHaveValue(/#.+/);
    const url = await long.inputValue();

    const context = await browser.newContext();
    try {
      const recipient = await context.newPage();
      await recipient.goto(url, { waitUntil: "domcontentloaded" });
      await expect(recipient.getByText("已載入分享連結", { exact: true })).toBeVisible();
      const theirs = recipient.getByRole("radiogroup", { name: "題庫" });
      await expect(theirs.getByRole("radio", { name: "三年級自然" })).toBeChecked();
      await expect(theirs).toContainText("簡單 1"); // 只帶勾選的題目
      await expect(theirs).not.toContainText("停用");
    } finally {
      await context.close();
    }
  });
}
