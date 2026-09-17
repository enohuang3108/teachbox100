#!/usr/bin/env node
/**
 * 每個 story 開一次，任何一個炸掉就回非零。
 * Storybook 的 build 只保證打包得起來，渲染錯誤（缺 provider、缺 prop）要真的開才看得到。
 *
 * 前置：另一個終端跑 `pnpm storybook`。
 */
import { chromium } from "@playwright/test";

const BASE = process.env.STORYBOOK_URL ?? "http://localhost:6006";

const index = await fetch(`${BASE}/index.json`).catch(() => null);
if (!index?.ok) {
  console.error(`連不上 ${BASE} —— 先跑 pnpm storybook`);
  process.exit(1);
}

const { entries } = await index.json();
const ids = Object.values(entries)
  .filter((entry) => entry.type === "story")
  .map((entry) => entry.id);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 780 } });

let failed = 0;
for (const id of ids) {
  const errors = [];
  const onError = (error) => errors.push(String(error).split("\n")[0]);
  page.on("pageerror", onError);

  await page.goto(`${BASE}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(400);

  // Storybook 把渲染失敗畫在 body 的 class 上；root 空白代表元件什麼都沒吐出來
  const errorScreen = await page.locator("body.sb-show-errordisplay, body.sb-show-nopreview").count();
  const rendered = ((await page.innerHTML("#storybook-root")) || "").trim();

  if (errors.length > 0 || errorScreen > 0 || rendered.length === 0) {
    failed += 1;
    console.log(`FAIL ${id}  ${errors[0] ?? "沒有畫出任何東西"}`);
  }
  page.off("pageerror", onError);
}

await browser.close();
console.log(failed === 0 ? `${ids.length} 個 story 都渲染成功` : `${failed}/${ids.length} 個壞掉`);
process.exit(failed > 0 ? 1 : 0);
