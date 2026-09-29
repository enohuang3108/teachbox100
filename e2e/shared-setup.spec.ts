import { expect, test } from "@playwright/test";

const units = [
  { path: "/monopoly", start: "開始遊戲" },
  { path: "/draw/wheel", start: "開始使用", names: true },
  { path: "/draw/gacha", start: "開始使用", names: true },
  { path: "/draw/ichiban", start: "開始使用" },
  { path: "/memory", start: "開始使用" },
  { path: "/multiplication", start: "開始使用" },
  { path: "/scoreboard", start: "開始使用" },
  { path: "/quiz/territory", start: "開始使用" },
  { path: "/quiz/morris", start: "開始使用" },
  { path: "/ultimate-password", start: "開始使用" },
] as const;

for (const unit of units) {
  test(`${unit.path} 的完整分享連結在新瀏覽器打開設定`, async ({ page, browser }) => {
    // 短連結由 API 測試保護；這裡只驗證完整連結與新瀏覽器的設定載入。
    await page.route("**/api/share", (route) => route.fulfill({ status: 503 }));
    await page.goto(unit.path, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: unit.start, exact: true }).click();
    if ("names" in unit) {
      await page.getByRole("textbox", { name: "名單，一行一個" }).fill("小明\n小華");
    }

    const share = page.getByRole("button", { name: "分享設定", exact: true });
    for (let step = 0; step < 4 && !(await share.isVisible()); step++) {
      await page.getByRole("button", { name: "下一步", exact: true }).click();
    }
    await expect(share).toBeEnabled();
    await share.click();
    const long = page.getByRole("textbox", { name: "完整連結" });
    await expect(long).toHaveValue(/#.+/);
    const url = await long.inputValue();
    expect(url).toContain(`${unit.path}#`);

    const recipientContext = await browser.newContext();
    try {
      const recipient = await recipientContext.newPage();
      await recipient.goto(url, { waitUntil: "domcontentloaded" });
      await expect(recipient.getByRole("dialog")).toBeVisible();
      await expect(recipient.getByText("已載入分享連結", { exact: true })).toBeVisible();
      await expect.poll(() => recipient.url()).toBe(new URL(unit.path, page.url()).toString());
    } finally {
      await recipientContext.close();
    }
  });
}

test("九九乘法的非預設範圍與題數會傳到新瀏覽器", async ({ page, browser }) => {
  await page.route("**/api/share", (route) => route.fulfill({ status: 503 }));
  await page.goto("/multiplication", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "開始使用" }).click();
  await page.getByRole("button", { name: "2 的乘法" }).click();
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("button", { name: "10 題" }).click();
  await page.getByRole("button", { name: "分享設定" }).click();
  const long = page.getByRole("textbox", { name: "完整連結" });
  await expect(long).toHaveValue(/#.+/);
  const url = await long.inputValue();
  expect(url).toContain("/multiplication#");

  const context = await browser.newContext();
  try {
    const recipient = await context.newPage();
    await recipient.goto(url, { waitUntil: "domcontentloaded" });
    await expect(recipient.getByText("已載入分享連結", { exact: true })).toBeVisible();
    await expect(recipient.getByRole("button", { name: "2 的乘法" })).toHaveAttribute("aria-pressed", "false");
    await recipient.getByRole("button", { name: "下一步" }).click();
    await expect(recipient.getByRole("button", { name: "10 題", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect.poll(() => recipient.url()).toBe(new URL("/multiplication", page.url()).toString());
  } finally {
    await context.close();
  }
});

test("大富翁的非預設玩家與骰子規則會傳到新瀏覽器", async ({ page, browser }) => {
  await page.route("**/api/share", (route) => route.fulfill({ status: 503 }));
  await page.goto("/monopoly", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "開始遊戲", exact: true }).click();
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("textbox", { name: "第 1 位玩家名字" }).fill("星星隊");
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("radiogroup", { name: "骰子數量" }).getByRole("radio", { name: "1 顆" }).click();
  await page.getByRole("button", { name: "分享設定" }).click();
  const long = page.getByRole("textbox", { name: "完整連結" });
  await expect(long).toHaveValue(/#.+/);
  const url = await long.inputValue();
  expect(url).toContain("/monopoly#");

  const context = await browser.newContext();
  try {
    const recipient = await context.newPage();
    await recipient.goto(url, { waitUntil: "domcontentloaded" });
    await expect(recipient.getByText("已載入分享連結", { exact: true })).toBeVisible();
    await recipient.getByRole("button", { name: "下一步" }).click();
    await expect(recipient.getByRole("textbox", { name: "第 1 位玩家名字" })).toHaveValue("星星隊");
    await recipient.getByRole("button", { name: "下一步" }).click();
    await expect(recipient.getByRole("radiogroup", { name: "骰子數量" }).getByRole("radio", { name: "1 顆" })).toHaveAttribute("aria-checked", "true");
    await expect.poll(() => recipient.url()).toBe(new URL("/monopoly", page.url()).toString());
  } finally {
    await context.close();
  }
});
