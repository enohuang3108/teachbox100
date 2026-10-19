import { expect, test } from "@playwright/test";

test("分享預覽保留大小寫、處理失效與服務錯誤，修改代碼後不採用舊回應", async ({ page }) => {
  let releaseOld!: () => void;
  const oldResponse = new Promise<void>((resolve) => { releaseOld = resolve; });
  const requested: string[] = [];
  await page.route("**/api/share/*", async (route) => {
    const code = route.request().url().split("/").at(-1)!;
    requested.push(code);
    if (code === "OlddEFGH") {
      await oldResponse;
      await route.fulfill({ json: { game: "過時預覽", bank: "舊題庫" } });
    } else if (code === "abcdEFGH") {
      await route.fulfill({ json: { game: "領地戰", bank: "三年級自然" } });
    } else {
      await route.fulfill({ status: code === "abcdefgh" ? 404 : 503 });
    }
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const dialog = page.getByRole("dialog", { name: "使用分享連結" });
  // domcontentloaded 時還沒 hydrate，第一下可能點空
  await expect(async () => {
    await page.getByRole("button", { name: "使用分享連結", exact: true }).click();
    await expect(dialog).toBeVisible({ timeout: 1_000 });
  }).toPass();
  const input = dialog.getByRole("textbox", { name: "分享代碼" });
  const open = dialog.getByRole("button", { name: "開啟", exact: true });
  await expect(open).toBeDisabled();
  await input.fill("123");
  await expect(open).toBeDisabled();
  await input.fill("OlddEFGH");
  await expect(dialog.getByText("查詢中…")).toBeVisible();
  await input.fill("https://teachbox100.com/s/abcdEFGH");
  await expect(dialog.getByText("三年級自然", { exact: true })).toBeVisible();
  const oldFinished = page.waitForResponse((response) => response.url().endsWith("/api/share/OlddEFGH"));
  releaseOld();
  await (await oldFinished).finished();
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await expect(open).toBeEnabled();
  await expect(dialog.getByText("三年級自然", { exact: true })).toBeVisible();
  await expect(dialog.getByText("過時預覽", { exact: true })).toHaveCount(0);
  await input.fill("s/abcdefgh");
  await expect(dialog.getByText(/找不到這個連結/)).toBeVisible();
  await expect(open).toBeDisabled();
  await input.fill("ERRRabcd");
  await expect(dialog.getByText("暫時查不到，請稍後再試", { exact: true })).toBeVisible();
  await expect(open).toBeDisabled();
  expect(requested).toContain("abcdEFGH");
  expect(requested).toContain("abcdefgh");
  expect(requested).not.toContain("123");
});
