import { expect, test } from "@playwright/test";

test("九九乘法完成後保留作答紀錄，窄螢幕不遮住分數", async ({ page }, testInfo) => {
  test.slow();
  await page.goto("/multiplication");
  await page.getByRole("button", { name: "開始使用", exact: true }).click();
  await page.getByRole("button", { name: "下一步", exact: true }).click();
  await page.getByRole("group", { name: "出幾題" }).getByRole("button", { name: "10 題" }).click();
  await page.getByRole("button", { name: "開始練習", exact: true }).click();

  for (let index = 0; index < 10; index++) {
    const equation = page.locator(".quiz-enter > p");
    const text = await equation.textContent();
    const match = text?.match(/(\d+)\s*×\s*(\d+)\s*=/);
    expect(match).not.toBeNull();
    const answer = Number(match![1]) * Number(match![2]);
    const options = page.locator(".quiz-enter button");
    const values = (await options.allTextContents()).map(Number);
    const choice = index === 0 ? values.find((value) => value !== answer)! : answer;
    await options.filter({ hasText: new RegExp(`^${choice}$`) }).click();
    if (index < 9) {
      await expect(page.getByText(new RegExp(`第 ${index + 2} / 10 題`))).toBeVisible({ timeout: 3_000 });
    }
  }

  await expect(page.getByRole("button", { name: "再練一輪", exact: true })).toBeVisible();
  await expect(page.locator(".cheer-pop")).toContainText("9/10");
  await expect(page.getByText("好厲害！", { exact: true })).toBeVisible();
  const log = page.getByRole("complementary", { name: "作答紀錄" });
  await expect(log.locator("li")).toHaveCount(10);
  await expect(log.locator("li").first()).toContainText("答錯");

  const logBox = await log.boundingBox();
  const scoreBox = await page.locator(".cheer-pop").boundingBox();
  const titleBarBox = await page.locator("header").first().boundingBox();
  expect(logBox).not.toBeNull();
  expect(scoreBox).not.toBeNull();
  expect(titleBarBox).not.toBeNull();
  const scrollY = await page.evaluate(() => window.scrollY);
  expect(logBox!.y + scrollY).toBeGreaterThanOrEqual(titleBarBox!.height);
  await expect(page.locator(".cheer-pop")).toBeInViewport();
  const horizontalOverlap = logBox!.x < scoreBox!.x + scoreBox!.width && scoreBox!.x < logBox!.x + logBox!.width;
  const verticalOverlap = logBox!.y < scoreBox!.y + scoreBox!.height && scoreBox!.y < logBox!.y + logBox!.height;
  expect(horizontalOverlap && verticalOverlap).toBe(false);

  if (process.env.QA_CAPTURE_DIR) {
    await page.screenshot({ path: `${process.env.QA_CAPTURE_DIR}/MULT-004-${testInfo.project.name}-light.png`, fullPage: true });
    await page.locator("html").evaluate((element) => element.classList.add("dark"));
    await page.screenshot({ path: `${process.env.QA_CAPTURE_DIR}/MULT-004-${testInfo.project.name}-dark.png`, fullPage: true });
  }
});

test("九九乘法全對時顯示滿分貼紙與紙屑畫布", async ({ page }, testInfo) => {
  test.slow();
  await page.goto("/multiplication", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "開始使用", exact: true }).click();
  await page.getByRole("button", { name: "下一步", exact: true }).click();
  await page.getByRole("group", { name: "出幾題" }).getByRole("button", { name: "10 題" }).click();
  await page.getByRole("button", { name: "開始練習", exact: true }).click();

  for (let index = 0; index < 10; index += 1) {
    const question = await page.locator(".quiz-enter > p").textContent();
    const match = question?.match(/(\d+)\s*×\s*(\d+)\s*=/);
    expect(match).not.toBeNull();
    const answer = Number(match![1]) * Number(match![2]);
    await page.locator(".quiz-enter button").filter({ hasText: new RegExp(`^${answer}$`) }).click();
    if (index < 9) await expect(page.getByText(new RegExp(`第 ${index + 2} / 10 題`))).toBeVisible();
  }

  await expect(page.locator(".cheer-pop")).toContainText("10/10");
  await expect(page.locator(".victory-tape")).toBeVisible();
  await expect(page.locator("#game-stage canvas")).toBeVisible();
  if (process.env.QA_CAPTURE_DIR) {
    await page.screenshot({ path: `${process.env.QA_CAPTURE_DIR}/MULT-002-${testInfo.project.name}-all-correct.png`, fullPage: true });
  }
});
