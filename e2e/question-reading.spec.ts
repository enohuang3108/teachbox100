import { expect, test, type Page } from "@playwright/test";

type SpeechWindow = Window & { spoken?: SpeechSynthesisUtterance[]; cancelled?: number };

// 假的語音：記下每次要唸的句子，由測試決定什麼時候唸完
async function fakeSpeech(page: Page) {
  await page.addInitScript(() => {
    const w = window as SpeechWindow;
    w.spoken = [];
    w.cancelled = 0;
    Object.defineProperty(window, "SpeechSynthesisUtterance", { configurable: true, value: class {
      text: string;
      constructor(text: string) { this.text = text; }
    } });
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: {
      getVoices: () => [],
      speak: (u: SpeechSynthesisUtterance) => { w.spoken!.push(u); u.onstart?.({} as SpeechSynthesisEvent); },
      cancel: () => { w.cancelled!++; },
    } });
  });
  await page.route(/\/(?:ingest|monitoring)(?:\/|$|\?)/, (route) => route.fulfill({ status: 204 }));
}

const lastSpoken = (page: Page) => page.evaluate(() => (window as SpeechWindow).spoken!.at(-1)?.text);
const cancelled = (page: Page) => page.evaluate(() => (window as SpeechWindow).cancelled);
const finishSpeaking = (page: Page) =>
  page.evaluate(() => (window as SpeechWindow).spoken!.at(-1)!.onend?.({} as SpeechSynthesisEvent));

test("終極密碼先唸題目，唸完才開放作答", async ({ page }) => {
  await fakeSpeech(page);
  await page.addInitScript(() => { Math.random = () => 0.11; });
  await page.goto("/ultimate-password", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "開始使用" }).click();
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("button", { name: "開始遊戲" }).click();
  const heading = page.locator("#game-stage h2");
  await expect.poll(() => lastSpoken(page)).toBe(await heading.textContent());
  const answer = page.getByRole("button", { name: "是", exact: true });
  await expect(answer).toBeDisabled();
  await finishSpeaking(page);
  await expect(answer).toBeEnabled();
});

test("終極密碼打開設定就停止朗讀，關掉設定再唸一次", async ({ page }) => {
  await fakeSpeech(page);
  await page.goto("/ultimate-password", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "開始使用" }).click();
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("button", { name: "開始遊戲" }).click();
  await expect.poll(() => lastSpoken(page)).toBeTruthy();
  const times = await page.evaluate(() => (window as SpeechWindow).spoken!.length);
  await page.getByRole("button", { name: "設定", exact: true }).click();
  await expect.poll(() => cancelled(page)).toBeGreaterThan(0);
  await page.keyboard.press("Escape");
  await expect.poll(() => page.evaluate(() => (window as SpeechWindow).spoken!.length)).toBe(times + 1);
});

test("大富翁跳出題目先唸，唸完才開放作答", async ({ page }) => {
  await fakeSpeech(page);
  await page.goto("/monopoly", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "開始遊戲", exact: true }).click();
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "開始遊戲", exact: true }).click();
  // 固定骰點落在第 2 格買地
  await page.evaluate(() => { Math.random = () => 0.1; });
  await page.getByRole("button", { name: "擲骰子", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("答對才能購買")).toBeVisible({ timeout: 15_000 });
  await expect.poll(() => lastSpoken(page)).toBeTruthy();
  const answers = dialog.locator("fieldset button");
  await expect(answers.first()).toBeDisabled();
  await finishSpeaking(page);
  await expect(answers.first()).toBeEnabled();
});

test("大富翁音效調到 0 就不朗讀，題目直接可以作答", async ({ page }) => {
  await fakeSpeech(page);
  await page.addInitScript(() => {
    localStorage.setItem("monopoly-audio", JSON.stringify({ state: { bgmVolume: 0.3, sfxVolume: 0 }, version: 0 }));
  });
  await page.goto("/monopoly", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "開始遊戲", exact: true }).click();
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "開始遊戲", exact: true }).click();
  await page.evaluate(() => { Math.random = () => 0.1; });
  await page.getByRole("button", { name: "擲骰子", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("答對才能購買")).toBeVisible({ timeout: 15_000 });
  await expect(dialog.locator("fieldset button").first()).toBeEnabled();
  expect(await lastSpoken(page)).toBeUndefined();
});

test("圈叉搶答兩隊題目不同，不提供朗讀也不唸題", async ({ page }) => {
  await fakeSpeech(page);
  await page.goto("/quiz/morris", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "開始使用" }).click();
  await page.getByRole("button", { name: "下一步", exact: true }).click();
  await page.getByRole("button", { name: "下一步", exact: true }).click();
  await expect(page.getByRole("switch", { name: "顯示注音" })).toBeVisible();
  await expect(page.getByRole("region", { name: "題目朗讀設定" })).toHaveCount(0);
  await page.getByRole("button", { name: "開始比賽", exact: true }).click();
  await page.getByRole("button", { name: "紅隊準備好了", exact: true }).click();
  await page.getByRole("button", { name: "藍隊準備好了", exact: true }).click();
  await expect(page.locator('[data-morris-lane="red"] p.zhuyin-text')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("button", { name: /唸題目/ })).toHaveCount(0);
  expect(await page.evaluate(() => (window as SpeechWindow).spoken!.length)).toBe(0);
});

test("領地戰匯入的題庫，圈叉搶答也選得到", async ({ page }) => {
  await page.route(/\/(?:ingest|monitoring)(?:\/|$|\?)/, (route) => route.fulfill({ status: 204 }));
  await page.goto("/quiz/territory", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "開始使用" }).click();
  await page.getByRole("button", { name: "在瀏覽器出題" }).click();
  const editor = page.getByRole("dialog", { name: "編輯題庫" });
  await editor.getByRole("textbox", { name: "題庫名稱" }).fill("共用自然");
  await editor.getByRole("button", { name: "儲存", exact: true }).click();
  await expect(page.getByRole("radio", { name: /共用自然/ })).toBeChecked();

  await page.goto("/quiz/morris", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "開始使用" }).click();
  const shared = page.getByRole("radio", { name: /共用自然/ });
  await expect(shared).toBeVisible();
  await expect(page.getByRole("radio", { name: /內建題庫/ })).toBeChecked(); // 各遊戲自己記得選哪份
});
