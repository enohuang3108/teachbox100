# 認識新臺幣（/coin/introduction）

## COININTRO-001 介紹頁 → 開始認識
- smoke: True
- viewport: desktop, mobile
- auto: manual —— 待寫進 e2e
- 前置: 清掉 localStorage
- 步驟:
  1. 開 /coin/introduction
  2. 按「開始認識」
- 預期: 顯示所有面額且無重複、點面額有 3D 硬幣／紙鈔，無 console error
- issues: —

## COININTRO-002 頂列與樣式跟其他單元一致
- smoke: false
- viewport: desktop, mobile
- auto: manual —— 視覺比對
- 前置: COININTRO-001
- 步驟:
  1. 進入主畫面，對照 /coin/value 主畫面
- 預期: 有全螢幕鈕，樣式用 design token，不用 bg-gradient/backdrop-blur
- issues: —
