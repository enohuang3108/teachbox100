# 分享設定跨分頁觀察

- 目標：`http://127.0.0.1:3199` 的 production build
- 瀏覽器：獨立 Chromium session；每次來源頁與收件頁都使用全新、未寫入 localStorage 的 browser context。收件分頁建立時的網址為 `about:blank`，再載入剛從 UI 複製的完整連結。操作結束後已關閉 browser session。
- 視窗：desktop 1440×900、mobile 390×844
- 截圖：只在收件頁完成值比對、看見載入提示、確認設定視窗自動開啟且網址 hash 清空後擷取。

## WHEEL-003 分享名單設定

- desktop：設定畫面把預設 6 人改成「冬冬、米米」，到最後一步按「分享設定」。完整連結欄位為 `/draw/wheel#…`，長 66 字元；按旁邊「複製」後，剪貼簿內容與欄位完全相同。新分頁從 `about:blank` 載入後，設定視窗自行開啟，出現「已載入分享連結」，名單欄仍為 `冬冬\n米米`；最終網址為 `/draw/wheel`，沒有 hash。[收件頁截圖](assets/2026-09-25-e23a7f9/WHEEL-003-desktop-verified.png)。
- mobile：以同一組非預設名單重新走設定與複製，完整連結同為 66 字元、剪貼簿相符。新分頁同樣從 `about:blank` 載入，設定自動開啟、載入提示可見、名單仍為 `冬冬\n米米`，最終網址沒有 hash。[收件頁截圖](assets/2026-09-25-e23a7f9/WHEEL-003-mobile-verified.png)。

## GACHA-005 分享名單設定

- desktop：設定畫面把預設 6 顆改成「海星、河馬」，到玩法這一站按「分享設定」。完整連結欄位為 `/draw/gacha#…`，長 66 字元；按「複製」後剪貼簿與欄位相同。新分頁從 `about:blank` 載入後，設定自行開啟並顯示「已載入分享連結」；名單欄為 `海星\n河馬`，最終網址為 `/draw/gacha`，沒有 hash。[收件頁截圖](assets/2026-09-25-e23a7f9/GACHA-005-desktop-verified.png)。
- mobile：重新在手機視窗輸入同組非預設名單、複製 66 字元完整連結，剪貼簿相符。新分頁從 `about:blank` 載入，設定自動開啟、載入提示可見、名單相同，最終網址沒有 hash。[收件頁截圖](assets/2026-09-25-e23a7f9/GACHA-005-mobile-verified.png)。

## ICHI-005 分享獎項設定

- desktop：在設定 UI 將 A 賞內容「星空投影燈」改成「彩虹鉛筆盒」，按「分享設定」。完整連結欄位為 `/draw/ichiban#…`，長 131 字元；按「複製」後剪貼簿相符。新分頁從 `about:blank` 載入，設定自行開啟並顯示「已載入分享連結」。收件頁三列依序為 A 賞／彩虹鉛筆盒／1 張、B 賞／造型抱枕／3 張、C 賞／桌上收納盒／3 張，與來源頁逐欄相同；最終網址為 `/draw/ichiban`，沒有 hash。[收件頁截圖](assets/2026-09-25-e23a7f9/ICHI-005-desktop-verified.png)。
- mobile：重新在手機視窗修改 A 賞內容並複製 131 字元完整連結，剪貼簿相符。新分頁從 `about:blank` 載入，設定自動開啟、載入提示可見，三列獎項／內容／數量均與來源頁相同，最終網址沒有 hash。截圖時已等載入過場結束。[收件頁截圖](assets/2026-09-25-e23a7f9/ICHI-005-mobile-verified.png)。

## MEM-004 分享牌組設定

- desktop：在設定 UI 將第 1 組由「貓／cat」改成「樹葉／leaf」，再到玩法這一站按「分享設定」。完整連結欄位為 `/memory#…`，長 110 字元；按「複製」後剪貼簿相符。新分頁從 `about:blank` 載入，設定自行開啟並顯示「已載入分享連結」。收件頁四組依序為「樹葉／leaf、狗／dog、太陽／sun、月亮／moon」，與來源頁八個欄位逐一相同；最終網址為 `/memory`，沒有 hash。[收件頁截圖](assets/2026-09-25-e23a7f9/MEM-004-desktop-verified.png)。
- mobile：重新在手機視窗修改第 1 組並複製 110 字元完整連結，剪貼簿相符。新分頁從 `about:blank` 載入，設定自動開啟、載入提示可見，四組八個欄位相同，最終網址沒有 hash。[收件頁截圖](assets/2026-09-25-e23a7f9/MEM-004-mobile-verified.png)。

## 未完成步驟

無。
