# qa-run 的 sub agent 面向

主 agent 派工時讀。每個面向一個 sub agent：`security` 用 `model: "opus"`，其他面向用 `model: "sonnet"`。
sub agent **只收證據、不判 pass／fail** —— brief 裡明寫這句，並要求它照「觀察紀錄」格式回報。

## 觀察紀錄（每個面向共用）

```md
### <case-id> <viewport>
- 做了: 實際執行的步驟，卡住的步驟寫在哪一步、畫面上有什麼
- 看到: 畫面結果的客觀描述（文字、數字、元素有沒有出現）
- console: error／warning 原文，沒有就寫「無」
- 截圖: docs/qa/reports/assets/<run>/<case-id>-<viewport>.png
- 額外異常: case 沒問但看到的怪事，沒有就寫「無」
```

## 功能有效性 `functional`

- 跑範圍內所有 `manual` case，照步驟逐字操作。
- 每個單元額外做一次 **重新整理**與**上一頁**，記錄設定是否保留、畫面是否回到合理狀態。

## UI/UX 一致性 `uiux`

- 範圍內每個單元的介紹頁、設定頁、主畫面各截一張，兩個 viewport。
- 對照 `design-system` skill 與 `unit-page` skill 的產品約定，逐頁記錄：breadcrumb、頂列鈕、「開始」位置、字級與配色是否跟其他單元一樣、手機上有沒有橫向捲動或被切掉的元素、按鈕可點範圍。
- 列出**跨單元不一致**的地方：哪兩頁、差在哪。

## 效能 `perf`

- 桌機為準（見 `docs/seo/history.md` 的慣例）。對範圍內每個單元頁量一次：
  `playwright-cli -s=<session> eval` 取 `performance.getEntriesByType('navigation')[0]` 的 `domContentLoadedEventEnd`、`loadEventEnd`，以及 LCP（`PerformanceObserver` type `largest-contentful-paint`, buffered）。
- 主畫面有動畫的單元（扭蛋、一番賞、轉盤、大富翁）操作 10 秒，記錄有沒有明顯卡頓、console 的 long task。
- 回報數字，不下結論。

## 安全 `security`

- 只做**被動**與**自己輸入**的檢查，不對 prod 做掃描或大量請求。
- 所有可輸入文字的地方（名單、題庫、隊名、房間名）輸入 `<img src=x onerror=console.log('xss')>` 與超長字串（500 字），記錄是否被當 HTML 執行、畫面是否破版。
- 計分板加入頁：記錄房間代碼是否能被猜（長度、字元集）、錯誤代碼的回應。
- `curl -sI <目標站>` 記錄 security header（CSP、X-Frame-Options、Referrer-Policy、HSTS）。
- console 與 network 裡有沒有外洩的 key、token、內部網址。
