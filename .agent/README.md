# TeachBox100 · brigade

agent 冷啟動時讀這份：哪些能自己驗證、哪些動作要停手。框架契約見 `~/agent-kit/brigade/README.md`；
改產品程式碼的流程以 `AGENTS.md` 與 `.agents/skills/teachbox100-testing/` 為準，行為真相是 `docs/testing.md`。

## Surfaces

| surface | 主要 | 建置／啟動 | ready 判斷 | 雲端 Linux 可驗證 |
|---|---|---|---|---|
| 網站（Next.js 15 App Router，21 個單元＋首頁、分類頁） | ✅ | 人手開的在 3100（`pnpm dev`）。agent 另開：`E2E_PORT=3199 NEXT_DIST_DIR=.next-e2e pnpm test:e2e <檔>`（Playwright 自己起 server）；3D 單元（一番賞）加 `E2E_SERVER_MODE=production` | `curl -sf http://127.0.0.1:3199/` 回 200 | ✅ headless Chromium；canvas／3D 需要 GPU 才準 |
| PWA 離線（`@serwist/next` service worker） | | `pnpm build && pnpm start`（dev 不註冊 SW） | 瀏覽器 `navigator.serviceWorker.controller` 不是 null | ✅ |
| 短連結 API（`app/api/share`，Upstash Redis） | | 跟網站同一台 server；需要 `.env.local` 的 `KV_REST_API_*` | `POST /api/share` 回 200 | ⚠️ 要金鑰，且寫進**正式共用的 Redis**（見 Doors #10） |
| 計分板搶答（WebRTC＋公開 nostr relay） | | `LIVE_WEBRTC=1 pnpm test:e2e e2e/scoreboard-live.spec.ts` | 兩個學生瀏覽器加入房間 | ⚠️ 要能連外網的 relay；真手機斷線重連只能實機 |
| 麥克風、觸控手感、音效、投影可讀性 | | — | — | ❌ 真機，見 `docs/testing.md` 第三欄、`docs/qa/cases/` |

不准做的事：`next dev` 跑著時刪 `.next` 或在同一個 distDir build（白畫面）；收尾 `pkill -f "next dev"`（會殺掉使用者 3100 那台）。

## Gates

2026-10-28 在 M 系列 Mac 實測。

| gate | 指令 | 耗時 |
|---|---|---|
| lint | `pnpm lint`（oxlint type-aware） | 2 秒，有 warning 無 error |
| 型別 | `pnpm exec tsc --noEmit` | 6 秒，**main 上已經紅 4 個**（`app/coin/pay/page.tsx:19`、`app/coin/value/page.tsx:19`、`lib/hooks/use-toast.ts:9` 等）；`next.config` 設 `ignoreBuildErrors: true`，build 不擋 |
| 設計 token | `pnpm lint:tokens` | 1 秒 |
| 單元測試 | `pnpm test`（Vitest，384 項） | 3 秒 |
| proof 工具自身 | `pnpm test:workflow` | 1 秒 |
| E2E | `pnpm test:e2e <檔>`（檔名前不加 `--`，否則跑全套）；版型基準 `e2e/visual.spec.ts` | 未量；單檔含起 server 約 1–2 分 |
| Storybook | `pnpm test:stories` | 未量 |
| commit 閘門 | `.githooks/pre-commit`：動到 `app/ lib/ components/ hooks/` 就要 `.agents/verification/<HEAD>.json` 的 proof，且 diff hash 對得上。先 `git add` 再 `pnpm verify:change -- --matrix "<列>" --behavior "<行為>" --seam unit -- pnpm test <檔>` | — |
| CI | **沒有**（repo 沒有 `.github/`）。Vercel 只做 build | — |
| 編輯後快速檢查 | `.agent/check <檔>`：`.ts/.tsx/.js/.mjs` 跑 `oxlint --type-aware`＋`tsc`（只報這個檔的錯）＋`lint:tokens`（`app/ components/ lib/`）＋同名 `.test.ts(x)`；`*.test.ts(x)` 跑 vitest；`e2e/` 不跑 Playwright；JSON 用 `JSON.parse`（`tsconfig*` 是 JSONC，跳過）；Python 用 `ast.parse`；shell（`.agent/verify`、`.githooks/*`、`*.sh`）用 `brigade-shell-lint`。不帶參數＝`pnpm lint`＋`lint:tokens`＋`test` | 2026-10-28 實測：TS 4–7 秒（tsc 佔大半），其他 1 秒內。**PostToolUse hook 不會自動跑**：使用者還沒核准信任這個 repo（`brigade-trust`），要手動跑 |

