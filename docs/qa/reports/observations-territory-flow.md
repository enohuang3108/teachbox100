# 領地戰瀏覽器觀察（2026-09-25-e23a7f9）

目標：`http://127.0.0.1:3199/quiz/territory`。專用 Playwright session：`territory-flow-1`。桌機 1440×900、手機 390×844。此檔只記錄實際操作與畫面，不判定 pass／fail。

### TERR-002 desktop
- 做了：寫入含簡單、普通、困難各兩題且正解為「正確」的題庫；經設定兩站開始比賽、兩隊準備後實際點答案。每題等待倒數完，依序做三種難度答對、藍隊答錯後重按與紅隊接手、兩隊都答錯；讀取棋盤每格隊色。
- 看到：簡單答對藍 1→2、普通答對藍 3→5、困難答對藍 5→8。藍答錯時紅 2→3；藍按鈕 disabled、重送 pointerdown 後格數不變，紅按鈕仍可按；紅接手答對後紅 3→6。雙錯後顯示「正解是『正確』」，當回合雙方各加 1。最後中立格 1→0 時藍 8→10、紅 6→5，觀察到紅格轉藍。
- console：`Failed to load resource: the server responded with a status of 429 ()` 兩次；無 pageerror。
- 截圖：[TERR-002-desktop-flow.png](assets/2026-09-25-e23a7f9/TERR-002-desktop-flow.png)
- 額外異常：無。

### TERR-002 mobile
- 做了：390×844 重做同一題庫與答題流程；藍答錯後截取出局畫面。
- 看到：簡單、普通、困難答對分別增加 1、2、3 格；藍答錯時紅 1→2，藍 disabled 且重按不變，紅仍能按並接手答對到 5 格。雙錯顯示正解，兩隊各增 1。中立格 1→0 後藍 8→9、紅維持 6。
- console：`Failed to load resource: the server responded with a status of 429 ()` 兩次；無 pageerror。
- 截圖：[TERR-002-mobile-flow.png](assets/2026-09-25-e23a7f9/TERR-002-mobile-flow.png)
- 額外異常：無。

### TERR-003 desktop
- 做了：分別以一題簡單題藍答對、一題簡單題兩隊答錯、八題困難題藍連續答對開三局；每局看到結算後按「再來一局」。
- 看到：題目出完但格數不同時顯示「藍隊 獲勝！」及「題目出完：藍隊 2 格，紅隊 1 格」；相同時顯示「平手！」及 2:2；吃光局的棋盤依序 4:1、7:1、10:1、13:1、15:0，第五答後顯示「藍隊 獲勝！」。三局的「再來一局」均回到藍紅各 1 格、`READY?` 和兩隊準備按鈕。
- console：每次載入各有一筆 `Failed to load resource: the server responded with a status of 429 ()`；無 pageerror。
- 截圖：[格數不同](assets/2026-09-25-e23a7f9/TERR-003-desktop-unequal-flow.png)、[平手](assets/2026-09-25-e23a7f9/TERR-003-desktop-tie-flow.png)、[吃光](assets/2026-09-25-e23a7f9/TERR-003-desktop-elimination-flow.png)
- 額外異常：無。

### TERR-003 mobile
- 做了：390×844 重做上述三局及三次「再來一局」。
- 看到：格數不同顯示藍勝 2:1；相同顯示平手 2:2；吃光局第五答變成 15:0 並顯示藍勝。三次重開均回 1:1、`READY?`、兩隊準備按鈕。
- console：每次載入各有一筆 `Failed to load resource: the server responded with a status of 429 ()`；無 pageerror。
- 截圖：[格數不同](assets/2026-09-25-e23a7f9/TERR-003-mobile-unequal-flow.png)、[平手](assets/2026-09-25-e23a7f9/TERR-003-mobile-tie-flow.png)、[吃光](assets/2026-09-25-e23a7f9/TERR-003-mobile-elimination-flow.png)
- 額外異常：無。

