import { expect, test } from "@playwright/test";

test("翻牌牌組到 15 組後不能再加，未填好不能開始", async ({ page }) => {
  await page.goto("/memory");
  await page.getByRole("button", { name: "開始使用", exact: true }).click();
  for (let i = 0; i < 11; i++) {
    await page.getByRole("button", { name: "新增配對", exact: true }).click();
  }
  await expect(page.getByText("15／15 組", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "新增配對", exact: true })).toBeDisabled();
  for (let i = 0; i < 2; i++) {
    await page.getByRole("button", { name: "下一步", exact: true }).click();
  }
  await expect(page.getByText("有配對還沒填好，請看紅字那一組", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "開始遊戲", exact: true })).toBeDisabled();
});

test("翻牌配對完成後顯示結算，能再玩一次", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "memory-game",
      JSON.stringify({
        state: {
          deck: [
            { id: "a", faces: ["甲一", "甲二"], sameFace: false },
            { id: "b", faces: ["乙一", "乙二"], sameFace: false },
          ],
          preview: false,
          sound: false,
        },
        version: 0,
      }),
    );
  });

  await page.goto("/memory");
  await page.getByRole("button", { name: "開始使用", exact: true }).click();
  for (let i = 0; i < 2; i++) {
    await page.getByRole("button", { name: "下一步", exact: true }).click();
  }
  await page.getByRole("button", { name: "開始遊戲", exact: true }).click();
  for (const face of ["甲一", "甲二", "乙一", "乙二"]) {
    await page.locator("button.memory-card").filter({ hasText: face }).click();
  }

  await expect(page.getByText("全部配對完成！", { exact: true })).toBeVisible();
  await expect(page.getByText(/翻了 \d+ 次/)).toHaveCount(0);
  await page.getByRole("button", { name: "再玩一次", exact: true }).last().click();
  await expect(page.getByText(/全部配對完成/)).toBeHidden();
  await expect(page.getByRole("button", { name: "蓋著的牌" })).toHaveCount(4);
});

test("翻牌批次輸入一行一組，貼上就成牌組，切回一般輸入看得到", async ({ page }) => {
  await page.goto("/memory");
  await page.getByRole("button", { name: "開始使用", exact: true }).click();
  await page.getByRole("tab", { name: "批次輸入" }).click();
  const box = page.getByRole("textbox", { name: "批次輸入，一行一組" });
  await expect(box).toHaveValue("貓 cat\n狗 dog\n太陽 sun\n月亮 moon");

  await box.fill("蘋果 apple\n蘋果 pie");
  await expect(page.getByText("第 2 行：「蘋果」已在配對 1 用過")).toBeVisible();

  await box.fill("蘋果 apple\n\n香蕉 banana\n星星");
  await expect(page.getByText("3／15 組", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "一般輸入" }).click();
  await expect(page.getByRole("textbox", { name: "配對 2 卡面 2" })).toHaveValue("banana");
  await expect(page.getByRole("switch").nth(2)).toBeChecked();
});
