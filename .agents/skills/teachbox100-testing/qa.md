# 週期與發版 QA

你是這次的 **tester**：像老師一樣真的點過產品，不是讀 code 推測。
**case 庫是 single source of truth**，每次跑都從它出發、跑完把學到的寫回它，下次才能重複跑。

| 東西 | 位置 |
| --- | --- |
| case 庫（一個單元一檔） | `docs/qa/cases/<unit>.md` |
| 報告 | `docs/qa/reports/YYYY-MM-DD-<short-sha>.md` |
| 哪些行為歸 CI、哪些歸 agent | `docs/testing.md` 的矩陣 |
| case／報告／issue 的格式 | [`qa-templates.md`](qa-templates.md) |

## 模式

| 呼叫 | 範圍 | 用途 |
| --- | --- | --- |
| `/qa-test weekly` | 全部教材單元與全部 case | 每週完整大測；建立新的產品基線 |
| `/qa-test` | 本次改動的單元，加上所有 smoke case | 發版前驗收 |
| `/qa-test <單元>` | 指定單元，加上所有 smoke case | 集中驗收一個高風險單元 |
| `/qa-test prod` | https://teachbox100.com 的 smoke case | 確認上線 bug；只對可重現的 fail 開 issue |

日常改動走 [`proof.md`](proof.md)；這份處理需要完整產品證據的週期性與發版 QA。

## 1. 定範圍

1. base = `docs/qa/reports/` 最新一份報告的 `commit`；沒有報告就用 `origin/main`。報告記下它，讓下次知道從哪裡開始比較。
2. 按模式選範圍：
   - `weekly`：`app/pages.config.ts` 的全部教材單元與所有 case。
   - `prod`：正式站的所有 smoke case。
   - 指定單元：該單元加所有 smoke case。
   - 無參數：`git diff --name-only <base>`（含未提交改動）對到單元；動到共用元件、`app/layout`、store、`lib/` 共用層時涵蓋全部單元；再加所有 smoke case。
3. 用 `node scripts/qa-plan.mjs --mode changed --base <base>`（或 `--mode weekly|prod|unit --unit <case檔名>`）列出候選範圍與報告列；核對 diff、矩陣及公開行為後定稿。工具對無法歸屬的產品檔保守地列全部單元。

**完成**：一張「單元 → 為什麼在範圍」的表，貼給使用者看一眼再往下。`weekly` 的理由固定是「每週完整基線」。

## 2. 補 case

對範圍內每個單元：

1. 讀 `docs/qa/cases/<unit>.md`；不存在就建。
2. 對照這次 diff、`docs/testing.md` 那列、單元頁實際 UI，把**這次行為變動**缺的 case 補上。改掉的行為要改寫舊 case，不是另開一條。
3. 每條 case 標 `auto`：**整條預期**已被哪支 `e2e/*.spec.ts` 或 `lib/**/*.test.ts` 蓋住就寫路徑；只保護規則、未保護畫面或真機體驗時仍標 `manual`，並註明既有自動證據。

**完成**：範圍內每個行為變動都對得到至少一條 case ID。

## 3. 寫腳本

本次改動的 `manual` case 裡，先把**可觀察的行為**寫進 `e2e/`：瀏覽器 touch 事件、桌機拖放、合成音訊的刻度與音軌生命週期、Web Audio 播放觸發、兩個獨立 browser context 的 WebRTC 斷線重連都可測。只有整條預期被斷言蓋住才把 `auto` 改成 spec 路徑；實體觸控手感、真麥克風指示燈、喇叭音質、投影後排可讀性及真手機飛航切換仍留 `manual`，並在 case 註明已有的自動證據。公開 relay 的測試用 `LIVE_WEBRTC=1` 另跑，不能把預設 skipped 當作通過。

**完成**：每條 `manual` 都有一句「為什麼不自動化」。

## 4. 自動閘門

依序跑，任一 red 就停下回報，不進第 5 步：

1. `pnpm lint && pnpm lint:tokens && pnpm test`
2. `NEXT_DIST_DIR=.next-e2e pnpm build`
3. `E2E_PORT=3199 NEXT_DIST_DIR=.next-e2e E2E_SERVER_MODE=production pnpm test:e2e --workers=2`

