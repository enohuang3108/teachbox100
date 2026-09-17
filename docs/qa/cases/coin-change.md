# 找零（/coin/change）

## COINCHG-001 介紹頁 → 設定 → 出第一題
- smoke: True
- viewport: desktop, mobile
- auto: e2e/game-template.spec.ts
- 前置: 清掉 localStorage
- 步驟:
  1. 開 /coin/change
  2. 確認只看到介紹頁：大標、說明、「開始練習」鈕，頂列沒有設定／全螢幕鈕
  3. 按「開始練習」
  4. 設定 Dialog 出現，按 Dialog 裡的「開始練習」
- 預期: 出現第一題與作答區，頂列出現設定鈕，全螢幕鈕在最後一顆，無 console error
- issues: —

## COINCHG-002 設定會記住、重整回介紹頁
- smoke: False
- viewport: desktop, mobile
- auto: manual —— 待寫進 e2e
- 前置: 清掉 localStorage
- 步驟:
  1. 開 /coin/change → 開始練習 → 改一個設定值 → 開始練習
  2. 重新整理
  3. 再按開始練習打開設定
- 預期: 重整後回到介紹頁；設定 Dialog 仍是剛才改過的值
- issues: —
