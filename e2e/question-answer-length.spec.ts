import { expect, test, type Locator } from "@playwright/test";
import * as XLSX from "xlsx";


async function expectAlignedAnswers(shortButton: Locator, longButton: Locator) {
  await shortButton.evaluate(() => document.fonts.ready.then(() => undefined));
  const longElement = await longButton.elementHandle();
  expect(longElement).not.toBeNull();
  // Dialog 進場會縮放整組答案，兩次跨 frame 的 boundingBox 會量到不同縮放率。
  // 在同一次瀏覽器執行裡量兩顆，仍要求寬高差小於原本的 0.05px。
  await expect.poll(() => shortButton.evaluate((short, long) => {
    const a = short.getBoundingClientRect();
    const b = long!.getBoundingClientRect();
    return Math.max(Math.abs(a.width - b.width), Math.abs(a.height - b.height));
  }, longElement)).toBeLessThan(0.05);
  await longElement?.dispose();
  const shortFont = await shortButton.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  const longFont = await longButton.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(longFont).toBeLessThanOrEqual(shortFont);
  expect(await longButton.evaluate((el) => el.scrollWidth <= el.clientWidth && el.scrollHeight <= el.clientHeight)).toBe(true);
}

const longAnswer = "植物利用陽光製造養分的過程";
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(Array.from({ length: 6 }, (_, i) => ({
  題型: "選擇", 題目: `哪個選項描述光合作用？（第 ${i + 1} 題）`,
  選項A: "呼吸", 選項B: "吸收水分", 選項C: "製造養分", 選項D: longAnswer,
  正確答案: "D", 難度: "普通",
}))), "題庫");
const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

