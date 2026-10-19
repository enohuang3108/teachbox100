# 首頁與分類頁（/、/draw、/coin）

## HOME-001 首頁卡牆與分類頁入口
- smoke: True
- viewport: desktop, mobile
- auto: e2e/home.spec.ts
- 前置: 清掉 localStorage
- 步驟:
  1. 開 /
  2. 點「抽籤」分類卡
  3. 回首頁點「認識金錢」分類卡
- 預期: 首頁 12 張入口卡；/draw 列 5 個、/coin 列 6 個單元；卡片封面圖都有載入
- issues: —

## HOME-002 每個單元頁都打得開
- smoke: True
- viewport: desktop, mobile
- auto: manual —— 導航逐頁在 dev server 首次編譯太慢，e2e 刻意不做（見 home.spec.ts 註解）
- 前置: 清掉 localStorage
- 步驟:
  1. 依序開 app/pages.config.ts 所有 path
- 預期: 每頁 200、有麵包屑與 h1、無 console error
- issues: —

## HOME-003 上一頁不重播進場動畫、捲動位置還原
- smoke: False
- viewport: desktop, mobile
- auto: manual —— 捲動與動畫觀感
- 前置: 清掉 localStorage
- 步驟:
  1. 開 /，往下捲到卡牆中段
  2. 點一張單元卡
  3. 按瀏覽器上一頁
- 預期: 回到剛才的捲動位置，卡片不重新跑進場動畫
- issues: —

## HOME-004 介紹頁 JS 還沒載完就點開始
- smoke: false
- viewport: desktop, mobile
- auto: e2e/slow-load.spec.ts
- 前置: 清快取、慢速網路
- 步驟:
  1. 開任一介紹頁，一出現按鈕就點「開始練習／開始使用」
- 預期: 點擊不被吞掉：設定 Dialog 會開，或按鈕在可用前呈 disabled
- issues: —

## HOME-005 分享代碼預覽與錯誤處理
- smoke: true
- viewport: desktop, mobile
- auto: e2e/open-share-link.spec.ts
- 前置: 全新瀏覽器，測試回應以攔截方式控制（不代表正式站短連結服務通過）
- 步驟:
  1. 開使用分享連結，輸入不足八碼、完整網址、s/代碼
  2. 舊查詢尚未完成時換成新代碼，再讓舊回應返回
  3. 輸入大小寫不同的不存在代碼及服務錯誤代碼
- 預期: 不足八碼不能開啟且不查詢；成功時顯示遊戲與題庫，保留代碼大小寫；舊回應不覆蓋新預覽；不存在及服務錯誤有提示且不能開啟
- issues: —
