import { expect, test } from "@playwright/test";

/** 真實 WebRTC：學生按鈴，老師端要看到名次。手動 LIVE_WEBRTC=1 才跑。 */
test.skip(!process.env.LIVE_WEBRTC, "requires public Nostr relays and WebRTC");

test("live: 學生按鈴會顯示在老師端", async ({ browser }) => {
  test.setTimeout(90_000);
  const teacherContext = await browser.newContext();
  const studentContext = await browser.newContext({
    viewport: { width: 393, height: 852 },
  });
  const teacher = await teacherContext.newPage();
  const student = await studentContext.newPage();
  const signals: string[] = [];
  for (const [name, page] of [
    ["teacher", teacher],
    ["student", student],
  ] as const) {
    page.on("console", (m) => signals.push(`${name} console ${m.type()}: ${m.text()}`));
    page.on("pageerror", (e) => signals.push(`${name} pageerror: ${e.message}`));
  }

  try {
    await teacher.goto("/scoreboard");
    await teacher.getByRole("button", { name: "設定" }).click();
    await teacher.getByText("連線搶答").locator("..").getByRole("switch").click();
    const qr = teacher.locator('img[alt^="加入搶答的 QR code，房號 "]');
    await expect(qr).toBeVisible({ timeout: 20_000 });
    const code = (await qr.getAttribute("alt"))!.match(/房號 (\w{4})$/)![1];

    await student.goto(`/scoreboard/join#${code}`);
    await student.getByRole("textbox", { name: "你的名字" }).fill("小明");
    await student.getByRole("button", { name: "加入" }).click();
    await expect(teacher.getByText("已加入 1 人", { exact: true })).toBeVisible({ timeout: 20_000 });

    // 關掉 QR 對話框與設定面板，才點得到計分板上的搶答控制列
    await teacher.locator('[role="dialog"] button:has-text("Close")').last().click();
    await teacher.locator('[role="dialog"] button:has-text("Close")').last().click();
    await expect(teacher.locator('[role="dialog"]')).toHaveCount(0, { timeout: 5_000 });
    const start = teacher.getByRole("button", { name: "開始搶答" });
    await expect(start).toBeVisible({ timeout: 10_000 });
    await start.click();

    const buzz = student.getByRole("button", { name: "搶答" });
    await expect(buzz).toBeEnabled({ timeout: 10_000 });
    await buzz.click();

    await expect(student.getByRole("button", { name: "第一個" })).toBeVisible({ timeout: 10_000 });
    await expect(teacher.getByRole("listitem").filter({ hasText: "小明" })).toBeVisible({ timeout: 10_000 });
  } catch (error) {
    throw new Error(`${error instanceof Error ? error.message : String(error)}\n\n${signals.join("\n")}`);
  } finally {
    await teacherContext.close();
    await studentContext.close();
  }
});

/** 教室裡兩個同名的學生（或都沒填名字）不能互相擠掉；擠掉的那個按鈴老師端會看不到。 */
test("live: 同名的兩個學生各佔一格，先加入的按鈴也顯示", async ({ browser }) => {
  test.setTimeout(90_000);
  const teacherContext = await browser.newContext();
  const teacher = await teacherContext.newPage();
  const students = [] as { ctx: Awaited<ReturnType<typeof browser.newContext>>; page: typeof teacher }[];
  try {
    await teacher.goto("/scoreboard");
    await teacher.getByRole("button", { name: "設定" }).click();
    await teacher.getByText("連線搶答").locator("..").getByRole("switch").click();
    const qr = teacher.locator('img[alt^="加入搶答的 QR code，房號 "]');
    await expect(qr).toBeVisible({ timeout: 20_000 });
    const code = (await qr.getAttribute("alt"))!.match(/房號 (\w{4})$/)![1];

    for (const _ of [0, 1]) {
      // 各自一個 context：等於兩台不同的手機，才有兩個裝置 id
      const ctx = await browser.newContext({ viewport: { width: 393, height: 852 } });
      const page = await ctx.newPage();
      await page.goto(`/scoreboard/join#${code}`);
      await page.getByRole("textbox", { name: "你的名字" }).fill("小明");
      await page.getByRole("button", { name: "加入" }).click();
      students.push({ ctx, page });
    }
    await expect(teacher.getByText("已加入 2 人", { exact: true })).toBeVisible({ timeout: 25_000 });

    const close = teacher.locator('[role="dialog"] button:has-text("Close")');
    await close.last().click();
    await close.last().click();
    await teacher.getByRole("button", { name: "開始搶答" }).click();

    // 先加入的那個按鈴：舊版用名字認人時會被第二個小明擠掉，這裡就會是空的
    const buzz = students[0].page.getByRole("button", { name: "搶答" });
    await expect(buzz).toBeEnabled({ timeout: 15_000 });
    await buzz.click();
    await expect(teacher.locator("[data-score-root] ol li")).toHaveCount(1, { timeout: 10_000 });
  } finally {
    await teacherContext.close();
    for (const s of students) await s.ctx.close();
  }
});

/** 一台裝置只能有一個分頁在搶答：兩個分頁共用身分 id，同時連著會互相擠掉。 */
test("live: 同一個瀏覽器開第二個分頁會被擋住", async ({ browser }) => {
  test.setTimeout(90_000);
  const teacherContext = await browser.newContext();
  const teacher = await teacherContext.newPage();
  const studentContext = await browser.newContext({
    viewport: { width: 393, height: 852 },
  });
  try {
    await teacher.goto("/scoreboard");
    await teacher.getByRole("button", { name: "設定" }).click();
    await teacher.getByText("連線搶答").locator("..").getByRole("switch").click();
    const qr = teacher.locator('img[alt^="加入搶答的 QR code，房號 "]');
    await expect(qr).toBeVisible({ timeout: 20_000 });
    const code = (await qr.getAttribute("alt"))!.match(/房號 (\w{4})$/)![1];

    const tab1 = await studentContext.newPage();
    await tab1.goto(`/scoreboard/join#${code}`);
    await tab1.getByRole("textbox", { name: "你的名字" }).fill("小明");
    await tab1.getByRole("button", { name: "加入" }).click();
    await expect(teacher.getByText("已加入 1 人", { exact: true })).toBeVisible({
      timeout: 25_000,
    });

    // 第二個分頁會用記住的名字自動報到，然後被 claimDevice() 擋掉
    const tab2 = await studentContext.newPage();
    await tab2.goto(`/scoreboard/join#${code}`);
    await expect(
      tab2.getByRole("heading", { name: /另一個分頁/ }),
    ).toBeVisible({ timeout: 15_000 });
    // 老師端仍然只有一個人：第一個分頁沒有被擠掉
    await expect(teacher.getByText("已加入 1 人", { exact: true })).toBeVisible();
  } finally {
    await teacherContext.close();
    await studentContext.close();
  }
});
