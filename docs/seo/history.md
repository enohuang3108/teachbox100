# SEO 數據紀錄

## 真實使用者效能（Sentry）

判斷效能以這張表為準。資料來源是 Sentry 的 pageload span，也就是使用者瀏覽器實際量到的 Web Vitals。每次改完 SEO 或效能，就用 Sentry MCP 的 `search_events` 查一次，追加一列：

- dataset `spans`，query `span.op:pageload environment:vercel-production`，period `30d`
- fields：`transaction`、`count()`，以及 `measurements.lcp`、`measurements.inp`、`measurements.cls` 的 `p75(...)`
- INP 要另外用 `environment:vercel-production has:measurements.inp` 查，pageload span 本身不帶 INP

正式站的 environment 是 **`vercel-production`**。標成 `production` 的是本機 `next start` 與 QA build，TTFB 大約 10ms，還會出現沒部署的頁面，不能拿來判斷。樣本數低於 20 筆的頁只能看方向。CLS 剛好是 1 的頁要先打開單筆 trace 確認，可能是動畫被算進去。

| 記錄日 | 區間 | 頁面 | 樣本 | LCP p75 | INP p75（樣本） | CLS p75 |
|---|---|---|---:|---:|---:|---:|
| 2026-09-29 | 30d | /draw/gacha | 25 | 1.2s | 136ms (11) | 1（待查） |
| 2026-09-29 | 30d | / | 22 | 1.7s | 128ms (2) | - |
| 2026-09-29 | 30d | /draw/wheel | 8 | 1.9s | 138ms (3) | 1（待查） |
| 2026-09-29 | 30d | /memory | 4 | 1.6s | 592ms (2) | - |
| 2026-09-29 | 30d | /quiz/territory | - | - | 748ms (4) | - |
| 2026-10-01 | 30d | /draw/gacha | 40 | 1.3s | 148ms (31) | 1（只有 1 筆帶 CLS） |
| 2026-10-01 | 30d | / | 30 | 1.5s | 104ms (5) | - |
| 2026-10-01 | 30d | /draw/ichiban | 12 | 1.3s | 192ms (10) | - |
| 2026-10-01 | 30d | /draw/wheel | 11 | 2.0s | 120ms (6) | 1（只有 1 筆帶 CLS） |
| 2026-10-01 | 30d | /scoreboard | 10 | 1.8s | 170ms (3) | - |
| 2026-10-01 | 30d | /monopoly | 6 | 1.3s | 258ms (5) | - |

2026-10-01 檢查：各頁 LCP 都在 2.5 秒內。TTFB 偏高（/scoreboard p75 3.5s 全是同一台 Safari）是網路造成的，正式站各頁都是 `x-vercel-cache: HIT` 的靜態檔。CLS 的 1 都來自單筆樣本，其餘 pageload 沒帶 CLS，不能當結論。INP 依互動元素拆開看（fields 加 `span.description`）：扭蛋機「繼續抽」p75 336ms（4 筆），本機 4 倍 CPU 節流只量到 72–136ms，推測差在學校電腦的 GPU，還沒動。已處理：一番賞的 three.js 場景改成按開始才載入（首次載入 JS 543 → 369 kB），場景 chunk 與 1.2 MB 票券模型在打開設定時先抓，按開始到票券畫出 770 → 455ms（M4 GPU、模擬 10 Mbps，量骨架屏淡出，不要用 Playwright waitFor 計時，它的輪詢間隔會拉到 1 秒）；大富翁的三個 mp3 改成第一次擲骰才抓，其他用 `useSound` 的頁面不再一載入就下載。

## 實驗室數據（Lighthouse）

只在要找出**為什麼慢**的時候跑 `pnpm seo:snapshot`，排名與成效的判斷不用它。Lighthouse 是模擬節流，機器忙的時候 TBT 會暴增好幾倍，所以要在 load average 低的時候跑，同裝置、同條件的結果才能互相比較。