### TERR-004 desktop
- 做了：清 localStorage 後寫入兩題已知題庫；在設定兩站把隊名改為星星隊／月亮隊、難度困難以下、場地「大」、倒數「5 秒」，按「分享設定」。取「完整連結」輸入框中的網址（格式 `http://127.0.0.1:3199/quiz/territory#setup=...`，166 字元），新分頁從空白文件載入。查看題庫站和玩法站；把星星隊改成「重整保留隊」後重整。另造加入倒數與場地欄位前的舊連結，開第二個新分頁。
- 看到：原設定摘要「自訂 2 題・2 題・棋盤 8×5・倒數 5 秒」。新連結開啟時設定自動打開，題庫站顯示自訂 2 題、提示「已載入分享連結」；玩法站顯示星星隊／月亮隊、困難以下、大、5 秒均已選。網址 hash 被清除。修改隊名後重整仍顯示「重整保留隊」，未再次顯示載入提示。舊連結帶入舊藍隊／舊紅隊，「自動」與「3 秒」已選，網址 hash 亦清除。
- console：原分頁載入時 `Failed to load resource: the server responded with a status of 429 ()`；無 pageerror。
- 截圖：[新連結](assets/2026-09-25-e23a7f9/TERR-004-desktop-flow.png)、[舊連結](assets/2026-09-25-e23a7f9/TERR-004-desktop-old-flow.png)
- 額外異常：首次嘗試先在新分頁載入同一路徑以清 localStorage，再導向只有 hash 不同的網址；瀏覽器視為同文件 hash 導航，設定未自動套用。改成先回 `about:blank` 再載入完整連結後正常，這是測試步驟差異。

### TERR-004 mobile
- 做了：390×844 重做桌機的分享、新分頁載入、重整保留和舊連結流程。
- 看到：新連結自動開設定並提示已載入，題庫 2 題與星星隊／月亮隊、困難以下、大、5 秒均顯示；hash 清除。改名重整後保留「重整保留隊」且不再提示。舊連結為舊藍隊／舊紅隊、自動、3 秒；hash 清除。
- console：原分頁載入時 `Failed to load resource: the server responded with a status of 429 ()`；無 pageerror。
- 截圖：[新連結](assets/2026-09-25-e23a7f9/TERR-004-mobile-flow.png)、[舊連結](assets/2026-09-25-e23a7f9/TERR-004-mobile-old-flow.png)
- 額外異常：無。

### TERR-005 desktop
- 做了：1440×900 開一題局，按「全螢幕」，量棋盤位置與格數排法；兩隊準備、倒數出題後依序派送不同 `pointerId` 的兩個觸控類型 `pointerdown`，先藍答對再紅按相同答案。
- 看到：`document.fullscreenElement` 有值；棋盤從 896×560、位於 (272,202)，擴為 1440×900、位於 (0,0)；格數排法保持 5 欄×3 列。依序派送後藍 1→2、紅仍 1。這是自動化 pointer 事件，無法代表兩人近同時在實體螢幕按下。
- console：載入時 `Failed to load resource: the server responded with a status of 429 ()`；無 pageerror。
- 截圖：[TERR-005-desktop-flow.png](assets/2026-09-25-e23a7f9/TERR-005-desktop-flow.png)
- 額外異常：投影後排可讀性、實體多指觸控、旗子落地與紙屑動態觀感、勝利音效未在真機確認。

### TERR-005 mobile
- 做了：390×844 重做全螢幕與依序 pointer 事件檢查。
- 看到：`document.fullscreenElement` 有值；棋盤從 358×774.7、位於 (16,80)，擴為 390×844、位於 (0,0)；保持 3 欄×5 列。依序派送後藍 1→2、紅仍 1。實體觸控與兩人近同時作答未驗。
- console：載入時 `Failed to load resource: the server responded with a status of 429 ()`；無 pageerror。
- 截圖：[TERR-005-mobile-flow.png](assets/2026-09-25-e23a7f9/TERR-005-mobile-flow.png)
- 額外異常：後排可讀性、實體多指觸控、旗子與紙屑動態觀感、音效未在真機確認。
