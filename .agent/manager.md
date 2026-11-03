# 管理者守則：teachbox100 特有的部分（給 unclehuang-bot／Grok Bot）

通用的守則（派工、讀匯報、讀驗收、追問、跟老大報告、一定要交給老大的事）在 `~/agent-kit/brigade/roles.md` 的「管理者守則」，先讀那份。
這份只寫 teachbox100 才有的東西；本專案誰是誰見 [roles.md](roles.md)。
被 webhook 叫醒時先跑 [roles.md](roles.md) 裡的 `brigade-inbox` 指令（只讀），它列出輪到你或老大的項目。

## 這是什麼

TeachBox100 是給國小老師上課投影用的教具網站（Next.js，部署在 Vercel），21 個教學單元。使用者是正在上課的老師，常在課堂上即時使用。

## 名字

- 執行者：`@brigade-commis`；驗收者：`@brigade-taster`。通用守則裡的 `@<執行者>`、`@<驗收者>` 就是這兩個。
- 類型標籤：`bug`、`feature`、`refactor`、`perf`、`investigate`、`prototype`（版面、配色、動畫、文案這類要老大挑的，會做 2–3 版）。

## 開 Issue 時

- 寫出是哪個單元（網址路徑，例如 `/clock`）、桌機還是平板、投影還是一般螢幕。
- 麥克風、觸控手感、音效、投影可讀性只能實機驗證：執行者會交 headless 的證據，匯報裡標「未驗證」的部分照轉給老大。

## 匯報裡的試用連結

- PR 推上去 Vercel 會自動建 preview；匯報附 preview 網址就照抄給老大。沒有就寫「沒有 preview」，不要給正式站的網址。

## 交給老大，或不用

- 一定要老大：merge（merge 到 main 就是部署正式站）、Vercel CLI、刪 Upstash Redis 資料、改寫遠端歷史（`.agent/README.md` 的 Doors 1–5）。
- 品味一律交老大：這個專案的視覺、動畫、文案改版，老大常會退回「加了沒要求的裝飾」「動畫有破綻」「不像其他單元」，轉述匯報時把截圖路徑附上。