for (const [route, start] of [["/ultimate-password", "開始使用"], ["/quiz/territory", "開始使用"], ["/quiz/morris", "開始使用"], ["/monopoly", "開始遊戲"]]) {
  test(`${route} 超長答案匯入只提醒，仍能繼續設定`, async ({ page }) => {
    test.slow(); // 開發站首次編譯與兩隊倒數也算在這段操作內
    await page.route(/\/(?:ingest|monitoring)(?:\/|$|\?)/, (route) => route.fulfill({ status: 204 }));
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: start, exact: true }).click();
    await page.locator('input[type="file"]').setInputFiles({ name: "長答案.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer });
    const warning = page.getByRole("status").filter({ hasText: "超過 10 個字" });
    await expect(warning).toContainText(longAnswer);
    await expect(warning).toContainText("仍可使用");
    await expect(page.getByRole("radio", { name: "長答案" })).toBeChecked();
    await expect(page.getByRole("button", { name: "下一步", exact: true })).toBeEnabled();
    if (route === "/quiz/territory" || route === "/quiz/morris") {
      await page.getByRole("button", { name: "下一步", exact: true }).click();
      await page.getByRole("button", { name: "下一步", exact: true }).click();
      await page.getByRole("button", { name: "開始比賽", exact: true }).click();
      await page.getByRole("button", { name: "紅隊準備好了", exact: true }).click();
      await page.getByRole("button", { name: "藍隊準備好了", exact: true }).click();
      const longButton = page.getByRole("button", { name: `紅隊選 ${longAnswer}`, exact: true });
      const shortButton = page.getByRole("button", { name: "紅隊選 呼吸", exact: true });
      await expect(longButton).toBeVisible({ timeout: 15_000 });
      await expectAlignedAnswers(shortButton, longButton);
      expect(await longButton.evaluate((el) => el.scrollWidth <= el.clientWidth && el.scrollHeight <= el.clientHeight)).toBe(true);
      if (route === "/quiz/morris") {
        const lane = page.locator('[data-morris-lane="red"]');
        const header = await lane.locator("header").boundingBox();
        const question = await lane.getByText(/^哪個選項描述光合作用/).boundingBox();
        expect(question!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
      }
      await page.mouse.move(0, 0);
      const unit = route.split("/").pop();
      await page.screenshot({ animations: "disabled", scale: "css", path: `/tmp/answer-length-${unit}-light-${test.info().project.name}.png` });
      await page.evaluate(() => document.documentElement.classList.add("dark"));
      await page.screenshot({ animations: "disabled", scale: "css", path: `/tmp/answer-length-${unit}-dark-${test.info().project.name}.png` });
      await longButton.click();
      if (route === "/quiz/morris") {
        await expect(page.getByText("紅隊，選一個空格放棋", { exact: true })).toBeVisible();
      } else {
        await expect(page.getByText("紅隊目前 3 格", { exact: true })).toBeAttached();
      }
      return;
    }
    if (route === "/monopoly") {
      await page.getByRole("button", { name: "下一步", exact: true }).click();
      await page.getByRole("button", { name: "下一步", exact: true }).click();
      await page.getByRole("button", { name: "下一步", exact: true }).click();
      await page.getByRole("dialog").getByRole("button", { name: "開始遊戲", exact: true }).click();
      // 固定骰點落在第 2 格買地，讓題目視窗的檢查可重現。
      await page.evaluate(() => { Math.random = () => 0.1; });
      await page.getByRole("button", { name: "擲骰子", exact: true }).click();
      const longButton = page.getByRole("button", { name: longAnswer, exact: true });
      await expect(longButton).toBeVisible({ timeout: 15_000 });
      const shortButton = page.getByRole("button", { name: "呼吸", exact: true });
      await expectAlignedAnswers(shortButton, longButton);
      expect(await longButton.evaluate((el) => el.scrollWidth <= el.clientWidth && el.scrollHeight <= el.clientHeight)).toBe(true);
      const avatar = page.getByRole("dialog").locator("img").first();
      await expect.poll(async () => (await avatar.boundingBox())?.y ?? -1).toBeGreaterThanOrEqual(16);
      await page.mouse.move(0, 0);
      await page.screenshot({ animations: "disabled", scale: "css", path: `/tmp/answer-length-monopoly-light-${test.info().project.name}.png` });
      await page.evaluate(() => document.documentElement.classList.add("dark"));
      await page.screenshot({ animations: "disabled", scale: "css", path: `/tmp/answer-length-monopoly-dark-${test.info().project.name}.png` });
      return;
    }
    await page.screenshot({ animations: "disabled", scale: "css", path: `/tmp/answer-length-warning-${test.info().project.name}.png` });
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.screenshot({ animations: "disabled", scale: "css", path: `/tmp/answer-length-warning-dark-${test.info().project.name}.png` });
    await page.evaluate(() => document.documentElement.classList.remove("dark"));
    await page.getByRole("button", { name: "下一步", exact: true }).click();
    await page.getByRole("button", { name: "下一步", exact: true }).click();
    await page.getByRole("button", { name: "開始遊戲", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const shortButton = page.getByRole("button", { name: "呼吸", exact: true });
    const longButton = page.getByRole("button", { name: longAnswer, exact: true });
    await expect(longButton).toBeVisible();
    const shortBox = await shortButton.boundingBox();
    const longBox = await longButton.boundingBox();
    expect(shortBox).not.toBeNull();
    expect(longBox).not.toBeNull();
    expect(longBox!.height).toBeGreaterThanOrEqual(96);
    expect(shortBox!.height).toBeCloseTo(longBox!.height, 1);
    for (const answer of ["吸收水分", "製造養分"]) {
      const box = await page.getByRole("button", { name: answer, exact: true }).boundingBox();
      expect(box!.width).toBeCloseTo(longBox!.width, 1);
      expect(box!.height).toBeCloseTo(longBox!.height, 1);
    }
    const shortFontSize = await shortButton.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    const mediumFontSize = await page.getByRole("button", { name: "吸收水分", exact: true }).evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    const longFontSize = await longButton.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(shortFontSize).toBe(mediumFontSize);
    expect(mediumFontSize).toBeGreaterThanOrEqual(longFontSize);
    expect(longFontSize).toBeGreaterThanOrEqual(24);
    for (const button of [shortButton, longButton]) {
      expect(await button.evaluate((el) => el.scrollWidth <= el.clientWidth && el.scrollHeight <= el.clientHeight)).toBe(true);
    }
    await page.mouse.move(0, 0);
    await page.screenshot({ animations: "disabled", scale: "css", fullPage: true, path: `/tmp/answer-length-game-light-${test.info().project.name}.png` });
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.screenshot({ animations: "disabled", scale: "css", fullPage: true, path: `/tmp/answer-length-game-dark-${test.info().project.name}.png` });
    await longButton.click();
    await expect(page.getByText("答對了", { exact: false }).first()).toBeVisible();
  });
}

for (const unit of ["multiplication", "clock"]) {
  test(`${unit} 選擇答案使用統一中等字級與整齊按鈕`, async ({ page }, testInfo) => {
    test.slow();
    await page.route(/\/(?:ingest|monitoring)(?:\/|$|\?)/, (route) => route.fulfill({ status: 204 }));
    await page.goto(unit === "clock" ? "/clock/current-time" : "/multiplication", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: unit === "clock" ? "開始練習" : "開始使用", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "下一步", exact: true }).click();
    if (unit === "clock") await page.getByLabel("選擇題", { exact: true }).check();
    await page.getByRole("dialog").getByRole("button", { name: "開始練習", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const buttons = unit === "clock"
      ? page.getByRole("button", { name: /^(上午\s*|下午\s*)?\d{1,2} 點(?: \d{1,2} 分)?$/ })
      : page.locator(".quiz-enter button");
    await expect(buttons).toHaveCount(4);
    if (unit === "clock") {
      await page.getByRole("slider", { name: "調整時間" }).press("Home");
      await expect(page.getByRole("button", { name: /^(上午\s*|下午\s*)?12 點$/ })).toBeVisible();
    }
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    const firstBox = await buttons.first().boundingBox();
    for (const button of await buttons.all()) {
      await expect(button).toBeVisible();
      const text = (await button.innerText()).replace(/^(上午|下午)\s*/, "").trim();
      const expectedFont = testInfo.project.name === "desktop" ? (Array.from(text).length <= 6 ? 36 : 32) : 24;
      expect(await button.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBe(expectedFont);
      const box = await button.boundingBox();
      expect(box!.width).toBeCloseTo(firstBox!.width, 1);
      expect(box!.height).toBeCloseTo(firstBox!.height, 1);
      expect(await button.evaluate((el) => el.scrollWidth <= el.clientWidth && el.scrollHeight <= el.clientHeight)).toBe(true);
    }
    await page.mouse.move(0, 0);
    await page.screenshot({ animations: "disabled", scale: "css", fullPage: true, path: `/tmp/answer-length-${unit}-light-${testInfo.project.name}.png` });
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.screenshot({ animations: "disabled", scale: "css", fullPage: true, path: `/tmp/answer-length-${unit}-dark-${testInfo.project.name}.png` });
    await buttons.first().click();
    if (unit === "clock") await expect(page.locator(".password-fb")).toBeVisible();
    else await expect(page.getByText("第 2 / 20 題・答對", { exact: false })).toBeVisible();
  });
}
