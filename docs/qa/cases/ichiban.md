# 一番賞（/draw/ichiban）

## ICHI-001 設定獎項後撕票揭曉
- smoke: True
- viewport: desktop, mobile
- auto: e2e/ichiban.spec.ts
- 前置: 清掉 localStorage
- 步驟:
  1. 開 /draw/ichiban
  2. 開始使用 → 設定獎項 → 開始
  3. 選一張票，由左往右撕開
- 預期: 顯示設定的兩行獎項
- issues: —

## ICHI-002 旋轉選籤、撕動回彈、揭曉音效
- smoke: False
- viewport: desktop, mobile
- auto: manual —— 觸控與 3D 手感、音效
- 前置: ICHI-001 開局
- 步驟:
  1. 拖曳輪播選籤、放手看吸附
  2. 撕到一半放手
  3. 撕過門檻
- 預期: 放手吸附到最近一張；未過門檻回彈；過門檻揭曉並有音效，文字被底紙正確遮擋
- issues: —

## ICHI-003 手機沒有橫向捲動
- smoke: false
- viewport: mobile
- auto: e2e/ichiban.spec.ts
- 前置: ICHI-001 開局
- 步驟:
  1. 390 寬進主畫面
  2. 量 document.documentElement.scrollWidth
- 預期: scrollWidth 不超過 innerWidth
- issues: —

## ICHI-004 撕票音效有開關並記住
- smoke: false
- viewport: desktop, mobile
- auto: e2e/ichiban-sound.spec.ts
- 前置: ICHI-001 開局
- 步驟:
  1. 頂列找音效開關並關閉
  2. 重整後再進來
- 預期: 頂列有音效鈕，開啟時撕票會觸發 Web Audio 音訊節點，關閉後不再觸發，重整後仍關閉；喇叭實際聽感另列 ICHI-002
- issues: —

## ICHI-005 分享獎項設定
- smoke: false
- viewport: desktop, mobile
- auto: manual —— `lib/share/units.test.ts` 保護編解碼，跨分頁套用設定尚無瀏覽器斷言
- 前置: 清掉 localStorage
- 步驟:
  1. 修改一個獎項名稱，在設定最後一站複製完整分享連結
  2. 用新分頁開完整連結
- 預期: 設定自動打開並帶入修改後的獎項；顯示載入提示，網址 hash 被清掉
- issues: —
