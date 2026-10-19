import { expect, test, type Browser, type Page, type TestInfo } from "@playwright/test";
import { writeFile } from "node:fs/promises";

const title = "QA分享勾選題目";
const assets = "docs/qa/reports/assets/2026-10-19-71adf62";

async function createBank(page: Page, baseURL: string, disableSecond: boolean) {
  await page.goto(`${baseURL}/quiz/territory`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "開始使用", exact: true }).click();
  await page.getByRole("button", { name: "在瀏覽器出題", exact: true }).click();
  const editor = page.getByRole("dialog", { name: "編輯題庫" });
  await editor.getByRole("textbox", { name: /^題庫名稱/ }).fill(title);
  if (disableSecond) await editor.getByRole("checkbox", { name: "使用第 2 題", exact: true }).click();
  await editor.getByRole("button", { name: "儲存", exact: true }).click();
}

async function receiveBank(page: Page, browser: Browser, baseURL: string, testInfo: TestInfo) {
  await page.route("**/api/share", (route) => route.fulfill({ status: 503 }));
  await createBank(page, baseURL, false);
  await page.getByRole("button", { name: "下一步", exact: true }).click();
  await page.getByRole("button", { name: "下一步", exact: true }).click();
  await page.getByRole("button", { name: "分享設定", exact: true }).click();
  const long = page.getByRole("textbox", { name: "完整連結" });
  await expect(long).toHaveValue(/#.+/);
  const url = await long.inputValue();
  const context = await browser.newContext({
    viewport: testInfo.project.name === "mobile" ? { width: 390, height: 844 } : { width: 1440, height: 900 },
  });
  try {
    const setup = await context.newPage();
    await createBank(setup, baseURL, true);
    await setup.close();
    const recipient = await context.newPage();
    await recipient.goto(url, { waitUntil: "domcontentloaded" });
    await expect.poll(() => new URL(recipient.url()).hash).toBe("");
    await expect(recipient.getByRole("dialog", { name: "領地戰設定" })).toBeVisible();
    return { context, recipient };
  } catch (error) {
    await context.close();
    throw error;
  }
}

test("接收分享時沿用相同題庫內容，也應採用分享者勾選的題目", async ({ page, browser, baseURL }, testInfo) => {
  test.slow();
  const { context, recipient } = await receiveBank(page, browser, baseURL!, testInfo);
  try {
    const list = recipient.getByRole("radiogroup", { name: "題庫", exact: true });
    await expect(list.getByRole("radio", { name: title })).toBeChecked();
    await recipient.screenshot({ path: `${assets}/TERR-012-${testInfo.project.name}.png`, scale: "css" });
    await expect(list).not.toContainText("停用 1");
    await expect(list).toContainText("普通 1");
  } finally {
    await context.close();
  }
});

test("手機共用題庫清單的下一步按鈕完整留在視窗內", async ({ page, browser, baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "390px 手機版的版面合約");
  test.slow();
  const { context, recipient } = await receiveBank(page, browser, baseURL!, testInfo);
  try {
    const next = await recipient.getByRole("button", { name: "下一步", exact: true }).boundingBox();
    const viewport = recipient.viewportSize()!;
    await recipient.screenshot({ path: `${assets}/TERR-013-mobile.png`, scale: "css" });
    await writeFile(`${assets}/TERR-013-mobile.json`, JSON.stringify({ viewport, next }, null, 2));
    expect(next).not.toBeNull();
    expect(next!.x).toBeGreaterThanOrEqual(0);
    expect(next!.x + next!.width).toBeLessThanOrEqual(viewport.width);
  } finally {
    await context.close();
  }
});