## Doors

one-way 全部在 `one-way-doors`，由 hook 擋下；改規則後跑 `~/agent-kit/brigade/bin/brigade-doors-test`。
2026-10-28 使用者逐項確認（#6、#7 由建議的 one-way 改成 two-way）。

| # | door | 分類 | 理由 | 回滾 |
|---|---|---|---|---|
| 1 | `git push` 到 `main`（Vercel Git 整合自動部署正式站，推測自 `docs/seo/history.md:75`） | one-way（政策） | 老師可能正在課堂上用；部署由使用者用 `!` 執行 | `git revert <sha> && git push origin main`（人做）或 Vercel 後台 Instant Rollback |
| 2 | 改寫遠端歷史：`push --force`／`-f`／`--force-with-lease`、`--delete`、`:ref`、`+ref`、`--mirror`、`--prune` | one-way | 遠端歷史消失 | 無 |
| 3 | 丟棄未提交的改動：`checkout --`／`checkout .`／`-f`、`restore`、`reset --hard`、`clean -f`、`stash drop/clear`、`switch --discard-changes` | one-way | 使用者手改的檔案會一起消失。還原自己的暫存改動：先 `cp` 備份、再 `cp` 回來 | 無 |
| 4 | Vercel CLI：`--prod`、`rollback`、`promote`、`remove`／`rm`、`redeploy`、`alias`、`env add/rm/update`、`domains add/rm` | one-way | 動到正式站；env 沒有歷史 | 無 |
| 5 | Upstash Redis 刪資料：REST `/del`、`/flushdb`、`/flushall`、`redis-cli del/flush*`、`.del(` | one-way | 本機與正式站共用同一個 Redis（`lib/short-link.ts:15`），刪掉的是老師分享出去的連結 | 無 |
| 6 | `pnpm seo:indexnow`（送 sitemap 到 IndexNow） | two-way | 重送只是再通知搜尋引擎一次，無害 | 不需要；照慣例部署後跑 |
| 7 | `gh issue create/comment/close` | two-way | 自己的 repo；`qa.md:91` 仍規定 issue 內文先給使用者看 | `gh issue delete <n> --yes`、`gh issue reopen <n>` |
| 8 | 一般 `git push`（非 main 分支） | two-way | 只產生 Vercel preview | 刪遠端分支屬 #2，要人做 |
| 9 | `pnpm build` 上傳 Sentry source map（`.env.sentry-build-plugin` 有 token） | two-way | 只是符號檔 | Sentry 後台刪 release 檔案 |
| 10 | dev／e2e 建短連結寫進共用 Redis | two-way | 非 production 的連結 30 天自動過期（`lib/short-link.ts:15`） | 等 TTL |

不算 door：計分板對公開 nostr relay 只送 ephemeral event；`pnpm seo:rank` 只讀 GSC、結果寫進本機 `docs/seo/history.md`。

`one-way-doors` 只看得到 agent 直接下的 Bash 指令；寫成腳本、`sh -c "…"`、在 main 上打裸的 `git push`（沒寫分支名）都擋不到，那類動作照上表自己停手。
agent 推分支一律寫出分支名：`git push -u origin <branch>`。

## Rules

每條規則都配上執行它的東西。人糾正 agent 時：修那個錯，並加一列；已經在表上卻沒有東西擋住＝重犯，往更高一層修。錯不可能再發生時，刪掉那列。
2026-10-28 由 brigade-3-guardrails 整理自 37 份對話紀錄（227 則使用者訊息）與 auto-memory，使用者逐項核准 A–D。

