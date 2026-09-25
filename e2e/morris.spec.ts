import { expect, test } from "@playwright/test";

const bank = Array.from({ length: 6 }, (_, index) => ({
  id: `e2e-${index}`,
  type: "choice",
  text: `測試題目 ${index + 1}`,
  options: ["正確", "錯誤"],
  answer: "正確",
  explanation: `解析 ${index + 1}`,
  difficulty: "easy",
}));

test("圈叉搶答會鎖場下棋、暫停答錯冷卻並可手動和局", async ({ page }) => {
  await page.addInitScript((questions) => {
    localStorage.setItem(
      "morris-game",
      JSON.stringify({
        state: {
          bank: questions,
          useDefault: false,
          cap: "hard",
          names: ["紅隊", "藍隊"],
          sound: false,
        },
        version: 0,
      }),
    );
  }, bank);

  await page.goto("/quiz/morris");
  await page.getByRole("button", { name: "開始使用", exact: true }).click();
  await page.getByRole("button", { name: "下一步", exact: true }).click();
  await page.getByRole("button", { name: "開始比賽", exact: true }).click();

  await expect(page.getByText("站到自己的題目旁，準備好再按。", { exact: true })).toHaveCount(0);
  const readyLabel = page.locator("[data-morris-ready-label]");
  const readyGrid = page.locator("[data-morris-grid]");
  await expect(readyLabel).toHaveText("READY?");
  const readyLabelBox = await readyLabel.boundingBox();
  const readyGridBox = await readyGrid.boundingBox();
  expect(readyLabelBox).not.toBeNull();
  expect(readyGridBox).not.toBeNull();
  expect(readyLabelBox!.x + readyLabelBox!.width / 2).toBeCloseTo(
    readyGridBox!.x + readyGridBox!.width / 2,
    0,
  );
  expect(readyLabelBox!.y + readyLabelBox!.height / 2).toBeCloseTo(
    readyGridBox!.y + readyGridBox!.height / 2,
    0,
  );
  const redReadyBox = await page
    .getByRole("button", { name: "紅隊準備好了", exact: true })
    .boundingBox();
  expect(redReadyBox).not.toBeNull();
  expect(redReadyBox!.width).toBeGreaterThanOrEqual(160);
  expect(redReadyBox!.height).toBeGreaterThanOrEqual(56);

  await page.getByRole("button", { name: "紅隊準備好了", exact: true }).click();
  await page.getByRole("button", { name: "藍隊準備好了", exact: true }).click();
  await expect(page.getByText(/^測試題目 /)).toHaveCount(0);
  await expect(page.getByText("準備出題", { exact: true })).toHaveCount(2);
  await expect(page.getByText("1", { exact: true })).toBeVisible({ timeout: 4_000 });
  await expect(page.getByText(/^測試題目 /).first()).toBeVisible({ timeout: 2_000 });
  const initialGrid = await page.locator("[data-morris-grid]").boundingBox();
  expect(initialGrid).not.toBeNull();
  expect(initialGrid!.width).toBeCloseTo(initialGrid!.height, 1);
  await expect(page.getByText("先連成三枚的一隊獲勝", { exact: true })).toHaveCount(0);
  await expect(page.getByText("紅隊 ○　藍隊 ×", { exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "紅隊選 錯誤", exact: true }).click();
  await expect(page.getByText("答錯了，3 秒後換題", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "藍隊選 正確", exact: true }).click();
  const correctFeedback = page.locator('[data-morris-feedback="correct"]');
  await expect(correctFeedback.getByText("正確", { exact: true })).toBeVisible();
  await expect(correctFeedback.getByText("取得一個棋步", { exact: true })).toBeVisible();
  await expect(page.getByText("藍隊，選一個空格放棋", { exact: true })).toBeVisible();
  const blueLane = page.locator('[data-morris-lane="blue"]');
  await expect(blueLane).toHaveClass(/morris-action-lane/);
  await expect(page.locator('[data-morris-lane="red"]')).not.toHaveClass(/morris-action-lane/);
  await expect
    .poll(() =>
      blueLane.evaluate((element) => getComputedStyle(element, "::after").animationName),
    )
    .toContain("morris-cue-breathe");
  await expect(page.getByRole("button", { name: "紅隊選 正確", exact: true })).toBeDisabled();
  await expect(page.locator('[data-morris-answers="red"]')).toHaveClass(/opacity-40/);
  await expect(page.locator('[data-morris-cell][data-action-hint="true"]')).toHaveCount(9);
  await page.getByRole("button", { name: "空格 1", exact: true }).click();
  const gridAfterPiece = await page.locator("[data-morris-grid]").boundingBox();
  expect(gridAfterPiece).not.toBeNull();
  expect(gridAfterPiece!.width).toBeCloseTo(initialGrid!.width, 1);
  expect(gridAfterPiece!.height).toBeCloseTo(initialGrid!.height, 1);

  await expect(page.getByText("答錯了，2 秒後換題", { exact: true })).toBeVisible({
    timeout: 1_500,
  });

  await page.getByRole("button", { name: "藍隊選 正確", exact: true }).click();
  await page.getByRole("button", { name: "空格 2", exact: true }).click();
  await page.getByRole("button", { name: "藍隊選 正確", exact: true }).click();
  await page.getByRole("button", { name: "空格 4", exact: true }).click();
  await page.getByRole("button", { name: "藍隊選 正確", exact: true }).click();
  await expect(page.locator('[data-morris-cell][data-action-hint="true"]')).toHaveCount(3);
  await page.locator('[data-morris-cell="0"]').click();
  await expect(page.locator('[data-morris-cell][data-action-hint="true"]')).toHaveCount(6);
  await page.locator('[data-morris-cell="2"]').click();

  await page.getByRole("button", { name: "結束本局", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "結束本局" }).click();
  await expect(page.getByText("和局", { exact: true })).toBeVisible();
  const resultDialog = page.getByRole("dialog", { name: "和局", exact: true });
  const resultTitle = resultDialog.locator("[data-morris-result-title]");
  const stageBox = await page.locator("[data-morris-board]").boundingBox();
  const dialogBox = await resultDialog.boundingBox();
  expect(stageBox).not.toBeNull();
  expect(dialogBox).not.toBeNull();
  expect(dialogBox!.x + dialogBox!.width / 2).toBeCloseTo(
    stageBox!.x + stageBox!.width / 2,
    0,
  );
  expect(dialogBox!.y + dialogBox!.height / 2).toBeCloseTo(
    stageBox!.y + stageBox!.height / 2,
    0,
  );
  await expect(resultTitle).toHaveCSS("font-size", /(?:4[0-9]|[5-9][0-9]|[1-9][0-9]{2,})px/);
  await expect(page.getByRole("button", { name: "再玩一次", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "設定", exact: true })).toBeVisible();
});

test("圈叉搶答連線獲勝時畫出大圈叉並貼上獲勝紙膠帶", async ({ page }) => {
  await page.addInitScript((questions) => {
    localStorage.setItem(
      "morris-game",
      JSON.stringify({
        state: { bank: questions, useDefault: false, cap: "hard", names: ["紅隊", "藍隊"], sound: false },
        version: 0,
      }),
    );
  }, bank);

  await page.goto("/quiz/morris");
  await page.getByRole("button", { name: "開始使用", exact: true }).click();
  await page.getByRole("button", { name: "下一步", exact: true }).click();
  await page.getByRole("button", { name: "開始比賽", exact: true }).click();
  await page.getByRole("button", { name: "紅隊準備好了", exact: true }).click();
  await page.getByRole("button", { name: "藍隊準備好了", exact: true }).click();

  for (const cell of [1, 5, 9]) {
    await page.getByRole("button", { name: "藍隊選 正確", exact: true }).click({ timeout: 6_000 });
    await page.getByRole("button", { name: `空格 ${cell}`, exact: true }).click();
  }

  await expect(page.getByText("藍隊 獲勝！", { exact: true })).toBeVisible();
  await expect(page.locator(".morris-win-mark line")).toHaveCount(2);
  await page.getByRole("button", { name: "再玩一次", exact: true }).click();
  await expect(page.getByText("藍隊 獲勝！", { exact: true })).toHaveCount(0);
});
