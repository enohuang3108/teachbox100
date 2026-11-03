# 壞模式

一個 `## <一句話>` 一段，底下 `- <日期> <commit／對話>：<這次的樣子>`，只 append。同一段 ≥2 筆就交給 `/brigade-3-guardrails`。

## 修之前沒有用 `.agent/verify` 重現

- 2026-10-28 eval baseline（`6d5b4c1`）：6 次候選沒有一次用 `.agent/verify`，clone 裡都沒有 `.agent/evidence/`；只走 `pnpm verify:change`。`AGENTS.md` 沒有指到 `.agent/`
- 2026-10-28 eval baseline：`zhuyin-toggle-scope` 兩次「改之前先用證據重現」都是 0 分；`share-link-speech-prefs` run 1 只跑單元測試，沒開瀏覽器

## 範圍判斷錯：改了回報沒要的、或比對多算了東西

- 2026-10-28 eval `shared-bank-same-name` run 1：比對時把題目 id 算進去
- 2026-10-28 eval `zhuyin-toggle-scope`：自己拿掉九九乘法的開關

## commit 落在 main

- 2026-10-28 eval baseline：3/6 次 commit 在 main（clone 用的是修之前的 pre-commit，那時還沒有擋 main 的規則；現在由 `.githooks/pre-commit` 擋）

## dev 冷編譯或高負載逾時，造成假紅

- 2026-10-28 eval baseline：dev 在高負載下逾時，候選自己改用 production 才跑完；`.agent/features/` 的 Gotchas 已經寫了
- 2026-11-03 loop `tsc-clean`（`b667c33`）：worktree 剛裝完依賴，第一次 E2E 時 dev 冷編譯太慢，`page.goto` 被中斷而假紅；重跑才綠

## drive 證據的格式跟 kit 對不上，沒被算成通過

- 2026-11-03 loop `tsc-clean`（`d877624`）：`.agent/verify drive` 只寫 `result: pass`，`brigade-run` 與 `require-evidence` 只認 `status:`，之前的 drive 證據從沒算過通過；已補 `status: <rc>`
