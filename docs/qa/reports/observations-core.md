# Functional core observations — 2026-09-25-e23a7f9

Viewport runs used 1440×900 desktop and 390×844 mobile. Browser session: `functional-core-1`, target `http://127.0.0.1:3199`. These are observations only; no pass/fail judgments.

Console: the browser console contained one error during the recorded run: `Failed to load resource: the server responded with a status of 429 () @ https://umami.enohuang.com/script.js:0`. No warnings were reported. HOME-002 pageerror listener returned an empty array on every route visited.

### HOME-002 desktop / mobile
- 做了: 逐頁直接開啟 app/pages.config.ts 中單元 path，另含 /、/draw、/coin 與分類 /about。每頁等 DOMContentLoaded 後約 700ms，讀取 title、h1、breadcrumb，截圖。
- 看到: 所列頁面均顯示預期 URL、title、h1；分類與單元頁均有 breadcrumb（首頁根頁除外）；pageerror 清單皆空。已遍訪 paths 見本目錄 HOME-002-<viewport>-*.png。
- console: 該次逐頁 pageerror 無；整體 console 有上述 Umami 429。
- 截圖: `HOME-002-desktop-*.png`、`HOME-002-mobile-*.png`（本資料夾）。
- 額外異常: 無其他。

### HOME-003 desktop / mobile
- 做了: 首頁清 localStorage、捲動至 y≈700，點選 `[href^="/clock"]`，呼叫瀏覽器上一頁並截圖。
- 看到: 操作期間路由返回狀態不穩定；紀錄到桌機最後 URL 為 `/timer`、手機最後 URL 為 `/coin/buy`，scrollY 均為 0；不能據此確認上一頁位置還原或動畫是否重播。
- console: 整體 console 有上述 Umami 429。
- 截圖: `HOME-003-desktop.png`、`HOME-003-mobile.png`。
- 額外異常: 上述返回路由與預期起始首頁不同，需主 agent 視截圖判讀。

### HOME-004 desktop / mobile
- 做了: 以 `domcontentloaded` 開啟 `/clock/current-time`、`/coin/buy`，立刻點介紹頁第一顆「開始」按鈕。
- 看到: 兩頁均顯示設定 dialog（role=dialog count 1）；桌機與手機都有截圖。此流程沒有 throttle 到慢速網路，也未清瀏覽器 HTTP cache。
- console: 整體 console 有上述 Umami 429。
- 截圖: `HOME-004-<viewport>-clock-current-time.png`、`HOME-004-<viewport>-buy.png`。
- 額外異常: 未觀察到點擊未反應。

### CLOCK-002 desktop / mobile
- 做了: 清 localStorage、開設定；找到兩個 role=switch，但未切換後開始。刷新後再次開設定。
- 看到: dialog 含「隨機上下午（24 小時制）」「顯示時間滑桿」；刷新後仍出現同樣項目。未成功變更任一設定值，故未取得變更值重載比較證據。
- console: 整體 console 有上述 Umami 429。
- 截圖: `CLOCK-002-<viewport>.png`。
- 額外異常: 無其他。

### CLOCK-003 desktop / mobile
- 做了: 進作答畫面；讀取畫面並截圖，沒有執行指針拖曳或觸控滑桿操作。
- 看到: 作答畫面有鐘面、時刻滑桿、時／分作答區與「確定」「下一題」。尚未以手勢驗證指針跟手與出題時間判定。
- console: 整體 console 有上述 Umami 429。
- 截圖: `CLOCK-003-<viewport>.png`。
- 額外異常: 需人工拖曳／觸控實測。

### COINBUY-002 / COINCHG-002 / COINEQ-002 / COINPAY-002 / COINVAL-002 desktop / mobile
- 做了: 每個單元清 localStorage、開設定頁、讀取設定文字並截圖，開始作答、刷新並重新開設定。未能在所有控件中實際改變一個值。
- 看到: 六頁（含 clock）都能顯示設定 dialog；進作答後頁面分別顯示購物商品／購物車、已付金額與售價／找零選擇、相同價值提示／硬幣選擇、付款售價／硬幣選擇、硬幣總值題。刷新後重新打開設定 dialog。購物、找零、付款設定含金額上限 slider；等值設定有可用面額；價值設定有面額、金額區間、回答方式、排列選項。因未調整設定，沒有前後值比較。
- console: 整體 console 有上述 Umami 429。
- 截圖: 各 case id 加 `-desktop.png` / `-mobile.png`。
- 額外異常: 手動修改設定與刷新後值是否保留，尚無可比對值。

