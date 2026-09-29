import { expect, test } from "@playwright/test";

test("翻牌牌組到 15 組後不能再加，未填好不能開始", async ({ page }) => {
  await page.goto("/memory");
  await page.getByRole("button", { name: "開始使用", exact: true }).click();
  for (let i = 0; i < 11; i++) {
    await page.getByRole("button", { name: "新增配對", exact: true }).click();
  }
  await expect(page.getByText("15／15 組", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "新增配對", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "下一步", exact: true }).click();
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
  await page.getByRole("button", { name: "下一步", exact: true }).click();
  await page.getByRole("button", { name: "開始遊戲", exact: true }).click();
  for (const face of ["甲一", "甲二", "乙一", "乙二"]) {
    await page.locator("button.memory-card").filter({ hasText: face }).click();
  }

  await expect(page.getByText("配對 2 / 2", { exact: true })).toBeVisible();
  await expect(page.getByText(/全部配對完成！總共翻了 2 次/)).toBeVisible();
  await page.getByRole("button", { name: "再玩一次", exact: true }).last().click();
  await expect(page.getByText("配對 0 / 2", { exact: true })).toBeVisible();
});
