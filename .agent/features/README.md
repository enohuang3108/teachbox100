# TeachBox100 verification map

驗證老師或學生看得到的行為時，先讀這份，再照對應的功能檔操作。指令一律是 `.agent/verify drive <feature> [sub]`。
每個 sub-feature 對到 `e2e/` 裡的一個 Playwright 案例（對照表在 `.agent/verify` 的 `pairs`，兩邊一起改）。
行為的真相是 `docs/testing.md`；這份只寫怎麼走到、怎麼操作。

## Baseline preconditions

- 跑過 `pnpm install`，且 Playwright Chromium 已安裝（`pnpm exec playwright install chromium`）
- `.agent/verify launch` 已通過：這個 worktree 自己的 `next dev` 起在 port `3200+n`、distDir 是 `.next-brigade-n`（n 由路徑雜湊決定，`doctor` 會印出來）。不碰使用者 3100 那台
- 每個案例都用全新的 browser context：localStorage 是空的，等於第一次打開的老師
- 有 3D 或 canvas 的單元（一番賞）要用 `.agent/verify launch prod`（build 約 2–3 分）
- 任何異常先跑 `.agent/verify doctor`（它會提示機器負載）
- 跑 `drive` 期間，不要讓任何東西寫進 worktree：dev 會重新編譯，跑到一半的頁面會整頁重載。`verify` 自己的證據會先寫到 `$TMPDIR/teachbox100-brigade-<key>/run/`，跑完才搬進 `.agent/evidence/`

## Driving conventions

- 把手的順序：role＋accessible name（`getByRole("button", { name: "開始使用" })`）→ `aria-*` 值 → `data-*` → `id`。不用座標，也不用 nth 順序
- 單元的共同路徑：介紹頁「開始使用」或「開始練習」→ 設定對話框逐站「下一步」→「開始」
- 新增 journey 時寫成 `e2e/<flow>.spec.ts`，在 `pairs` 加一行 `<sub> <spec>|<標題 regex>`，再在功能檔補一行
- 指令照抄，引號與參數都不改；`BRIGADE_PROJECT=mobile` 改跑 Pixel 5；`BRIGADE_TIMEOUT_MS`（預設 60000）調整單一案例的時間上限，`test.slow()` 的案例是 3 倍

## Proof and skip reporting

- 每次 `drive` 會產生一個證據目錄（路徑印在最後一行），內容：
  - `summary.txt`：feature、rev、server、result
  - `<sub>.log`：Playwright 輸出
  - `pw-<sub>/*/trace.zip`：每個動作前後的 DOM 與截圖，用 `pnpm exec playwright show-trace <zip>` 打開
  - `<route>.png`：使用者落地的畫面，**先看這張**
- 標題 regex 沒有對到任何案例（0 passed）一律算 FAIL，不算綠燈
- 回報時附上 feature、sub 與證據路徑；只跑了一個 sub 就說只跑了那個
- 真機才驗得到的（麥克風、觸控手感、音效、投影可讀性）照 `docs/testing.md` 第三欄報 verified-unreachable，不拿 headless 結果代替

## Features

- [首頁](./home.md)：分類與單元入口、依流量排序、教具箱開合
- [抽籤](./draw.md)：轉盤、扭蛋機、舊網址轉址
- [學習讀時鐘](./clock.md)：時間滑桿跨 12 點帶動時針
- [九九乘法](./multiplication.md)：開始、作答紀錄、全對結算
- [出題遊戲與題庫](./quiz.md)：領地戰出題、共用題庫、分享連結預覽
