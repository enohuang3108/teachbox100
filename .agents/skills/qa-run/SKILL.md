---
name: qa-run
description: 上 prod 前的 agent 驗收 —— 挑範圍、補 case、跑自動閘門、在真瀏覽器手動測、出報告、上線 bug 開 GitHub issue。
disable-model-invocation: true
---

# QA run

你是這次發版的 **tester**：像老師一樣真的點過產品，不是讀 code 推測。
**case 庫是 single source of truth**，每次跑都從它出發、跑完把學到的寫回它，下次才能重複跑。

| 東西 | 位置 |
| --- | --- |
| case 庫（一個單元一檔） | `docs/qa/cases/<unit>.md` |
| 報告 | `docs/qa/reports/YYYY-MM-DD-<short-sha>.md` |
| 哪些行為歸 CI、哪些歸 agent | `docs/testing.md` |
| case／報告／issue 的格式 | [`templates.md`](templates.md) |

呼叫時可帶參數：`prod`（只對 https://teachbox100.com 跑 smoke 找上線 bug）或單元名（只跑那些單元）。沒帶就是發版前完整流程。

## 1. 定範圍

1. base = `docs/qa/reports/` 最新一份報告的 `commit`；沒有報告就用 `origin/main`。
2. `git diff --name-only <base>..HEAD` 對到單元（`app/pages.config.ts` 的 `path` 是對照表）。動到共用元件、`app/layout`、store、`lib/` 共用層 → 全部單元都在範圍。
3. 範圍 = 改到的單元 + **smoke**（所有單元的 `smoke: true` case）。

**完成**：一張「單元 → 為什麼在範圍」的表，貼給使用者看一眼再往下。

## 2. 補 case

對範圍內每個單元：

1. 讀 `docs/qa/cases/<unit>.md`；不存在就建。
2. 對照這次 diff、`docs/testing.md` 那列、單元頁實際 UI，把**這次行為變動**缺的 case 補上。改掉的行為要改寫舊 case，不是另開一條。
3. 每條 case 標 `auto`：已被哪支 `e2e/*.spec.ts` 或 `lib/**/*.test.ts` 蓋住就寫路徑，否則寫 `manual`。

**完成**：範圍內每個行為變動都對得到至少一條 case ID。

## 3. 寫腳本

`manual` case 裡，流程穩定、不靠手感／麥克風／多裝置的，寫進 `e2e/`（沿用現有 spec 的寫法），case 的 `auto` 改成 spec 路徑。靠物理、拖放手感、音效、投影可讀性、WebRTC 的留 `manual`。

**完成**：每條 `manual` 都有一句「為什麼不自動化」。

## 4. 自動閘門

依序跑，任一 red 就停下回報，不進第 5 步：

1. `pnpm lint && pnpm lint:tokens && pnpm test`
2. `E2E_PORT=3199 NEXT_DIST_DIR=.next-e2e pnpm test:e2e --workers=2`
3. `NEXT_DIST_DIR=.next-build pnpm build`，跑完 `git checkout tsconfig.json`（Next 會把 dist 目錄塞進 include）

**記憶體**：這台同時開著使用者的 dev server、Orca、OrbStack，上次預設 workers 跑 e2e 時背景指令被系統以記憶體不足砍掉。每步開始前 `memory_pressure | tail -1`，低於 25% 就停下回報；e2e 與 build 依序跑、不並行，e2e 的 server 關掉才開始 build。

**3100 常有使用者的 dev server**：先 `lsof -nP -iTCP:3100 -sTCP:LISTEN` 查；另開的 server 一律用獨立 `NEXT_DIST_DIR`，收尾只 kill 自己記下的 pid。

**完成**：三步 green，貼每步最後一行輸出。

## 5. 手動測

分工是 **收證據 vs 判決**：sub agent 用便宜的 model 在真瀏覽器操作、只回報觀察；pass／fail／blocked 一律由主 agent 判。

1. 目標站：發版前用 3100 那台（沒有就自己開 `E2E_PORT` 那種獨立 server）；`prod` 模式用 https://teachbox100.com。
2. 依 [`aspects.md`](aspects.md) 派 sub agent，**同一則訊息平行送出**：每個面向一個，功能面向的 case 多時再按單元切成幾個。**同時開著的瀏覽器最多 3 個**：超過就分批，一批回報完再派下一批，派之前查 `memory_pressure`。每個 brief 帶：目標站、面向說明、要跑的 case 原文、`run` 名稱、它專屬的 `playwright-cli -s=<面向>-<n>` session 名。
3. sub agent 每條 case × **桌機 1440×900、手機 390×844** 各跑一輪：照步驟操作 → 截圖存 `docs/qa/reports/assets/<run>/<case-id>-<viewport>.png` → 回報 aspects.md 規定的**觀察紀錄**。
4. 主 agent 逐條判決：觀察對照 case 的「預期」；觀察模糊或跟預期對不上時，自己開瀏覽器重看那一條，再判。
5. 手動做不到的（真實麥克風、兩支手機）判 `blocked` 並寫「需要人做什麼」。
6. sub agent 回報 case 沒寫到的異常 → 主 agent 確認屬實後補 case、再記 fail。

**完成**：範圍內每條 case × 每個 viewport 都有主 agent 的判決與截圖路徑，零條空白；每個面向都有一份回報。

## 6. 報告

照 `templates.md` 寫報告，結論只有三種：**可上線**（零 fail、零 blocked）、**有條件上線**（只剩 blocked，列出要人補測的）、**不可上線**。

**完成**：報告檔存在，對話裡只貼結論與 fail 清單。

## 7. 回報上線 bug

只有 **prod 上重現得到**的 fail 才開 issue（本機才壞的是發版阻擋，不是上線 bug）：

1. 在 https://teachbox100.com 用同一條 case 重現；重現不到就在報告註記，不開。
2. `gh issue list --label bug --state open --search "<關鍵字>"` 查重複；有就在原 issue 留言附新證據。
3. 先把 issue 標題與內文貼給使用者確認，確認後 `gh issue create --label bug --title ... --body-file ...`（格式見 `templates.md`）。
4. issue 網址寫回報告與 case 的 `issues` 欄。

**完成**：每條 prod fail 都有 issue 連結或「未重現」註記。