| 規則 | 執行者 | 證明 |
|---|---|---|
| 第二台 Next server 不共用使用者 3100 的 `.next` | 架構：`playwright.config.ts` 在 port 不是 3100 時自動設 `NEXT_DIST_DIR=.next-e2e-<port>`；`.agent/verify` 用自己的 `.next-brigade-<n>` | 舊 config 加 `E2E_PORT=3199` → `NEXT_DIST_DIR` 沒設（寫進 `.next`）；新 config → `.next-e2e-3199`；3100 不變（`a04628a`） |
| 不按名稱殺 next、不砍 `.next` | hook `guard-doors.sh`，door 6 | `brigade-doors-test` 73/73；本 session 寫測試案例時的 printf 就被它擋下（`a04628a`） |
| agent 不在 main 上 commit | git hook `.githooks/pre-commit`（`CLAUDECODE=1` 且在 main 時擋） | scratch clone：舊 hook exit 0、新 hook exit 1；人 exit 0、分支 exit 0（`b34ed88`，重建） |
| 不發佈到 claude.ai artifact | 專案 hook `.claude/settings.json` PreToolUse `Artifact`（只擋 publish） | 模擬輸入：publish exit 2、不帶 action exit 2、list exit 0（`8a6def3`）；沒有拿真的呼叫測，免得 hook 沒載入時真的發佈出去 |
| 說「修好了」之前要有這次改動之後的證據 | hook `require-evidence.sh`（Stop，**2026-10-28 起只警告**；滿一週沒有誤報、使用者同意後 `touch .agent/enforce-evidence` 改成擋下，預定 2026-11-04 檢查）＋ `.agent/verify` | 對話 10-17、10-19 共 4 次「還是沒有」；brigade-2 的證據目錄 |
| 動到產品程式碼要有 proof 才能 commit | git hook `.githooks/pre-commit`（verify:change receipt＋diff hash） | 既有；`pnpm test:workflow` |
| 顏色、z-index、transition 走 design token | `pnpm lint:tokens`；`.agent/check` 編輯當下報 | 既有；`check` 對 `UnitHero.tsx` 加 `bg-red-500` → exit 1（`36c5b94`） |
| shell 變數後面不直接接全形字元 | `brigade-shell-lint`（`.agent/check` 改到 shell 時） | 抓到 `.githooks/pre-commit:44` 的真錯：bash 印出 `x（��y`，改 `${current}` 後印出 `x（abc）y`（`36c5b94`） |
| 部署（push main）、改寫遠端歷史、丟棄未提交改動、Vercel CLI、刪 Redis 由使用者執行 | hook `guard-doors.sh`，door 1–5 | `brigade-doors-test` 73/73；`echo npx vercel deploy --prod` 被擋，訊息指向本檔 Doors |
| 回覆一律用繁體中文（臺灣） | 全域 hook `reply-language.sh` | agent-kit `8e9d8cd` |

駁回（使用者 2026-10-28）：加了沒要求的文字或裝飾（約 12 次）、動畫有破綻（約 7 次）、外觀醜或不像其他單元（約 6 次）、同一件事要講第二次（約 3 次）、入口放錯位置（2 次）。這些屬於判斷，不設規則，auto-memory 照舊留著。
證據不足（只有 1 次）：proof 要在 `git add` 之後跑、`pnpm test:e2e` 多加 `--`、只在瀏覽器跑的套件會讓 build 壞掉。再發生一次就補進來。

## 平台限制

- **網站、PWA、短連結 API**：雲端 Linux 可以跑 `pnpm lint`、`pnpm test`、`pnpm test:e2e`（headless Chromium）。短連結要 Redis 金鑰，且會寫進正式共用庫；沒金鑰時只跑 `lib/short-link.test.ts` 這類替身測試
- **canvas、three.js（一番賞、扭蛋機）**：headless 沒 GPU 時畫面與時序不準；計時別用 Playwright `waitFor`；要在 Mac（真 GPU）或開 GPU 的 headless 跑
- **計分板 WebRTC**：要能連公開 nostr relay（`scripts/probe-relays.mjs` 測寫入）；校園網路、手機飛航重連只能實機
- **麥克風、觸控手感、喇叭、投影全螢幕**：只能實機，走 `/qa-test`（`docs/qa/cases/`）
- **本機 dev server**：使用者的 3100 那台與 agent 的 3199 那台要分開 `NEXT_DIST_DIR`；同時只開一台 agent server

