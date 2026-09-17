# 學習讀時鐘（/clock/current-time）

## CLOCK-001 介紹頁 → 設定 → 出第一題
- smoke: True
- viewport: desktop, mobile
- auto: e2e/game-template.spec.ts
- 前置: 清掉 localStorage
- 步驟:
  1. 開 /clock/current-time
  2. 確認只看到介紹頁：大標、說明、「開始練習」鈕，頂列沒有設定／全螢幕鈕
  3. 按「開始練習」
  4. 設定 Dialog 出現，按 Dialog 裡的「開始練習」
- 預期: 出現第一題與作答區，頂列出現設定鈕，全螢幕鈕在最後一顆，無 console error
- issues: —

## CLOCK-002 設定會記住、重整回介紹頁
- smoke: False
- viewport: desktop, mobile
- auto: manual —— 待寫進 e2e
- 前置: 清掉 localStorage
- 步驟:
  1. 開 /clock/current-time → 開始練習 → 改一個設定值 → 開始練習
  2. 重新整理
  3. 再按開始練習打開設定
- 預期: 重整後回到介紹頁；設定 Dialog 仍是剛才改過的值
- issues: 2026-09-17 fail：24 小時制與滑桿開關是 useState 沒記住

## CLOCK-003 老師拖曳指針與滑桿設定題目時間
- smoke: false
- viewport: desktop, mobile
- auto: manual —— 拖曳手感
- 前置: 進入作答
- 步驟:
  1. 拖曳時針、分針到任一時間（手機用觸控滑桿）
  2. 右側「時／分」調成同一個時間，按確定
- 預期: 指針跟手；拖曳改的是題目時間（給老師出題示範用，不會動到右側作答數字）；作答與指針一致時判定答對
- issues: 2026-09-17 曾誤判為 bug：拖曳本來就是老師設定題目用
