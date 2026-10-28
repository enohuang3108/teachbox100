# 出題遊戲與題庫

領地戰（`/quiz/territory`）、圈叉搶答（`/quiz/morris`）、終極密碼（`/ultimate-password`）、大富翁（`/monopoly`）共用瀏覽器裡的題庫清單。
設定分三步：題庫、遊戲設定、輔助。老師也可以用首頁「使用分享連結」輸入代碼，帶入別人分享的題庫與設定。

## Sub-features

- `territory`：選小場地、5 秒倒數 → 兩隊各按準備 → 先出題幹、倒數 5 秒，倒數完才出現兩隊的選項
- `library`：在領地戰建一份題庫，其他三個遊戲都看得到；取消編輯、取消刪除都不會改到資料
- `share-open`：首頁輸入分享代碼，預覽保留大小寫；失效（404）與服務錯誤（503）有提示；改了代碼後不採用舊的回應

## How to get to it (user POV)

- 首頁「領地戰」卡 →「開始使用」→ 題庫 →「下一步」→ 遊戲設定 →「下一步」→ 輔助 →「開始比賽」
- 題庫：任一出題遊戲的題庫步驟 →「在瀏覽器出題」或鉛筆鈕
- 分享：首頁或一般頁頁首「使用分享連結」→ 輸入代碼 →「開啟」

## Driving it with Playwright

Preconditions: baseline。`territory` 關掉 `speechSynthesis`，不朗讀；`share-open` 攔截 `/api/share/*`，不碰 Redis。

- `.agent/verify drive quiz territory` → 棋盤 12–15 格、2 支灰旗；兩隊準備後出現「5」，倒數完出現「藍隊選…」按鈕
- `.agent/verify drive quiz library` → 四個遊戲的題庫清單都有「QA共用題庫」，編輯框的第 1 題維持原文
- `.agent/verify drive quiz share-open` → 預覽顯示「領地戰／三年級自然」，`abcdefgh` 顯示找不到，其他代碼顯示服務錯誤
- 截圖：`_quiz_territory.png`

## Gotchas

- `library` 一個案例走四個路由；`drive quiz` 會先預熱這四個路由。只要有檔案寫進 worktree，dev 就會重新編譯，頁面會整頁重載、按鈕一直 disabled（10/28 卡了 3 分鐘）
- `territory` 斷言要看到倒數的「5」；機器很忙時，從點下按鈕到開始斷言之間倒數可能已經跑完，失敗畫面會直接停在選項上。這種情況先在負載低時重跑，不要直接判定產品壞了
- 朗讀的實際聲音與尾音、各瀏覽器差異屬於真機驗收；headless 沒有中文語音
- 真的建短連結（`POST /api/share`）會寫進正式共用的 Redis（README door 10）；這裡的 journey 都用攔截，不要改成打真的 API