## 驗證方式

改完要證明行為時用 `.agent/verify`（子指令與 exit code 見檔頭）；功能與 sub-feature 清單在 `.agent/features/README.md`。

- **smoke**：`.agent/verify`（launch dev → doctor → `drive home` → cleanup）。2026-10-28 實測約 1.5 分鐘，第一次冷編譯會再久一點
- **單一功能**：`.agent/verify launch` 之後跑 `.agent/verify drive <feature> [sub]`，證據路徑印在最後一行；先看裡面的 `<route>.png`，失敗時看 `pw-<sub>/*/trace.zip`
- **看狀態**：`.agent/verify doctor`；收尾用 `.agent/verify cleanup`（只停自己啟動的 server，證據會留著）
- **3D 單元**：`.agent/verify launch prod`（先 `next build` 到自己的 distDir）
- 改了規則、資料、解析的邏輯，仍然走 repo 的 proof：`pnpm verify:change …`（`.agents/skills/teachbox100-testing/proof.md`）。`verify drive` 證明的是使用者路徑

| surface | harness | 狀態 |
|---|---|---|
| 網站 | 這個 worktree 自己的 `next dev`（port 3200–3299）＋ repo 的 Playwright spec（`E2E_REUSE_SERVER`、`--trace on`）＋ `playwright screenshot` | ✅ 5 個功能、14 個 sub 全綠（2026-10-28，`home`／`draw`／`clock`／`multiplication`／`quiz`） |
| PWA 離線 | `launch prod` | 已建檔，沒有在 brigade 跑過 journey |
| 短連結 API | 攔截 `/api/share/*`（`quiz share-open`） | 只驗 client 端；真的 `POST` 會寫進正式 Redis，不放進 drive |
| 計分板搶答 | `LIVE_WEBRTC=1 pnpm test:e2e e2e/scoreboard-live.spec.ts` | 不在 map 裡：要連公開 relay，結果看 relay 狀況 |
| 麥克風、觸控、音效、投影 | — | verified-unreachable：要實機，走 `/qa-test`（`docs/testing.md` 第三欄） |

**替身清單**（這些步驟在真實目標跑過之前都算未驗證）：

- headless Chromium 代替真實瀏覽器：沒有 GPU 合成、沒有中文語音（領地戰的 journey 關掉了 `speechSynthesis`）、沒有真的觸控
- `next dev` 代替正式部署：沒有 Vercel CDN 快取、沒有 service worker（只有 `launch prod` 才有）、Sentry environment 是 `e2e`
- 分享連結的 API 用攔截代替：預覽 UI 驗過了，Redis 讀寫與 TTL 只靠 `lib/short-link.test.ts`
- `Math.random` 固定（multiplication `finish`）：題序可以重現，但紙屑會疊成一片

**隔離**：每個 worktree 用自己的 port（`3200 + 路徑雜湊 % 100`）、distDir（`.next-brigade-<n>`）、state（`$TMPDIR/teachbox100-brigade-<key>/`）。
port 被別人佔用時，`launch` 回 exit 2，不會去搶。使用者 3100 那台不碰，也不 `pkill`。
`next dev` 會把自己的 distDir 寫進 `tsconfig.json`；`launch` 先備份一份，`cleanup` 時如果差異只有那一行就還原，其他差異留給人處理。

**10/28 建置時抓到的 harness 錯**：證據原本直接寫進 `.agent/evidence/`，dev 看到檔案變動就重新編譯，測試跑到一半的頁面整頁重載、一直沒 hydrate，造成 wheel、library 假紅。
改成先寫到 repo 外、跑完再搬進來之後，14 個 sub 全綠。對照組：server 開著時寫進 evidence 觸發一次 `Compiled`，寫到 repo 外不會觸發。
