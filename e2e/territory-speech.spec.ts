import { expect, test, type Page } from "@playwright/test";

type SpeechWindow = Window & {
  testUtterance?: SpeechSynthesisUtterance;
  speechCancels?: number;
};

async function begin(page: Page, mode: "normal" | "unsupported" | "muted" = "normal") {
  await page.addInitScript((mode) => {
    localStorage.setItem("territory-game", JSON.stringify({ state: {
      useDefault: false, bank: [
        { id: "speech-1", type: "boolean", text: "太陽從東邊升起", answer: "是", difficulty: "easy" },
        { id: "speech-2", type: "boolean", text: "地球是圓的", answer: "是", difficulty: "easy" },
      ], cap: "hard", names: ["藍隊", "紅隊"], countdown: 3, size: "large", sound: mode !== "muted",
    }, version: 0 }));
    const w = window as SpeechWindow;
    w.speechCancels = 0;
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: mode === "unsupported" ? undefined : {
      getVoices: () => [],
      speak: (u: SpeechSynthesisUtterance) => { w.testUtterance = u; },
      cancel: () => { w.speechCancels = (w.speechCancels ?? 0) + 1; },
    } });
  }, mode);
  await page.route(/\/(?:ingest|monitoring)(?:\/|$|\?)/, (route) => route.fulfill({ status: 204 }));
  await page.goto("/quiz/territory");
  await page.getByRole("button", { name: "開始使用", exact: true }).click();
  await page.getByRole("button", { name: "下一步", exact: true }).click();
  await page.getByRole("button", { name: "開始比賽", exact: true }).click();
  await page.clock.install({ time: new Date("2026-10-17T12:00:00Z") });
  await page.clock.pauseAt(new Date("2026-10-17T12:00:01Z"));
  await page.getByRole("button", { name: "藍隊準備好了", exact: true }).click();
  await page.getByRole("button", { name: "紅隊準備好了", exact: true }).click();
}

for (const theme of ["light", "dark"]) {
  test(`先顯示並唸題，唸完才倒數並開放兩隊作答（${theme}）`, async ({ page }) => {
    await begin(page);
    await page.evaluate((theme) => document.documentElement.classList.toggle("dark", theme === "dark"), theme);
    const board = page.locator("[data-territory-board]");
    const answers = board.getByRole("button", { name: /隊選/ });
    await expect.poll(() => page.evaluate(() => (window as SpeechWindow).testUtterance?.text)).toBeTruthy();
    await expect(board.getByText("正在唸題目…", { exact: true })).toHaveCount(0);
    await expect(board.getByRole("button", { name: "略過朗讀" })).toHaveCount(0);
    const text = await page.evaluate(() => (window as SpeechWindow).testUtterance?.text);
    expect(text).toBeTruthy();
    await expect(board.getByText(text!, { exact: false })).toBeVisible();
    await page.evaluate(() => {
      const u = (window as SpeechWindow).testUtterance!;
      u.onstart?.({} as SpeechSynthesisEvent);
    });
    await page.clock.runFor(6000);
    await expect(answers).toHaveCount(0);
    await expect(board.getByText("3", { exact: true })).toHaveCount(0);
    await page.screenshot({ path: `/tmp/territory-reading-${theme}.png` });
    await page.evaluate(() => {
      const u = (window as SpeechWindow).testUtterance!;
      u.onend?.({} as SpeechSynthesisEvent);
    });
    await expect(board.getByText("3", { exact: true })).toBeVisible();
    await expect(board.getByText(text!, { exact: false })).toBeVisible();
    await page.screenshot({ path: `/tmp/territory-countdown-${theme}.png` });
    await page.clock.runFor(1000);
    await expect(board.getByText("2", { exact: true })).toBeVisible();
    await page.clock.runFor(1000);
    await expect(board.getByText("1", { exact: true })).toBeVisible();
    await expect(answers).toHaveCount(0);
    await page.clock.runFor(1000);
    await expect(answers).toHaveCount(4);
    await board.getByRole("button", { name: "藍隊選 是", exact: true }).click();
    await page.clock.runFor(2300);
    await expect.poll(() => page.evaluate(() => (window as SpeechWindow).testUtterance?.text)).not.toBe(text);
    await expect(answers).toHaveCount(0);
    await expect(board.getByText(text!, { exact: false })).toHaveCount(0);
    await page.getByRole("button", { name: "重新開始", exact: true }).click();
    await expect(board.getByText("READY?", { exact: true })).toBeVisible();
    expect(await page.evaluate(() => (window as SpeechWindow).speechCancels)).toBeGreaterThan(0);
    await page.clock.runFor(5000);
    await expect(answers).toHaveCount(0);
  });
}

for (const mode of ["unsupported", "muted"] as const) {
  test(`${mode} 時直接倒數，仍先顯示題目再顯示選項`, async ({ page }) => {
    await begin(page, mode);
    const board = page.locator("[data-territory-board]");
    await expect(board.getByText("3", { exact: true })).toBeVisible();
    await expect(board.getByRole("button", { name: /隊選/ })).toHaveCount(0);
    await page.clock.runFor(1000);
    await expect(board.getByText("2", { exact: true })).toBeVisible();
    await page.clock.runFor(1000);
    await expect(board.getByText("1", { exact: true })).toBeVisible();
    await page.clock.runFor(1000);
    await expect(board.getByRole("button", { name: /隊選/ })).toHaveCount(4);
  });
}

test("朗讀失敗或五秒無法啟動都能繼續倒數", async ({ page }) => {
  await begin(page);
  await page.evaluate(() => (window as SpeechWindow).testUtterance!.onerror?.({} as SpeechSynthesisErrorEvent));
  await expect(page.getByText("3", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "重新開始", exact: true }).click();
  await page.getByRole("button", { name: "藍隊準備好了", exact: true }).click();
  await page.getByRole("button", { name: "紅隊準備好了", exact: true }).click();
  await page.clock.runFor(5000);
  await expect(page.getByText("3", { exact: true })).toBeVisible();
  await page.clock.runFor(1000);
  await expect(page.getByText("2", { exact: true })).toBeVisible();
  await page.clock.runFor(1000);
  await expect(page.getByText("1", { exact: true })).toBeVisible();
  await page.clock.runFor(1000);
  await expect(page.getByRole("button", { name: /隊選/ })).toHaveCount(4);
});
