import { expect, test } from "@playwright/test";
import { decodeFor } from "@/lib/share/units";

test("大量真實圖片分享時壓縮並提示短連結容量不足", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "大量圖片上傳的桌機案例");
  test.setTimeout(180_000);
  let shareRequests = 0;
  await page.route("**/api/share", (route) => {
    shareRequests += 1;
    return route.fulfill({ status: 503 });
  });
  await page.goto("/memory", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "開始使用" }).click();
  for (let group = 4; group < 15; group += 1) {
    await page.getByRole("button", { name: "新增配對" }).click();
  }

  for (let index = 0; index < 30; index += 1) {
    const group = Math.floor(index / 2) + 1;
    const face = (index % 2) + 1;
    const base64 = await page.evaluate((seed) => {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 320;
      const context = canvas.getContext("2d")!;
      const pixels = context.createImageData(320, 320);
      let state = seed + 1;
      for (let i = 0; i < pixels.data.length; i += 4) {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        pixels.data[i] = state & 255;
        pixels.data[i + 1] = (state >>> 8) & 255;
        pixels.data[i + 2] = (state >>> 16) & 255;
        pixels.data[i + 3] = 255;
      }
      context.putImageData(pixels, 0, 0);
      return canvas.toDataURL("image/png").split(",")[1];
    }, index);
    await page.locator(`label[aria-label="配對 ${group} 卡面 ${face} 改用圖片"] input[type="file"]`).setInputFiles({
      name: `photo-${index}.png`,
      mimeType: "image/png",
      buffer: Buffer.from(base64, "base64"),
    });
    await expect(page.getByRole("button", { name: `配對 ${group} 卡面 ${face} 清除圖片` })).toBeVisible();
  }

  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("button", { name: "分享設定" }).click();
  const long = page.getByRole("textbox", { name: "完整連結" });
  await expect(long).toHaveValue(/\/memory#.+/);
  const prepared = await decodeFor("memory", new URL(await long.inputValue()).hash.slice(1));
  expect(prepared).not.toBeNull();
  const originalLength = await page.evaluate(() => {
    const stored = JSON.parse(localStorage.getItem("memory-game")!);
    return stored.state.deck.flatMap((group: { faces: string[] }) => group.faces)
      .reduce((sum: number, face: string) => sum + face.length, 0);
  });
  const sharedLength = prepared!.deck.flatMap((group) => group.faces)
    .reduce((sum, face) => sum + face.length, 0);
  expect(sharedLength).toBeLessThan(originalLength);
  await expect(page.getByRole("textbox", { name: "短連結" })).toHaveValue(/圖片過大，短連結放不下/);
  await expect(page.getByRole("button", { name: "複製" }).first()).toBeDisabled();
  expect(shareRequests).toBe(0);
});
