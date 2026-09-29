import { expect, test } from "@playwright/test";

test("自訂結果：爬下一位揭曉一格，全部爬完每人對到不同結果", async ({ page }) => {
  await page.goto("/draw/ladder");
  await page.getByRole("button", { name: "開始使用" }).click();
  await page.getByRole("textbox", { name: "名單，一行一個" }).fill("小明\n小華\n小美");
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("textbox", { name: "結果，一行一個" }).fill("掃地\n擦黑板");
  await expect(page.getByText("結果要跟名單一樣多（名單 3 個，結果 2 個）")).toBeVisible();
  await page.getByRole("textbox", { name: "結果，一行一個" }).fill("掃地\n擦黑板\n澆花");
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("button", { name: "開始", exact: true }).click();

  await page.getByRole("button", { name: "爬下一位" }).click();
  await expect(page.getByTestId("ladder-result")).toContainText("小明");
  await page.getByRole("button", { name: "全部揭曉" }).click();

  const list = page.getByRole("complementary", { name: "爬格子結果" });
  await expect(list).toContainText("全部爬完了");
  const results = await page.getByRole("list", { name: "結果" }).locator("li").allInnerTexts();
  expect(results.sort()).toEqual(["掃地", "擦黑板", "澆花"].sort());
});

test("分組：全部揭曉後清單列出每一組，人數最多差一人", async ({ page }) => {
  await page.goto("/draw/ladder");
  await page.getByRole("button", { name: "開始使用" }).click();
  await page
    .getByRole("textbox", { name: "名單，一行一個" })
    .fill(Array.from({ length: 7 }, (_, i) => `學生${i + 1}`).join("\n"));
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("tab", { name: "分組" }).click();
  await page.getByText("3 組", { exact: true }).click();
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("button", { name: "開始", exact: true }).click();

  await page.getByRole("button", { name: "全部揭曉" }).click();
  const list = page.getByRole("complementary", { name: "爬格子結果" });
  await expect(list).toContainText("分組結果");
  const sizes = await list.locator("li p:nth-child(2)").allInnerTexts();
  expect(sizes.map((s) => s.split("、").length).sort()).toEqual([2, 2, 3]);
});