### COINBUY-003 desktop / mobile
- 做了: 作答頁已進入並可見商品、購物車、付款操作區；未對商品執行拖放或付款。
- 看到: 頁面文字包含「把商品拖到這裡，或點一下商品放進購物車」「請挑選正確的金額來付款」及「付款」。
- console: 整體 console 有上述 Umami 429。
- 截圖: 本輪未另存 COINBUY-003 專屬截圖；參考 `COINBUY-002-<viewport>.png` 為起始流程畫面。
- 額外異常: 拖放與加總未實測。

### COININTRO-001 desktop / mobile
- 做了: 開 `/coin/introduction`，按「開始認識」，等待約 900ms，截圖；讀取面額按鈕／畫面文字。
- 看到: 文字列出 1、5、10、50、100、200、500、1000、2000 元，每個面額一次；尚未逐一點擊驗證 3D 硬幣／紙鈔。
- console: 整體 console 有上述 Umami 429。
- 截圖: `COININTRO-001-<viewport>.png`。
- 額外異常: 3D 模型交互尚未點選觀察。

### COININTRO-002 desktop / mobile
- 做了: `/coin/introduction` 開始認識後截圖，另進 `/coin/value` 開始練習後截圖作比較。
- 看到: 兩頁均有 breadcrumb、頂列及面額／題目區；精確視覺樣式對照尚待主 agent 讀圖。未作 CSS token 或 gradient 檢查。
- console: 整體 console 有上述 Umami 429。
- 截圖: `COININTRO-002-intro-<viewport>.png`、`COININTRO-002-value-<viewport>.png`。
- 額外異常: 無其他。

### MEM-002 desktop / mobile
- 做了: 開翻牌配對，點「開始使用」，設定 dialog 開啟；讀取畫面。
- 看到: 初始牌組顯示 `4／15 組`，四組配對項目及「新增配對」「下一步」。尚未新增至 15 組，亦未觀察超上限訊息與 disabled 狀態。
- console: 整體 console 有上述 Umami 429。
- 截圖: `MEM-002-<viewport>.png`。
- 額外異常: 牌組上限 guard 尚未操作至上限。

### MEM-003 desktop / mobile
- 做了: 依序按開始使用、下一步、開始遊戲；讀取作答畫面並截圖。沒有完成整局配對。
- 看到: 牌面文字「配對 0 / 4」「翻牌 0 次」及八個預設文字牌（cat、狗、月亮、sun、moon、dog、貓、太陽）。
- console: 整體 console 有上述 Umami 429。
- 截圖: `MEM-003-<viewport>.png`。
- 額外異常: 結算畫面未到達。

### NOISE-002 / NOISE-003 desktop / mobile
- 做了: 開 `/noise`；NOISE-002 截圖初始畫面；點「噓」後再截圖，未授予或拒絕麥克風權限，也未離開權限詢問中的頁面。
- 看到: 顯示「等待授權…」。
- console: 整體 console 有上述 Umami 429。
- 截圖: `NOISE-002-<viewport>.png`、`NOISE-003-<viewport>.png`。
- 額外異常: 真實麥克風說話／安靜時音量刻度與離頁後瀏覽器指示燈狀態，需具麥克風及可操作權限提示的實體瀏覽器人工確認；本輪沒有得到權限詢問畫面，不能確認釋放行為。

### TIMER-002 desktop / mobile
- 做了: 開 `/timer`、按「開始使用」，讀取畫面並截圖；未將時間設成 01:00、未開始等待歸零。
- 看到: 初始畫面顯示「考試時間 05:00」「時間 05:00」「+1 分」「重設」「開始」。
- console: 整體 console 有上述 Umami 429。
- 截圖: `TIMER-002-<viewport>.png`。
- 額外異常: 歸零提示畫面未觀察；響鈴需實際播放並由人耳確認，約需等待 60 秒。
