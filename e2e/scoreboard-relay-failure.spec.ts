import { expect, test } from "@playwright/test";

test("計分板 relay 全斷時提示原因並送出無房號的診斷事件", async ({ page }) => {
  test.setTimeout(35_000);
  const envelopes: string[] = [];
  await page.routeWebSocket(/wss?:\/\//, (socket) => socket.close());
  await page.route(/ingest\.us\.sentry\.io\/api\/.*\/envelope\//, (route) => {
    envelopes.push(route.request().postData() ?? "");
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
  await page.route("**/monitoring*", (route) => {
    envelopes.push(route.request().postData() ?? "");
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });

  await page.goto("/scoreboard", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "開始使用" }).click();
  await page.getByRole("textbox", { name: "組名，一行一個" }).fill("敏感測試組\n另一組");
  await page.getByRole("switch", { name: /連線搶答/ }).click();
  const qr = page.locator('img[alt^="加入搶答的 QR code，房號 "]');
  await expect(qr).toBeVisible();
  const room = (await qr.getAttribute("alt"))!.match(/房號 (\w{4})$/)![1];
  await expect(page.getByText(/連不上配對伺服器，學生現在加不進來/).first()).toBeVisible({ timeout: 15_000 });
  await expect.poll(() => envelopes.some((body) => body.includes("Scoreboard signaling relays unavailable"))).toBe(true);
  const event = envelopes.find((body) => body.includes("Scoreboard signaling relays unavailable"))!;
  expect(event).not.toContain(room);
  expect(event).not.toContain("敏感測試組");
});
