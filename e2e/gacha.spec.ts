import { expect, test } from "@playwright/test";

test("點一顆扭蛋直接揭曉，繼續抽會收進紀錄，全部放回", async ({ page }, testInfo) => {
  await page.goto("/draw/gacha");
  await page.getByRole("button", { name: "開始使用" }).click();
  await page.getByRole("textbox", { name: "名單，一行一個" }).fill("小明\n小華");
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("button", { name: "開始", exact: true }).click();
  const remaining = async (count: number) => {
    if (testInfo.project.name === "mobile") {
      await expect(page.getByRole("button", { name: "查看抽籤紀錄" })).toContainText(`紀錄 ${2 - count} / 2`);
    } else {
      await expect(page.getByText(`還剩 ${count} / 2 顆`)).toBeVisible();
    }
  };
  await remaining(2);

  // canvas 上的球位置不固定，走讀螢幕器用的替代按鈕，確定抽到第一顆
  await page.getByRole("button", { name: "抽第 1 顆扭蛋" }).press("Enter");
  await expect(page.getByTestId("gacha-result")).toHaveText("小明");
  await page.getByRole("button", { name: "繼續抽", exact: true }).click();
  await remaining(1);

  await page.getByRole("button", { name: "全部放回", exact: true }).first().click();
  await remaining(2);
});

test("手機連抽 30 顆後仍能抽最後一顆", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "手機版長時間抽取案例");
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "warning" && message.text().includes("Too many active WebGL contexts")) {
      errors.push(message.text());
    }
  });
  await page.goto("/draw/gacha", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "開始使用" }).click();
  await page.getByRole("textbox", { name: "名單，一行一個" }).fill(
    Array.from({ length: 30 }, (_, index) => `QA-${index + 1}`).join("\n"),
  );
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("button", { name: "開始", exact: true }).click();
  const recordToggle = page.getByRole("button", { name: "查看抽籤紀錄" });
  await expect(recordToggle).toBeVisible();
  await expect(page.getByRole("complementary", { name: "已抽出的名單" })).toHaveCount(0);
  for (let index = 1; index <= 30; index += 1) {
    await expect(recordToggle).toContainText(`紀錄 ${index - 1} / 30`);
    if (index === 30 && process.env.QA_CAPTURE_DIR) {
      await page.screenshot({ path: `${process.env.QA_CAPTURE_DIR}/GACHA-004-mobile-last-ball.png` });
    }
    if (index === 30) {
      let openedByTouch = false;
      for (let attempt = 0; attempt < 3 && !openedByTouch; attempt += 1) {
        const screenshot = await page.screenshot({ scale: "css" });
        const ball = await page.evaluate(async (base64) => {
          const image = new Image();
          image.src = `data:image/png;base64,${base64}`;
          await image.decode();
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const context = canvas.getContext("2d")!;
          context.drawImage(image, 0, 0);
          const { data } = context.getImageData(0, 0, image.width, image.height);
          let left = image.width;
          let right = 0;
          let top = image.height;
          let bottom = 0;
          for (let y = 140; y < image.height; y += 1) {
            for (let x = 0; x < image.width; x += 1) {
              if (x > image.width - 140 && y > image.height - 140) continue; // 搖一搖按鈕
              const p = (y * image.width + x) * 4;
              const red = data[p];
              const green = data[p + 1];
              const blue = data[p + 2];
              if (Math.max(red, green, blue) - Math.min(red, green, blue) < 90) continue;
              left = Math.min(left, x);
              right = Math.max(right, x);
              top = Math.min(top, y);
              bottom = Math.max(bottom, y);
            }
          }
          if (right <= left || bottom <= top) return null;
          return { x: (left + right) / 2, y: (top + bottom) / 2 + 12 };
        }, screenshot.toString("base64"));
        if (ball) {
          await page.mouse.click(ball.x, ball.y);
          openedByTouch = await page.getByTestId("gacha-result")
            .waitFor({ state: "visible", timeout: 2500 })
            .then(() => true, () => false);
        }
      }
      expect(openedByTouch, "最後一顆扭蛋應可從畫面直接點開").toBe(true);
    } else {
      await page.getByRole("button", { name: `抽第 ${index} 顆扭蛋` }).press("Enter");
    }
    await expect(page.getByTestId("gacha-result")).toHaveText(`QA-${index}`);
    await page.getByRole("button", { name: "繼續抽", exact: true }).click();
  }
  await expect(recordToggle).toContainText("紀錄 30 / 30");
  await recordToggle.click();
  await expect(page.getByRole("complementary", { name: "已抽出的名單" })).toContainText("還剩 0 / 30 顆");
  expect(errors).toEqual([]);
});
