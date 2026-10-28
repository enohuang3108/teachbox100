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

## 平台限制

- **網站、PWA、短連結 API**：雲端 Linux 可以跑 `pnpm lint`、`pnpm test`、`pnpm test:e2e`（headless Chromium）。短連結要 Redis 金鑰，且會寫進正式共用庫；沒金鑰時只跑 `lib/short-link.test.ts` 這類替身測試
- **canvas、three.js（一番賞、扭蛋機）**：headless 沒 GPU 時畫面與時序不準；計時別用 Playwright `waitFor`；要在 Mac（真 GPU）或開 GPU 的 headless 跑
- **計分板 WebRTC**：要能連公開 nostr relay（`scripts/probe-relays.mjs` 測寫入）；校園網路、手機飛航重連只能實機
- **麥克風、觸控手感、喇叭、投影全螢幕**：只能實機，走 `/qa-test`（`docs/qa/cases/`）
- **本機 dev server**：使用者的 3100 那台與 agent 的 3199 那台要分開 `NEXT_DIST_DIR`；同時只開一台 agent server

## 驗證方式

（brigade-2-verify 填）
