import { expect, test } from "@playwright/test";

/**
 * 真實 WebRTC smoke test：只在手動執行 LIVE_WEBRTC=1 時跑，不能當 CI gate。
 * 它量測學生送出加入，到老師端名單出現的時間；超過五秒即代表上課現場會感到拖慢。
 */
test.skip(!process.env.LIVE_WEBRTC, "requires public Nostr relays and WebRTC");

test("live: 學生加入會在五秒內顯示於老師端", async ({ browser }) => {
  test.setTimeout(45_000);
  const teacherContext = await browser.newContext();
  const studentContext = await browser.newContext({ viewport: { width: 393, height: 852 } });
  const teacher = await teacherContext.newPage();
  const student = await studentContext.newPage();
  const signals: string[] = [];
  for (const [name, page] of [["teacher", teacher], ["student", student]] as const) {
    page.on("console", (message) => signals.push(`${name} console ${message.type()}: ${message.text()}`));
    page.on("pageerror", (error) => signals.push(`${name} pageerror: ${error.message}`));
    page.on("response", (response) => {
      if (response.status() >= 400) {
        signals.push(`${name} HTTP ${response.status()}: ${response.url()}`);
      }
    });
  }

  try {
    await teacher.goto("/");
    await teacher.goto("/scoreboard");
    await teacher.getByRole("button", { name: "設定" }).click();
    const linkSwitch = teacher.getByText("連線搶答").locator("..").getByRole("switch");
    await linkSwitch.click();

    const qr = teacher.locator('img[alt^="加入搶答的 QR code，房號 "]');
    await expect(qr).toBeVisible({ timeout: 15_000 });
    const code = (await qr.getAttribute("alt"))!.match(/房號 (\w{4})$/)![1];

    await student.goto(`/scoreboard/join#${code}`);
    await student.getByRole("textbox", { name: "你的名字" }).fill("本機測試");
    const started = performance.now();
    await student.getByRole("button", { name: "加入" }).click();
    await expect(teacher.getByText("已加入 1 人")).toBeVisible({ timeout: 15_000 });
    const elapsed = performance.now() - started;
    test.info().annotations.push({ type: "join-ms", description: `${Math.round(elapsed)}` });
    expect(elapsed).toBeLessThan(5_000);
  } catch (error) {
    await test.info().attach("signaling-log", {
      body: signals.join("\n"),
      contentType: "text/plain",
    });
    throw new Error(`${error instanceof Error ? error.message : String(error)}\n\n${signals.join("\n")}`);
  } finally {
    await teacherContext.close();
    await studentContext.close();
  }
});
