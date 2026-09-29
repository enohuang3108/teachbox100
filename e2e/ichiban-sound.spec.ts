import { expect, test } from "@playwright/test";

test("撕票有合成音訊，關閉音效後不再觸發且設定重整保留", async ({ page }) => {
  await page.addInitScript(() => {
    const start = AudioBufferSourceNode.prototype.start;
    Object.assign(window, { qaSoundStarts: 0 });
    AudioBufferSourceNode.prototype.start = function (...args) {
      (window as unknown as { qaSoundStarts: number }).qaSoundStarts += 1;
      return start.apply(this, args);
    };
  });
  await page.goto("/draw/ichiban", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "開始使用" }).click();
  await page.getByRole("button", { name: "開始", exact: true }).click();
  await page.getByRole("button", { name: /旋轉一番賞票券/ }).press("Enter");
  const tear = page.getByRole("button", { name: "按住一番賞票券，從左往右撕開封條" });
  await expect(tear).toBeVisible();
  const dragPartway = async () => {
    const box = await tear.boundingBox();
    expect(box).not.toBeNull();
    const x = box!.x + box!.width * 0.2;
    const y = box!.y + box!.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let step = 1; step <= 6; step += 1) {
      await page.mouse.move(x + box!.width * step * 0.045, y);
    }
    await page.mouse.up();
  };
  const count = () => page.evaluate(() => (window as unknown as { qaSoundStarts: number }).qaSoundStarts);
  await dragPartway();
  await expect.poll(count).toBeGreaterThan(0);
  await page.getByRole("button", { name: "關閉音效" }).click();
  const mutedBaseline = await count();
  await dragPartway();
  expect(await count()).toBe(mutedBaseline);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "開始使用" }).click();
  await page.getByRole("button", { name: "開始", exact: true }).click();
  await expect(page.getByRole("button", { name: "開啟音效" })).toBeVisible();
});
