import { expect, test } from "@playwright/test";

test("計時器開始後可暫停，重設後回到可開始狀態", async ({ page }) => {
  await page.goto("/timer");
  await page.getByRole("button", { name: "開始", exact: true }).click();
  await expect(page.getByRole("button", { name: "暫停", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "重設", exact: true }).click();
  await expect(page.getByRole("button", { name: "開始", exact: true })).toBeVisible();
});

test("計分板點組別加分，切換分數步長後依新步長累加", async ({ page }) => {
  await page.goto("/scoreboard");
  const firstTeam = page.locator("[data-score-card]").first();

  await firstTeam.getByRole("button", { name: /第 1 組 加 1 分/ }).click();
  await expect(firstTeam.locator("[data-score-value]")).toHaveText("1");

  await page.getByRole("button", { name: "5 分", exact: true }).click();
  await firstTeam.getByRole("button", { name: /第 1 組 加 5 分/ }).click();
  await expect(firstTeam.locator("[data-score-value]")).toHaveText("6");
});

test("噪音計被拒絕麥克風時，會給老師可採取行動的提示", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia: () => Promise.reject(new DOMException("Denied", "NotAllowedError")) },
      configurable: true,
    });
  });
  await page.goto("/noise");
  await page.getByRole("button", { name: "打開麥克風" }).click();

  await expect(page.getByText("瀏覽器擋住了麥克風。", { exact: false })).toBeVisible();
});
