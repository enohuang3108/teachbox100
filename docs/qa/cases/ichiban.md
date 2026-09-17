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
- auto: manual —— 待寫 e2e（scrollWidth <= innerWidth）
- 前置: ICHI-001 開局
- 步驟:
  1. 390 寬進主畫面
  2. 量 document.documentElement.scrollWidth
- 預期: scrollWidth 不超過 innerWidth
- issues: —

## ICHI-004 撕票音效有開關並記住
- smoke: false
- viewport: desktop, mobile
- auto: manual —— 音效
- 前置: ICHI-001 開局
- 步驟:
  1. 頂列找音效開關並關閉
  2. 重整後再進來
- 預期: 頂列有音效鈕，關閉後撕票無聲，重整後仍關閉
- issues: —