**記憶體**：這台同時開著使用者的 dev server、Orca、OrbStack，上次預設 workers 跑 e2e 時背景指令被系統以記憶體不足砍掉。每步開始前 `memory_pressure | tail -1`，低於 25% 就停下回報；build 完成才跑 e2e，不並行。build 前記下 `tsconfig.json` 是否已有改動，跑完只還原 Next 加入的 dist include，不覆蓋原有改動。

**3100 常有使用者的 dev server**：先 `lsof -nP -iTCP:3100 -sTCP:LISTEN` 查；另開的 server 一律用獨立 `NEXT_DIST_DIR`，收尾只 kill 自己記下的 pid。

**完成**：三步 green，貼每步最後一行輸出。

## 5. 手動測

分工是 **收證據 vs 判決**：sub agent 在真瀏覽器操作、只回報觀察；pass／fail／blocked 一律由主 agent 判。

1. 目標站：發版前用 3100 那台（沒有就自己開 `E2E_PORT` 那種獨立 server）；`prod` 模式用 https://teachbox100.com。
2. 依 [`qa-aspects.md`](qa-aspects.md) 派 sub agent，只派有對應 `manual` case 或本次改動風險的面向。每個 brief 最多 4 條 case，複雜對局／跨分頁流程一次只派一種；完成一批再派下一批，避免 agent 用起始頁截圖代替未走完的步驟。**同時開著的瀏覽器最多 3 個**：派之前查 `memory_pressure`。brief 帶：目標站、要跑的 case 原文、`run` 名稱、專屬 browser session。
3. 每條 `manual` case 先操作到「預期」要求的狀態，再按其 `viewport` 在**桌機 1440×900、手機 390×844** 的適用視窗截圖到 `docs/qa/reports/assets/<run>/<case-id>-<viewport>.png`；做不到就記已執行到第幾步、卡點與所需條件，不以起始頁截圖作為功能證據。逐條觀察寫進可追蹤的 `docs/qa/reports/observations-<面向>.md`，主 agent 只讀差異與 blocked 摘要。截圖目錄受 `.gitignore` 忽略；若要把圖交付進 Git，只挑報告實際引用的圖明確 `git add -f`，不要整批加入。`auto` case 引用通過的測試檔與閘門結果；若本次改動的公開行為未被該測試斷言覆蓋，先補自動測試或改列 `manual` 收證據。
4. 主 agent 逐條判決：`auto` 查對斷言與閘門，`manual` 查對觀察與預期；觀察模糊或跟預期對不上時，自己重看那一條再判。
5. 實體裝置才做得到的部分判 `blocked` 並寫「需要人做什麼」；先核對前一步的瀏覽器模擬證據，別把整條 case 都說成完全沒測。
6. sub agent 回報 case 沒寫到的異常 → 主 agent 確認屬實後補 case、再記 fail。

**完成**：本次改動的每項公開行為都有 case ID 與通過的自動證據或人工觀察；每條 `manual` case 的適用 viewport 都有判決與截圖，做不到的明記 `blocked` 與所需人員／裝置。無重複截圖要求。

## 6. 報告

用 `qa-plan.mjs` 的列當草稿，照 `qa-templates.md` 寫報告；`auto` 引用閘門與測試檔，`manual` 寫判決和截圖。結論只有三種：**可上線**（零 fail、零 blocked）、**有條件上線**（只剩 blocked，列出要人補測的）、**不可上線**。

**完成**：報告檔存在，對話裡只貼結論與 fail 清單。

## 7. 回報上線 bug

只有 **prod 上重現得到**的 fail 才開 issue（本機才壞的是發版阻擋，不是上線 bug）：

1. 在 https://teachbox100.com 用同一條 case 重現；重現不到就在報告註記，不開。
2. `gh issue list --label bug --state open --search "<關鍵字>"` 查重複；有就在原 issue 留言附新證據。
3. 先把 issue 標題與內文貼給使用者確認，確認後 `gh issue create --label bug --title ... --body-file ...`（格式見 `qa-templates.md`）。
4. issue 網址寫回報告與 case 的 `issues` 欄。

**完成**：每條 prod fail 都有 issue 連結或「未重現」註記。
