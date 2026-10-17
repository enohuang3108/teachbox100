import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`領地戰顯示注音只放在玩法（${theme}）`, async ({ page }, testInfo) => {
    await page.route(/\/(?:ingest|monitoring)(?:\/|$|\?)/, (route) => route.fulfill({ status: 204 }));
    await page.goto("/quiz/territory");
    await page.evaluate((theme) => document.documentElement.classList.toggle("dark", theme === "dark"), theme);
    await page.getByRole("button", { name: "開始使用", exact: true }).click();
    const dialog = page.getByRole("dialog");
    const toggle = dialog.getByRole("switch", { name: "顯示注音", exact: true });
    await expect(toggle).toHaveCount(0);
    await dialog.getByRole("button", { name: "下一步", exact: true }).click();
    await expect(toggle).toBeVisible();
    await expect(toggle).not.toBeChecked();
    await toggle.click();
    await expect(toggle).toBeChecked();
    await expect.poll(() => page.locator("body").evaluate((el) => getComputedStyle(el).fontFamily)).toContain("Bpmf Iansui");
    await dialog.getByRole("button", { name: "上一步", exact: true }).click();
    await expect(toggle).toHaveCount(0);
    await dialog.getByRole("button", { name: "下一步", exact: true }).click();
    await expect(toggle).toBeChecked();
    await page.screenshot({ animations: "disabled", path: `/tmp/territory-zhuyin-${testInfo.project.name}-${theme}.png` });
  });
}
