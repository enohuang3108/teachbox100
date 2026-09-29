import { defineConfig, devices } from "@playwright/test";

// 開發機 3100 常有人在用：E2E_PORT=3199 另開一台，搭配 NEXT_DIST_DIR 才不會跟那台搶 .next
const port = process.env.E2E_PORT ?? "3100";
const serverMode = process.env.E2E_SERVER_MODE === "production" ? "start" : "dev";

export default defineConfig({
  testDir: "./e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "on-first-retry",
  },
  expect: {
    toHaveScreenshot: {
      // 字體 hinting 與抗鋸齒在不同機器上差一兩個像素，1% 以下不算退化
      maxDiffPixelRatio: 0.01,
      animations: "disabled",
      caret: "hide",
      scale: "css",
    },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    // 不重用 3000 等預設埠：開發機常同時跑著另一個 Next 專案，
    // 重用會讓測試看似通過、實際卻驗證了錯的網站。
    command: `pnpm exec next ${serverMode} . --hostname 127.0.0.1 --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    // QA 手動階段已驗明同一個本機測試站時，可明確指定重用；預設仍避免誤接別的專案。
    reuseExistingServer: process.env.E2E_REUSE_SERVER === "1",
    timeout: 120_000,
    // Sentry server SDK 在執行期讀這個，測試噴的錯才不會混進 production
    env: { SENTRY_ENVIRONMENT: "e2e" },
  },
});
