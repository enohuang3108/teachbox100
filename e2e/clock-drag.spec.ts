import { expect, test } from "@playwright/test";

test("時鐘分針跨越 12 點後，時針與題目時間前進一小時", async ({ page }, testInfo) => {
  await page.goto("/clock/current-time", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "開始練習", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "開始練習", exact: true }).click();
  const slider = page.getByRole("slider");
  const sliderBox = await slider.locator("../..").boundingBox();
  expect(sliderBox).not.toBeNull();
  await page.mouse.click(sliderBox!.x + sliderBox!.width * (715 / 1439), sliderBox!.y + sliderBox!.height / 2);
  let current = Number(await slider.getAttribute("aria-valuenow"));
  for (; current < 715; current += 1) await slider.press("ArrowRight");
  for (; current > 715; current -= 1) await slider.press("ArrowLeft");
  await expect(slider).toHaveAttribute("aria-valuenow", "715");
  const before = Number(await slider.getAttribute("aria-valuenow"));
  expect(before).toBeLessThan(720);
  await expect.poll(async () => page.locator("#clock > div").nth(1).getAttribute("style"))
    .toContain("rotate(330deg)");

  const clock = page.locator("#clock");
  await clock.scrollIntoViewIfNeeded();
  await page.waitForTimeout(350); // 等分針的 CSS 轉場落定位，觸點才真正落在指針上
  const box = await clock.boundingBox();
  expect(box).not.toBeNull();
  const cx = box!.x + box!.width / 2;
  const cy = box!.y + box!.height / 2;
  if (testInfo.project.name === "mobile") {
    const cdp = await page.context().newCDPSession(page);
    const minuteHand = await clock.locator(":scope > div").nth(1).boundingBox();
    expect(minuteHand).not.toBeNull();
    const start = {
      x: minuteHand!.x + minuteHand!.width / 2,
      y: minuteHand!.y + minuteHand!.height / 2,
    };
    const radius = Math.hypot(start.x - cx, start.y - cy);
    const point = (degrees: number) => ({
      x: cx + radius * Math.sin((degrees * Math.PI) / 180),
      y: cy - radius * Math.cos((degrees * Math.PI) / 180),
    });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [start] });
    for (const degrees of [340, 350, 0, 10, 25]) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [point(degrees)] });
      await page.waitForTimeout(20);
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  } else {
    await page.mouse.move(cx - 60, cy - 104);
    await clock.locator(":scope > div").nth(1).dispatchEvent("mousedown", {
      button: 0,
      buttons: 1,
      clientX: cx - 40,
      clientY: cy - 100,
    });
    await page.mouse.move(cx + 80, cy - 80);
    await page.mouse.up();
  }
  await expect.poll(async () => Number(await slider.getAttribute("aria-valuenow"))).toBeGreaterThanOrEqual(720);
  expect(Number(await slider.getAttribute("aria-valuenow"))).toBeLessThan(730);
});
