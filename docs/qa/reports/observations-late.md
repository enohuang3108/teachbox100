# 後段瀏覽器觀察與證據邊界

- 日期：2026-09-27；目標：`http://127.0.0.1:3199` production build。
- 三個獨立 Chromium 任務在完成報告檔前遇到執行用量限制。本檔只收錄其即時回報、留存畫面及主 agent 後續測試；不把未記錄步驟推成通過。

## COININTRO-002

執行者回報桌機 1440×900 與手機 390×844 都進入認識新臺幣主畫面，並和已開始的金錢價值頁比較。留存的 [桌機](assets/2026-09-25-e23a7f9/COININTRO-002-desktop-verified.png) 與 [手機](assets/2026-09-25-e23a7f9/COININTRO-002-mobile-verified.png) 畫面顯示麵包屑、全螢幕鈕、紙色背景與面額卡；沒有先前的模糊光暈或漸層。視覺項目已複核。

## COINBUY-003

執行者在桌機把 18 元礦泉水拖入購物車，看到總額 18 並完成付款；[購物車畫面](assets/2026-09-25-e23a7f9/COINBUY-003-desktop-verified.png)、[付款畫面](assets/2026-09-25-e23a7f9/COINBUY-003-desktop-paid.png)。手機模擬滑鼠拖曳沒有把商品放入車內，改用畫面明示的點選方式加入 12 元商品並付款成功；[點選畫面](assets/2026-09-25-e23a7f9/COINBUY-003-mobile-verified.png)、[付款畫面](assets/2026-09-25-e23a7f9/COINBUY-003-mobile-paid.png)。真手機手指拖放尚未操作，不以模擬滑鼠失敗直接判產品故障。

## MONO-004、MONO-005

[手機主畫面](assets/2026-09-25-e23a7f9/MONO-004-mobile-verified.png) 顯示玩家卡與骰子縮在棋盤中央；外圈棋格與頂列可見。棋子頭像是預期覆蓋在所在格上的遊戲元素。頂列在[桌機](assets/2026-09-25-e23a7f9/MONO-005-desktop-verified.png)、[手機](assets/2026-09-25-e23a7f9/MONO-005-mobile-verified.png) 均依序出現重新開始、音量、全螢幕；按重新開始後的[桌機](assets/2026-09-25-e23a7f9/MONO-005-desktop-return-settings.png)與[手機](assets/2026-09-25-e23a7f9/MONO-005-mobile-return-settings.png)畫面均回到三站設定的題庫站。

## SCORE-006、SCORE-007

執行者回報 SCORE-006 桌機與手機都從 UI 修改組名、複製完整連結、在空白新 context 開啟，組名相符、出現「已載入分享連結」、網址 hash 清除；[桌機收件頁](assets/2026-09-25-e23a7f9/SCORE-006-desktop-verified.png)、[手機收件頁](assets/2026-09-25-e23a7f9/SCORE-006-mobile-verified.png)。

SCORE-007 留存的[桌機](assets/2026-09-25-e23a7f9/SCORE-007-desktop-verified.png)與[手機](assets/2026-09-25-e23a7f9/SCORE-007-mobile-verified.png)顯示紅色錯誤提示「連不上配對伺服器，學生現在加不進來。請確認這台電腦的網路，或改用手機熱點再打開一次。」後續 `e2e/scoreboard-relay-failure.spec.ts` 在桌機與手機攔截所有 WebSocket，兩邊均顯示提示；同時在本機攔截 `/monitoring` 的 Sentry envelope，確認送出指定診斷訊息，內容不含當輪房號及自訂組名。兩條通過；本測試沒有把診斷資料實際送至遠端 Sentry。

## GACHA-003、GACHA-004

執行者回報手機 30 顆流程已揭曉並收進紀錄 29 顆，第 15 顆時剩餘球池可見、WebGL 主 context 有效，沒有 `Too many active WebGL contexts`。在 29／30 時試了約 10 次像素位置點擊，未打開最後一顆。主 agent 後續以正式建置截圖重現：固定開啟的紀錄面板覆蓋球池左側，當時最後一顆只露出一小部分。修正後，手機紀錄預設收成小按鈕，抽球或全部放回時也會收起；[修正後的第 30 顆畫面](assets/2026-09-25-e23a7f9/GACHA-004-mobile-last-ball.png)顯示整顆球可見。`e2e/gacha.spec.ts` 在手機連抽 29 顆後，從畫面截圖定位最後一顆的色塊並以 pointer 點開，驗到結果 `QA-30`、繼續抽後 0／30、紀錄可重新展開，且全程沒有 WebGL context 警告（2 tests passed，1.0m）。實體手機上的搖動與動畫流暢度仍待補。

MEM-005 在該執行者中斷前尚未進行；主 agent 後續新增並跑過 `e2e/memory-photo-share.spec.ts`：透過設定 UI 上傳 30 張獨立高雜訊 PNG，分享時解碼完整連結確認圖片總長變小；短連結欄顯示「圖片過大，短連結放不下」，複製鈕停用，且 `/api/share` 沒有被呼叫。桌機 1 passed。