| 日期 | 裝置 | 頁面 | Perf | FCP | LCP | TBT | CLS | 總 KB | 字型 KB | JS KB |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026-09-07 | desktop | / | 67 | 1.0s | 4.3s | 232ms | 0.000 | 3354 | 935 | 815 |
| 2026-09-07 | desktop | /coin | 92 | 1.0s | 1.2s | 131ms | 0.000 | 2088 | 1007 | 518 |
| 2026-09-07 | desktop | /coin/change | 93 | 1.0s | 1.2s | 112ms | 0.001 | 1959 | 795 | 483 |
| 2026-09-07 | desktop | /clock/current-time | 43 | 1.8s | 3.3s | 788ms | 0.000 | 1592 | 790 | 490 |
| 2026-09-09 | desktop | / | 84 | 1.6s | 1.6s | 134ms | 0.000 | 3580 | 1016 | 840 |
| 2026-09-09 | desktop | /coin | 84 | 1.7s | 1.7s | 62ms | 0.000 | 2064 | 1010 | 540 |
| 2026-09-09 | desktop | /coin/change | 82 | 1.0s | 1.7s | 194ms | 0.000 | 2071 | 937 | 503 |
| 2026-09-09 | desktop | /clock/current-time | 87 | 1.5s | 1.5s | 52ms | 0.000 | 1704 | 931 | 513 |
| 2026-09-09 | desktop | /timer | 95 | 0.8s | 1.0s | 62ms | 0.000 | 1896 | 1118 | 499 |
| 2026-09-09 | desktop | /multiplication | 93 | 0.8s | 0.8s | 73ms | 0.102 | 1848 | 1070 | 502 |
| 2026-09-17 | desktop | / | 87 | 1.4s | 1.5s | 139ms | 0.000 | 2502 | 917 | 737 |
| 2026-09-17 | desktop | /coin | 92 | 1.1s | 1.3s | 107ms | 0.000 | 2052 | 1007 | 537 |
| 2026-09-17 | desktop | /coin/change | 88 | 0.9s | 1.4s | 172ms | 0.000 | 2169 | 862 | 987 |
| 2026-09-17 | desktop | /clock/current-time | 86 | 1.4s | 1.4s | 185ms | 0.000 | 2246 | 934 | 988 |
| 2026-09-17 | desktop | /timer | 89 | 1.1s | 1.2s | 181ms | 0.000 | 1891 | 1119 | 500 |
| 2026-09-17 | desktop | /multiplication | 87 | 1.0s | 1.4s | 188ms | 0.000 | 2404 | 1073 | 988 |

## 全站搜尋成效

來源：Google Search Console `sc-domain:teachbox100.com`，Web 搜尋，不分維度的總計。GSC 資料約延遲兩天；同一個搜尋結果可能顯示多個本站頁面，所以各頁數據不可相加當成全站總計。

| 記錄日 | 資料區間 | 曝光 | 點擊 | CTR | 平均排名 |
|---|---|---:|---:|---:|---:|
| 2026-09-24 | 2026-08-25 ~ 2026-09-22 | 470 | 57 | 12.1% | 7.7 |
| 2026-09-29 | 2026-08-30 ~ 2026-09-27 | 637 | 75 | 11.8% | 7.5 |

## 搜尋排名紀錄

每次跑 `python3 scripts/gsc-rank.py --record` 追加一列。索引數由 sitemap URL 逐一查詢 URL Inspection；關鍵字數、曝光、點擊、平均排名只涵蓋 GSC 回傳的查詢列，受匿名查詢篩選影響，**不是全站總計**。需要全站總計時看上表。

| 記錄日 | 資料區間 | 已索引/提交 | 可見關鍵字數 | 可見查詢曝光 | 可見查詢點擊 | 可見查詢平均排名 | 最高曝光關鍵字 |
|---|---|---|---|---|---|---|---|
| 2026-09-08 | 2026-08-09 ~ 2026-09-06 | 12/15 | 0 | 0 | 0 | - | - |
| 2026-09-10 | 2026-08-11 ~ 2026-09-08 | 14/19 | 1 | 1 | 1 | 2.0 | teach box |
| 2026-09-24 | 2026-08-25 ~ 2026-09-22 | 17/22 | 16 | 60 | 4 | 8.0 | 翻牌抽籤 |
| 2026-09-29 | 2026-08-30 ~ 2026-09-27 | 19/22 | 29 | 130 | 10 | 7.7 | 線上扭蛋機 |

2026-09-24 的詳細檢查與待辦：[SEO 現況紀錄](2026-09-24-audit.md)。

2026-09-29 已處理（`ce7f922` 部署）：`/draw/lottery` 308 轉到 `/draw/gacha`；首頁卡片依搜尋點擊排序；轉盤 title 與 FAQ 補座號、分組；IndexNow 送出 23 頁；GSC 對 `/ultimate-password`、`/draw`、`/timer`、`/multiplication` 要求建立索引。複查：一週後看收錄數（當時 19/23），兩到四週後看 `/draw/wheel` 排名（當時 5.6）與 `/draw/lottery` 曝光是否轉到 `/draw/gacha`。
