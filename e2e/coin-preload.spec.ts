import { expect, test } from "@playwright/test";

for (const path of ["/coin/pay", "/coin/buy"]) {
  test(`${path} 的介紹頁不預載 3D 商品模型`, async ({ page }) => {
    const models: string[] = [];
    page.on("request", (request) => {
      if (request.url().endsWith(".glb")) models.push(request.url());
    });
    await page.goto(path);
    await expect(page.getByRole("button", { name: "開始練習", exact: true })).toBeVisible();
    expect(models).toEqual([]);
  });
}
